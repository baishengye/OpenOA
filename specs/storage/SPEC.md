# @itc/storage 模块规范

## 概述

**@itc/storage** 是 OpenOA 项目的 KV 持久化模块，实现 `@itc/base` 的 `KVStorage` 接口。三端统一使用 MMKV 存储引擎（同步读写），宿主在启动时调用 `installStorage()` 注入实现，业务层通过 `@itc/base` 的 `storage` 代理访问。

**核心职责：**
- 提供同步 KV 存储能力（string / boolean）
- 探测式初始化：原生未就绪时自动回退到内存兜底，不崩溃
- 三端统一 API，底层切换透明

**设计原则：**
- 不实现 `ItcModule` 契约（无初始化/销毁生命周期），仅导出单例
- 惰性初始化：MMKV 在首次访问时安装
- 宿主驱动：`installStorage()` 由 App 启动时调用一次

---

## 2. 模块契约（KVStorage 接口）

`@itc/storage` 必须实现 `@itc/base` 定义的 `KVStorage` 接口：

```typescript
interface KVStorage {
  /** 读取字符串，不存在返回 null */
  getString(key: string): string | null;

  /** 写入字符串 */
  set(key: string, value: string): void;

  /** 读取布尔值，不存在返回 null */
  getBoolean(key: string): boolean | null;

  /** 写入布尔值 */
  setBoolean(key: string, value: boolean): void;

  /** 删除单个 key */
  delete(key: string): void;

  /** 检查 key 是否存在 */
  contains(key: string): boolean;

  /** 清空所有数据 */
  clearAll(): void;
}
```

---

## 3. 导出清单

```typescript
/** KVStorage 单例，通过 @itc/base 的 storage 全局代理访问 */
export const storage: KVStorage;

/**
 * 注入 storage 到 @itc/base 全局代理（宿主启动时调用一次）。
 * @returns true=启用了持久化后端；false=原生未就绪，使用内存兜底
 */
export function installStorage(): boolean;
```

---

## 4. 内部实现

### 4.1 目录结构

```
packages/storage/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # 主入口：ItcStorage 实现 + installStorage
    ├── mmkv.ts           # Android/iOS：react-native-mmkv-storage
    └── mmkv.harmony.ts   # 鸿蒙：@react-native-oh-tpl/react-native-mmkv-storage
```

### 4.2 ItcStorage 类

```typescript
class ItcStorage implements KVStorage {
  getString(key: string): string | null {
    return kv().getString(key) ?? null;
  }
  set(key: string, value: string): void {
    kv().setString(key, value);
  }
  getBoolean(key: string): boolean | null {
    return kv().getBool(key) ?? null;
  }
  setBoolean(key: string, value: boolean): void {
    kv().setBool(key, value);
  }
  delete(key: string): void {
    kv().removeItem(key);
  }
  contains(key: string): boolean {
    return kv().indexer.hasKey(key);
  }
  clearAll(): void {
    kv().clearStore();
  }
}
```

**归一化规则：**
- MMKV 的 `getString`/`getBool` 在 key 不存在时返回 `undefined`，统一转为 `null`
- 所有操作同步执行

### 4.3惰性初始化

```typescript
const INSTANCE_ID = 'itc-storage';

let mmkv: ReturnType<MMKVLoader['initialize']> | null = null;

function kv(): ReturnType<MMKVLoader['initialize']> {
  if (mmkv == null) {
    mmkv = new MMKVLoader().withInstanceID(INSTANCE_ID).initialize();
  }
  return mmkv;
}
```

`INSTANCE_ID = 'itc-storage'` 保持与旧原生实现的 mmapID 兼容，保留已有数据。

### 4.4 探测式安装

```typescript
export function installStorage(): boolean {
  try {
    kv().indexer.hasKey('__itc_storage_probe__');
    setStorage(storage);
    return true;
  } catch (e) {
    mmkv = null; // 回退：下次再探测；保留内存兜底
    return false;
  }
}
```

- 先试探 MMKV 是否可用（访问任意 key）
- 可用则通过 `setStorage()` 注入到 `@itc/base`
- 不可用则静默回退到 `@itc/base` 内置的内存实现（`MemoryStorage`）

---

## 5. 平台差异

### 5.1 MMKV 包映射

| 平台 | npm 包 | 入口文件 |
|------|--------|----------|
| Android | `react-native-mmkv-storage` | `src/mmkv.ts` |
| iOS | `react-native-mmkv-storage` | `src/mmkv.ts` |
| 鸿蒙 NEXT | `@react-native-oh-tpl/react-native-mmkv-storage` | `src/mmkv.harmony.ts` |

Metro 按平台选择文件：
- Android/iOS → `mmkv.ts`
- 鸿蒙 → `mmkv.harmony.ts`（`.harmony.ts` 后缀优先）

### 5.2 鸿蒙原生接入

鸿蒙端 MMKV 需要额外原生配置（由 App 层负责）：

1. **HAR 依赖**（`apps/oa/harmony/entry/oh-package.json5`）：
   ```json5
   "@react-native-oh-tpl/react-native-mmkv-storage": "file:../../node_modules/@react-native-oh-tpl/react-native-mmkv-storage/harmony/foo.har"
   ```
2. **CMakeLists.txt**：添加 HAR 包含目录
3. **权限**：`ohos.permission.INTERNET`（如需网络同步）

---

## 6. 依赖关系

**peerDependencies：**
- `@itc/base`：依赖 `KVStorage` 接口、`setStorage`
- `react-native`：>= 0.77.0

**dependencies：**
- Android/iOS：`react-native-mmkv-storage@^0.11.2`
- 鸿蒙：`@react-native-oh-tpl/react-native-mmkv-storage@0.10.3-0.0.2`

**内部依赖：**
- `@itc/base`（workspace）

---

## 7. 使用示例

### 7.1 宿主启动时注入（App 入口）

```typescript
// App.tsx 或 entry 文件
import { installStorage } from '@itc/storage';

const persistent = installStorage();
console.log('Storage backend:', persistent ? 'MMKV' : 'Memory');
```

### 7.2 业务层使用（通过 base 代理）

```typescript
import { storage } from '@itc/base';

// 字符串
storage.set('user_token', 'abc123');
const token = storage.getString('user_token');

if (token) {
  // token 存在
}

// 布尔值
storage.setBoolean('is_logged_in', true);
const loggedIn = storage.getBoolean('is_logged_in');

// 检查与删除
if (storage.contains('temp_key')) {
  storage.delete('temp_key');
}

// 清空
storage.clearAll();
```

### 7.3 启动计数示例

```typescript
import { storage } from '@itc/base';

const LAUNCH_KEY = 'app_launch_count';

const prev = parseInt(storage.getString(LAUNCH_KEY) ?? '0', 10) || 0;
const next = prev + 1;
storage.set(LAUNCH_KEY, String(next));
console.log('Launch count:', next);
```

---

## 8. 与 @itc/base 的关系

```
@itc/base                                    @itc/storage
┌──────────────────────┐                     ┌──────────────────────┐
│ interface KVStorage  │◄───────────────────│ implements KVStorage  │
│                      │    implements      │                       │
│ setStorage(impl)     │───────────────────►│ installStorage()      │
│ storage proxy ───────┼────────────────────│ export const storage │
└──────────────────────┘                     └──────────────────────┘
        ▲
        │ 业务层 import { storage } from '@itc/base'
        │
   ┌────┴────┐
   │ 其他模块 │
   └─────────┘
```

- `@itc/base` 定义 `KVStorage` 接口并提供全局 `storage` 代理
- `@itc/storage` 实现该接口并通过 `installStorage()` 注入
- 业务层只依赖 `@itc/base`，不直接 import `@itc/storage`

---

## 9. 注意事项

1. **无 ItcModule 契约**：`@itc/storage` 不继承 `BaseModule`，不参与模块初始化/销毁生命周期
2. **同步操作**：MMKV 所有操作同步，无 async/await
3. **instanceID 兼容性**：硬编码为 `'itc-storage'`，修改会导致旧数据丢失
4. **内存兜底**：原生未就绪时不抛错，业务层感知不到后端切换
