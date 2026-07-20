/**
 * @itc/uikit Toast 组件类型定义
 */
import type { ReactNode } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';

// ── Toast 类型 ────────────────────────────────────────────────────────────────

/** Toast 类型 */
export type ToastType = 'info' | 'warn' | 'success' | 'fail';

// ── Toast 配置 ────────────────────────────────────────────────────────────────

export interface ToastOptions {
  /** toast 类型，决定默认图标和颜色 */
  type?: ToastType;
  /** toast 内容文本。如果传了 content，此字段会被忽略 */
  message?: string;
  /** 自定义渲染内容。优先级高于 message */
  content?: ReactNode;
  /** 显示时长（毫秒），默认 2000。传 0 则不自动关闭 */
  duration?: number;
  /** 自定义 toast 容器样式 */
  style?: ViewStyle;
  /** 自定义 toast 内部内容样式 */
  contentStyle?: ViewStyle;
  /** 自定义图标样式 */
  iconStyle?: TextStyle;
  /** 自定义图标文字，覆盖类型默认图标 */
  icon?: string;
  /** 自定义主文字样式 */
  messageStyle?: TextStyle;
}

// ── 按类型区分的默认配置 ────────────────────────────────────────────────────────

/** 按类型区分的默认配置（用于全局默认） */
export interface ToastTypeDefaults {
  /** info 类型默认 content */
  contentInfo?: ReactNode;
  /** warn 类型默认 content */
  contentWarn?: ReactNode;
  /** success 类型默认 content */
  contentSuccess?: ReactNode;
  /** fail 类型默认 content */
  contentFail?: ReactNode;
}

// ── Toast 内部状态 ────────────────────────────────────────────────────────────

/** Toast 唯一标识 */
export type ToastId = string;

/** 单个 Toast 项的完整状态 */
export interface ToastItem {
  id: ToastId;
  options: Required<ToastOptions>;
}

// ── Toast API ─────────────────────────────────────────────────────────────────

/**
 * Toast 静态 API
 */
export interface ToastInterface {
  show: (options: ToastOptions) => void;
  hide: () => void;
  setDefaultOptions: (options: ToastOptions) => void;
  setTypeDefaultOptions: (options: ToastTypeDefaults) => void;
  resetDefaultOptions: () => void;
}
