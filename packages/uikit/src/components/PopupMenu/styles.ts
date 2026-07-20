/**
 * PopupMenu 默认样式
 */

import { StyleSheet } from 'react-native';

export const menuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionDisabled: {
    opacity: 0.5,
  },
});

export const defaultConfig = {
  animationDuration: 200,
  overlayOpacity: 0.3,
  closeOnPressOutside: true,
  autoDismiss: true,
};
