/**
 * IM SDK 业务封装服务
 * 封装 IM SDK 的常用操作
 */
import {
  MessageItem,
  ConversationItem as IMConversationItem,
  SelfUserInfo,
  itcOpenIM,
  ViewType,
} from '@itc/rn-client-sdk-plus';
import type {
  SendMsgParams,
  OperateMessageParams,
  GetAdvancedHistoryMsgParams,
} from '@itc/rn-client-sdk-plus';
import { API_ADDR, WS_ADDR } from '../config';
import type {
  ConversationItem,
  Message,
  UserInfo,
} from '../types';
import { isIOS } from '@itc/base';

// ── SDK 初始化 ───────────────────────────────────────────────────────────────

/** 初始化 IM SDK */
export async function initIM(): Promise<void> {
  const dataDir = "itc_openim_data";
  // dataDir 用于指定 SDK 数据存储目录
  console.log('[IMService] 初始化 IM SDK, dataDir:', dataDir);
  await itcOpenIM.initSDK({
    apiAddr: API_ADDR,
    wsAddr: WS_ADDR,
    dataDir: dataDir,
  });
}

// ── 登录/登出 ─────────────────────────────────────────────────────────────────

/** IM SDK 登录 */
export async function loginIM(userID: string, token: string): Promise<void> {
  console.log('[IMService] 开始 IM SDK 登录:', { userID, tokenPrefix: token.substring(0, 20) + '...' });
  await itcOpenIM.login({ userID, token });
  console.log('[IMService] IM SDK 登录完成');
}

/** IM SDK 登出 */
export async function logoutIM(): Promise<void> {
  await itcOpenIM.logout();
}

/** 获取登录状态 */
export async function getLoginStatus(): Promise<number> {
  return await itcOpenIM.getLoginStatus();
}

/** 获取当前用户 ID */
export async function getCurrentUserID(): Promise<string> {
  return await itcOpenIM.getLoginUserID();
}

// ── 会话操作 ─────────────────────────────────────────────────────────────────

/** 获取所有会话列表 */
export async function getConversationList(currentUserID?: string): Promise<ConversationItem[]> {
  const list = await itcOpenIM.getAllConversationList() as IMConversationItem[];
  console.log('[IMService] getConversationList 获取到会话数:', list.length, 'currentUserID:', currentUserID);
  // 打印前几个会话的 conversationID 用于调试
  list.slice(0, 3).forEach((item, idx) => {
    console.log(`[IMService] 会话${idx}: conversationID=${item.conversationID}, userID=${item.userID}, showName=${item.showName}`);
  });
  return list.map((item) => convertToConversationItem(item, currentUserID));
}

/** 获取会话信息 */
export async function getConversationInfo(
  conversationID: string,
  currentUserID?: string
): Promise<ConversationItem | null> {
  const list = await itcOpenIM.getAllConversationList() as IMConversationItem[];
  const item = list.find((c) => c.conversationID === conversationID);
  return item ? convertToConversationItem(item, currentUserID) : null;
}

/** 置顶/取消置顶会话 */
export async function pinConversation(
  conversationID: string,
  isPinned: boolean
): Promise<void> {
  await itcOpenIM.pinConversation({ conversationID, isPinned });
}

/** 设置会话免打扰 */
export async function setConversationMuted(
  conversationID: string,
  isMuted: boolean
): Promise<void> {
  await itcOpenIM.setConversationPrivateChat({ conversationID, isPrivate: !isMuted });
}

/** 标记会话已读 */
export async function markConversationAsRead(conversationID: string): Promise<void> {
  await itcOpenIM.markConversationMessageAsRead(conversationID);
}

/** 设置会话草稿 */
export async function setConversationDraft(
  conversationID: string,
  draftText: string
): Promise<void> {
  await itcOpenIM.setConversationDraft({ conversationID, draftText });
}

/** 删除会话 */
export async function deleteConversation(conversationID: string): Promise<void> {
  await itcOpenIM.deleteConversationAndDeleteAllMsg(conversationID);
}

// ── 消息操作 ─────────────────────────────────────────────────────────────────

/** 获取历史消息 */
export async function getHistoryMessages(
  params: { conversationID: string; count?: number; startClientMsgID?: string }
): Promise<Message[]> {
  const msgParams: GetAdvancedHistoryMsgParams = {
    conversationID: params.conversationID,
    count: params.count || 20,
    startClientMsgID: params.startClientMsgID??'',
    viewType: ViewType.History,
  };
  console.log('[IMService] getHistoryMessages 调用参数:', JSON.stringify(msgParams, null, 2));
  try {
    // 获取当前用户 ID 用于判断消息是否为自己发送
    let currentUserID = '';
    try {
      currentUserID = await getCurrentUserID();
    } catch (e) {
      console.log('[IMService] 获取当前用户ID失败:', e);
    }
    console.log('[IMService] 调用 getAdvancedHistoryMessageList 开始, currentUserID:', currentUserID);
    const result = await itcOpenIM.getAdvancedHistoryMessageList(msgParams as any) as any;
    console.log('[IMService] getAdvancedHistoryMessageList 返回结果:', JSON.stringify({
      hasMore: result?.hasMore,
      messageListLength: result?.messageList?.length || 0,
      firstMsgID: result?.messageList?.[0]?.clientMsgID,
      lastMsgID: result?.messageList?.[result?.messageList?.length - 1]?.clientMsgID,
    }, null, 2));
    const messageList = result?.messageList || [];
    return messageList.map((msg: MessageItem) => convertToMessage(msg, currentUserID));
  } catch (err: any) {
    // 详细记录错误信息
    console.error('[IMService] getAdvancedHistoryMessageList 异常:', {
      errorName: err?.name,
      errorMessage: err?.message,
      errorCode: err?.code,
      errorStack: err?.stack,
      fullError: err,
      params: msgParams,
    });
    // 10005 错误：消息游标失效/记录不存在，返回空消息列表
    if (err?.code === '10005' || (err?.message && err.message.includes('10005'))) {
      console.log('[IMService] 识别为 10005 错误（消息游标失效），返回空列表');
      return [];
    }
    // 其他错误继续抛出
    throw err;
  }
}

/** 发送文本消息 */
export async function sendTextMessage(
  text: string,
  options: { senderID?: string; receiverID?: string; groupID?: string; conversationID?: string }
): Promise<Message> {
  console.log('[IMService] sendTextMessage 开始:', { text, options });
  try {
    const message = await itcOpenIM.createTextMessage(text);
    console.log('[IMService] createTextMessage 成功:', { clientMsgID: (message as any)?.clientMsgID });

    // 优先使用 conversationID，其次使用 recvID/groupID
    const sendParams: SendMsgParams = {
      message: message as MessageItem,
      recvID: options.receiverID??'',
      groupID: options.groupID??'',
    };
    console.log('[IMService] 调用 sendMessage, params:', JSON.stringify(sendParams));
    const sent = await itcOpenIM.sendMessage(sendParams) as MessageItem;
    console.log('[IMService] sendMessage 成功:', {
      clientMsgID: sent.clientMsgID,
      serverMsgID: sent.serverMsgID,
      sendID: sent.sendID,
    });
    return convertToMessage(sent);
  } catch (err: any) {
    console.error('[IMService] sendTextMessage 异常:', {
      errorName: err?.name,
      errorMessage: err?.message,
      errorCode: err?.code,
      errorStack: err?.stack,
      fullError: err,
    });
    throw err;
  }
}

/** 发送图片消息 */
export async function sendImageMessage(
  imagePath: string,
  options: { senderID?: string; receiverID?: string; groupID?: string }
): Promise<Message> {
  const message = await itcOpenIM.createImageMessageFromFullPath(imagePath);
  const sendParams: SendMsgParams = {
    message: message as MessageItem,
    recvID: options.receiverID??'',
    groupID: options.groupID??'',
  };
  const sent = await itcOpenIM.sendMessage(sendParams) as MessageItem;
  return convertToMessage(sent);
}

/** 发送语音消息 */
export async function sendAudioMessage(
  audioPath: string,
  duration: number,
  options: { senderID?: string; receiverID?: string; groupID?: string }
): Promise<Message> {
  const message = await itcOpenIM.createSoundMessageFromFullPath({ soundPath: audioPath, duration });
  const sendParams: SendMsgParams = {
    message: message as MessageItem,
    recvID: options.receiverID??'',
    groupID: options.groupID??'',
  };
  const sent = await itcOpenIM.sendMessage(sendParams) as MessageItem;
  return convertToMessage(sent);
}

/** 发送视频消息 */
export async function sendVideoMessage(
  videoPath: string,
  videoType: string,
  duration: number,
  _size: number,
  options: { senderID?: string; receiverID?: string; groupID?: string }
): Promise<Message> {
  const message = await itcOpenIM.createVideoMessageFromFullPath({ videoPath, duration, videoType, snapshotPath: '' });
  const sendParams: SendMsgParams = {
    message: message as MessageItem,
    recvID: options.receiverID??'',
    groupID: options.groupID??'',
  };
  const sent = await itcOpenIM.sendMessage(sendParams) as MessageItem;
  return convertToMessage(sent);
}

/** 发送文件消息 */
export async function sendFileMessage(
  filePath: string,
  fileName: string,
  _fileSize: number,
  options: { senderID?: string; receiverID?: string; groupID?: string }
): Promise<Message> {
  const message = await itcOpenIM.createFileMessageFromFullPath({ filePath, fileName });
  const sendParams: SendMsgParams = {
    message: message as MessageItem,
    recvID: options.receiverID??'',
    groupID: options.groupID??'',
  };
  const sent = await itcOpenIM.sendMessage(sendParams) as MessageItem;
  return convertToMessage(sent);
}

/** 发送位置消息 */
export async function sendLocationMessage(
  latitude: number,
  longitude: number,
  description: string,
  options: { senderID?: string; receiverID?: string; groupID?: string }
): Promise<Message> {
  const message = await itcOpenIM.createLocationMessage({ latitude, longitude, description });
  const sendParams: SendMsgParams = {
    message: message as MessageItem,
    recvID: options.receiverID??'',
    groupID: options.groupID??'',
  };
  const sent = await itcOpenIM.sendMessage(sendParams) as MessageItem;
  return convertToMessage(sent);
}

/** 撤回消息 */
export async function revokeMessage(message: Message,conversationID: string): Promise<void> {
  const params: OperateMessageParams = {
    conversationID: conversationID,
    clientMsgID: message.clientMsgID,
  };
  await itcOpenIM.revokeMessage(params);
}

/** 删除本地消息 */
export async function deleteLocalMessage(message: Message, conversationID: string): Promise<void> {
  const params: OperateMessageParams = {
    conversationID: conversationID,
    clientMsgID: message.clientMsgID,
  };
  await itcOpenIM.deleteMessageFromLocalStorage(params);
}

// ── 用户信息 ─────────────────────────────────────────────────────────────────

/** 获取自身用户信息 */
export async function getSelfUserInfo(): Promise<UserInfo> {
  const info = await itcOpenIM.getSelfUserInfo() as SelfUserInfo;
  return convertToUserInfo(info);
}

/** 设置自身用户信息 */
export async function setSelfUserInfo(info: Partial<UserInfo>): Promise<void> {
  await itcOpenIM.setSelfInfo(info as Partial<SelfUserInfo>);
}

/** 获取用户信息（批量） */
export async function getUsersInfo(userIDs: string[]): Promise<UserInfo[]> {
  const list = await itcOpenIM.getUsersInfo(userIDs) as SelfUserInfo[];
  return list.map(convertToUserInfo);
}

// ── 事件监听 ─────────────────────────────────────────────────────────────────

import { eventBus } from '@itc/base';

/** 事件类型 */
export type IMEventType =
  | 'newMessage'
  | 'conversationChanged'
  | 'typingStatus'
  | 'totalUnreadChanged'
  | 'kickedOffline'
  | 'tokenExpired'
  | 'userStatusChanged';

/** 映射 demo 事件类型到 eventBus 事件 */
const EVENT_MAP: Record<IMEventType, string> = {
  newMessage: 'im:newMessage',
  conversationChanged: 'im:conversationChanged',
  typingStatus: 'im:typingStatus',
  totalUnreadChanged: 'im:totalUnreadChanged',
  kickedOffline: 'im:kickedOffline',
  tokenExpired: 'im:tokenExpired',
  userStatusChanged: 'im:userStatusChanged',
};

/** 订阅事件 */
export function onIMEvent(
  event: IMEventType,
  callback: (...args: any[]) => void
): () => void {
  const eventName = EVENT_MAP[event];
  if (!eventName) {
    console.warn(`[IMService] Unknown event type: ${event}`);
    return () => {};
  }
  return eventBus.on(eventName, callback as (data: unknown) => void);
}

// ── 类型转换 ─────────────────────────────────────────────────────────────────

/** 转换 IM SDK 会话项为应用会话项 */
/** 从会话 ID 解析用户 ID
 * conversationID 格式: si_{userID1}_{userID2} (单聊)
 */
function parseUserIDFromConversationID(conversationID: string, currentUserID: string): string | undefined {
  if (!conversationID.startsWith('si_')) {
    return undefined;
  }
  const parts = conversationID.split('_');
  if (parts.length >= 3) {
    // parts: ['si', userID1, userID2]
    // 找出不是当前用户 ID 的那个
    if (parts[1] !== currentUserID) {
      return parts[1];
    }
    if (parts[2] !== currentUserID) {
      return parts[2];
    }
  }
  return undefined;
}

function convertToConversationItem(item: IMConversationItem, currentUserID?: string): ConversationItem {
  // 从 conversationID 解析 userID
  const parsedUserID = currentUserID ? parseUserIDFromConversationID(item.conversationID, currentUserID) : undefined;
  const finalUserID = item.userID || parsedUserID;

  return {
    conversationID: item.conversationID,
    conversationType: item.conversationType === 1 ? 'single' : 'group',
    userID: finalUserID,
    groupID: item.groupID,
    showName: item.showName || finalUserID || item.groupID || '未知',
    faceURL: item.faceURL,
    latestMsgContent: item.latestMsg,
    latestMsgSendTime: item.latestMsgSendTime,
    unreadCount: item.unreadCount || 0,
    isPinned: item.isPinned || false,
    isMuted: item.recvMsgOpt === 0 ? false : true,
    draftText: item.draftText,
  };
}

/** 转换 IM SDK 消息项为应用消息项 */
function convertToMessage(msg: MessageItem, senderID?: string): Message {
  const currentUserID = senderID || '';
  return {
    ...msg,
    isSelf: msg.sendID === currentUserID,
    status: 'succeed',
  };
}

/** 转换 IM SDK 用户信息为应用用户信息 */
function convertToUserInfo(info: SelfUserInfo): UserInfo {
  return {
    userID: info.userID,
    nickname: info.nickname,
    faceURL: info.faceURL,
    createTime: info.createTime,
  };
}
