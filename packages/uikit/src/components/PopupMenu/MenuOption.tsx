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
  renderOption,
}) => {
  const { select, close } = useMenuContext();

  const handleSelect = useCallback(() => {
    if (disabled) return;

    const finalValue = value ?? '';
    if (onSelect) {
      onSelect(finalValue);
    } else {
      select(finalValue);
    }
    // 关闭菜单
    close();
  }, [disabled, value, onSelect, select, close]);

  // 完全自定义渲染
  if (renderOption) {
    return (
      <>
        {renderOption({ disabled, onPress: handleSelect })}
      </>
    );
  }

  return (
    <Pressable
      onPress={handleSelect}
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
