# @itc/flash-list

高性能列表渲染层封装，基于 [@shopify/flash-list](https://shopify.github.io/flash-list/) 的三端适配（Android/iOS/HarmonyOS NEXT）。

业务层请仅从本包导入：
```tsx
import { FlashList, MessageList } from '@itc/flash-list';
```

切勿直接引用 `@shopify/flash-list` 或 `@react-native-ohos/flash-list`。

## 版本适配表

| 平台 | 底层实现 | 支持版本 | Autolink | 配置方式 |
|------|---------|----------|----------|----------|
| Android | @shopify/flash-list（RN 新架构） | RN 0.82+ | ✅ 支持 | 自动配置 |
| iOS | @shopify/flash-list（RN 新架构） | RN 0.82+ | ✅ 支持 | 自动配置 |
| HarmonyOS NEXT | @react-native-ohos/flash-list | API 12+ / RN 0.82+ | ❌ 不支持 | 手动添加依赖 |

## 特性

- ✅ **API 隐藏**：完全隐藏底层实现，业务只依赖本包
- ✅ **三端一致**：所有平台 API 和行为完全一致
- ✅ **MessageList**：IM 场景专用组件（默认倒序排列）
- ✅ **性能优化**：支持 `getItemType`、`horizontal`、`onEndReached` 等 FlashList 优化特性
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **平台自适应**：运行时自动选择正确的底层实现

## 安装

```bash
pnpm add @itc/flash-list
```

## 使用

### 普通列表

```tsx
import { FlashList } from '@itc/flash-list';

function App() {
  const data = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
  ];

  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      keyExtractor={(item) => item.id}
      estimatedItemSize={80}
    />
  );
}
```

### IM 消息列表（默认倒序）

```tsx
import { MessageList } from '@itc/flash-list';

interface Message {
  id: string;
  type: 'text' | 'image';
  content: string;
  senderId: string;
  timestamp: number;
  status: 'sending' | 'sent';
}

function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <MessageList<Message>
      data={messages}
      renderItem={({ item }) => <MessageBubble message={item} />}
      timestampKey="timestamp"
      senderKey="senderId"
      statusKey="status"
      getItemType={(item) => item.type}
      onEndReached={loadMoreHistory}
    />
  );
}
```

### HarmonyOS 配置

参考 [packages/flash-list/harmony/README.md](./harmony/README.md) 配置 har 依赖。

## 类型定义

```ts
import type {
  FlashListProps,
  MessageListProps,
  ListRenderItemInfo,
} from '@itc/flash-list';
```

完整类型定义请查看 [src/types.ts](./src/types.ts)。

## 三端兼容性说明

- Android/iOS：使用 `@shopify/flash-list`
- HarmonyOS NEXT：使用 `@react-native-ohos/flash-list@2.1.1-rc.1`
- 代码层面完全兼容，行为一致

## FAQ

### 为什么需要这个包？

- 统一三端 API，简化业务开发
- 隔离底层实现差异，方便未来升级/替换
- 屏蔽 HarmonyOS 平台特殊依赖配置

### HarmonyOS 支持 Autolink 吗？

v2.1.1 不支持，需要手动配置 har 依赖。

### 为什么不能直接用 `@shopify/flash-list`？

- HarmonyOS 平台不支持
- 平台差异（inverted、estimatedItemSize 等）需要适配
- API 隐藏设计原则

### 如何更新底层版本？

1. 更新 package.json 中的版本依赖
2. 针对性测试 HarmonyOS 兼容性
3. 验证三端一致性
4. 更新 har 包依赖

## 版本记录

| 版本 | 变更 | 兼容性 |
|------|------|----------|
| 0.1.0 | 初始版本 | RN 0.82+ / HarmonyOS API 12+ |

## 贡献

本包由 OpenOA 团队维护，欢迎提交 Issue/Pull Request。