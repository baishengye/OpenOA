/**
 * MenuOptions - 菜单选项容器
 *
 * MenuOptions 直接渲染 Modal 和菜单内容
 */

import React, {
  type FC,
  useCallback,
  useState,
} from 'react';
import { Modal, Pressable, View, LayoutChangeEvent } from 'react-native';
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
  verticalAlign = 'bottom',
  horizontalAlign = 'start',
  optionsStyle,
  overlayStyle,
  renderContent,
  offsetX = 0,
  offsetY = 0,
}) => {
  const { visible, close, triggerLayout, config } = useMenuContext();
  const [menuSize, setMenuSize] = useState({ width: 0, height: 0 });

  const handleOverlayPress = useCallback(() => {
    if (config.closeOnPressOutside) {
      close();
    }
  }, [config.closeOnPressOutside, close]);

  // 测量菜单尺寸
  const handleMenuLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setMenuSize({ width, height });
  }, []);

  // 计算菜单位置
  const getMenuPosition = useCallback(() => {
    const baseX = triggerLayout?.pageX ?? 20;
    const baseY = triggerLayout?.pageY ?? 100;
    const triggerW = triggerLayout?.width ?? 100;
    const triggerH = triggerLayout?.height ?? 40;

    // 水平位置计算
    let left: number;
    switch (horizontalAlign) {
      case 'end':
        left = baseX + triggerW - menuSize.width + offsetX;
        break;
      case 'center':
        left = baseX + triggerW / 2 - menuSize.width / 2 + offsetX;
        break;
      case 'start':
      default:
        left = baseX + offsetX;
        break;
    }

    // 垂直位置计算
    let top: number;
    switch (verticalAlign) {
      case 'top':
        top = baseY - menuSize.height - 8 + offsetY;
        break;
      case 'center':
        top = baseY + triggerH / 2 - menuSize.height / 2 + offsetY;
        break;
      case 'bottom':
      default:
        top = baseY + triggerH + 8 + offsetY;
        break;
    }

    return { top, left };
  }, [triggerLayout, horizontalAlign, verticalAlign, offsetX, offsetY, menuSize]);

  // 如果菜单不可见，不渲染
  if (!visible) return null;

  const position = getMenuPosition();

  // 渲染菜单内容
  const renderMenuContent = (content: React.ReactNode) => (
    <View
      onLayout={handleMenuLayout}
      style={[
        styles.absoluteContainer,
        {
          top: position.top,
          left: position.left,
        },
      ]}
    >
      {content}
    </View>
  );

  // 完全自定义菜单内容
  if (renderContent) {
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
          {renderMenuContent(renderContent({ close }))}
        </Pressable>
      </Modal>
    );
  }

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
        {renderMenuContent(
          <YStack style={[menuStyles.optionsContainer, optionsStyle]}>
            <View>{children}</View>
          </YStack>
        )}
      </Pressable>
    </Modal>
  );
};

const styles = {
  absoluteContainer: {
    position: 'absolute' as const,
  },
};
