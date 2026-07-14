// ============ Re-export all types ============
export * from './entity';
export * from './enum';
export * from './eventArgs';
export * from './params';

// Re-export MessageItem explicitly to avoid resolution issues
import type { MessageItem } from './entity';
export type { MessageItem };

// ============ IM Module specific types ============

/** 连接状态 */
export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'kickedOffline';

/** IM 消息类型（简化版，用于事件总线） */
export type IMMessage = {
  clientMsgID: string;
  serverMsgID: string;
  createTime: number;
  sessionType: number;
  sendID: string;
  recvID: string;
  msgFrom: number;
  contentType: number;
  platformID: number;
  senderNickName: string;
  senderFaceUrl: string;
  content: string;
  status: number;
  isRead: boolean;
  isReact: boolean;
  reactionList?: unknown[];
  messageEntityList?: unknown[];
  extension?: string;
  localEx?: string;
};

/** IM 初始化选项（对应 OpenIM SDK InitOptions） */
export type IMInitOptions = {
  /** API 地址 */
  apiAddr: string;
  /** WebSocket 地址 */
  wsAddr: string;
  /** 存储目录 */
  dataDir?: string;
  /** 日志文件路径 */
  logFilePath?: string;
  /** 日志级别 */
  logLevel?: number;
  /** 是否自动登录 */
  isAutoLogin?: boolean;
  /** 是否输出日志到标准输出 */
  isLogStandardOutput?: boolean;
  /** 网络超时时间（毫秒） */
  networkTimeout?: number;
  /** 日志文件名 */
  logFileName?: string;
};
