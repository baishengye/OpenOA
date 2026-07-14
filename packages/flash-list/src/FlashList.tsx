/**
 * 通用 FlashList 组件封装
 * 提供跨平台统一的列表组件接口
 */

import React from 'react';
import { FlashList as FlashListImpl } from './platform';
import type { FlashListProps } from './types';

/**
 * 通用列表组件
 *
 * @example
 * ```tsx
 * import { FlashList } from '@itc/flash-list';
 *
 * function App() {
 *   return (
 *     <FlashList
 *       data={items}
 *       renderItem={({ item, index }) => <Text>{item.name}</Text>}
 *       estimatedItemSize={80}
 *       keyExtractor={(item) => item.id}
 *     />
 *   );
 * }
 * ```
 */
export function FlashList<T>(props: FlashListProps<T>): React.JSX.Element {
  return <FlashListImpl {...props} />;
}
