/**
 * MenuTrigger - 触发器组件
 *
 * 测量自身位置，点击或长按时打开菜单
 */

import React, {
  type FC,
  type ReactNode,
  useCallback,
  useRef,
} from 'react';
import { View, LayoutChangeEvent, GestureResponderEvent } from 'react-native';
import { useMenuContext } from './context';
import type { MenuTriggerProps } from './types';

const LONG_PRESS_DELAY = 500;

/**
 * Menu 触发器。
 * 点击时测量位置并打开菜单。
 */
export const MenuTrigger: FC<MenuTriggerProps> = ({
  children,
  triggerOnLongPress = false,
  disabled = false,
}) => {
  const { open, setTriggerLayout } = useMenuContext();
  const viewRef = useRef<View>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 处理布局变化，测量位置并注册
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      viewRef.current?.measureInWindow((pageX, pageY, width, height) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height, pageX, pageY });
      });
    },
    [setTriggerLayout]
  );

  // 打开菜单
  const openMenu = useCallback(() => {
    viewRef.current?.measureInWindow((pageX, pageY, width, height) => {
      setTriggerLayout({ x: pageX, y: pageY, width, height, pageX, pageY });
      open();
    });
  }, [open, setTriggerLayout]);

  // 触摸开始
  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (disabled) return;
      event.persist();

      if (triggerOnLongPress) {
        // 长按模式：启动定时器
        longPressTimer.current = setTimeout(() => {
          longPressTimer.current = null;
          openMenu();
        }, LONG_PRESS_DELAY);
      } else {
        // 点击模式：立即打开
        openMenu();
      }
    },
    [disabled, triggerOnLongPress, openMenu]
  );

  // 触摸结束（取消长按定时器）
  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <View
      ref={viewRef}
      onLayout={handleLayout}
      onTouchStart={disabled ? undefined : handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </View>
  );
};
