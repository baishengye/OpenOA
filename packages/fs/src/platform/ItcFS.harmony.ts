/**
 * @itc/fs HarmonyOS 实现
 * 使用 @react-native-ohos/react-native-fs
 */

import OHOSRNFS from '@react-native-ohos/react-native-fs';
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

// ── FsProvider 实现 ──────────────────────────────────────────────────────────

export class ItcFSHarmony implements FsProvider {
  // ── 路径常量 ──────────────────────────────────────────────────────────────

  get MainBundlePath(): string {
    return OHOSRNFS.MainBundlePath;
  }

  get CachesDirectoryPath(): string {
    return OHOSRNFS.CachesDirectoryPath;
  }

  get ExternalCachesDirectoryPath(): string {
    return OHOSRNFS.ExternalCachesDirectoryPath;
  }

  get DownloadDirectoryPath(): string {
    return OHOSRNFS.DownloadDirectoryPath;
  }

  get DocumentDirectoryPath(): string {
    return OHOSRNFS.DocumentDirectoryPath;
  }

  get ExternalDirectoryPath(): string {
    return OHOSRNFS.ExternalDirectoryPath;
  }

  get ExternalStorageDirectoryPath(): string {
    return OHOSRNFS.ExternalStorageDirectoryPath;
  }

  get TemporaryDirectoryPath(): string {
    return OHOSRNFS.TemporaryDirectoryPath;
  }

  get LibraryDirectoryPath(): string {
    return OHOSRNFS.LibraryDirectoryPath;
  }

  get PicturesDirectoryPath(): string {
    return OHOSRNFS.PicturesDirectoryPath;
  }

  get FileProtectionKeys(): string {
    return OHOSRNFS.FileProtectionKeys;
  }

  // ── 基础文件操作 ──────────────────────────────────────────────────────────

  async mkdir(filepath: string, options?: MkdirOptions): Promise<void> {
    try {
      await OHOSRNFS.mkdir(filepath, options);
    } catch (error) {
      logger.warn(TAG, `mkdir failed for ${filepath}`, error);
      throw error;
    }
  }

  async moveFile(filepath: string, destPath: string, options?: FileOptions): Promise<void> {
    try {
      await OHOSRNFS.moveFile(filepath, destPath, options);
    } catch (error) {
      logger.warn(TAG, `moveFile failed from ${filepath} to ${destPath}`, error);
      throw error;
    }
  }

  async copyFile(filepath: string, destPath: string, options?: FileOptions): Promise<void> {
    try {
      await OHOSRNFS.copyFile(filepath, destPath, options);
    } catch (error) {
      logger.warn(TAG, `copyFile failed from ${filepath} to ${destPath}`, error);
      throw error;
    }
  }

  async copyFolder(srcPath: string, destPath: string): Promise<void> {
    try {
      const exists = await OHOSRNFS.exists(destPath);
      if (!exists) {
        await OHOSRNFS.mkdir(destPath);
      }

      const items = await OHOSRNFS.readDir(srcPath);
      for (const item of items) {
        const destItemPath = `${destPath}/${item.name}`;
        if (item.isDirectory()) {
          await this.copyFolder(item.path, destItemPath);
        } else {
          await OHOSRNFS.copyFile(item.path, destItemPath);
        }
      }
    } catch (error) {
      logger.warn(TAG, `copyFolder failed from ${srcPath} to ${destPath}`, error);
      throw error;
    }
  }

  async pathForBundle(bundleNamed: string): Promise<string> {
    try {
      return await OHOSRNFS.pathForBundle(bundleNamed);
    } catch (error) {
      logger.warn(TAG, `pathForBundle failed for ${bundleNamed}`, error);
      throw error;
    }
  }

  async pathForGroup(groupName: string): Promise<string> {
    try {
      return await OHOSRNFS.pathForGroup(groupName);
    } catch (error) {
      logger.warn(TAG, `pathForGroup failed for ${groupName}`, error);
      throw error;
    }
  }

  async getFSInfo(): Promise<FSInfoResult> {
    try {
      return await OHOSRNFS.getFSInfo();
    } catch (error) {
      logger.warn(TAG, 'getFSInfo failed', error);
      throw error;
    }
  }

  async getAllExternalFilesDirs(): Promise<string[]> {
    try {
      return await OHOSRNFS.getAllExternalFilesDirs();
    } catch (error) {
      logger.warn(TAG, 'getAllExternalFilesDirs failed', error);
      throw error;
    }
  }

  async unlink(filepath: string): Promise<void> {
    try {
      await OHOSRNFS.unlink(filepath);
    } catch (error) {
      logger.warn(TAG, `unlink failed for ${filepath}`, error);
      throw error;
    }
  }

  async exists(filepath: string): Promise<boolean> {
    try {
      return await OHOSRNFS.exists(filepath);
    } catch (error) {
      logger.warn(TAG, `exists failed for ${filepath}`, error);
      return false;
    }
  }

  stopDownload(jobId: number): void {
    OHOSRNFS.stopDownload(jobId);
  }

  resumeDownload(jobId: number): void {
    OHOSRNFS.resumeDownload(jobId);
  }

  async isResumable(jobId: number): Promise<boolean> {
    try {
      return await OHOSRNFS.isResumable(jobId);
    } catch (error) {
      logger.warn(TAG, `isResumable failed for jobId ${jobId}`, error);
      return false;
    }
  }

  stopUpload(jobId: number): void {
    OHOSRNFS.stopUpload(jobId);
  }

  completeHandlerIOS(jobId: number): void {
    OHOSRNFS.completeHandlerIOS(jobId);
  }

  // ── 目录操作 ──────────────────────────────────────────────────────────────

  async readDir(dirpath: string): Promise<ReadDirItem[]> {
    try {
      return await OHOSRNFS.readDir(dirpath);
    } catch (error) {
      logger.warn(TAG, `readDir failed for ${dirpath}`, error);
      throw error;
    }
  }

  async scanFile(path: string): Promise<string[]> {
    try {
      return await OHOSRNFS.scanFile(path);
    } catch (error) {
      logger.warn(TAG, `scanFile failed for ${path}`, error);
      throw error;
    }
  }

  async readDirAssets(dirpath: string): Promise<ReadDirItem[]> {
    try {
      return await OHOSRNFS.readDirAssets(dirpath);
    } catch (error) {
      logger.warn(TAG, `readDirAssets failed for ${dirpath}`, error);
      throw error;
    }
  }

  async existsAssets(filepath: string): Promise<boolean> {
    try {
      return await OHOSRNFS.existsAssets(filepath);
    } catch (error) {
      logger.warn(TAG, `existsAssets failed for ${filepath}`, error);
      return false;
    }
  }

  async existsRes(filepath: string): Promise<boolean> {
    try {
      return await OHOSRNFS.existsRes(filepath);
    } catch (error) {
      logger.warn(TAG, `existsRes failed for ${filepath}`, error);
      return false;
    }
  }

  async readdir(dirpath: string): Promise<string[]> {
    try {
      return await OHOSRNFS.readdir(dirpath);
    } catch (error) {
      logger.warn(TAG, `readdir failed for ${dirpath}`, error);
      throw error;
    }
  }

  async setReadable(
    filepath: string,
    readable: boolean,
    ownerOnly: boolean,
  ): Promise<boolean> {
    try {
      return await OHOSRNFS.setReadable(filepath, readable, ownerOnly);
    } catch (error) {
      logger.warn(TAG, `setReadable failed for ${filepath}`, error);
      throw error;
    }
  }

  // ── 文件操作 ──────────────────────────────────────────────────────────────

  async stat(filepath: string): Promise<StatResult> {
    try {
      return await OHOSRNFS.stat(filepath);
    } catch (error) {
      logger.warn(TAG, `stat failed for ${filepath}`, error);
      throw error;
    }
  }

  async readFile(filepath: string, encodingOrOptions?: any): Promise<string> {
    try {
      return await OHOSRNFS.readFile(filepath, encodingOrOptions);
    } catch (error) {
      logger.warn(TAG, `readFile failed for ${filepath}`, error);
      throw error;
    }
  }

  async read(
    filepath: string,
    length?: number,
    position?: number,
    encodingOrOptions?: any,
  ): Promise<string> {
    try {
      return await OHOSRNFS.read(filepath, length, position, encodingOrOptions);
    } catch (error) {
      logger.warn(TAG, `read failed for ${filepath}`, error);
      throw error;
    }
  }

  async readFileAssets(filepath: string, encodingOrOptions?: any): Promise<string> {
    try {
      return await OHOSRNFS.readFileAssets(filepath, encodingOrOptions);
    } catch (error) {
      logger.warn(TAG, `readFileAssets failed for ${filepath}`, error);
      throw error;
    }
  }

  async readFileRes(filepath: string, encodingOrOptions?: any): Promise<string> {
    try {
      return await OHOSRNFS.readFileRes(filepath, encodingOrOptions);
    } catch (error) {
      logger.warn(TAG, `readFileRes failed for ${filepath}`, error);
      throw error;
    }
  }

  async hash(filepath: string, algorithm: string): Promise<string> {
    try {
      return await OHOSRNFS.hash(filepath, algorithm);
    } catch (error) {
      logger.warn(TAG, `hash failed for ${filepath} with algorithm ${algorithm}`, error);
      throw error;
    }
  }

  async copyFileAssets(filepath: string, destPath: string): Promise<void> {
    try {
      await OHOSRNFS.copyFileAssets(filepath, destPath);
    } catch (error) {
      logger.warn(TAG, `copyFileAssets failed from ${filepath} to ${destPath}`, error);
      throw error;
    }
  }

  async copyFileRes(filepath: string, destPath: string): Promise<void> {
    try {
      await OHOSRNFS.copyFileRes(filepath, destPath);
    } catch (error) {
      logger.warn(TAG, `copyFileRes failed from ${filepath} to ${destPath}`, error);
      throw error;
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
    // HarmonyOS 不支持此功能
    logger.warn(TAG, `copyAssetsFileIOS not supported on HarmonyOS`);
    return Promise.reject(new Error('copyAssetsFileIOS not supported on HarmonyOS'));
  }

  async copyAssetsVideoIOS(imageUri: string, destPath: string): Promise<string> {
    // HarmonyOS 不支持此功能
    logger.warn(TAG, `copyAssetsVideoIOS not supported on HarmonyOS`);
    return Promise.reject(new Error('copyAssetsVideoIOS not supported on HarmonyOS'));
  }

  async writeFile(
    filepath: string,
    contents: string,
    encodingOrOptions?: any,
  ): Promise<void> {
    try {
      await OHOSRNFS.writeFile(filepath, contents, encodingOrOptions);
    } catch (error) {
      logger.warn(TAG, `writeFile failed for ${filepath}`, error);
      throw error;
    }
  }

  async appendFile(
    filepath: string,
    contents: string,
    encodingOrOptions?: string,
  ): Promise<void> {
    try {
      await OHOSRNFS.appendFile(filepath, contents, encodingOrOptions);
    } catch (error) {
      logger.warn(TAG, `appendFile failed for ${filepath}`, error);
      throw error;
    }
  }

  async write(
    filepath: string,
    contents: string,
    position?: number,
    encodingOrOptions?: any,
  ): Promise<void> {
    try {
      await OHOSRNFS.write(filepath, contents, position, encodingOrOptions);
    } catch (error) {
      logger.warn(TAG, `write failed for ${filepath}`, error);
      throw error;
    }
  }

  async touch(
    filepath: string,
    mtime?: Date,
    ctime?: Date,
  ): Promise<void> {
    try {
      await OHOSRNFS.touch(filepath, mtime, ctime);
    } catch (error) {
      logger.warn(TAG, `touch failed for ${filepath}`, error);
      throw error;
    }
  }

  // ── 下载/上传 ─────────────────────────────────────────────────────────────

  downloadFile(options: DownloadFileOptions): { jobId: number; promise: Promise<DownloadResult> } {
    return OHOSRNFS.downloadFile(options);
  }

  uploadFiles(options: UploadFileOptions): { jobId: number; promise: Promise<UploadResult> } {
    return OHOSRNFS.uploadFiles(options);
  }
}
