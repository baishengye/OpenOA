/**
 * @itc/document-picker 类型定义
 * 基于 react-native-document-picker 官方 API 类型
 */

// ── 文件类型常量 ──────────────────────────────────────────────────────────────

/**
 * 预定义的文件类型
 * @example
 * ```typescript
 * import { types } from '@itc/document-picker';
 * // 选择图片
 * const result = await DocumentPicker.pick({ type: [types.images] });
 * ```
 */
export const types = {
  allFiles: 'public.item',
  images: 'public.image',
  audio: 'public.audio',
  video: 'public.movie',
  videos: 'public.movie',
  pdf: 'com.adobe.pdf',
  plainText: 'public.plain-text',
  zip: 'public.zip-archive',
  doc: 'com.microsoft.word.doc',
  docx: 'org.openxmlformats.wordprocessingml.document',
  xls: 'com.microsoft.excel.xls',
  xlsx: 'org.openxmlformats.spreadsheetml.sheet',
  ppt: 'com.microsoft.powerpoint.ppt',
  pptx: 'org.openxmlformats.presentationml.presentation',
  csv: 'public.comma-separated-values-text',
} as const;

/**
 * 文件类型映射 - 不同平台可能有不同的 UTI
 */
export const perPlatformTypes = {
  android: {
    allFiles: '*/*',
    images: 'image/*',
    audio: 'audio/*',
    videos: 'video/*',
    pdf: 'application/pdf',
    plainText: 'text/plain',
    zip: 'application/zip',
  },
  ios: types,
  harmony: {
    allFiles: 'public.item',
    images: 'public.image',
    audio: 'public.audio',
    videos: 'public.movie',
    pdf: 'com.adobe.pdf',
    plainText: 'public.plain-text',
    zip: 'public.zip-archive',
  },
} as const;

// ── 文档选择结果 ──────────────────────────────────────────────────────────────

/**
 * 文档选择返回结果
 */
export interface DocumentPickerResponse {
  /** 文件 URI */
  uri: string;
  /** 文件名称 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** MIME 类型 */
  type: string;
  /** 文件复制目标路径（如果设置了 copyTo） */
  fileCopyUri?: string;
  /** 原始文件的路径（部分平台支持） */
  originalUri?: string;
}

// ── 选择选项 ─────────────────────────────────────────────────────────────────

/**
 * 文档选择选项
 * v12+ 移除了 copyTo，mode=open 需要配合 requestLongTermAccess
 */
export interface DocumentPickerOptions {
  /** 是否允许多选，默认 false */
  allowMultiSelection?: boolean;
  /** 允许选择的文件类型 */
  type?: string | string[];
  /** 复制文件到指定目录，可选值: 'cachesDirectory' | 'documentDirectory' (v9.x 兼容，v12+ 不支持) */
  copyTo?: 'cachesDirectory' | 'documentDirectory';
  /** iOS 特有的选项 */
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  /** iOS 特有的选项 */
  transitionStyle?: 'coverVertical' | 'flipHorizontal' | 'crossDissolve' | 'partialCurl';
  /** 模式: 'import' | 'open' (v12+ open 模式需要 requestLongTermAccess) */
  mode?: 'import' | 'open';
  /** 请求长期访问权限 (v12+ mode=open 时可用) */
  requestLongTermAccess?: boolean;
  /** Android 特有 - 是否允许虚拟文件 */
  allowVirtualFiles?: boolean;
}

// ── DocumentPickerProvider 接口 ───────────────────────────────────────────────

/**
 * 文档选择器 Provider 接口
 * 封装三端的文档选择能力，提供统一的 API
 *
 * @example
 * ```typescript
 * import { documentPicker } from '@itc/document-picker';
 *
 * // 选择单个文件
 * const result = await documentPicker.pickSingle();
 *
 * // 选择多个文件
 * const results = await documentPicker.pick();
 *
 * // 选择目录
 * const dir = await documentPicker.pickDirectory();
 * ```
 */
export interface DocumentPickerProvider {
  /**
   * 选择文件（支持多选）
   * @param options - 选择选项
   * @returns 选择的文件列表
   */
  pick(options?: DocumentPickerOptions): Promise<DocumentPickerResponse[]>;

  /**
   * 选择单个文件
   * @param options - 选择选项
   * @returns 选择的文件
   */
  pickSingle(options?: DocumentPickerOptions): Promise<DocumentPickerResponse>;

  /**
   * 选择目录（仅部分平台支持）
   * @returns 选择的目录信息
   */
  pickDirectory(): Promise<DocumentPickerResponse>;

  /**
   * 检查错误是否为用户取消
   * @param err - 错误对象
   * @returns 是否为取消错误
   */
  isCancel(err: unknown): boolean;

  /**
   * 检查是否有正在进行的选则操作
   * @returns 是否有正在进行的操作
   */
  isInProgress(): boolean;

  /**
   * 释放安全访问权限（仅 iOS 在 mode=open 时需要）
   * v12+ 返回 Promise，参数为 string[]
   */
  releaseSecureAccess(uris?: string[]): Promise<void>;
}

// ── 错误类型 ─────────────────────────────────────────────────────────────────

/**
 * 文档选择器错误
 */
export class DocumentPickerError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'DocumentPickerError';
  }
}

/**
 * 取消选择错误
 */
export class DocumentPickerCancelError extends DocumentPickerError {
  constructor() {
    super('User cancelled document picker', 'CANCELLED');
    this.name = 'DocumentPickerCancelError';
  }
}

/**
 * 选择正在进行中错误
 */
export class DocumentPickerInProgressError extends DocumentPickerError {
  constructor() {
    super('Another pick is already in progress', 'IN_PROGRESS');
    this.name = 'DocumentPickerInProgressError';
  }
}
