/**
 * TurboModule 规格（codegen 输入）。
 *
 * 参照 open-im-sdk-reactnative 实现，适配 RN 0.82 TurboModule 架构。
 * ⚠️ 受 React Native Codegen 约束：入参只用基本类型（boolean/number/string），
 * 不用 object 入参；返回可用内联 object / object 数组。JS 层负责拆/装 options 与收窄枚举。
 *
 * 三端原生均实现名为 `ItcOpenIM` 的 TurboModule：
 *  - Android: com.itc.openim.ItcOpenIMSDKModule (Kotlin)
 *  - iOS:     ItcOpenIMSDK (Obj-C++)
 *  - 鸿蒙:    待实现
 */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry, NativeModules } from 'react-native';

// 懒加载模式，避免模块顶层立即调用 TurboModuleRegistry.getEnforcing
let _module: Spec | null = null;

function getIMModule(): Spec {
  if (_module) return _module;

  try {
    // 优先尝试 TurboModule
    _module = TurboModuleRegistry.getEnforcing<Spec>('ItcOpenIM');
    return _module;
  } catch {
    // Fallback: Bridge Module（iOS 当前使用 RCT_EXPORT_MODULE）
    const bridgeModule = (NativeModules as unknown as Record<string, unknown>)['ItcOpenIM'] as Spec | undefined;
    if (bridgeModule) {
      console.warn('[ItcOpenIM] Using Bridge Module fallback (TurboModule not available)');
      _module = bridgeModule;
      return _module;
    }
    // 最终兜底：抛出原始错误
    throw new Error('ItcOpenIM native module not found');
  }
}

// 代理对象，延迟初始化
const ItcOpenIMSDK: Spec = new Proxy({} as Spec, {
  get(_target, prop) {
    return (getIMModule() as unknown as Record<string, unknown>)[prop as string];
  },
});

export default ItcOpenIMSDK;

// ============ 事件类型定义 ============

export interface ListenerOnly {
  // 连接状态
  onConnectSuccess: () => void;
  onConnecting: () => void;
  onConnectFailed: (errCode: number, errMsg: string) => void;
  onKickedOffline: () => void;
  onSelfInfoUpdated: (userInfo: string) => void;
  onUserTokenExpired: () => void;
  onUserTokenInvalid: () => void;

  // 消息
  onRecvNewMessages: (msgList: string) => void;
  onRecvOfflineNewMessages: (msgList: string) => void;
  onMsgDeleted: (msgList: string) => void;
  onRecvC2CReadReceipt: (msgList: string) => void;
  onNewRecvMessageRevoked: (msg: string) => void;
  onRecvMessageRevoked: (msgId: string) => void;
  onRecvNewMessage: (msg: string) => void;
  onRecvOfflineNewMessage: (msg: string) => void;
  onRecvOnlineOnlyMessage: (msg: string) => void;
  onSendMessageProgress: (msg: string, progress: number) => void;

  // 消息扩展
  onRecvMessageExtensionsAdded: (msgId: string, extensions: string) => void;
  onRecvMessageExtensionsChanged: (msgId: string, extensions: string) => void;
  onRecvMessageExtensionsDeleted: (msgId: string, keys: string) => void;

  // 会话
  onConversationChanged: (conversationList: string) => void;
  onInputStatusChanged: (userId: string, status: boolean) => void;
  onNewConversation: (conversationList: string) => void;
  onSyncServerFailed: () => void;
  onSyncServerFinish: () => void;
  onSyncServerStart: () => void;
  onSyncServerProgress: (progress: number) => void;
  onTotalUnreadMessageCountChanged: (count: number) => void;

  // 好友
  onBlackAdded: (info: string) => void;
  onBlackDeleted: (info: string) => void;
  onFriendApplicationAccepted: (info: string) => void;
  onFriendApplicationAdded: (info: string) => void;
  onFriendApplicationDeleted: (info: string) => void;
  onFriendApplicationRejected: (info: string) => void;
  onFriendInfoChanged: (info: string) => void;
  onFriendAdded: (info: string) => void;
  onFriendDeleted: (info: string) => void;

  // 群组
  onGroupApplicationAccepted: (info: string) => void;
  onGroupApplicationRejected: (info: string) => void;
  onGroupApplicationAdded: (info: string) => void;
  onGroupInfoChanged: (groupId: string, info: string) => void;
  onGroupMemberInfoChanged: (groupId: string, info: string) => void;
  onGroupMemberAdded: (info: string) => void;
  onGroupMemberDeleted: (info: string) => void;
  onJoinedGroupAdded: (info: string) => void;
  onJoinedGroupDeleted: (info: string) => void;
  onGroupDismissed: (groupId: string, dismissor: string) => void;

  // 上传
  uploadComplete: (uploadResult: string) => void;
  uploadOnProgress: (uploadProgress: string) => void;
}

export interface Spec extends TurboModule {
  // ============ 登录相关 ============

  /** 初始化 SDK */
  initSDK(config: string, operationID: string): Promise<boolean>;

  /** 登录 */
  login(userID: string, token: string, operationID: string): Promise<void>;

  /** 登出 */
  logout(operationID: string): Promise<void>;

  /** 获取登录状态 */
  getLoginStatus(operationID: string): Promise<number>;

  /** 获取登录用户ID */
  getLoginUserID(operationID: string): Promise<string>;

  /** 设置应用后台状态 */
  setAppBackgroundStatus(isBackground: boolean, operationID: string): Promise<void>;

  /** 网络状态变化 */
  networkStatusChanged(operationID: string): Promise<void>;

  // ============ 用户相关 ============

  /** 获取用户信息 */
  getUsersInfo(userIDList: string, operationID: string): Promise<string>;

  /** 获取个人用户信息 */
  getSelfUserInfo(operationID: string): Promise<string>;

  /** 设置个人用户信息 */
  setSelfInfo(userInfo: string, operationID: string): Promise<void>;

  // ============ 好友相关 ============

  /** 获取好友列表 */
  getFriendList(filterBlack: boolean, operationID: string): Promise<string>;

  /** 添加好友 */
  addFriend(userID: string, reqMsg: string, operationID: string): Promise<void>;

  /** 删除好友 */
  deleteFriend(userID: string, operationID: string): Promise<void>;

  /** 获取黑名单 */
  getBlackList(operationID: string): Promise<string>;

  /** 添加黑名单 */
  addBlack(userID: string, ex: string, operationID: string): Promise<void>;

  /** 移除黑名单 */
  removeBlack(userID: string, operationID: string): Promise<void>;

  /** 同意好友申请 */
  acceptFriendApplication(userID: string, handleType: number, operationID: string): Promise<void>;

  /** 拒绝好友申请 */
  refuseFriendApplication(userID: string, handleType: number, operationID: string): Promise<void>;

  /** 获取好友申请列表（申请人视角） */
  getFriendApplicationListAsApplicant(offset: number, count: number, operationID: string): Promise<string>;

  /** 获取好友申请列表（接收人视角） */
  getFriendApplicationListAsRecipient(offset: number, count: number, operationID: string): Promise<string>;

  // ============ 群组相关 ============

  /** 创建群组 */
  createGroup(groupBaseInfo: string, memberList: string, operationID: string): Promise<string>;

  /** 加入群组 */
  joinGroup(groupID: string, message: string, operationID: string): Promise<void>;

  /** 退出群组 */
  quitGroup(groupID: string, operationID: string): Promise<void>;

  /** 解散群组 */
  dismissGroup(groupID: string, operationID: string): Promise<void>;

  /** 获取已加入群组列表 */
  getJoinedGroupList(operationID: string): Promise<string>;

  /** 获取群信息 */
  getGroupsInfo(groupIDList: string, operationID: string): Promise<string>;

  /** 设置群信息 */
  setGroupInfo(groupInfo: string, operationID: string): Promise<void>;

  /** 获取群成员列表 */
  getGroupMemberList(groupID: string, filter: number, offset: number, count: number, operationID: string): Promise<string>;

  /** 邀请用户入群 */
  inviteUserToGroup(groupID: string, userIDList: string, operationID: string): Promise<string>;

  /** 踢出群成员 */
  kickGroupMember(groupID: string, userIDList: string, operationID: string): Promise<string>;

  /** 转让群主 */
  transferGroupOwner(groupID: string, newOwnerID: string, operationID: string): Promise<void>;

  /** 获取群申请列表 */
  getGroupApplicationList(operationID: string): Promise<string>;

  // ============ 会话相关 ============

  /** 获取所有会话列表 */
  getAllConversationList(operationID: string): Promise<string>;

  /** 获取会话列表（分页） */
  getConversationListSplit(offset: number, count: number, operationID: string): Promise<string>;

  /** 获取单个会话 */
  getOneConversation(sessionType: number, peerID: string, operationID: string): Promise<string>;

  /** 设置会话已读 */
  markConversationMessageAsRead(conversationID: string, operationID: string): Promise<void>;

  /** 获取未读消息总数 */
  getTotalUnreadMsgCount(operationID: string): Promise<number>;

  // ============ 消息相关 ============

  /** 发送消息 */
  sendMessage(conversationID: string, message: string, operationID: string): Promise<string>;

  /** 撤回消息 */
  revokeMessage(conversationID: string, messageID: string, operationID: string): Promise<void>;

  /** 删除消息 */
  deleteMessage(conversationID: string, messageID: string, operationID: string): Promise<void>;

  /** 获取历史消息 */
  getAdvancedHistoryMessageList(conversationID: string, lastMsgSeq: number, count: number, startTime: number, operationID: string): Promise<string>;

  /** 搜索本地消息 */
  searchLocalMessages(searchParam: string, operationID: string): Promise<string>;

  /** 创建文本消息 */
  createTextMessage(text: string, operationID: string): Promise<string>;

  // ============ 上传相关 ============

  /** 上传文件 */
  uploadFile(filePath: string, operationID: string): Promise<string>;

  // ============ SDK 清理 ============

  /** 反初始化 SDK */
  unInitSDK(operationID: string): Promise<void>;
}
