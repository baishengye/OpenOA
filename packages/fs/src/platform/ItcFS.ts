/**
 * @itc/fs iOS/Android 实现
 * 使用 react-native-fs-turbo (JSI/C++ TurboModules)
 */

import RNFSTurbo from 'react-native-fs-turbo';
import { logger } from '@itc/base';
import type {
  FsProvider,
  MkdirOptions,
  FileOptions,
  ReadDirItem,
  StatResult,
  DownloadFileOptions,
  DownloadResult,
  UploadFileOptions,
  UploadResult,
  FSInfoResult,
} from '../types';

const TAG = 'fs';

// ── 类型映射 ─────────────────────────────────────────────────────────────────

// react-native-fs-turbo 使用不同的类型定义，需要适配

interface TurboReadDirItem {
  ctime: Date;
  mtime: Date;
  name: string;
  path: string;
  size: string;
  isFile: () => boolean;
  isDirectory: () => boolean;
}

interface TurboStatResult {
  path: string;
  ctime: Date;
  mtime: Date;
  size: number;
  mode: number;
  originalFilepath: string;
  isFile: () => boolean;
  isDirectory: () => boolean;
}

interface TurboFSInfoResult {
  totalSpace: number;
  freeSpace: number;
  totalSpaceEx?: number;
  freeSpaceEx?: number;
  encryptionEnabled: boolean;
}

// ── FsProvider 实现 ──────────────────────────────────────────────────────────

export class ItcFS implements FsProvider {
  // ── 路径常量 ──────────────────────────────────────────────────────────────

  get MainBundlePath(): string {
    return RNFSTurbo.MainBundlePath;
  }

  get CachesDirectoryPath(): string {
    return RNFSTurbo.CachesDirectoryPath;
  }

  get ExternalCachesDirectoryPath(): string {
    return RNFSTurbo.ExternalCachesDirectoryPath;
  }

  get DownloadDirectoryPath(): string {
    return RNFSTurbo.DownloadDirectoryPath;
  }

  get DocumentDirectoryPath(): string {
    return RNFSTurbo.DocumentDirectoryPath;
  }

  get ExternalDirectoryPath(): string {
    return RNFSTurbo.ExternalDirectoryPath;
  }

  get ExternalStorageDirectoryPath(): string {
    return RNFSTurbo.ExternalStorageDirectoryPath;
  }

  get TemporaryDirectoryPath(): string {
    return RNFSTurbo.TemporaryDirectoryPath;
  }

  get LibraryDirectoryPath(): string {
    return RNFSTurbo.LibraryDirectoryPath;
  }

  get PicturesDirectoryPath(): string {
    return RNFSTurbo.PicturesDirectoryPath;
  }

  get FileProtectionKeys(): string {
    // Turbo 版本没有这个属性，返回空字符串
    return '';
  }

  // ── 基础文件操作 ──────────────────────────────────────────────────────────

  mkdir(filepath: string, _options?: MkdirOptions): Promise<void> {
    try {
      // react-native-fs-turbo 不支持 MkdirOptions，忽略参数
      RNFSTurbo.mkdir(filepath);
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `mkdir failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  moveFile(filepath: string, destPath: string, _options?: FileOptions): Promise<void> {
    try {
      // react-native-fs-turbo 不支持 FileOptions，忽略参数
      RNFSTurbo.moveFile(filepath, destPath);
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `moveFile failed from ${filepath} to ${destPath}`, error);
      return Promise.reject(error);
    }
  }

  copyFile(filepath: string, destPath: string, _options?: FileOptions): Promise<void> {
    try {
      RNFSTurbo.copyFile(filepath, destPath);
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `copyFile failed from ${filepath} to ${destPath}`, error);
      return Promise.reject(error);
    }
  }

  copyFolder(srcPath: string, destPath: string): Promise<void> {
    try {
      RNFSTurbo.copyFolder(srcPath, destPath);
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `copyFolder failed from ${srcPath} to ${destPath}`, error);
      return Promise.reject(error);
    }
  }

  async pathForBundle(bundleNamed: string): Promise<string> {
    // Turbo 版本没有这个方法
    logger.warn(TAG, `pathForBundle not supported in Turbo version`);
    return Promise.reject(new Error('pathForBundle not supported'));
  }

  async pathForGroup(groupName: string): Promise<string> {
    try {
      return RNFSTurbo.pathForGroup(groupName);
    } catch (error) {
      logger.warn(TAG, `pathForGroup failed for ${groupName}`, error);
      return Promise.reject(error);
    }
  }

  async getFSInfo(): Promise<FSInfoResult> {
    try {
      const info = RNFSTurbo.getFSInfo() as TurboFSInfoResult;
      return {
        totalSpace: info.totalSpace,
        freeSpace: info.freeSpace,
      };
    } catch (error) {
      logger.warn(TAG, 'getFSInfo failed', error);
      return Promise.reject(error);
    }
  }

  async getAllExternalFilesDirs(): Promise<string[]> {
    try {
      return RNFSTurbo.getAllExternalFilesDirs();
    } catch (error) {
      logger.warn(TAG, 'getAllExternalFilesDirs failed', error);
      return Promise.reject(error);
    }
  }

  unlink(filepath: string): Promise<void> {
    try {
      RNFSTurbo.unlink(filepath);
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `unlink failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  exists(filepath: string): Promise<boolean> {
    try {
      return Promise.resolve(RNFSTurbo.exists(filepath));
    } catch (error) {
      logger.warn(TAG, `exists failed for ${filepath}`, error);
      return Promise.resolve(false);
    }
  }

  stopDownload(jobId: number): void {
    RNFSTurbo.stopDownload(jobId);
  }

  resumeDownload(jobId: number): void {
    RNFSTurbo.resumeDownload(jobId);
  }

  isResumable(jobId: number): Promise<boolean> {
    try {
      return Promise.resolve(RNFSTurbo.isResumable(jobId));
    } catch (error) {
      logger.warn(TAG, `isResumable failed for jobId ${jobId}`, error);
      return Promise.resolve(false);
    }
  }

  stopUpload(jobId: number): void {
    RNFSTurbo.stopUpload(jobId);
  }

  completeHandlerIOS(jobId: number): void {
    RNFSTurbo.completeHandlerIOS(jobId);
  }

  // ── 目录操作 ──────────────────────────────────────────────────────────────

  async readDir(dirpath: string): Promise<ReadDirItem[]> {
    try {
      const items = RNFSTurbo.readDir(dirpath) as TurboReadDirItem[];
      return items.map((item) => ({
        ctime: item.ctime,
        mtime: item.mtime,
        name: item.name,
        path: item.path,
        size: typeof item.size === 'string' ? parseInt(item.size, 10) : item.size,
        isFile: item.isFile,
        isDirectory: item.isDirectory,
      }));
    } catch (error) {
      logger.warn(TAG, `readDir failed for ${dirpath}`, error);
      return Promise.reject(error);
    }
  }

  async scanFile(path: string): Promise<string[]> {
    // Turbo 版本使用不同的 scanFile API
    try {
      const result = RNFSTurbo.scanFile(path) as { promise?: Promise<{ path: string }> };
      if (result && result.promise) {
        const r = await result.promise;
        return [r.path];
      }
      return [path];
    } catch (error) {
      logger.warn(TAG, `scanFile failed for ${path}`, error);
      return Promise.reject(error);
    }
  }

  async readDirAssets(dirpath: string): Promise<ReadDirItem[]> {
    try {
      const items = RNFSTurbo.readDirAssets(dirpath) as TurboReadDirItem[];
      return items.map((item) => ({
        ctime: item.ctime,
        mtime: item.mtime,
        name: item.name,
        path: item.path,
        size: typeof item.size === 'string' ? parseInt(item.size, 10) : item.size,
        isFile: item.isFile,
        isDirectory: item.isDirectory,
      }));
    } catch (error) {
      logger.warn(TAG, `readDirAssets failed for ${dirpath}`, error);
      return Promise.reject(error);
    }
  }

  existsAssets(filepath: string): Promise<boolean> {
    try {
      return Promise.resolve(RNFSTurbo.existsAssets(filepath));
    } catch (error) {
      logger.warn(TAG, `existsAssets failed for ${filepath}`, error);
      return Promise.resolve(false);
    }
  }

  existsRes(filepath: string): Promise<boolean> {
    try {
      return Promise.resolve(RNFSTurbo.existsRes(filepath));
    } catch (error) {
      logger.warn(TAG, `existsRes failed for ${filepath}`, error);
      return Promise.resolve(false);
    }
  }

  readdir(dirpath: string): Promise<string[]> {
    try {
      return Promise.resolve(RNFSTurbo.readdir(dirpath));
    } catch (error) {
      logger.warn(TAG, `readdir failed for ${dirpath}`, error);
      return Promise.reject(error);
    }
  }

  async setReadable(
    filepath: string,
    readable: boolean,
    ownerOnly: boolean,
  ): Promise<boolean> {
    // Turbo 版本没有这个方法
    logger.warn(TAG, `setReadable not supported in Turbo version`);
    return Promise.reject(new Error('setReadable not supported'));
  }

  // ── 文件操作 ──────────────────────────────────────────────────────────────

  async stat(filepath: string): Promise<StatResult> {
    try {
      const result = RNFSTurbo.stat(filepath) as TurboStatResult;
      return {
        name: result.path.split('/').pop(),
        path: result.path,
        size: result.size,
        mode: result.mode,
        ctime: result.ctime.getTime(),
        mtime: result.mtime.getTime(),
        originalFilepath: result.originalFilepath,
        isFile: result.isFile,
        isDirectory: result.isDirectory,
      };
    } catch (error) {
      logger.warn(TAG, `stat failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  readFile(filepath: string, encodingOrOptions?: any): Promise<string> {
    try {
      const encoding = typeof encodingOrOptions === 'string' ? encodingOrOptions : encodingOrOptions?.encoding;
      const result = RNFSTurbo.readFile(filepath, encoding || 'utf8');
      return Promise.resolve(result as string);
    } catch (error) {
      logger.warn(TAG, `readFile failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  read(
    filepath: string,
    length: number = 0,
    position: number = 0,
    encodingOrOptions?: any,
  ): Promise<string> {
    try {
      const encoding = typeof encodingOrOptions === 'string' ? encodingOrOptions : encodingOrOptions?.encoding;
      const result = RNFSTurbo.read(filepath, length, position, encoding || 'utf8');
      return Promise.resolve(result as string);
    } catch (error) {
      logger.warn(TAG, `read failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  async readFileAssets(filepath: string, encodingOrOptions?: any): Promise<string> {
    try {
      const encoding = typeof encodingOrOptions === 'string' ? encodingOrOptions : encodingOrOptions?.encoding;
      const result = RNFSTurbo.readFileAssets(filepath, encoding || 'utf8');
      // react-native-fs-turbo 返回的是 string[]
      if (Array.isArray(result)) {
        return result.join('');
      }
      return String(result);
    } catch (error) {
      logger.warn(TAG, `readFileAssets failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  async readFileRes(filepath: string, encodingOrOptions?: any): Promise<string> {
    try {
      const encoding = typeof encodingOrOptions === 'string' ? encodingOrOptions : encodingOrOptions?.encoding;
      const result = RNFSTurbo.readFileRes(filepath, encoding || 'utf8');
      if (Array.isArray(result)) {
        return result.join('');
      }
      return String(result);
    } catch (error) {
      logger.warn(TAG, `readFileRes failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  hash(filepath: string, algorithm: string): Promise<string> {
    try {
      return Promise.resolve(RNFSTurbo.hash(filepath, algorithm as any));
    } catch (error) {
      logger.warn(TAG, `hash failed for ${filepath} with algorithm ${algorithm}`, error);
      return Promise.reject(error);
    }
  }

  copyFileAssets(filepath: string, destPath: string): Promise<void> {
    try {
      RNFSTurbo.copyFileAssets(filepath, destPath);
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `copyFileAssets failed from ${filepath} to ${destPath}`, error);
      return Promise.reject(error);
    }
  }

  copyFileRes(filepath: string, destPath: string): Promise<void> {
    try {
      RNFSTurbo.copyFileRes(filepath, destPath);
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `copyFileRes failed from ${filepath} to ${destPath}`, error);
      return Promise.reject(error);
    }
  }

  async copyAssetsFileIOS(
    imageUri: string,
    destPath: string,
    width: number,
    height: number,
    scale?: number,
    compression?: number,
    resizeMode?: string,
  ): Promise<string> {
    try {
      const result = RNFSTurbo.copyAssetsFileIOS(
        imageUri,
        destPath,
        width,
        height,
        scale,
        compression,
        resizeMode,
      );
      return Promise.resolve(result ?? '');
    } catch (error) {
      logger.warn(TAG, `copyAssetsFileIOS failed for ${imageUri}`, error);
      return Promise.reject(error);
    }
  }

  async copyAssetsVideoIOS(imageUri: string, destPath: string): Promise<string> {
    try {
      const result = RNFSTurbo.copyAssetsVideoIOS(imageUri, destPath);
      return Promise.resolve(result ?? '');
    } catch (error) {
      logger.warn(TAG, `copyAssetsVideoIOS failed for ${imageUri}`, error);
      return Promise.reject(error);
    }
  }

  writeFile(
    filepath: string,
    contents: string,
    encodingOrOptions?: any,
  ): Promise<void> {
    try {
      const encoding = typeof encodingOrOptions === 'string' ? encodingOrOptions : encodingOrOptions?.encoding;
      RNFSTurbo.writeFile(filepath, contents, encoding || 'utf8');
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `writeFile failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  appendFile(
    filepath: string,
    contents: string,
    encodingOrOptions?: string,
  ): Promise<void> {
    try {
      // react-native-fs-turbo 需要 WriteOptions 对象，使用 as any 跳过类型检查
      RNFSTurbo.appendFile(filepath, contents, encodingOrOptions as any);
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `appendFile failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  write(
    filepath: string,
    contents: string,
    position?: number,
    encodingOrOptions?: any,
  ): Promise<void> {
    try {
      const encoding = typeof encodingOrOptions === 'string' ? encodingOrOptions : encodingOrOptions?.encoding;
      RNFSTurbo.write(filepath, contents, position ?? 0, encoding || 'utf8');
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `write failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  touch(
    filepath: string,
    mtime?: Date,
    ctime?: Date,
  ): Promise<void> {
    try {
      RNFSTurbo.touch(filepath, mtime, ctime);
      return Promise.resolve();
    } catch (error) {
      logger.warn(TAG, `touch failed for ${filepath}`, error);
      return Promise.reject(error);
    }
  }

  // ── 下载/上传 ─────────────────────────────────────────────────────────────

  downloadFile(options: DownloadFileOptions): { jobId: number; promise: Promise<DownloadResult> } {
    // 使用 as any 跳过类型检查，因为类型定义有细微差异但运行时兼容
    const result = RNFSTurbo.downloadFile(options as any) as {
      jobId: number;
      promise?: Promise<DownloadResult>;
    };
    if (result.promise) {
      return result as { jobId: number; promise: Promise<DownloadResult> };
    }
    return {
      jobId: result.jobId,
      promise: Promise.reject(new Error('downloadFile callback mode not supported')),
    };
  }

  uploadFiles(options: UploadFileOptions): { jobId: number; promise: Promise<UploadResult> } {
    const result = RNFSTurbo.uploadFiles(options as any) as {
      jobId: number;
      promise?: Promise<UploadResult>;
    };
    if (result.promise) {
      return result as { jobId: number; promise: Promise<UploadResult> };
    }
    return {
      jobId: result.jobId,
      promise: Promise.reject(new Error('uploadFiles callback mode not supported')),
    };
  }
}
