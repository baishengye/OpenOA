/**
 * @itc/flash-list 类型定义
 * 为 FlashList 和 MessageList 提供统一的类型接口
 */

import type { StyleProp, ViewStyle } from 'react-native';

/**
 * 列表项渲染信息
 */
export interface ListRenderItemInfo<T> {
  item: T;
  index: number;
  extraData?: any;
}

/**
 * 通用列表组件 Props
 */
export interface FlashListProps<T> {
  /** 数据源 */
  data: T[];

  /** 渲染单个项 */
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement;

  /** 唯一键提取器 */
  keyExtractor?: (item: T, index: number) => string;

  /** 预估项高度（性能关键，建议 80-120px） */
  estimatedItemSize?: number;

  /** 是否水平布局 */
  horizontal?: boolean;

  /** 多列布局 */
  numColumns?: number;

  /** 翻页加载 */
  onEndReached?: () => void;

  /** 距离底部触发翻页的距离（0-1 表示比例，>1 表示像素） */
  onEndReachedThreshold?: number;

  /** 下拉刷新 */
  refreshing?: boolean;
  onRefresh?: () => void;

  /** 类型区分函数，用于优化项复用 */
  getItemType?: (item: T) => string | number;

  /** 列表数据变化标记，变化时应传入新引用以触发重渲染 */
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

  /** 初始偏移量 */
  initialScrollIndex?: number;

  /** 列表滚动位置变化回调 */
  onScroll?: (event: any) => void;

  /** 滚动方向锁定 */
  scrollEventThrottle?: number;

  /** 按下时是否禁用滚动 */
  pagingEnabled?: boolean;

  /** 反转列表（使用 -1 缩放变换实现） */
  inverted?: boolean;

  /** 保留所有其他属性以兼容底层实现 */
  [key: string]: any;
}

/**
 * 消息列表组件 Props
 * 专为 IM 即时通讯场景优化
 */
export interface MessageListProps<T> extends Omit<FlashListProps<T>, 'horizontal'> {
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

  /** 距离底部多少距离触发翻页 */
  onEndReachedThreshold?: number;

  /** 类型区分（文本/图片/语音等）用于 recyclable 优化 */
  getItemType?: (item: T) => string | number;

  /** 列表数据变化标记，触发部分更新 */
  extraData?: any;

  /** 外边距 */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /** 是否显示滚动条 */
  showsVerticalScrollIndicator?: boolean;

  /** 消息列表是否倒序（默认 true，最新消息在底部） */
  inverted?: boolean;

  /** 保留所有其他属性以兼容底层实现 */
  [key: string]: any;
}
