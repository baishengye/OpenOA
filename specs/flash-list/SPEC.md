# @itc/flash-list 模块规范

## 概述

**@itc/flash-list** 是 OpenOA 项目的高性能列表渲染层封装，基于 **@shopify/flash-list** 的三端适配抽象（Android/iOS/HarmonyOS NEXT）。通过统一接口屏蔽底层差异，保证三端表现一致性。


**核心职责：**
- 封装 @shopify/flash-list 的三端适配层
- 统一 API 接口，下层自动适配具体平台实现
- 提供 IM 消息列表等高频刷新场景的性能优化方案

**设计原则：**
- **API 隐藏**：业务层只依赖 `@itc/flash-list`，不 import `@shopify/flash-list`
- **清晰抽象**：底层实现可随时切换，无需改动业务代码
- **性能优先**：充分利用 FlashList 的优化能力
- **三端一致**：所有平台表现完全一致的列表组件

---

## 1. 技术栈

| 平台 | 底层实现 | 版本要求 | 适配状态 |
|------|---------|----------|----------|
| Android | @shopify/flash-list（RN 新架构） | RN 0.82+ | ✅ 适配完成 |
| iOS | @shopify/flash-list（RN 新架构） | RN 0.82+ | ✅ 适配完成 |
| HarmonyOS NEXT | @react-native-ohos/flash-list（RNOH 版） | API 12+ / RN 0.82+ | ✅ 适配完成（需手动配置） |

> **说明**：
> - @react-native-ohos/flash-list 是专为 HarmonyOS NEXT 开发的 FlashList 移植版
> - API 12+ 表示兼容 HarmonyOS 5.0.0(API 12) 及以上版本
> - 最低支持 RN 0.82 与 OpenOA 基线保持一致

---

## 2. 核心接口设计

### 2.1 导出组件

```typescript
/**
 * 消息列表组件（默认倒序排列，适合即时通讯）
 */
export function MessageList<T>(props: MessageListProps<T>): React.JSX.Element;

/**
 * 通用列表组件（可正序或倒序）
 */
export function FlashList<T>(props: FlashListProps<T>): React.JSX.Element;
```

### 2.2 消息列表专用 Props（`MessageListProps<T>`）

```typescript
export interface MessageListProps<T> {
  /** 数据源 */
  data: T[];
  
  /** 渲染单个消息项 */
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement;
  
  /** 消息发送者 ID 字段名（用于消息分组优化） */
  senderKey?: string;
  
  /** 时间戳字段名（用于时间分割器） */
  timestampKey?: string;
  
  /** 消息状态字段名 */
  statusKey?: string;
  
  /** 翻页加载函数 */
  onEndReached?: () => void;
  
  /** 距离底部多少距离触发 */
  onEndReachedThreshold?: number;
  
  /** 类型区分（文本/图片/语音等）用于 recyclable 优化 */
  getItemType?: (item: T) => string;
  
  /** 列表数据变化标记，触发部分更新 */
  extraData?: any;
  
  /** 外边距 */
  contentContainerStyle?: StyleProp<ViewStyle>;
  
  /** 是否显示滚动条 */
  showsVerticalScrollIndicator?: boolean;
}
```

### 2.3 通用列表 Props（`FlashListProps<T>`）

```typescript
export interface FlashListProps<T> {
  /** 数据源 */
  data: T[];
  
  /** 渲染单个项 */
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement;
  
  /** 唯一键提取器 */
  keyExtractor?: (item: T, index: number) => string;
  
  /** 预估项高度（性能关键） */
  estimatedItemSize?: number;
  
  /** 是否水平布局 */
  horizontal?: boolean;
  
  /** 多列布局 */
  numColumns?: number;
  
  /** 翻页加载 */
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  
  /** 下拉刷新 */
  refreshing?: boolean;
  onRefresh?: () => void;
  
  /** 类型区分 */
  getItemType?: (item: T) => number;
  
  /** 列表数据变化标记 */
  extraData?: any;
  
  /** 空数据组件 */
  ListEmptyComponent?: React.ComponentType | React.ReactElement;
  
  /** 头部组件 */
  ListHeaderComponent?: React.ComponentType | React.ReactElement;
  
  /** 底部组件 */
  ListFooterComponent?: React.ComponentType | React.ReactElement;
  
  /** 间距组件 */
  ItemSeparatorComponent?: React.ComponentType | React.ReactElement;
  
  /** 外边距 */
  contentContainerStyle?: StyleProp<ViewStyle>;
  
  /** 是否显示滚动条 */
  showsVerticalScrollIndicator?: boolean;
}
```

### 2.4 ListRenderItemInfo

```typescript
export interface ListRenderItemInfo<T> {
  item: T;
  index: number;
  extraData?: any;
}
```

---

## 3. 目录结构

```
packages/flash-list/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # 唯一出口，白名单导出
│   ├── FlashList.tsx         # 通用 FlashList 封装
│   ├── MessageList.tsx       # IM 消息列表封装
│   ├── types.ts              # 类型定义
│   └── platform/
│       ├── index.ts          # 平台选择入口
│       ├── flash-list.ts     # Android/iOS 实现
│       └── flash-list.ohos.ts # HarmonyOS 实现
├── android/                  # Android 原生（如有需要）
├── ios/                      # iOS 原生（如有需要）
└── harmony/                  # 鸿蒙原生（使用 @react-native-ohos/flash-list）
```

---

## 4. 平台适配策略

### 4.1 平台检测与适配

```typescript
// src/platform/index.ts
import { Platform } from 'react-native';
import { FlashListBase } from './flash-list';
import { FlashListOHOS } from './flash-list.ohos';

// 根据平台选择实现
const FlashListImpl = Platform.OS === 'harmony' 
  ? FlashListOHOS 
  : FlashListBase;

export { FlashListImpl as FlashList };
```

### 4.2 鸿蒙特殊处理

```typescript
// src/platform/flash-list.ohos.ts
// 鸿蒙版可能需要额外处理
import { FlashList as FlashListRN } from '@shopify/flash-list';

// 鸿蒙版 API 可能存在差异，需要适配
export function FlashListOHOS<T>(props: FlashListProps<T>) {
  // 统一参数格式
  const adaptedProps = adaptProps(props);
  return <FlashListRN {...adaptedProps} />;
}
```

---

## 5. IM 消息列表优化

### 5.1 MessageList 特性

- **倒序排列**：最新消息在底部（聊天室惯例）
- **消息类型优化**：通过 `getItemType` 区分不同消息类型
- **状态同步**：配合 eventBus 监听消息状态变化
- **增量更新**：避免全量重渲染

### 5.2 使用示例

```tsx
import { MessageList } from '@itc/flash-list';
import { eventBus } from '@itc/base';

interface Message {
  id: string;
  type: 'text' | 'image' | 'video' | 'voice';
  content: string;
  senderId: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'read';
}

function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // 监听新消息
  useEffect(() => {
    const unsubscribe = eventBus.on('im:newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    return unsubscribe;
  }, []);
  
  return (
    <MessageList
      data={messages}
      renderItem={({ item }) => <MessageBubble message={item} />}
      timestampKey="timestamp"
      senderKey="senderId"
      statusKey="status"
      getItemType={(item) => item.type}
      onEndReached={loadMoreHistory}
      extraData={extraData}
    />
  );
}
```

---

## 6. 依赖关系

### 6.1 peerDependencies

```json
{
  "react-native": ">= 0.82.0",
  "react": ">= 19.0.0"
}
```

### 6.2 dependencies

```json
{
  "@shopify/flash-list": "^2.1.0",
  "@react-native-ohos/flash-list": "~2.1.1"
}
```

> **说明**：
> - @shopify/flash-list 用于 Android/iOS
> - @react-native-ohos/flash-list 用于 HarmonyOS（通过 Metro 平台选择）

### 6.3 内部依赖

```json
{
  "@itc/base": "workspace:*"
}
```

---

## 7. 开发任务

### 7.1 Phase 1：基础框架

- [ ] 创建 packages/flash-list 目录结构
- [ ] 配置 package.json 和 tsconfig.json
- [ ] 实现类型定义（types.ts）
- [ ] 实现平台检测与适配层

### 7.2 Phase 2：组件实现

- [ ] 实现 FlashList 组件封装
- [ ] 实现 MessageList 组件封装
- [ ] 适配鸿蒙版差异（如有）

### 7.3 Phase 3：测试验证

- [ ] Android 平台测试
- [ ] iOS 平台测试
- [ ] HarmonyOS 平台测试
- [ ] 性能对比测试

### 7.4 Phase 4：文档与集成

- [ ] 更新 SPEC.md 规范
- [ ] 在 apps/oa 中集成演示
- [ ] 更新 README.md 使用文档

---

## 8. 注意事项

1. **平台判断**：使用 `Platform.OS === 'harmony'` 判断鸿蒙平台
2. **预估高度**：`estimatedItemSize` 设置合理值（80-120px）
3. **keyExtractor**：必须提供唯一键，避免渲染错误
4. **extraData**：状态更新时使用，避免列表不刷新
5. **ItemType**：IM 场景建议区分消息类型，优化复用
6. **倒序问题**：鸿蒙版 `inverted` 属性可能有差异，需适配

---

## 10. HarmonyOS 手动配置

由于 `@react-native-ohos/flash-list` v2.1.1 **不支持 Autolink**，需要进行以下手动配置：

### 10.1 添加 har 依赖

在 `apps/oa/harmony/entry/oh-package.json5` 的 `dependencies` 中添加：

```json
{
  "dependencies": {
    "@react-native-ohos/flash-list": "file:../../node_modules/@react-native-ohos/flash-list/harmony/flash_list.har"
  }
}
```

### 10.2 依赖版本对照表

| 三方库版本 | 支持 RN 版本 | Autolink | 编译 API |
|-----------|-------------|----------|----------|
| 2.1.1-rc.1 | 0.82.* | 否 | API12+ |
| ~1.8.3 | 0.77.* | 否 | API12+ |
| ~1.6.4 | 0.72.* | 是 | API12+ |

### 10.3 版本差异注意事项

| 功能 | v2.1.1 说明 |
|------|-------------|
| 原生 C++ 代码 | ❌ 不涉及 |
| CMakeLists 配置 | ❌ 不涉及 |
| PackageProvider | ❌ 不涉及 |
| inverted | ⚠️ 已废弃，使用 maintainVisibleContentPosition |
| estimatedItemSize | ⚠️ 已废弃 |
| contentContainerStyle | ⚠️ 已废弃 |

### 10.4 已知问题

> ⚠️ RNOH 的 `maintainVisibleContentPosition` 实现未考虑 FlashList 元素复用机制，导致列表滑动时出现跳跃。[Issue#19](https://gitcode.com/openharmony-sig/rntpc_flash-list/issues/19)

---

## 11. 相关资源

- [@shopify/flash-list 官方文档](https://shopify.github.io/flash-list/)
- [@react-native-ohos/flash-list GitCode](https://gitcode.com/openharmony-sig/rntpc_flash-list)
- [鸿蒙 React Native 适配指南](https://gitcode.com/openharmony-sig/ohos_react_native)
