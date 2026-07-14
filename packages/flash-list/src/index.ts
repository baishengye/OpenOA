/**
 * @itc/flash-list
 * 高性能列表渲染层封装，基于 @shopify/flash-list 的三端适配（Android/iOS/HarmonyOS NEXT）
 *
 * 业务层只应从此文件导入，不应直接引用 @shopify/flash-list 或 @react-native-ohos/flash-list
 */

// 组件导出
export { FlashList } from './FlashList';
export { MessageList } from './MessageList';

// 类型导出
export type {
  FlashListProps,
  MessageListProps,
  ListRenderItemInfo,
} from './types';
