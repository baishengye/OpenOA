/**
 * 共享类型定义
 * OpenIM Plus Demo 应用
 */

// ── IM SDK 类型重导出 ─────────────────────────────────────────────────────────

import type { MessageItem, ConversationItem as IMConversationItemType, LoginStatus, CreateGroupParams } from '@itc/rn-client-sdk-plus';
import { MessageType as IMMessageType, MessageStatus as IMMessageStatus } from '@itc/rn-client-sdk-plus';

export type { IMConversationItemType, LoginStatus, CreateGroupParams };
export { IMMessageType, IMMessageStatus };

export type { MessageItem };

// ── 登录相关 ──────────────────────────────────────────────────────────────────

/** 登录请求参数 */
export interface LoginParams {
  phone: string;
  password: string;
}

/** 登录响应（后端返回） */
export interface LoginResponse {
  userID: string;
  token: string;
}

/** 认证状态 */
export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

/** 登录表单数据 */
export interface LoginFormData {
  phone: string;
  password: string;
  rememberPassword: boolean;
}

// ── 用户信息 ─────────────────────────────────────────────────────────────────

/** 用户信息 */
export interface UserInfo {
  userID: string;
  nickname?: string;
  faceURL?: string;
  phone?: string;
  email?: string;
  birth?: string;
  gender?: number;
  createTime?: number;
}

// ── 会话相关 ─────────────────────────────────────────────────────────────────

/** 会话类型 */
export type ConversationType = 'single' | 'group';

/** 会话列表项 */
export interface ConversationItem {
  conversationID: string;
  conversationType: ConversationType;
  userID?: string;
  groupID?: string;
  showName: string;
  faceURL?: string;
  latestMsgContent?: string;
  latestMsgSendTime?: number;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  draftText?: string;
  groupInfo?: {
    memberCount: number;
    ownerUserID: string;
  };
}

/** 会话操作类型 */
export type ConversationAction = 'pin' | 'mute' | 'delete' | 'markUnread' | 'clearHistory';

// ── 消息相关 ─────────────────────────────────────────────────────────────────

/** 消息发送状态 */
export type DemoMessageStatus = 'sending' | 'succeed' | 'failed';

/** 消息类型 */
export type DemoMessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'location'
  | 'quote'
  | 'card'
  | 'custom';

/** 消息元素 */
export interface TextElem {
  content?: string;
}

export interface PictureElem {
  sourcePicture?: { url?: string; width?: number; height?: number };
  bigPicture?: { url?: string; width?: number; height?: number };
  snapshotPicture?: { url?: string; width?: number; height?: number };
}

export interface SoundElem {
  duration?: number;
  soundPath?: string;
  displayDuration?: string;
}

export interface VideoElem {
  videoPath?: string;
  duration?: number;
  snapshotUrl?: string;
  videoSize?: number;
}

export interface FileElem {
  fileName?: string;
  fileSize?: number;
  filePath?: string;
}

export interface LocationElem {
  description?: string;
  latitude?: number;
  longitude?: number;
}

/** 消息项（扩展 IM SDK 的 MessageItem） */
export interface Message {
  clientMsgID: string;
  serverMsgID?: string;
  createTime?: number;
  sendTime?: number;
  sessionType?: number;
  sendID?: string;
  senderNickname?: string;
  senderFaceUrl?: string;
  content?: string;
  contentType?: number;
  status?: DemoMessageStatus;
  isSelf?: boolean;
  senderShowName?: string;
  senderFaceURL?: string;
  groupID?: string;
  recvID?: string;
  msgFrom?: number;
  senderPlatformID?: number;
  // 会话列表预览用
  latestMsgContent?: string;
  // 消息元素
  textElem?: TextElem;
  pictureElem?: PictureElem;
  soundElem?: SoundElem;
  videoElem?: VideoElem;
  fileElem?: FileElem;
  locationElem?: LocationElem;
}

/** 消息气泡类型 */
export interface MessageBubbleType {
  type: DemoMessageType;
  content: string;
  extra?: Record<string, unknown>;
}

/** 引用消息 */
export interface QuoteMessageContent {
  quoteMsgID: string;
  quoteMsgSenderNickname: string;
  quoteMsgContent: string;
}

// ── 设置相关 ─────────────────────────────────────────────────────────────────

/** 用户设置 */
export interface UserSettings {
  notifyEnabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  doNotDisturb: boolean;
  allowVoIP: boolean;
}

export const defaultSettings: UserSettings = {
  notifyEnabled: true,
  soundEnabled: true,
  vibrateEnabled: true,
  doNotDisturb: false,
  allowVoIP: false,
};

// ── 导航相关 ─────────────────────────────────────────────────────────────────

/** 根导航参数列表 */
export type RootStackParamList = {
  Login: undefined;
  ConversationList: undefined;
  Chat: { conversationID: string; showName: string; userID?: string };
  PersonalInfo: undefined;
  Settings: undefined;
};

/** 主页面 Tab 导航参数列表 */
export type MainTabParamList = {
  ConversationTab: undefined;
  ProfileTab: undefined;
};

/** 会话栈导航参数列表 */
export type ConversationStackParamList = {
  ConversationList: undefined;
  Chat: {
    conversationID: string;
    conversationType: ConversationType;
    title: string;
    userID?: string;
    groupID?: string;
  };
};

/** 我的栈导航参数列表 */
export type ProfileStackParamList = {
  PersonalInfo: undefined;
  Settings: undefined;
};

// ── 工具函数 ─────────────────────────────────────────────────────────────────

/** 格式化时间显示 */
export function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;

  if (diff < oneMinute) {
    return '刚刚';
  }
  if (diff < oneHour) {
    return `${Math.floor(diff / oneMinute)}分钟前`;
  }
  if (diff < oneDay) {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  if (diff < 7 * oneDay) {
    const date = new Date(timestamp);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()] ?? '';
  }
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/** 格式化消息时间 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/** 截断文本 */
export function truncateText(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/** 格式化未读数 */
export function formatUnreadCount(count: number): string {
  if (count === 0) return '';
  if (count > 99) return '99+';
  return count.toString();
}
