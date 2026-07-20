/**
 * MenuProvider - 全局 Menu Context Provider
 */

import React, { type FC, type ReactNode, useMemo } from 'react';
import { MenuContext } from './context';
import type { MenuProviderProps, MenuConfig } from './types';

const defaultConfig: Required<MenuConfig> = {
  animationDuration: 200,
  overlayOpacity: 0.3,
  closeOnPressOutside: true,
  autoDismiss: true,
};

export const MenuProvider: FC<MenuProviderProps> = ({
  children,
  config = {},
}) => {
  const mergedConfig = useMemo<Required<MenuConfig>>(
    () => ({
      animationDuration: config.animationDuration ?? defaultConfig.animationDuration,
      overlayOpacity: config.overlayOpacity ?? defaultConfig.overlayOpacity,
      closeOnPressOutside: config.closeOnPressOutside ?? defaultConfig.closeOnPressOutside,
      autoDismiss: config.autoDismiss ?? defaultConfig.autoDismiss,
    }),
    [config]
  );

  const contextValue = useMemo(
    () => ({
      visible: false,
      open: () => {},
      close: () => {},
      toggle: () => {},
      triggerLayout: null,
      setTriggerLayout: () => {},
      select: () => {},
      config: mergedConfig,
    }),
    [mergedConfig]
  );

  return (
    <MenuContext.Provider value={contextValue}>
      {children}
    </MenuContext.Provider>
  );
};
