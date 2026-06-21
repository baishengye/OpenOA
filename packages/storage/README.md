# @itc/storage

可剥离复用的 **KV 持久化模块**。实现 [@itc/base](../base) 的 `KVStorage` 接口，三端统一用 **MMKV**（`react-native-mmkv-storage`）。

> 设计：**接口在 base，实现在 storage**。业务层只依赖 `@itc/base` 的 `storage` 代理，看不到 MMKV；换底层只改本模块。

## 在其他 app 中引入

**1. 加依赖**
```jsonc
// app/package.json —— storage 的原生依赖（MMKV）由 app 直接持有，autolink 才扫得到
{
  "dependencies": {
    "@itc/base": "workspace:*",
    "@itc/storage": "workspace:*",
    "react-native-mmkv-storage": "^0.11.2"
  }
}
```

**2. 启动时注入一次**（通常在 `index.js` / `App` 之前）
```ts
import { installStorage } from '@itc/storage';
import { storage } from '@itc/base';

const ok = installStorage();   // 探测式：原生没接入则返回 false、保留内存兜底，不崩
// 之后业务层全程只用 @itc/base 的 storage：
storage.set('token', 'abc');
storage.getString('token');    // 'abc' | null
storage.getBoolean('agreed');  // boolean | null
storage.contains('token'); storage.delete('token'); storage.clearAll();
```

**3. 原生接入**
- **iOS**：`cd ios && pod install`（autolink + MMKV pod）。
- **Android**：autolink 自动，无需手动。
- **鸿蒙**：用 RNOH 移植包 `@react-native-oh-tpl/react-native-mmkv-storage`；宿主 [metro.config.harmony.js](../../apps/oa/metro.config.harmony.js) 把 `react-native-mmkv-storage` 重定向到移植包（本模块已备 `mmkv.harmony.ts`，Metro 按 `.harmony` 扩展名自动选），并在 RNOH `RNPackagesFactory` 注册移植包的 Package。

## API
| 方法 | 说明 |
|---|---|
| `installStorage(): boolean` | 宿主启动注入 MMKV 后端；返回是否启用持久化（false=原生未就绪、走内存兜底） |
| `storage`（从 `@itc/base`） | `getString/set` `getBoolean/setBoolean` `delete` `contains` `clearAll` |

## 注意
- **业务别 `import { storage } from '@itc/storage'`**——统一从 `@itc/base` 取代理，保证未注入时也有内存兜底、且日后可换实现。
- `installStorage()` 是**探测式**的：某端没接入原生 / 没重编时返回 `false` 而非抛错，App 仍可运行（数据走内存、重启失）。
- MMKV 实例 ID 固定 `itc-storage`（沿用旧原生实现的 mmapID，保留历史数据），勿改。
- key 不存在时 `getString/getBoolean` 统一返回 `null`。
