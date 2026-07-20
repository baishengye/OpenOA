/**
 * HarmonyOS NEXT 平台的 FlashList 实现
 * 使用 @react-native-ohos/flash-list
 */

import React from 'react';
import { FlashList as FlashListOHOS } from '@react-native-ohos/flash-list';
import type { FlashListProps } from '../types';

/**
 * HarmonyOS 平台的 FlashList 组件
 * 鸿蒙版 API 与 RN 版略有差异，需要适配
 */
export function FlashList<T>(props: FlashListProps<T>): React.JSX.Element {
  const {
    data,
    renderItem,
    keyExtractor,
    horizontal,
    numColumns,
    onEndReached,
    onEndReachedThreshold,
    refreshing,
    onRefresh,
    getItemType,
    extraData,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    ItemSeparatorComponent,
    contentContainerStyle,
    showsVerticalScrollIndicator,
    initialScrollIndex,
    onScroll,
    scrollEventThrottle,
    pagingEnabled,
    inverted,
    ...rest
  } = props;

  // inverted 模式时，需要滚动到最后一条显示最新消息
  // HarmonyOS 使用 maintainVisibleContentPosition.startRenderingFromBottom 配合 initialScrollIndex
  const isInverted = inverted === true;
  const maintainVisibleContentPosition = isInverted
    ? { startRenderingFromBottom: true }
    : undefined;

  // inverted 模式时，初始滚动到最后一个item（最新消息）
  const scrollIndex = isInverted && initialScrollIndex === undefined && data.length > 0
    ? data.length - 1
    : initialScrollIndex;

  return (
    <FlashListOHOS<T>
      data={data}
      renderItem={renderItem as any}
      keyExtractor={keyExtractor as any}
      horizontal={horizontal}
      numColumns={numColumns}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshing={refreshing}
      onRefresh={onRefresh}
      getItemType={getItemType as any}
      extraData={extraData}
      ListEmptyComponent={ListEmptyComponent as any}
      ListHeaderComponent={ListHeaderComponent as any}
      ListFooterComponent={ListFooterComponent as any}
      ItemSeparatorComponent={ItemSeparatorComponent as any}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      initialScrollIndex={scrollIndex}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      pagingEnabled={pagingEnabled}
      maintainVisibleContentPosition={maintainVisibleContentPosition}
      {...rest}
    />
  );
}
