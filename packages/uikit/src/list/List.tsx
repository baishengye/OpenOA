import React, { type ReactElement } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { View, SizableText, Spinner } from 'tamagui';

export interface ListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactElement | null;
  keyExtractor?: (item: T, index: number) => string;
  /** 下拉刷新中 */
  refreshing?: boolean;
  /** 下拉刷新回调；不传则无下拉刷新 */
  onRefresh?: () => void;
  /** 上拉加载更多回调；不传则无上拉加载 */
  onLoadMore?: () => void;
  /** 加载更多进行中 */
  loadingMore?: boolean;
  /** 是否还有更多；false 时底部显「没有更多」，且不再触发 onLoadMore。默认 true */
  hasMore?: boolean;
  /** 空数据时展示 */
  emptyComponent?: ReactElement;
  /** 列表头部（渲染在列表项之上，随列表一起滚动）；可放页面其它内容，避免 FlatList 再嵌 ScrollView */
  header?: ReactElement;
}

/**
 * 列表控件。封装 RN FlatList：
 * - 下拉刷新（onRefresh + refreshing）
 * - 上拉加载更多（onLoadMore + loadingMore）
 * - 没有更多（hasMore=false → 底部「没有更多」）
 */
export function List<T>({
  data,
  renderItem,
  keyExtractor,
  refreshing,
  onRefresh,
  onLoadMore,
  loadingMore,
  hasMore = true,
  emptyComponent,
  header,
}: ListProps<T>) {
  return (
    <FlatList
      data={data}
      renderItem={({ item, index }) => renderItem(item as T, index)}
      keyExtractor={keyExtractor ? (item, i) => keyExtractor(item as T, i) : (_, i) => String(i)}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      onEndReached={hasMore && !loadingMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.2}
      ListHeaderComponent={header}
      ListEmptyComponent={emptyComponent}
      ListFooterComponent={
        data.length === 0 ? null : loadingMore ? (
          <View paddingVertical={16} alignItems="center">
            <Spinner />
          </View>
        ) : !hasMore ? (
          <SizableText size="$2" textAlign="center" paddingVertical={16} color="$gray9">
            没有更多了
          </SizableText>
        ) : null
      }
    />
  );
}
