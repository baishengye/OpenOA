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
import type { TurboModule, NativeModule } from 'react-native';
import { TurboModuleRegistry, NativeModules, NativeEventEmitter } from 'react-native';

// 懒加载模式，避免模块顶层立即调用 TurboModuleRegistry.getEnforcing
let _module: Spec | null = null;
let _emitter: NativeEventEmitter | null = null;

function getIMModule(): Spec {
  if (_module) return _module;

  try {
    // 优先尝试 TurboModule
    _module = TurboModuleRegistry.getEnforcing<Spec>('ItcOpenIM');
    return _module;
  } catch {
    // 最终兜底：抛出原始错误
    throw new Error('ItcOpenIM native module not found');
  }
}

// 获取事件发射器
export function getNativeEmitter(): NativeEventEmitter {
  if (_emitter) return _emitter;
  _emitter = new NativeEventEmitter(NativeModules.ItcOpenIM as NativeModule);
  return _emitter;
}

// 代理对象，延迟初始化
const ItcOpenIMSDK: Spec = new Proxy({} as Spec, {
  get(_target, prop) {
    return (getIMModule() as unknown as Record<string, unknown>)[prop as string];
  },
});

// 导出原生模块引用供事件监听使用
export const NativeItcOpenIM: NativeModule | null = (NativeModules as unknown as Record<string, NativeModule>).ItcOpenIM ?? null;

export default ItcOpenIMSDK;

// ============ 事件类型定义 ============

export interface ListenerOnly {
  // 连接状态
  onConnectSuccess: () => void;
  onConnecting: () => void;
  onConnectFailed: (errCode: number, errMsg: string) => void;
  onKickedOffline: () => void;
  onSelfInfoUpdated: (userInfo: string) => void;
  onUserStatusChanged: (userStatus: string) => void;
  onUserTokenExpired: () => void;
  onUserTokenInvalid: () => void;

  // 消息
  onRecvNewMessages: (msgList: string) => void;
  onRecvOfflineNewMessages: (msgList: string) => void;
  onMsgDeleted: (msgList: string) => void;
  onRecvC2CReadReceipt: (msgList: string) => void;
  onNewRecvMessageRevoked: (msg: string) => void;
  onRecvNewMessage: (msg: string) => void;
  onRecvOfflineNewMessage: (msg: string) => void;
  onRecvOnlineOnlyMessage: (msg: string) => void;
  onSendMessageProgress: (msg: string, progress: number) => void;

  // 会话
  onConversationChanged: (conversationList: string) => void;
  onInputStatusChanged: (userId: string, status: boolean) => void;
  onNewConversation: (conversationList: string) => void;
  onSyncServerFailed: () => void;
  onSyncServerFinish: () => void;
  onSyncServerStart: (isSyncing: boolean) => void;
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
  onGroupApplicationDeleted: (info: string) => void;
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
  initSDK(config: string, operationID: string): Promise<unknown>;

  /** 登录 */
  login(options: string, operationID: string): Promise<unknown>;

  /** 登出 */
  logout(operationID: string): Promise<unknown>;

  /** 获取登录状态 */
  getLoginStatus(operationID: string): Promise<number>;

  /** 获取登录用户ID */
  getLoginUserID(operationID: string): Promise<string>;

  /** 上传文件 */
  uploadFile(reqData: string, operationID: string): Promise<unknown>;

  // ============ 用户相关 ============

  /** 获取用户信息 */
  getUsersInfo(userIDList: string, operationID: string): Promise<unknown>;

  /** 获取个人用户信息 */
  getSelfUserInfo(operationID: string): Promise<unknown>;

  /** 设置个人用户信息 */
  setSelfInfo(userInfo: string, operationID: string): Promise<unknown>;

  /** 订阅用户状态 */
  subscribeUsersStatus(userIDList: string, operationID: string): Promise<unknown>;

  /** 取消订阅用户状态 */
  unsubscribeUsersStatus(userIDList: string, operationID: string): Promise<unknown>;

  /** 获取订阅的用户状态 */
  getSubscribeUsersStatus(operationID: string): Promise<unknown>;

  /** 设置应用后台状态 */
  setAppBackgroundStatus(isBackground: boolean, operationID: string): Promise<unknown>;

  /** 网络状态变化 */
  networkStatusChanged(operationID: string): Promise<unknown>;

  /** 全局设置消息接收选项 */
  setGlobalRecvMessageOpt(params: number, operationID: string): Promise<unknown>;

  // ============ 好友相关 ============

  /** 审核好友申请 */
  acceptFriendApplication(params: string, operationID: string): Promise<unknown>;

  /** 添加黑名单 */
  addBlack(params: string, operationID: string): Promise<unknown>;

  /** 添加好友 */
  addFriend(params: string, operationID: string): Promise<unknown>;

  /** 检查好友关系 */
  checkFriend(userIDList: string, operationID: string): Promise<unknown>;

  /** 删除好友 */
  deleteFriend(userID: string, operationID: string): Promise<unknown>;

  /** 获取黑名单 */
  getBlackList(operationID: string): Promise<unknown>;

  /** 获取好友申请列表（申请人视角） */
  getFriendApplicationListAsApplicant(req: string, operationID: string): Promise<unknown>;

  /** 获取好友申请列表（接收人视角） */
  getFriendApplicationListAsRecipient(req: string, operationID: string): Promise<unknown>;

  /** 获取未处理的好友申请数量 */
  getFriendApplicationUnhandledCount(req: string, operationID: string): Promise<number>;

  /** 获取好友列表 */
  getFriendList(filterBlack: boolean, operationID: string): Promise<unknown>;

  /** 获取好友列表（分页） */
  getFriendListPage(params: string, operationID: string): Promise<unknown>;

  /** 获取指定好友信息 */
  getSpecifiedFriendsInfo(params: string, operationID: string): Promise<unknown>;

  /** 更新好友信息 */
  updateFriends(params: string, operationID: string): Promise<unknown>;

  /** 拒绝好友申请 */
  refuseFriendApplication(params: string, operationID: string): Promise<unknown>;

  /** 移除黑名单 */
  removeBlack(userID: string, operationID: string): Promise<unknown>;

  /** 搜索好友 */
  searchFriends(params: string, operationID: string): Promise<unknown>;

  /** 设置好友备注 */
  setFriendRemark(params: string, operationID: string): Promise<unknown>;

  // ============ 群组相关 ============

  /** 创建群组 */
  createGroup(params: string, operationID: string): Promise<unknown>;

  /** 加入群组 */
  joinGroup(params: string, operationID: string): Promise<unknown>;

  /** 邀请用户入群 */
  inviteUserToGroup(params: string, operationID: string): Promise<unknown>;

  /** 获取已加入群组列表 */
  getJoinedGroupList(operationID: string): Promise<unknown>;

  /** 获取已加入群组列表（分页） */
  getJoinedGroupListPage(params: string, operationID: string): Promise<unknown>;

  /** 搜索群组 */
  searchGroups(params: string, operationID: string): Promise<unknown>;

  /** 获取指定群组信息 */
  getSpecifiedGroupsInfo(groupIDList: string, operationID: string): Promise<unknown>;

  /** 设置群组信息 */
  setGroupInfo(params: string, operationID: string): Promise<unknown>;

  /** 获取群申请列表（接收人视角） */
  getGroupApplicationListAsRecipient(req: string, operationID: string): Promise<unknown>;

  /** 获取群申请列表（申请人视角） */
  getGroupApplicationListAsApplicant(req: string, operationID: string): Promise<unknown>;

  /** 获取未处理的群申请数量 */
  getGroupApplicationUnhandledCount(req: string, operationID: string): Promise<number>;

  /** 同意群申请 */
  acceptGroupApplication(params: string, operationID: string): Promise<unknown>;

  /** 拒绝群申请 */
  refuseGroupApplication(params: string, operationID: string): Promise<unknown>;

  /** 获取群组成员列表 */
  getGroupMemberList(params: string, operationID: string): Promise<unknown>;

  /** 获取指定群成员信息 */
  getSpecifiedGroupMembersInfo(params: string, operationID: string): Promise<unknown>;

  /** 获取群组中的用户 */
  getUsersInGroup(params: string, operationID: string): Promise<unknown>;

  /** 搜索群成员 */
  searchGroupMembers(params: string, operationID: string): Promise<unknown>;

  /** 设置群成员信息 */
  setGroupMemberInfo(params: string, operationID: string): Promise<unknown>;

  /** 获取群主和管理员列表 */
  getGroupMemberOwnerAndAdmin(groupID: string, operationID: string): Promise<unknown>;

  /** 按加入时间过滤获取群成员列表 */
  getGroupMemberListByJoinTimeFilter(params: string, operationID: string): Promise<unknown>;

  /** 踢出群成员 */
  kickGroupMember(params: string, operationID: string): Promise<unknown>;

  /** 禁言群成员 */
  changeGroupMemberMute(params: string, operationID: string): Promise<unknown>;

  /** 禁言整个群 */
  changeGroupMute(params: string, operationID: string): Promise<unknown>;

  /** 转让群主 */
  transferGroupOwner(params: string, operationID: string): Promise<unknown>;

  /** 解散群组 */
  dismissGroup(groupID: string, operationID: string): Promise<unknown>;

  /** 退出群组 */
  quitGroup(groupID: string, operationID: string): Promise<unknown>;

  /** 判断是否已加入群组 */
  isJoinGroup(groupID: string, operationID: string): Promise<boolean>;

  // ============ 会话相关 ============

  /** 获取所有会话列表 */
  getAllConversationList(operationID: string): Promise<unknown>;

  /** 获取会话列表（分页） */
  getConversationListSplit(params: string, operationID: string): Promise<unknown>;

  /** 获取单个会话 */
  getOneConversation(params: string, operationID: string): Promise<unknown>;

  /** 获取多个会话 */
  getMultipleConversation(conversationIDList: string, operationID: string): Promise<unknown>;

  /** 根据会话类型获取会话ID */
  getConversationIDBySessionType(params: string, operationID: string): Promise<unknown>;

  /** 获取未读消息总数 */
  getTotalUnreadMsgCount(operationID: string): Promise<number>;

  /** 标记会话消息已读 */
  markConversationMessageAsRead(conversationID: string, operationID: string): Promise<unknown>;

  /** 设置会话 */
  setConversation(params: string, operationID: string): Promise<unknown>;

  /** 设置会话草稿 */
  setConversationDraft(params: string, operationID: string): Promise<unknown>;

  /** 置顶会话 */
  pinConversation(params: string, operationID: string): Promise<unknown>;

  /** 设置会话消息接收选项 */
  setConversationRecvMessageOpt(params: string, operationID: string): Promise<unknown>;

  /** 设置会话私密聊天 */
  setConversationPrivateChat(params: string, operationID: string): Promise<unknown>;

  /** 设置会话阅后即焚时长 */
  setConversationBurnDuration(params: string, operationID: string): Promise<unknown>;

  /** 重置会话群@类型 */
  resetConversationGroupAtType(conversationID: string, operationID: string): Promise<unknown>;

  /** 隐藏会话 */
  hideConversation(conversationID: string, operationID: string): Promise<unknown>;

  /** 隐藏所有会话 */
  hideAllConversations(operationID: string): Promise<unknown>;

  /** 清除会话并删除所有消息 */
  clearConversationAndDeleteAllMsg(conversationID: string, operationID: string): Promise<unknown>;

  /** 删除会话并删除所有消息 */
  deleteConversationAndDeleteAllMsg(conversationID: string, operationID: string): Promise<unknown>;

  // ============ 消息相关 ============

  /** 从本地路径创建图片消息 */
  createImageMessageFromFullPath(imagePath: string, operationID: string): Promise<unknown>;

  /** 从本地路径创建视频消息 */
  createVideoMessageFromFullPath(params: string, operationID: string): Promise<unknown>;

  /** 从本地路径创建声音消息 */
  createSoundMessageFromFullPath(params: string, operationID: string): Promise<unknown>;

  /** 从本地路径创建文件消息 */
  createFileMessageFromFullPath(params: string, operationID: string): Promise<unknown>;

  /** 创建文本消息 */
  createTextMessage(text: string, operationID: string): Promise<unknown>;

  /** 创建@消息 */
  createTextAtMessage(params: string, operationID: string): Promise<unknown>;

  /** 通过URL创建图片消息 */
  createImageMessageByURL(params: string, operationID: string): Promise<unknown>;

  /** 通过URL创建声音消息 */
  createSoundMessageByURL(params: string, operationID: string): Promise<unknown>;

  /** 通过URL创建视频消息 */
  createVideoMessageByURL(params: string, operationID: string): Promise<unknown>;

  /** 通过URL创建文件消息 */
  createFileMessageByURL(params: string, operationID: string): Promise<unknown>;

  /** 创建合并消息 */
  createMergerMessage(params: string, operationID: string): Promise<unknown>;

  /** 创建转发消息 */
  createForwardMessage(params: string, operationID: string): Promise<unknown>;

  /** 创建位置消息 */
  createLocationMessage(params: string, operationID: string): Promise<unknown>;

  /** 创建引用消息 */
  createQuoteMessage(params: string, operationID: string): Promise<unknown>;

  /** 创建名片消息 */
  createCardMessage(params: string, operationID: string): Promise<unknown>;

  /** 创建自定义消息 */
  createCustomMessage(params: string, operationID: string): Promise<unknown>;

  /** 创建表情消息 */
  createFaceMessage(params: string, operationID: string): Promise<unknown>;

  /** 发送消息 */
  sendMessage(params: string, operationID: string): Promise<unknown>;

  /** 发送消息（不通过OSS） */
  sendMessageNotOss(params: string, operationID: string): Promise<unknown>;

  /** 更新输入状态（打字状态） */
  typingStatusUpdate(params: string, operationID: string): Promise<unknown>;

  /** 改变输入状态 */
  changeInputStates(params: string, operationID: string): Promise<unknown>;

  /** 获取输入状态 */
  getInputStates(params: string, operationID: string): Promise<unknown>;

  /** 撤回消息 */
  revokeMessage(params: string, operationID: string): Promise<unknown>;

  /** 删除消息 */
  deleteMessage(params: string, operationID: string): Promise<unknown>;

  /** 从本地删除消息 */
  deleteMessageFromLocalStorage(params: string, operationID: string): Promise<unknown>;

  /** 删除本地所有消息 */
  deleteAllMsgFromLocal(operationID: string): Promise<unknown>;

  /** 删除本地和服务器所有消息 */
  deleteAllMsgFromLocalAndSvr(operationID: string): Promise<unknown>;

  /** 搜索本地消息 */
  searchLocalMessages(params: string, operationID: string): Promise<unknown>;

  /** 获取高级历史消息 */
  getAdvancedHistoryMessageList(params: string, operationID: string): Promise<unknown>;

  /** 获取高级历史消息（反向） */
  getAdvancedHistoryMessageListReverse(params: string, operationID: string): Promise<unknown>;

  /** 查找消息列表 */
  findMessageList(params: string, operationID: string): Promise<unknown>;

  /** 插入群组消息到本地 */
  insertGroupMessageToLocalStorage(params: string, operationID: string): Promise<unknown>;

  /** 插入单聊消息到本地 */
  insertSingleMessageToLocalStorage(params: string, operationID: string): Promise<unknown>;

  /** 设置消息本地扩展 */
  setMessageLocalEx(params: string, operationID: string): Promise<unknown>;

  // ============ 工具方法 ============

  /** 上传日志 */
  uploadLogs(params: string, operationID: string): Promise<unknown>;

  /** 记录日志 */
  logs(params: string, operationID: string): Promise<unknown>;

  /** 反初始化 SDK */
  unInitSDK(operationID: string): Promise<unknown>;

  /** 更新FCM Token */
  updateFcmToken(fcmToken: string, expireTime: number, operationID: string): Promise<unknown>;

  /** 设置应用角标 */
  setAppBadge(appUnreadCount: number, operationID: string): Promise<unknown>;
}
