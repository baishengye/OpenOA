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
  // MessageList 不使用 inverted，保持数据原序
  // 通过 initialScrollIndex 自动滚动到最新消息（列表底部）
  const inverted = props.inverted !== undefined ? props.inverted : false;

  // 如果用户没有指定 initialScrollIndex，默认滚动到最新消息（底部）
  // 只有在有数据时才设置
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
