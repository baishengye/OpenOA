/**
 * @itc/fs 类型定义
 * 基于 react-native-fs 官方 API 类型
 */

// ── 目录操作选项 ──────────────────────────────────────────────────────────────

export interface MkdirOptions {
  NSURLIsExcludedFromBackupKey?: boolean; // iOS only
  NSFileProtectionKey?: string; // iOS only
}

export interface FileOptions {
  NSFileProtectionKey?: string; // iOS only
}

// ── 文件/目录信息 ─────────────────────────────────────────────────────────────

export interface ReadDirItem {
  ctime: Date | undefined; // The creation date of the file (iOS only)
  mtime: Date | undefined; // The last modified date of the file
  name: string; // The name of the item
  path: string; // The absolute path to the item
  size: number; // Size in bytes
  isFile: () => boolean; // Is the file just a file?
  isDirectory: () => boolean; // Is the file a directory?
}

export interface StatResult {
  name: string | undefined; // The name of the item
  path: string; // The absolute path to the item
  size: number; // Size in bytes
  mode: number; // UNIX file mode
  ctime: number; // Created date
  mtime: number; // Last modified date
  originalFilepath: string; // In case of content uri this is the pointed file path, otherwise is the same as path
  isFile: () => boolean; // Is the file just a file?
  isDirectory: () => boolean; // Is the file a directory?
}

// ── 下载/上传类型 ─────────────────────────────────────────────────────────────

export type Headers = { [name: string]: string };
export type Fields = { [name: string]: string };

export interface DownloadFileOptions {
  fromUrl: string; // URL to download file from
  toFile: string; // Local filesystem path to save the file to
  headers?: Headers; // An object of headers to be passed to the server
  background?: boolean; // Continue the download in the background after the app terminates (iOS only)
  discretionary?: boolean; // Allow the OS to control the timing and speed of the download to improve perceived performance (iOS only)
  cacheable?: boolean; // Whether the download can be stored in the shared NSURLCache (iOS only)
  progressInterval?: number;
  progressDivider?: number;
  begin?: (res: DownloadBeginCallbackResult) => void;
  progress?: (res: DownloadProgressCallbackResult) => void;
  resumable?: () => void; // only supported on iOS yet
  connectionTimeout?: number; // only supported on Android yet
  readTimeout?: number; // supported on Android and iOS
  backgroundTimeout?: number; // Maximum time (in milliseconds) to download an entire resource (iOS only)
}

export interface DownloadBeginCallbackResult {
  jobId: number; // The download job ID, required if one wishes to cancel the download
  statusCode: number; // The HTTP status code
  contentLength: number; // The total size in bytes of the download resource
  headers: Headers; // The HTTP response headers from the server
}

export interface DownloadProgressCallbackResult {
  jobId: number; // The download job ID
  contentLength: number; // The total size in bytes of the download resource
  bytesWritten: number; // The number of bytes written to the file so far
}

export interface DownloadResult {
  jobId: number; // The download job ID
  statusCode: number; // The HTTP status code
  bytesWritten: number; // The number of bytes written to the file
}

export interface UploadFileOptions {
  toUrl: string; // URL to upload file to
  binaryStreamOnly?: boolean; // Allow for binary data stream for file to be uploaded without extra headers
  files: UploadFileItem[]; // An array of objects with the file information to be uploaded
  headers?: Headers; // An object of headers to be passed to the server
  fields?: Fields; // An object of fields to be passed to the server
  method?: string; // Default is 'POST', supports 'POST' and 'PUT'
  beginCallback?: (res: UploadBeginCallbackResult) => void; // deprecated
  progressCallback?: (res: UploadProgressCallbackResult) => void; // deprecated
  begin?: (res: UploadBeginCallbackResult) => void;
  progress?: (res: UploadProgressCallbackResult) => void;
}

export interface UploadFileItem {
  name: string; // Name of the file, if not defined then filename is used
  filename: string; // Name of file
  filepath: string; // Path to file
  filetype: string; // The mimetype of the file to be uploaded
}

export interface UploadBeginCallbackResult {
  jobId: number; // The upload job ID
}

export interface UploadProgressCallbackResult {
  jobId: number; // The upload job ID
  totalBytesExpectedToSend: number; // The total number of bytes that will be sent to the server
  totalBytesSent: number; // The number of bytes sent to the server
}

export interface UploadResult {
  jobId: number; // The upload job ID
  statusCode: number; // The HTTP status code
  headers: Headers; // The HTTP response headers from the server
  body: string; // The HTTP response body
}

// ── 文件系统信息 ──────────────────────────────────────────────────────────────

export interface FSInfoResult {
  totalSpace: number; // The total amount of storage space on the device (in bytes)
  freeSpace: number; // The amount of available storage space on the device (in bytes)
}

// ── FsProvider 接口 ────────────────────────────────────────────────────────────

export interface FsProvider {
  // ── 路径常量 ──────────────────────────────────────────────────────────────

  readonly MainBundlePath: string;
  readonly CachesDirectoryPath: string;
  readonly ExternalCachesDirectoryPath: string;
  readonly DownloadDirectoryPath: string;
  readonly DocumentDirectoryPath: string;
  readonly ExternalDirectoryPath: string;
  readonly ExternalStorageDirectoryPath: string;
  readonly TemporaryDirectoryPath: string;
  readonly LibraryDirectoryPath: string;
  readonly PicturesDirectoryPath: string;
  readonly FileProtectionKeys: string;

  // ── 基础文件操作 ──────────────────────────────────────────────────────────

  mkdir(filepath: string, options?: MkdirOptions): Promise<void>;
  moveFile(filepath: string, destPath: string, options?: FileOptions): Promise<void>;
  copyFile(filepath: string, destPath: string, options?: FileOptions): Promise<void>;
  copyFolder(srcPath: string, destPath: string): Promise<void>;
  pathForBundle(bundleNamed: string): Promise<string>;
  pathForGroup(groupName: string): Promise<string>;
  getFSInfo(): Promise<FSInfoResult>;
  getAllExternalFilesDirs(): Promise<string[]>;
  unlink(filepath: string): Promise<void>;
  exists(filepath: string): Promise<boolean>;
  stopDownload(jobId: number): void;
  resumeDownload(jobId: number): void;
  isResumable(jobId: number): Promise<boolean>;
  stopUpload(jobId: number): void;
  completeHandlerIOS(jobId: number): void;

  // ── 目录操作 ──────────────────────────────────────────────────────────────

  readDir(dirpath: string): Promise<ReadDirItem[]>;
  scanFile(path: string): Promise<string[]>; // Android only
  readDirAssets(dirpath: string): Promise<ReadDirItem[]>; // Android only
  existsAssets(filepath: string): Promise<boolean>; // Android only
  existsRes(filepath: string): Promise<boolean>; // Android only
  readdir(dirpath: string): Promise<string[]>; // Node style version
  setReadable(filepath: string, readable: boolean, ownerOnly: boolean): Promise<boolean>; // Android only

  // ── 文件操作 ──────────────────────────────────────────────────────────────

  stat(filepath: string): Promise<StatResult>;
  readFile(filepath: string, encodingOrOptions?: any): Promise<string>;
  read(
    filepath: string,
    length?: number,
    position?: number,
    encodingOrOptions?: any,
  ): Promise<string>;
  readFileAssets(filepath: string, encodingOrOptions?: any): Promise<string>; // Android only
  readFileRes(filepath: string, encodingOrOptions?: any): Promise<string>; // Android only
  hash(filepath: string, algorithm: string): Promise<string>;
  copyFileAssets(filepath: string, destPath: string): Promise<void>; // Android only
  copyFileRes(filepath: string, destPath: string): Promise<void>; // Android only
  copyAssetsFileIOS(
    imageUri: string,
    destPath: string,
    width: number,
    height: number,
    scale?: number,
    compression?: number,
    resizeMode?: string,
  ): Promise<string>; // iOS only
  copyAssetsVideoIOS(imageUri: string, destPath: string): Promise<string>; // iOS only
  writeFile(filepath: string, contents: string, encodingOrOptions?: any): Promise<void>;
  appendFile(filepath: string, contents: string, encodingOrOptions?: string): Promise<void>;
  write(
    filepath: string,
    contents: string,
    position?: number,
    encodingOrOptions?: any,
  ): Promise<void>;
  touch(filepath: string, mtime?: Date, ctime?: Date, modifyCreationTime?: boolean): Promise<void>;

  // ── 下载/上传 ─────────────────────────────────────────────────────────────

  downloadFile(options: DownloadFileOptions): { jobId: number; promise: Promise<DownloadResult> };
  uploadFiles(options: UploadFileOptions): { jobId: number; promise: Promise<UploadResult> };
}

