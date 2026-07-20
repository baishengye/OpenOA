/**
 * MenuOptions - 菜单选项容器
 *
 * MenuOptions 直接渲染 Modal 和菜单内容
 */

import React, { type FC, type ReactNode, useCallback } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { YStack } from 'tamagui';
import { useMenuContext } from './context';
import { menuStyles } from './styles';
import type { MenuOptionsProps } from './types';

/**
 * Menu 选项容器。
 * 接收 MenuOption 作为子组件。
 */
export const MenuOptions: FC<MenuOptionsProps> = ({
  children,
  placement = 'bottom',
  verticalDirection = 'down',
  optionsStyle,
  overlayStyle,
}) => {
  const { visible, close, triggerLayout, config } = useMenuContext();

  const handleOverlayPress = useCallback(() => {
    if (config.closeOnPressOutside) {
      close();
    }
  }, [config.closeOnPressOutside, close]);

  // 计算菜单位置
  const getMenuPosition = useCallback(() => {
    if (!triggerLayout) {
      return { top: 100, left: 20 };
    }

    const { pageX, pageY, width, height } = triggerLayout;

    if (placement === 'top') {
      return {
        top: pageY - 8,
        left: pageX,
      };
    }

    // 默认 bottom
    return {
      top: pageY + height + 8,
      left: pageX,
    };
  }, [triggerLayout, placement]);

  // 如果菜单不可见，不渲染
  if (!visible) return null;

  const position = getMenuPosition();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
    >
      <Pressable
        style={[
          menuStyles.overlay,
          overlayStyle,
          { backgroundColor: `rgba(0, 0, 0, ${config.overlayOpacity})` },
        ]}
        onPress={handleOverlayPress}
      >
        <YStack
          position="absolute"
          top={position.top}
          left={position.left}
          style={[menuStyles.optionsContainer, optionsStyle]}
        >
          <View>{children}</View>
        </YStack>
      </Pressable>
    </Modal>
  );
};
