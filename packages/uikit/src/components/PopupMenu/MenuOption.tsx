/**
 * MenuOption - 单个菜单选项
 */

import React, { type FC, useCallback } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useMenuContext } from './context';
import { menuStyles } from './styles';
import type { MenuOptionProps } from './types';

/**
 * Menu 单个选项。
 */
export const MenuOption: FC<MenuOptionProps> = ({
  children,
  value,
  style,
  disabled = false,
  onSelect,
}) => {
  const { select } = useMenuContext();

  const handlePress = useCallback(() => {
    if (disabled) return;

    // 优先使用自身的 onSelect，否则使用 Context 的 select
    const finalValue = value ?? '';
    if (onSelect) {
      onSelect(finalValue);
    } else {
      select(finalValue);
    }
  }, [disabled, value, onSelect, select]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        menuStyles.option,
        pressed && styles.optionPressed,
        disabled && menuStyles.optionDisabled,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  optionPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
