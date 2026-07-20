/**
 * 消息列表组件封装
 * 专为 IM 即时通讯场景优化（最新消息在底部，自动滚动到底部）
 */

import React from 'react';
import { FlashList as FlashListImpl } from './platform';
import type { MessageListProps } from './types';

/**
 * 消息列表组件（适合即时通讯）
 *
 * 特性：
 * - 最新消息显示在底部（IM 标准布局）
 * - 打开时自动滚动到最新消息
 * - 支持消息类型区分优化
 *
 * 使用说明：
 * - 传入时间正序的数据（最旧在前，最新在后）
 * - MessageList 会自动滚动到最新消息位置
 *
 * @example
 * ```tsx
 * import { MessageList } from '@itc/flash-list';
 *
 * interface Message {
 *   id: string;
 *   type: 'text' | 'image';
 *   content: string;
 *   senderId: string;
 *   timestamp: number;
 * }
 *
 * function ChatScreen() {
 *   return (
 *     <MessageList<Message>
 *       data={messages} // 时间正序：最旧在前，最新在后
 *       renderItem={({ item }) => <MessageBubble message={item} />}
 *       getItemType={(item) => item.type}
 *       onEndReached={loadMoreHistory}
 *     />
 *   );
 * }
 * ```
 */
export function MessageList<T>(props: MessageListProps<T>): React.JSX.Element {
  // MessageList 默认不使用 inverted，数据顺序即显示顺序
  // 最新消息在数组尾部，显示在视觉底部
  const inverted = props.inverted !== undefined ? props.inverted : false;

  // 自动滚动到最新消息（数组末尾）
  const hasData = props.data && props.data.length > 0;
  const initialScrollIndex = props.initialScrollIndex !== undefined
    ? props.initialScrollIndex
    : (hasData ? props.data.length - 1 : undefined);

  return (
    <FlashListImpl<T>
      {...props}
      inverted={inverted}
      initialScrollIndex={initialScrollIndex}
    />
  );
}
