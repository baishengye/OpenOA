/**
 * @itc/document-picker iOS/Android 实现
 * 使用 @react-native-documents/picker v12+
 */

import { pick, pickDirectory, releaseSecureAccess } from '@react-native-documents/picker';
import { logger } from '@itc/base';
import type {
  DocumentPickerProvider,
  DocumentPickerOptions,
  DocumentPickerResponse,
} from '../types';

const TAG = 'document-picker';

// ── 类型转换工具 ──────────────────────────────────────────────────────────────

/**
 * 将统一的类型字符串转换为原生库接受的格式
 * iOS/Android DocumentPicker 主要支持 MIME 类型
 */
function normalizeTypes(
  type: string | string[] | undefined,
): string[] | undefined {
  if (!type) return undefined;

  const typesArr = Array.isArray(type) ? type : [type];

  // UTI -> MIME 类型映射，确保兼容性
  const utiToMime: Record<string, string> = {
    'public.item': '*/*',
    'public.image': 'image/*',
    'public.audio': 'audio/*',
    'public.movie': 'video/*',
    'com.adobe.pdf': 'application/pdf',
    'public.plain-text': 'text/plain',
    'public.zip-archive': 'application/zip',
    'com.microsoft.word.doc': 'application/msword',
    'org.openxmlformats.wordprocessingml.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'com.microsoft.excel.xls': 'application/vnd.ms-excel',
    'org.openxmlformats.spreadsheetml.sheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'com.microsoft.powerpoint.ppt': 'application/vnd.ms-powerpoint',
    'org.openxmlformats.presentationml.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'public.comma-separated-values-text': 'text/csv',
  };

  return typesArr.map((t) => utiToMime[t] ?? t);
}

/**
 * 转换选择结果 - 适配 v12 API
 */
function normalizeResponse(raw: {
  uri: string;
  name: string | null;
  size: number | null;
  type: string | null;
}): DocumentPickerResponse {
  return {
    uri: raw.uri,
    name: raw.name ?? '',
    size: raw.size ?? 0,
    type: raw.type ?? '',
  };
}

/**
 * 转换选项 - v12 需要严格处理 mode 和 requestLongTermAccess
 * 当 mode='open' 时才添加 requestLongTermAccess
 */
function normalizeOptions(options?: DocumentPickerOptions) {
  if (!options) return undefined;

  const normalized: {
    type?: string[];
    allowMultiSelection?: boolean;
    presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
    transitionStyle?: 'coverVertical' | 'flipHorizontal' | 'crossDissolve' | 'partialCurl';
    mode?: 'import' | 'open';
    requestLongTermAccess?: boolean;
    allowVirtualFiles?: boolean;
  } = {};

  if (options.type) {
    normalized.type = normalizeTypes(options.type);
  }

  if (options.allowMultiSelection !== undefined) {
    normalized.allowMultiSelection = options.allowMultiSelection;
  }

  if (options.presentationStyle) {
    normalized.presentationStyle = options.presentationStyle;
  }

  if (options.transitionStyle) {
    normalized.transitionStyle = options.transitionStyle;
  }

  // v12: mode 和 requestLongTermAccess 必须一起处理
  // 只有 mode='open' 时才设置 requestLongTermAccess
  if (options.mode === 'open') {
    normalized.mode = 'open';
    normalized.requestLongTermAccess = options.requestLongTermAccess ?? false;
  } else if (options.mode === 'import') {
    normalized.mode = 'import';
  }
  // 如果 mode 未设置，不设置 mode 属性（使用默认 import 模式）

  if (options.allowVirtualFiles !== undefined) {
    normalized.allowVirtualFiles = options.allowVirtualFiles;
  }

  return normalized;
}

// ── DocumentPickerProvider 实现 ───────────────────────────────────────────────

export class ItcDocumentPicker implements DocumentPickerProvider {
  /**
   * 选择文件（支持多选）
   */
  async pick(options?: DocumentPickerOptions): Promise<DocumentPickerResponse[]> {
    try {
      const normalizedOptions = normalizeOptions(options);

      // 使用类型断言，因为我们的 DocumentPickerOptions 与 v12 类型存在差异
      const results = await pick(normalizedOptions as any);
      logger.info(TAG, `Picked ${results.length} file(s)`);
      return results.map(normalizeResponse);
    } catch (error) {
      logger.warn(TAG, 'pick failed', error);
      throw error;
    }
  }

  /**
   * 选择单个文件
   * v12+ 使用 pick() + allowMultiSelection: false
   */
  async pickSingle(options?: DocumentPickerOptions): Promise<DocumentPickerResponse> {
    try {
      const normalizedOptions = normalizeOptions({
        ...options,
        allowMultiSelection: false,
      });

      // 使用类型断言，因为我们的 DocumentPickerOptions 与 v12 类型存在差异
      const results = await pick(normalizedOptions as any);
      const result = results[0];
      logger.info(TAG, `Picked single file: ${result.name}`);
      return normalizeResponse(result);
    } catch (error) {
      logger.warn(TAG, 'pickSingle failed', error);
      throw error;
    }
  }

  /**
   * 选择目录
   */
  async pickDirectory(): Promise<DocumentPickerResponse> {
    try {
      const result = await pickDirectory();
      if (!result) {
        return Promise.reject(new Error('No directory selected'));
      }
      logger.info(TAG, `Picked directory: ${result.uri}`);
      return {
        uri: result.uri,
        name: '',
        size: 0,
        type: '',
      };
    } catch (error) {
      logger.warn(TAG, 'pickDirectory failed', error);
      throw error;
    }
  }

  /**
   * 检查是否为取消错误
   * v12+ 通过 error.message 判断
   */
  isCancel(err: unknown): boolean {
    if (err instanceof Error) {
      return err.message === 'User canceled' ||
             err.message.includes('canceled') ||
             err.message.includes('cancelled');
    }
    return false;
  }

  /**
   * 检查是否有正在进行的操作
   * v12+ 该方法已移除，始终返回 false
   */
  isInProgress(): boolean {
    return false;
  }

  /**
   * 释放安全访问权限
   * v12+ 返回 Promise，参数为 string[]
   */
  async releaseSecureAccess(uris?: string[]): Promise<void> {
    try {
      const uriList = uris ?? [];
      await releaseSecureAccess(uriList);
      logger.info(TAG, `Released secure access for ${uriList.length} URI(s)`);
    } catch (error) {
      logger.warn(TAG, 'releaseSecureAccess failed', error);
      throw error;
    }
  }
}
