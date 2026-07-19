/**
 * @itc/document-picker 主入口
 * 文档选择器模块
 *
 * 使用方式：
 * ```typescript
 * import { documentPicker, types } from '@itc/document-picker';
 *
 * // 选择单个文件
 * const result = await documentPicker.pickSingle();
 *
 * // 选择多个文件
 * const results = await documentPicker.pick();
 *
 * // 选择特定类型的文件
 * const images = await documentPicker.pick({ type: [types.images] });
 *
 * // 检查取消
 * try {
 *   const file = await documentPicker.pickSingle();
 * } catch (err) {
 *   if (documentPicker.isCancel(err)) {
 *     console.log('User cancelled');
 *   }
 * }
 * ```
 */

import { DocumentPicker } from './platform';
import type { DocumentPickerProvider } from './types';

const TAG = 'document-picker';

// ── 实例 ─────────────────────────────────────────────────────────────────────

/** 文档选择器实例 */
let _instance: DocumentPickerProvider | null = null;

function getInstance(): DocumentPickerProvider {
  if (!_instance) {
    _instance = new DocumentPicker();
  }
  return _instance;
}

// ── 代理对象 ─────────────────────────────────────────────────────────────────

/** 全局文档选择器代理 */
export const documentPicker: DocumentPickerProvider = new Proxy({} as DocumentPickerProvider, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;
    const instance = getInstance();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

// ── 导出 ─────────────────────────────────────────────────────────────────────

export { DocumentPicker } from './platform';
export type { DocumentPickerProvider } from './types';
export {
  types,
  perPlatformTypes,
  DocumentPickerError,
  DocumentPickerCancelError,
  DocumentPickerInProgressError,
} from './types';
export type {
  DocumentPickerResponse,
  DocumentPickerOptions,
} from './types';
