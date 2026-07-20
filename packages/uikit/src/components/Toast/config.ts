/**
 * @itc/uikit Toast 默认配置
 */
import type { ToastOptions, ToastType } from './types';

// ── 默认图标映射 ──────────────────────────────────────────────────────────────

export const DEFAULT_ICONS: Record<ToastType, string> = {
  info: 'ℹ️',
  warn: '⚠️',
  success: '✅',
  fail: '❌',
};

// ── 默认颜色映射 ──────────────────────────────────────────────────────────────

export const DEFAULT_COLORS: Record<ToastType, string> = {
  info: '#007AFF',
  warn: '#FF9500',
  success: '#34C759',
  fail: '#FF3B30',
};

// ── Toast 默认配置 ────────────────────────────────────────────────────────────

export const DEFAULT_DURATION = 2000;

export const DEFAULT_TOAST_OPTIONS = {
  type: 'info' as const,
  message: '',
  content: null,
  duration: DEFAULT_DURATION,
  style: {},
  contentStyle: {},
  iconStyle: {},
  icon: undefined,
  messageStyle: {},
} as const satisfies ToastOptions;

// ── 默认样式 ──────────────────────────────────────────────────────────────────

/** Toast 容器基础样式 */
export const BASE_CONTAINER_STYLE = {
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginHorizontal: 40,
  minWidth: 200,
  maxWidth: '80%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
} as const;

/** Toast 内容区样式 */
export const BASE_CONTENT_STYLE = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 8,
};

/** 图标文字样式 */
export const BASE_ICON_STYLE = {
  fontSize: 18,
};

/** 消息文字样式 */
export const BASE_MESSAGE_STYLE = {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '400' as const,
};
