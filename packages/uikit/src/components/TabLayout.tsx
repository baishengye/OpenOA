import React, {
  type FC,
  type ReactElement,
  type ReactNode,
  useState,
  useCallback,
  Children,
  isValidElement,
} from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { View } from 'tamagui';

// ── Types ────────────────────────────────────────────────────────────────────

export type TabLayoutDirection = 'horizontal' | 'vertical';
export type TabLayoutTabPosition = 'start' | 'end';

export interface TabLayoutProps {
  children?: ReactNode;

  /** 布局方向：横向（标签在上/下）或纵向（标签在左/右）。默认 'horizontal' */
  direction?: TabLayoutDirection;

  /** 标签列表位于内容区的哪一侧。默认 'start' */
  tabPosition?: TabLayoutTabPosition;

  /** 标签列表的宽度（纵向布局时）或高度（横向布局时）。默认 80 */
  tabSize?: number;

  /** 当前选中标签的索引。受控模式 */
  value?: number;

  /** 默认选中的标签索引。非受控模式 */
  defaultValue?: number;

  /** 选中变化时的回调。受控模式必需 */
  onChange?: (index: number) => void;

  /** 标签列表的渲染函数。接收 isActive（是否选中）用于高亮状态 */
  renderTabList: (tab: {
    isActive: boolean;
    index: number;
    label: string;
  }) => ReactElement;

  /** 内容区域的渲染函数 */
  renderTabContent: (tab: {
    index: number;
    label: string;
  }) => ReactElement;
}

export interface TabProps {
  /** 标签文本 */
  label: string;

  /** 标签内容自定义渲染（优先级高于 label） */
  children?: ReactNode;

  /** 是否禁用 */
  disabled?: boolean;
}

// ── Tab 组件 ─────────────────────────────────────────────────────────────────

/**
 * Tab 标签组件，用于配合 TabLayout 声明式定义标签。
 * 不直接渲染内容，仅传递 label 给 TabLayout。
 */
export const Tab: FC<TabProps> = () => null;

// ── TabLayout 组件 ────────────────────────────────────────────────────────────

interface TabItem {
  label: string;
  disabled?: boolean;
}

/**
 * TabLayout 是一个分段控制器布局容器，将「标签列表」和「内容区域」组合在一起。
 *
 * 支持：
 * - 横向/纵向布局（direction）
 * - 标签位置控制（tabPosition）
 * - 受控/非受控模式
 * - 自定义标签和内容渲染
 *
 * @example
 * <TabLayout
 *   defaultValue={0}
 *   onChange={(index) => console.log('切换到', index)}
 *   renderTabList={({ isActive, label }) => (
 *     <Text color={isActive ? '$primary' : '$gray9'}>{label}</Text>
 *   )}
 *   renderTabContent={({ index }) => (
 *     <Text>内容区域 {index}</Text>
 *   )}
 * />
 */
export const TabLayout: FC<TabLayoutProps> = ({
  children,
  direction = 'horizontal',
  tabPosition = 'start',
  tabSize = 80,
  value: controlledValue,
  defaultValue = 0,
  onChange,
  renderTabList,
  renderTabContent,
}) => {
  // 收集所有 Tab 子组件的 label
  const collectTabs = (): TabItem[] => {
    const items: TabItem[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        const element = child as ReactElement<{ label: string; disabled?: boolean }>;
        if (element.type === Tab) {
          items.push({
            label: element.props.label,
            disabled: element.props.disabled,
          });
        }
      }
    });
    return items;
  };

  const tabs = collectTabs();

  // 受控/非受控模式
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentIndex =
    controlledValue !== undefined ? controlledValue : internalValue;

  const handleTabPress = useCallback(
    (index: number) => {
      if (controlledValue === undefined) {
        setInternalValue(index);
      }
      onChange?.(index);
    },
    [controlledValue, onChange]
  );

  // 确定 flexDirection
  const isVertical = direction === 'vertical';
  const isTabAtEnd = tabPosition === 'end';

  const containerFlexDirection = isVertical
    ? isTabAtEnd
      ? 'row-reverse'
      : 'row'
    : isTabAtEnd
      ? 'column-reverse'
      : 'column';

  const tabContainerStyle = isVertical
    ? { width: tabSize, height: '100%' }
    : { height: tabSize, width: '100%' };

  const contentStyle = { flex: 1 };

  // 当前激活的 tab 信息
  const activeTab = tabs[currentIndex] ?? { label: '' };

  return (
    <View
      flexDirection={containerFlexDirection as any}
      flex={1}
      overflow="hidden"
    >
      {/* 标签列表 */}
      <View
        style={tabContainerStyle}
        flexDirection={isVertical ? 'column' : 'row'}
      >
        {tabs.map((tab, index) => {
          const isActive = index === currentIndex;

          const handlePress = () => {
            if (!tab.disabled) {
              handleTabPress(index);
            }
          };

          return (
            <Pressable
              key={`tab-${index}`}
              onPress={handlePress}
              disabled={tab.disabled}
              style={[
                tab.disabled ? styles.tabDisabled : null,
                isVertical ? null : styles.tabFlex,
                isVertical ? { height: tabSize } : null,
              ]}
            >
              {renderTabList({ isActive, index, label: tab.label })}
            </Pressable>
          );
        })}
      </View>

      {/* 内容区域 */}
      <View style={contentStyle}>
        {renderTabContent({
          index: currentIndex,
          label: activeTab.label,
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabDisabled: {
    opacity: 0.5,
  },
  tabFlex: {
    flex: 1,
  },
});
