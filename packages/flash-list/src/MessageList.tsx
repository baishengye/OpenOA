/**
 * 消息列表组件封装
 * 专为 IM 即时通讯场景优化（倒序排列、最新消息在底部）
 */

import React from 'react';
import { FlashList as FlashListImpl } from './platform';
import type { MessageListProps } from './types';

/**
 * 消息列表组件（默认倒序排列，适合即时通讯）
 *
 * 特性：
 * - 默认倒序排列，最新消息显示在底部
 * - 配合消息状态同步，实现增量更新
 * - 支持消息类型区分优化
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
 *       data={messages}
 *       renderItem={({ item }) => <MessageBubble message={item} />}
 *       timestampKey="timestamp"
 *       senderKey="senderId"
 *       statusKey="status"
 *       getItemType={(item) => item.type}
 *       onEndReached={loadMoreHistory}
 *     />
 *   );
 * }
 * ```
 */
export function MessageList<T>(props: MessageListProps<T>): React.JSX.Element {
  // MessageList 默认使用倒序（最新消息在底部），这是 IM 的标准做法
  const inverted = props.inverted !== undefined ? props.inverted : true;

  return <FlashListImpl<T> {...props} inverted={inverted} />;
}
