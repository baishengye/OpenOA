/**
 * OpenIM SDK 类型定义
 */

// ============ 消息相关类型 ============

export interface IMMessage {
  clientMsgId: string;
  serverMsgId: string;
  createTime: number;
  sendTime: number;
  sessionType: number;
  senderId: string;
  senderNickName: string;
  senderFaceUrl: string;
  conversationId: string;
  conversationType: number;
  conversationNickName: string;
  conversationFaceUrl: string;
  offlinePush: {
    title: string;
    desc: string;
    ex: string;
    iOSPushSound: string;
    iOSBadgeCount: number; // Go 后端期望 number 类型（0 或 1），而非 boolean
  };
  atText: string;
  faceUrl: string;
  ex: string;
  isRead: boolean;
  contentType: MessageContentType;
  platformID: number;
  listener?: string;
  textElem?: {
    content: string;
  };
  cardElem?: {
    userID: string;
    nickname: string;
    faceURL: string;
  };
  pictureElem?: {
    sourcePath: string;
    sourcePictureSize: {
      width: number;
      height: number;
    };
    pictureUrl: string;
    snapshotPictureUrl: string;
  };
  soundElem?: {
    uuid: string;
    soundPath: string;
    sourceUrl: string;
    dataSize: number;
    duration: number;
  };
  videoElem?: {
    videoPath: string;
    videoUUID: string;
    videoUrl: string;
    duration: number;
    snapshotPath: string;
    snapshotUUID: string;
    snapshotUrl: string;
    snapshotSize: {
      width: number;
      height: number;
    };
    fileSize: number;
  };
  fileElem?: {
    filePath: string;
    uuid: string;
    sourceUrl: string;
    fileName: string;
    fileSize: number;
  };
  locationElem?: {
    description: string;
    longitude: number;
    latitude: number;
  };
  mergeElem?: {
    title: string;
    abstractList: string[];
    messageList: IMMessage[];
  };
  customElem?: {
    data: string;
    description: string;
    extension: string;
  };
  quoteElem?: {
    text: string;
    quoteMessage: IMMessage;
  };
  notificationElem?: {
    detail: string;
    operationType: number;
  };
  typingElem?: {
    msgTip: string;
  };
}

export enum MessageContentType {
  TEXT = 101,
  IMAGE = 102,
  SOUND = 103,
  VIDEO = 104,
  FILE = 105,
  AT = 106,
  MERGER = 107,
  CARD = 108,
  LOCATION = 109,
  CUSTOM = 110,
  QUOTE = 111,
  NOTIFICATION = 120,
  REVOKE = 130,
  HAS_READ_SEND = 140,
  HAS_READ_RECEIPT = 141,
  TYPING = 150,
}

// ============ 会话相关类型 ============

export interface ConversationItem {
  conversationID: string;
  conversationType: number;
  userID: string;
  groupID: string;
  showName: string;
  faceUrl: string;
  latestMsg: string;
  latestMsgSendTime: number;
  unreadCount: number;
  groupAtType: number;
  isPinned: boolean;
  isPrivate: boolean;
  isNotInGroup: boolean;
  updateUnreadCountTime: number;
  draftText: string;
  burnDuration: number;
  isOpen: boolean;
  recvMsgOpt: number;
  messageHasReadPending: boolean;
}

export enum ConversationType {
  SINGLE = 1,
  GROUP = 2,
  NOTIFICATION = 3,
}

// ============ 连接状态 ============

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'kickedOffline';

// ============ 用户相关类型 ============

export interface UserInfo {
  userID: string;
  nickname: string;
  faceURL: string;
  globalRecvMsgOpt: number;
  ex: string;
}

export interface PublicUserItem {
  userID: string;
  nickname: string;
  faceURL: string;
  globalRecvMsgOpt: number;
}

// ============ 群组相关类型 ============

export interface GroupItem {
  groupID: string;
  groupName: string;
  notification: string;
  introduction: string;
  faceUrl: string;
  ownerUserID: string;
  createTime: number;
  memberCount: number;
  extra: string;
}

export interface GroupMemberItem {
  groupID: string;
  userID: string;
  nickname: string;
  faceUrl: string;
  roleLevel: number;
  joinTime: number;
  muteEndTime: number;
  ex: string;
}

// ============ 好友相关类型 ============

export interface FriendUserItem {
  ownerUserID: string;
  friendUserID: string;
  remark: string;
  createTime: number;
  addSource: number;
  operatorUserID: string;
  nickname: string;
  faceUrl: string;
  gender: number;
  phoneNumber: string;
  birth: string;
  email: string;
  ex: string;
  attachedInfo: string;
  userFullInfo: PublicUserItem;
}

export interface BlackUserItem {
  ownerUserID: string;
  blockUserID: string;
  createTime: number;
  nickname: string;
  faceUrl: string;
  gender: number;
  phoneNumber: string;
  birth: string;
  email: string;
  ex: string;
  attachedInfo: string;
  userFullInfo: PublicUserItem;
}

// ============ 初始化配置 ============

export interface IMInitOptions {
  /** OpenIM API 地址 */
  apiAddr: string;
  /** OpenIM WebSocket 地址 */
  wsAddr: string;
  /** 平台 ID：1=iOS 2=Android */
  platformID?: number;
  /** 数据库加密密钥 */
  dataDir?: string;
  /** 日志等级 */
  logLevel?: number;
  /** 是否自动登录 */
  isAutoLogin?: boolean;
  /** 网络超时时间（毫秒） */
  networkTimeout?: number;
  /** 日志存储路径 */
  logFilePath?: string;
}

// ============ 消息发送参数 ============

export interface SendMessageParams {
  audioUri?: string;
  ex?: string;
  ext?: string;
  fileUri?: string;
  imageUri?: string;
  videoUri?: string;
}
