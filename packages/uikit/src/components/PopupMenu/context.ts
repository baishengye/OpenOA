/**
 * PopupMenu Context
 */

import { createContext, useContext } from 'react';
import type { MenuContextValue, MenuConfig } from './types';

export const MenuContext = createContext<MenuContextValue>({
  visible: false,
  open: () => {},
  close: () => {},
  toggle: () => {},
  triggerLayout: null,
  setTriggerLayout: () => {},
  select: () => {},
  config: {
    animationDuration: 200,
    overlayOpacity: 0.3,
    closeOnPressOutside: true,
    autoDismiss: true,
  },
});

export const useMenuContext = () => useContext(MenuContext);
