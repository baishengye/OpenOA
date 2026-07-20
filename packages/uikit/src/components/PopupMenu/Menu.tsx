/**
 * Menu - 菜单根容器
 *
 * 架构说明：
 * - Menu 管理菜单的打开/关闭状态
 * - MenuTrigger 是触发器，点击时测量自身位置并打开菜单
 * - MenuOptions 渲染在 Modal 中，根据 triggerLayout 定位
 */

import React, {
  type FC,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { MenuContext } from './context';
import type { MenuProps, MenuConfig, TriggerLayout } from './types';

const defaultConfig: Required<MenuConfig> = {
  animationDuration: 200,
  overlayOpacity: 0.3,
  closeOnPressOutside: true,
  autoDismiss: true,
};

/**
 * Menu 组件。
 * 内部通过 React Context 管理菜单状态。
 */
export const Menu: FC<MenuProps> = ({
  children,
  onOpen,
  onClose,
  onSelect,
}) => {
  const [visible, setVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<TriggerLayout | null>(null);

  // 打开菜单
  const open = useCallback(() => {
    setVisible(true);
    onOpen?.();
  }, [onOpen]);

  // 关闭菜单
  const close = useCallback(() => {
    setVisible(false);
    onClose?.();
  }, [onClose]);

  // 切换菜单
  const toggle = useCallback(() => {
    if (visible) {
      close();
    } else {
      open();
    }
  }, [visible, open, close]);

  // 选中选项（由 MenuOption 调用）
  const select = useCallback(
    (value: string | number | object) => {
      if (defaultConfig.autoDismiss) {
        setVisible(false);
      }
      onSelect?.(value);
    },
    [onSelect]
  );

  const contextValue = useMemo(
    () => ({
      visible,
      open,
      close,
      toggle,
      triggerLayout,
      setTriggerLayout,
      select,
      config: defaultConfig,
    }),
    [visible, open, close, toggle, triggerLayout, select]
  );

  return (
    <MenuContext.Provider value={contextValue}>
      {children}
    </MenuContext.Provider>
  );
};
