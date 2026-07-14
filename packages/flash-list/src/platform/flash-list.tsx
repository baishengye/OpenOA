/**
 * Android/iOS 平台的 FlashList 实现
 * 使用 @shopify/flash-list
 */

import React from 'react';
import { FlashList as FlashListBase } from '@shopify/flash-list';
import type { FlashListProps } from '../types';

/**
 * Android/iOS 平台的 FlashList 组件
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

  return (
    <FlashListBase<T>
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
      initialScrollIndex={initialScrollIndex}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      pagingEnabled={pagingEnabled}
      inverted={inverted}
      {...rest}
    />
  );
}
