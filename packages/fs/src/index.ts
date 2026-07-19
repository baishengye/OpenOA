/**
 * @itc/fs 主入口
 * 文件系统管理模块
 *
 * 使用方式：
 * ```typescript
 * import { fs } from '@itc/fs';
 *
 * // 使用文件系统
 * const exists = await fs.exists(path);
 * const content = await fs.readFile(path);
 * await fs.writeFile(path, content);
 * ```
 */

import { logger } from '@itc/base';
import { ItcFS } from './platform';
import type { FsProvider } from './types';

const TAG = 'fs';

// ── 注册 + 代理 ───────────────────────────────────────────────────────────────

let _provider: FsProvider = new ItcFS();

/**
 * 覆盖默认文件系统后端。通常无需调用；供测试或未来切换文件系统方案时使用。
 */
export function installFs(provider: FsProvider): void {
  _provider = provider;
  logger.info(TAG, 'fs provider installed');
}

/** 全局文件系统代理，委托给当前已注册的 provider。 */
export const fs: FsProvider = new Proxy({} as FsProvider, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;
    const value = (_provider as any)[prop];
    if (typeof value === 'function') {
      return value.bind(_provider);
    }
    return value;
  },
});

// ── 导出 ─────────────────────────────────────────────────────────────────────

export { ItcFS } from './platform';
export type { FsProvider } from './types';
export type {
  Headers,
  Fields,
  MkdirOptions,
  FileOptions,
  ReadDirItem,
  StatResult,
  DownloadFileOptions,
  DownloadBeginCallbackResult,
  DownloadProgressCallbackResult,
  DownloadResult,
  UploadFileOptions,
  UploadFileItem,
  UploadBeginCallbackResult,
  UploadProgressCallbackResult,
  UploadResult,
  FSInfoResult,
} from './types';
