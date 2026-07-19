/**
 * @itc/document-picker HarmonyOS 实现
 * 使用 @react-native-ohos/react-native-document-picker
 */

import DocumentPicker from '@react-native-ohos/react-native-document-picker';
import { logger } from '@itc/base';
import type {
  DocumentPickerProvider,
  DocumentPickerOptions,
  DocumentPickerResponse,
} from '../types';

const TAG = 'document-picker';

// ── 类型转换工具 ──────────────────────────────────────────────────────────────

/**
 * 将统一的类型字符串转换为 HarmonyOS 接受的格式
 * 使用 MIME 类型以确保兼容性
 */
function normalizeTypes(type: string | string[] | undefined): string[] | undefined {
  if (!type) return undefined;

  const typesArr = Array.isArray(type) ? type : [type];

  // UTI -> MIME 类型映射
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
 * 转换选择结果
 */
function normalizeResponse(raw: {
  uri: string;
  name: string | null;
  size: number | null;
  type: string | null;
  fileCopyUri: string | null;
}): DocumentPickerResponse {
  return {
    uri: raw.uri ?? '',
    name: raw.name ?? '',
    size: typeof raw.size === 'string' ? parseInt(raw.size, 10) : (raw.size ?? 0),
    type: raw.type ?? '',
    fileCopyUri: raw.fileCopyUri ?? undefined,
  };
}

// ── DocumentPickerProvider 实现 ───────────────────────────────────────────────

export class ItcDocumentPickerHarmony implements DocumentPickerProvider {
  /**
   * 选择文件（支持多选）
   */
  async pick(options?: DocumentPickerOptions): Promise<DocumentPickerResponse[]> {
    try {
      const normalizedOptions = {
        ...options,
        type: normalizeTypes(options?.type),
      };

      const results = await DocumentPicker.pick(normalizedOptions);
      logger.info(TAG, `Picked ${results.length} file(s)`);
      return results.map(normalizeResponse);
    } catch (error) {
      logger.warn(TAG, 'pick failed', error);
      throw error;
    }
  }

  /**
   * 选择单个文件
   */
  async pickSingle(options?: DocumentPickerOptions): Promise<DocumentPickerResponse> {
    try {
      const normalizedOptions = {
        ...options,
        type: normalizeTypes(options?.type),
      };

      const result = await DocumentPicker.pickSingle(normalizedOptions);
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
      const result = await DocumentPicker.pickDirectory();
      if (!result) {
        return Promise.reject(new Error('No directory selected'));
      }
      logger.info(TAG, `Picked directory: ${result.uri}`);
      // DirectoryPickerResponse 只包含 uri 属性
      return {
        uri: result.uri ?? '',
        name: '',
        size: 0,
        type: 'directory',
      };
    } catch (error) {
      logger.warn(TAG, 'pickDirectory failed', error);
      throw error;
    }
  }

  /**
   * 检查是否为取消错误
   */
  isCancel(err: unknown): boolean {
    return DocumentPicker.isCancel(err);
  }

  /**
   * 检查是否有正在进行的操作
   */
  isInProgress(): boolean {
    // 检查是否有正在进行的文档选择操作
    return DocumentPicker.isInProgress(new Error('in_progress_check'));
  }

  /**
   * 释放安全访问权限
   * v12+ 返回 Promise，参数为 string[]
   */
  async releaseSecureAccess(uris?: string[]): Promise<void> {
    // HarmonyOS: 需要传入 URI 数组
    DocumentPicker.releaseSecureAccess(uris ?? []);
  }
}

// ── 导出类型常量 ──────────────────────────────────────────────────────────────

export { DocumentPicker as types };
