/**
 * @itc/rn-client-sdk-plus —— 即时 IM 模块，封装 OpenIM。
 *
 * 跨端策略：
 *  - Android / iOS：基于 TurboModule 架构，参照 open-im-sdk-reactnative 实现
 *  - 鸿蒙 NEXT：自编译 openim-sdk-core(Go) 为 OHOS arm64 .so + ArkTS NAPI 绑定
 *    （⚠️ 最大技术风险项，需独立 PoC，见 README）
 *
 * 沿用 @itc/biometric 结构：本文件定义统一 API 与 ItcModule 契约；新消息/连接状态
 * 经 @itc/base 的 eventBus 下发。
 */
import { BaseModule, eventBus, ItcError, logger } from '@itc/base';
import { NativeEventEmitter } from 'react-native';
import ItcOpenIMSDK, { NativeItcOpenIM } from './ItcOpenIMSDK';
import type { IMMessage, ConnectionState, IMInitOptions } from './types';

// ============ 导出类型 ============
export * from './types/entity';
export * from './types/enum';
export * from './types/eventArgs';
export * from './types/params';
export { OpenIMApiError } from './errors/OpenIMApiError';

// ============ 直接导出 SDK 实例（供高级用户直接调用） ============
import { OpenIMApiError } from './errors/OpenIMApiError';
import Emitter from './emitter';
import type { CardElem, MessageItem, SelfUserInfo } from './types/entity';
import type { MessageReceiveOptType } from './types/enum';
import {
  AccessFriendParams,
  AccessGroupParams,
  AddBlackParams,
  AddFriendParams,
  AtMsgParams,
  ChangeGroupMemberMuteParams,
  ChangeGroupMuteParams,
  ChangeInputStatesParams,
  CreateGroupParams,
  CustomMsgParams,
  FaceMessageParams,
  FileMsgByPathParams,
  FileMsgParams,
  FindMessageParams,
  GetAdvancedHistoryMsgParams,
  GetFriendApplicationListAsApplicantParams,
  GetFriendApplicationListAsRecipientParams,
  GetGroupApplicationListAsApplicantParams,
  GetGroupApplicationListAsRecipientParams,
  GetGroupMemberByTimeParams,
  GetGroupMemberParams,
  GetGroupMembersInfoParams,
  GetInputStatesParams,
  GetOneConversationParams,
  GetSelfApplicationUnhandledCountParams,
  GetSpecifiedFriendsParams,
  ImageMsgParams,
  InitOptions,
  InsertGroupMsgParams,
  InsertSingleMsgParams,
  JoinGroupParams,
  LocationMsgParams,
  LoginParams,
  LogsParams,
  MergerMsgParams,
  OffsetParams,
  OperateGroupParams,
  OperateMessageParams,
  PinConversationParams,
  QuoteMsgParams,
  RemarkFriendParams,
  SearchFriendParams,
  SearchGroupMemberParams,
  SearchGroupParams,
  SearchLocalParams,
  SendMsgParams,
  SetBurnDurationParams,
  SetConversationDraftParams,
  SetConversationParams,
  SetConversationPrivateParams,
  SetConversationRecvOptParams,
  SetGroupInfoParams,
  SetMessageLocalExParams,
  SoundMsgByPathParams,
  SoundMsgParams,
  SplitConversationParams,
  TransferGroupParams,
  TypingUpdateParams,
  UpdateFriendsParams,
  UpdateMemberInfoParams,
  UploadFileParams,
  UploadLogsParams,
  VideoMsgByPathParams,
  VideoMsgParams,
} from './types/params';
import id from './utils/id';
export { NativeItcOpenIM as ItcOpenIMEmitter } from './ItcOpenIMSDK';

// 将参数序列化为 JSON 字符串（适配 TurboModule 基本类型约束）
function serialize<T>(params: T): string {
  return typeof params === 'string' ? params : JSON.stringify(params);
}

// 将数组参数序列化为 JSON 字符串
function serializeArray<T>(params: T[]): string {
  return JSON.stringify(params);
}

// ItcOpenIM 类：直接封装 OpenIM SDK，与官方 open-im-sdk-reactnative 保持一致
class ItcOpenIM extends Emitter {
  private static instance: ItcOpenIM;

  private constructor() {
    super();
  }

  static getInstance(): ItcOpenIM {
    if (!ItcOpenIM.instance) {
      ItcOpenIM.instance = new ItcOpenIM();
    }
    return ItcOpenIM.instance;
  }

  private async invoke<T extends (...args: any[]) => any, R = ReturnType<T>>(
    nativeMethod: T,
    args: Parameters<T>
  ): Promise<R extends Promise<any> ? Awaited<R> : R> {
    try {
      const result = nativeMethod(...args);
      if (result instanceof Promise) {
        return await result;
      }
      return result;
    } catch (error: any) {
      throw new OpenIMApiError(error.code, error.message, args[args.length - 1]);
    }
  }

  // login
  initSDK(params: InitOptions, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.initSDK, [serialize(params), operationID]);
  }

  login(params: LoginParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.login, [serialize(params), operationID]);
  }

  logout(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.logout, [operationID]);
  }

  getLoginStatus(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getLoginStatus, [operationID]);
  }

  getLoginUserID(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getLoginUserID, [operationID]);
  }

  uploadFile(params: UploadFileParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.uploadFile, [serialize(params), operationID]);
  }

  // user
  getUsersInfo(userIDList: string[], operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getUsersInfo, [serializeArray(userIDList), operationID]);
  }

  getSelfUserInfo(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getSelfUserInfo, [operationID]);
  }

  setSelfInfo(params: Partial<SelfUserInfo>, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setSelfInfo, [serialize(params), operationID]);
  }

  subscribeUsersStatus(userIDs: string[], operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.subscribeUsersStatus, [serializeArray(userIDs), operationID]);
  }

  unsubscribeUsersStatus(userIDs: string[], operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.unsubscribeUsersStatus, [serializeArray(userIDs), operationID]);
  }

  getSubscribeUsersStatus(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getSubscribeUsersStatus, [operationID]);
  }

  setAppBackgroundStatus(isBackground: boolean, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setAppBackgroundStatus, [isBackground, operationID]);
  }

  networkStatusChanged(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.networkStatusChanged, [operationID]);
  }

  setGlobalRecvMessageOpt(recvOpt: MessageReceiveOptType, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setGlobalRecvMessageOpt, [recvOpt, operationID]);
  }

  // friend relationship
  acceptFriendApplication(params: AccessFriendParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.acceptFriendApplication, [serialize(params), operationID]);
  }

  addBlack(params: AddBlackParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.addBlack, [serialize(params), operationID]);
  }

  addFriend(params: AddFriendParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.addFriend, [serialize(params), operationID]);
  }

  checkFriend(friendUserIDList: string[], operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.checkFriend, [serializeArray(friendUserIDList), operationID]);
  }

  deleteFriend(friendUserID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.deleteFriend, [friendUserID, operationID]);
  }

  getBlackList(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getBlackList, [operationID]);
  }

  getFriendApplicationListAsApplicant(
    req: GetFriendApplicationListAsApplicantParams = { offset: 0, count: 20 },
    operationID: string = id(),
  ) {
    return this.invoke(ItcOpenIMSDK.getFriendApplicationListAsApplicant, [serialize(req), operationID]);
  }

  getFriendApplicationListAsRecipient(
    req: GetFriendApplicationListAsRecipientParams = { handleResults: [], offset: 0, count: 20 },
    operationID: string = id(),
  ) {
    return this.invoke(ItcOpenIMSDK.getFriendApplicationListAsRecipient, [serialize(req), operationID]);
  }

  getFriendApplicationUnhandledCount(
    req: GetSelfApplicationUnhandledCountParams,
    operationID: string = id()
  ) {
    return this.invoke(ItcOpenIMSDK.getFriendApplicationUnhandledCount, [serialize(req), operationID]);
  }

  getFriendList(filterBlack: boolean, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getFriendList, [filterBlack, operationID]);
  }

  getFriendListPage(
    params: OffsetParams & { filterBlack?: boolean },
    operationID: string = id()
  ) {
    return this.invoke(ItcOpenIMSDK.getFriendListPage, [serialize(params), operationID]);
  }

  getSpecifiedFriendsInfo(params: GetSpecifiedFriendsParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getSpecifiedFriendsInfo, [serialize(params), operationID]);
  }

  updateFriends(params: UpdateFriendsParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.updateFriends, [serialize(params), operationID]);
  }

  refuseFriendApplication(params: AccessFriendParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.refuseFriendApplication, [serialize(params), operationID]);
  }

  removeBlack(blackUserID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.removeBlack, [blackUserID, operationID]);
  }

  searchFriends(params: SearchFriendParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.searchFriends, [serialize(params), operationID]);
  }

  setFriendRemark(params: RemarkFriendParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setFriendRemark, [serialize(params), operationID]);
  }

  // group
  createGroup(params: CreateGroupParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createGroup, [serialize(params), operationID]);
  }

  joinGroup(params: JoinGroupParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.joinGroup, [serialize(params), operationID]);
  }

  inviteUserToGroup(params: OperateGroupParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.inviteUserToGroup, [serialize(params), operationID]);
  }

  getJoinedGroupList(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getJoinedGroupList, [operationID]);
  }

  getJoinedGroupListPage(params: OffsetParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getJoinedGroupListPage, [serialize(params), operationID]);
  }

  searchGroups(params: SearchGroupParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.searchGroups, [serialize(params), operationID]);
  }

  getSpecifiedGroupsInfo(groupIDs: string[], operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getSpecifiedGroupsInfo, [serializeArray(groupIDs), operationID]);
  }

  setGroupInfo(params: SetGroupInfoParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setGroupInfo, [serialize(params), operationID]);
  }

  getGroupApplicationListAsRecipient(
    req: GetGroupApplicationListAsRecipientParams = { groupIDs: [], handleResults: [], offset: 0, count: 20 },
    operationID: string = id(),
  ) {
    return this.invoke(ItcOpenIMSDK.getGroupApplicationListAsRecipient, [serialize(req), operationID]);
  }

  getGroupApplicationListAsApplicant(
    req: GetGroupApplicationListAsApplicantParams = { groupIDs: [], handleResults: [], offset: 0, count: 20 },
    operationID: string = id(),
  ) {
    return this.invoke(ItcOpenIMSDK.getGroupApplicationListAsApplicant, [serialize(req), operationID]);
  }

  getGroupApplicationUnhandledCount(
    req: GetSelfApplicationUnhandledCountParams,
    operationID: string = id()
  ) {
    return this.invoke(ItcOpenIMSDK.getGroupApplicationUnhandledCount, [serialize(req), operationID]);
  }

  acceptGroupApplication(params: AccessGroupParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.acceptGroupApplication, [serialize(params), operationID]);
  }

  refuseGroupApplication(params: AccessGroupParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.refuseGroupApplication, [serialize(params), operationID]);
  }

  getGroupMemberList(params: GetGroupMemberParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getGroupMemberList, [serialize(params), operationID]);
  }

  getSpecifiedGroupMembersInfo(
    params: GetGroupMembersInfoParams,
    operationID: string = id()
  ) {
    return this.invoke(ItcOpenIMSDK.getSpecifiedGroupMembersInfo, [serialize(params), operationID]);
  }

  getUsersInGroup(params: GetGroupMembersInfoParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getUsersInGroup, [serialize(params), operationID]);
  }

  searchGroupMembers(params: SearchGroupMemberParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.searchGroupMembers, [serialize(params), operationID]);
  }

  setGroupMemberInfo(params: UpdateMemberInfoParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setGroupMemberInfo, [serialize(params), operationID]);
  }

  getGroupMemberOwnerAndAdmin(groupID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getGroupMemberOwnerAndAdmin, [groupID, operationID]);
  }

  getGroupMemberListByJoinTimeFilter(
    params: GetGroupMemberByTimeParams,
    operationID: string = id()
  ) {
    return this.invoke(ItcOpenIMSDK.getGroupMemberListByJoinTimeFilter, [serialize(params), operationID]);
  }

  kickGroupMember(params: OperateGroupParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.kickGroupMember, [serialize(params), operationID]);
  }

  changeGroupMemberMute(params: ChangeGroupMemberMuteParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.changeGroupMemberMute, [serialize(params), operationID]);
  }

  changeGroupMute(params: ChangeGroupMuteParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.changeGroupMute, [serialize(params), operationID]);
  }

  transferGroupOwner(params: TransferGroupParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.transferGroupOwner, [serialize(params), operationID]);
  }

  dismissGroup(groupID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.dismissGroup, [groupID, operationID]);
  }

  quitGroup(groupID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.quitGroup, [groupID, operationID]);
  }

  isJoinGroup(groupID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.isJoinGroup, [groupID, operationID]);
  }

  // conversation & message
  getAllConversationList(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getAllConversationList, [operationID]);
  }

  getConversationListSplit(params: SplitConversationParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getConversationListSplit, [serialize(params), operationID]);
  }

  getOneConversation(params: GetOneConversationParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getOneConversation, [serialize(params), operationID]);
  }

  getMultipleConversation(conversationIDList: string[], operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getMultipleConversation, [serializeArray(conversationIDList), operationID]);
  }

  getConversationIDBySessionType(params: GetOneConversationParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getConversationIDBySessionType, [serialize(params), operationID]);
  }

  getTotalUnreadMsgCount(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getTotalUnreadMsgCount, [operationID]);
  }

  markConversationMessageAsRead(conversationID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.markConversationMessageAsRead, [conversationID, operationID]);
  }

  setConversation(params: SetConversationParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setConversation, [serialize(params), operationID]);
  }

  setConversationDraft(params: SetConversationDraftParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setConversationDraft, [serialize(params), operationID]);
  }

  pinConversation(params: PinConversationParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.pinConversation, [serialize(params), operationID]);
  }

  setConversationRecvMessageOpt(
    params: SetConversationRecvOptParams,
    operationID: string = id()
  ) {
    return this.invoke(ItcOpenIMSDK.setConversationRecvMessageOpt, [serialize(params), operationID]);
  }

  setConversationPrivateChat(
    params: SetConversationPrivateParams,
    operationID: string = id()
  ) {
    return this.invoke(ItcOpenIMSDK.setConversationPrivateChat, [serialize(params), operationID]);
  }

  setConversationBurnDuration(params: SetBurnDurationParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setConversationBurnDuration, [serialize(params), operationID]);
  }

  resetConversationGroupAtType(conversationID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.resetConversationGroupAtType, [conversationID, operationID]);
  }

  hideConversation(conversationID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.hideConversation, [conversationID, operationID]);
  }

  hideAllConversations(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.hideAllConversations, [operationID]);
  }

  clearConversationAndDeleteAllMsg(conversationID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.clearConversationAndDeleteAllMsg, [conversationID, operationID]);
  }

  deleteConversationAndDeleteAllMsg(conversationID: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.deleteConversationAndDeleteAllMsg, [conversationID, operationID]);
  }

  createImageMessageFromFullPath(imagePath: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createImageMessageFromFullPath, [imagePath, operationID]);
  }

  createVideoMessageFromFullPath(params: VideoMsgByPathParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createVideoMessageFromFullPath, [serialize(params), operationID]);
  }

  createSoundMessageFromFullPath(params: SoundMsgByPathParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createSoundMessageFromFullPath, [serialize(params), operationID]);
  }

  createFileMessageFromFullPath(params: FileMsgByPathParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createFileMessageFromFullPath, [serialize(params), operationID]);
  }

  createTextMessage(text: string, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createTextMessage, [text, operationID]);
  }

  createTextAtMessage(params: AtMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createTextAtMessage, [serialize(params), operationID]);
  }

  createImageMessageByURL(params: ImageMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createImageMessageByURL, [serialize(params), operationID]);
  }

  createSoundMessageByURL(params: SoundMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createSoundMessageByURL, [serialize(params), operationID]);
  }

  createVideoMessageByURL(params: VideoMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createVideoMessageByURL, [serialize(params), operationID]);
  }

  createFileMessageByURL(params: FileMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createFileMessageByURL, [serialize(params), operationID]);
  }

  createMergerMessage(params: MergerMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createMergerMessage, [serialize(params), operationID]);
  }

  createForwardMessage(params: MessageItem, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createForwardMessage, [serialize(params), operationID]);
  }

  createLocationMessage(params: LocationMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createLocationMessage, [serialize(params), operationID]);
  }

  createQuoteMessage(params: QuoteMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createQuoteMessage, [serialize(params), operationID]);
  }

  createCardMessage(params: CardElem, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createCardMessage, [serialize(params), operationID]);
  }

  createCustomMessage(params: CustomMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createCustomMessage, [serialize(params), operationID]);
  }

  createFaceMessage(params: FaceMessageParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.createFaceMessage, [serialize(params), operationID]);
  }

  sendMessage(params: SendMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.sendMessage, [serialize(params), operationID]);
  }

  sendMessageNotOss(params: SendMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.sendMessageNotOss, [serialize(params), operationID]);
  }

  typingStatusUpdate(params: TypingUpdateParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.typingStatusUpdate, [serialize(params), operationID]);
  }

  changeInputStates(params: ChangeInputStatesParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.changeInputStates, [serialize(params), operationID]);
  }

  getInputStates(params: GetInputStatesParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.getInputStates, [serialize(params), operationID]);
  }

  revokeMessage(params: OperateMessageParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.revokeMessage, [serialize(params), operationID]);
  }

  deleteMessage(params: OperateMessageParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.deleteMessage, [serialize(params), operationID]);
  }

  deleteMessageFromLocalStorage(params: OperateMessageParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.deleteMessageFromLocalStorage, [serialize(params), operationID]);
  }

  deleteAllMsgFromLocal(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.deleteAllMsgFromLocal, [operationID]);
  }

  deleteAllMsgFromLocalAndSvr(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.deleteAllMsgFromLocalAndSvr, [operationID]);
  }

  searchLocalMessages(params: SearchLocalParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.searchLocalMessages, [serialize(params), operationID]);
  }

  getAdvancedHistoryMessageList(
    params: GetAdvancedHistoryMsgParams,
    operationID: string = id()
  ) {
    return this.invoke(ItcOpenIMSDK.getAdvancedHistoryMessageList, [serialize(params), operationID]);
  }

  getAdvancedHistoryMessageListReverse(
    params: GetAdvancedHistoryMsgParams,
    operationID: string = id()
  ) {
    return this.invoke(ItcOpenIMSDK.getAdvancedHistoryMessageListReverse, [serialize(params), operationID]);
  }

  findMessageList(params: FindMessageParams[], operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.findMessageList, [serializeArray(params), operationID]);
  }

  insertGroupMessageToLocalStorage(params: InsertGroupMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.insertGroupMessageToLocalStorage, [serialize(params), operationID]);
  }

  insertSingleMessageToLocalStorage(params: InsertSingleMsgParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.insertSingleMessageToLocalStorage, [serialize(params), operationID]);
  }

  setMessageLocalEx(params: SetMessageLocalExParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setMessageLocalEx, [serialize(params), operationID]);
  }

  uploadLogs(params: UploadLogsParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.uploadLogs, [serialize(params), operationID]);
  }

  logs(params: LogsParams, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.logs, [serialize(params), operationID]);
  }

  unInitSDK(operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.unInitSDK, [operationID]);
  }

  updateFcmToken(fcmToken: string, expireTime: number, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.updateFcmToken, [fcmToken, expireTime, operationID]);
  }

  setAppBadge(appUnreadCount: number, operationID: string = id()) {
    return this.invoke(ItcOpenIMSDK.setAppBadge, [appUnreadCount, operationID]);
  }
}

// 导出单例实例
export { ItcOpenIM };
const itcOpenIM = ItcOpenIM.getInstance();
export { itcOpenIM };
export default itcOpenIM;

const TAG = 'im';

// NativeEventEmitter 用于订阅原生事件
let nativeEmitter: NativeEventEmitter | null = null;

function getNativeEmitter(): NativeEventEmitter {
  if (!nativeEmitter) {
    if (!NativeItcOpenIM) {
      logger.warn(TAG, 'NativeEventEmitter 不可用，跳过事件监听');
      // 返回一个 noop emitter
      return {
        addListener: () => ({ remove: () => {} }),
        removeAllListeners: () => {},
        listenerCount: () => 0,
      } as unknown as NativeEventEmitter;
    }
    nativeEmitter = new NativeEventEmitter(NativeItcOpenIM);
  }
  return nativeEmitter;
}

// ============ 事件类型声明 ============
declare module '@itc/base' {
  interface ItcEventMap {
    'im:newMessage': IMMessage;
    'im:connectionChanged': ConnectionState;
    'im:conversationChanged': string;
    'im:messageRevoked': string;
    'im:typingStatus': { userId: string; status: boolean };
    'im:totalUnreadChanged': number;
    'im:kickedOffline': void;
    'im:tokenExpired': void;
  }
}

// ============ IM 模块实现 ============

class IMModule extends BaseModule<IMInitOptions> {
  readonly name = 'im';
  private _listenersSet = false;

  async isSupported(): Promise<boolean> {
    // 检查 TurboModule 是否可用
    try {
      // TurboModule 存在即视为支持
      return typeof ItcOpenIMSDK !== 'undefined';
    } catch {
      return false;
    }
  }

  protected async onInit(_options: IMInitOptions): Promise<void> {
    logger.info(TAG, '初始化 OpenIM SDK...');

    // 设置平台 ID：1=iOS, 2=Android
    const platformId = 2; // 默认 Android，后续根据平台动态设置

    try {
      const config = {
        ..._options,
        platformID: platformId,
      };

      await ItcOpenIMSDK.initSDK(serialize(config), generateOperationID());
      this._setupListeners();
      logger.info(TAG, 'OpenIM SDK 初始化成功');
    } catch (e) {
      logger.error(TAG, 'OpenIM SDK 初始化失败', e);
      throw ItcError.from(e, 'im');
    }
  }

  protected async onDestroy(): Promise<void> {
    try {
      await ItcOpenIMSDK.unInitSDK(generateOperationID());
    } catch (e) {
      logger.warn(TAG, 'unInitSDK 失败', e);
    }
    this._removeListeners();
  }

  /** 设置事件监听 */
  private _setupListeners(): void {
    if (this._listenersSet) return;
    this._listenersSet = true;

    const emitter = getNativeEmitter();

    // 连接状态事件
    emitter.addListener('onConnectSuccess', () => {
      eventBus.emit('im:connectionChanged', 'connected');
    });

    emitter.addListener('onConnecting', () => {
      eventBus.emit('im:connectionChanged', 'connecting');
    });

    emitter.addListener('onConnectFailed', ((event: { code: number; msg: string }) => {
      logger.error(TAG, `连接失败: ${event.code} ${event.msg}`);
      eventBus.emit('im:connectionChanged', 'disconnected');
    }) as (event: unknown) => void);

    emitter.addListener('onKickedOffline', () => {
      eventBus.emit('im:kickedOffline', undefined);
      eventBus.emit('im:connectionChanged', 'kickedOffline');
    });

    emitter.addListener('onUserTokenExpired', () => {
      eventBus.emit('im:tokenExpired', undefined);
    });

    // 消息事件
    emitter.addListener('onRecvNewMessages', ((msgList: string) => {
      try {
        const messages = JSON.parse(msgList) as IMMessage[];
        messages.forEach(msg => eventBus.emit('im:newMessage', msg));
      } catch (e) {
        logger.error(TAG, '解析消息失败', e);
      }
    }) as (event: unknown) => void);

    // 会话事件
    emitter.addListener('onConversationChanged', ((conversationList: string) => {
      eventBus.emit('im:conversationChanged', conversationList);
    }) as (event: unknown) => void);

    emitter.addListener('onInputStatusChanged', ((event: { userId: string; status: boolean }) => {
      eventBus.emit('im:typingStatus', { userId: event.userId, status: event.status });
    }) as (event: unknown) => void);

    emitter.addListener('onTotalUnreadMessageCountChanged', ((count: number) => {
      eventBus.emit('im:totalUnreadChanged', count);
    }) as (event: unknown) => void);

    // 消息撤回
    emitter.addListener('onNewRecvMessageRevoked', ((msgId: string) => {
      eventBus.emit('im:messageRevoked', msgId);
    }) as (event: unknown) => void);
  }

  /** 移除事件监听 */
  private _removeListeners(): void {
    if (!this._listenersSet) return;
    this._listenersSet = false;

    // TurboModule 模式下，监听器随模块生命周期管理
    // 实际移除逻辑在 onDestroy 中处理
    eventBus.removeAll('im:newMessage');
    eventBus.removeAll('im:connectionChanged');
    eventBus.removeAll('im:conversationChanged');
    eventBus.removeAll('im:messageRevoked');
    eventBus.removeAll('im:typingStatus');
    eventBus.removeAll('im:totalUnreadChanged');
    eventBus.removeAll('im:kickedOffline');
    eventBus.removeAll('im:tokenExpired');
  }

  /** 登录 OpenIM */
  async login(userId: string, token: string): Promise<void> {
    try {
      await ItcOpenIMSDK.login(serialize({ userID: userId, token }), generateOperationID());
      logger.info(TAG, `登录成功: ${userId}`);
    } catch (e) {
      logger.error(TAG, '登录失败', e);
      throw ItcError.from(e, 'im');
    }
  }

  /** 登出 */
  async logout(): Promise<void> {
    try {
      await ItcOpenIMSDK.logout(generateOperationID());
      logger.info(TAG, '登出成功');
    } catch (e) {
      logger.error(TAG, '登出失败', e);
      throw ItcError.from(e, 'im');
    }
  }

  /** 发送文本消息 */
  async sendText(conversationId: string, text: string): Promise<MessageItem> {
    try {
      // 创建文本消息
      const msgResult = await ItcOpenIMSDK.createTextMessage(text, generateOperationID());
      const msgObj = JSON.parse(msgResult as string);

      // 发送消息
      const sendParams: SendMsgParams = {
        message: msgObj,
        conversationID: conversationId,
      };
      const sendResult = await ItcOpenIMSDK.sendMessage(JSON.stringify(sendParams), generateOperationID());
      return JSON.parse(sendResult as string);
    } catch (e) {
      logger.error(TAG, '发送消息失败', e);
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取登录状态 */
  async getLoginStatus(): Promise<number> {
    try {
      return await ItcOpenIMSDK.getLoginStatus(generateOperationID());
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取登录用户ID */
  async getLoginUserID(): Promise<string> {
    try {
      return await ItcOpenIMSDK.getLoginUserID(generateOperationID());
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取所有会话列表 */
  async getAllConversationList(): Promise<string> {
    try {
      const result = await ItcOpenIMSDK.getAllConversationList(generateOperationID());
      return result as string;
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取未读消息总数 */
  async getTotalUnreadMsgCount(): Promise<number> {
    try {
      return await ItcOpenIMSDK.getTotalUnreadMsgCount(generateOperationID());
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取历史消息 */
  async getHistoryMessageList(
    conversationId: string,
    count: number = 20,
    startTime: number = 0
  ): Promise<string> {
    try {
      const params = {
        conversationID: conversationId,
        count,
        startTime,
      };
      const result = await ItcOpenIMSDK.getAdvancedHistoryMessageList(JSON.stringify(params), generateOperationID());
      return result as string;
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 标记会话已读 */
  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await ItcOpenIMSDK.markConversationMessageAsRead(conversationId, generateOperationID());
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 创建群组 */
  async createGroup(params: CreateGroupParams, operationID: string = id()): Promise<string> {
    try {
      const result = await ItcOpenIMSDK.createGroup(serialize(params), operationID);
      return result as string;
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取已加入的群组列表 */
  async getJoinedGroupList(operationID: string = id()): Promise<string> {
    try {
      const result = await ItcOpenIMSDK.getJoinedGroupList(operationID);
      return result as string;
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 根据会话类型获取会话ID */
  async getConversationIDBySessionType(params: GetOneConversationParams, operationID: string = id()): Promise<string> {
    try {
      const result = await ItcOpenIMSDK.getConversationIDBySessionType(serialize(params), operationID);
      return result as string;
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 创建文本消息 */
  async createTextMessage(text: string, operationID: string = id()): Promise<MessageItem> {
    try {
      const result = await ItcOpenIMSDK.createTextMessage(text, operationID);
      return JSON.parse(result as string);
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }
}

// ============ 辅助函数 ============

let operationIdCounter = 0;

/** 生成操作ID（用于日志追踪） */
function generateOperationID(): string {
  return `im_${Date.now()}_${++operationIdCounter}`;
}

// ============ 导出 ItcModule 模式 ============

export { IMModule };
export const im = new IMModule();
