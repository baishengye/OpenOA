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
import { NativeEventEmitter, Platform } from 'react-native';
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

// ============ Native 事件监听器设置 ============
// Native 层发送的事件列表（全部使用 im: 前缀）
const TAG_IM = 'im';

function setupNativeListeners(): void {
  const emitter = getNativeEmitter();
  if (!emitter) return;

  logger.info(TAG_IM, '开始设置 Native 事件监听器...');

  // ========== 连接状态事件 (InitSDKListener) ==========
  emitter.addListener('im:connectSuccess', () => {
    logger.info(TAG_IM, '收到 im:connectSuccess');
    eventBus.emit('im:connectionChanged', 'connected');
  });

  emitter.addListener('im:connecting', () => {
    logger.info(TAG_IM, '收到 im:connecting');
    eventBus.emit('im:connectionChanged', 'connecting');
  });

  emitter.addListener('im:connectFailed', ((event: { errCode: number; errMsg: string }) => {
    logger.error(TAG_IM, `收到 im:connectFailed: ${event.errCode} ${event.errMsg}`);
    eventBus.emit('im:connectionChanged', 'disconnected');
  }) as (event: unknown) => void);

  emitter.addListener('im:kickedOffline', () => {
    logger.info(TAG_IM, '收到 im:kickedOffline');
    eventBus.emit('im:kickedOffline', undefined);
    eventBus.emit('im:connectionChanged', 'kickedOffline');
  });

  emitter.addListener('im:userTokenExpired', () => {
    logger.info(TAG_IM, '收到 im:userTokenExpired');
    eventBus.emit('im:tokenExpired', undefined);
  });

  emitter.addListener('im:userTokenInvalid', () => {
    logger.info(TAG_IM, '收到 im:userTokenInvalid');
    eventBus.emit('im:tokenExpired', undefined);
  });

  // ========== 用户事件 (UserListener) ==========
  emitter.addListener('im:selfInfoUpdated', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:selfInfoUpdated');
    eventBus.emit('im:selfInfoUpdated', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:userStatusChanged', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:userStatusChanged');
    eventBus.emit('im:userStatusChanged', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:userCommandAdd', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:userCommandAdd');
    eventBus.emit('im:userCommandAdd', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:userCommandDelete', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:userCommandDelete');
    eventBus.emit('im:userCommandDelete', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:userCommandUpdate', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:userCommandUpdate');
    eventBus.emit('im:userCommandUpdate', data);
  }) as (event: unknown) => void);

  // ========== 会话事件 (OnConversationListener) ==========
  emitter.addListener('im:conversationChanged', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:conversationChanged');
    eventBus.emit('im:conversationChanged', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:newConversation', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:newConversation');
    eventBus.emit('im:newConversation', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:inputStatusChanged', ((data: { userId: string; status: boolean }) => {
    logger.info(TAG_IM, '收到 im:inputStatusChanged');
    eventBus.emit('im:typingStatus', { userId: data.userId, status: data.status });
  }) as (event: unknown) => void);

  emitter.addListener('im:syncServerFailed', ((data: boolean) => {
    logger.info(TAG_IM, '收到 im:syncServerFailed');
    eventBus.emit('im:syncServerFailed', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:syncServerFinish', ((data: boolean) => {
    logger.info(TAG_IM, '收到 im:syncServerFinish');
    eventBus.emit('im:syncServerFinish', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:syncServerStart', ((data: boolean) => {
    logger.info(TAG_IM, '收到 im:syncServerStart');
    eventBus.emit('im:syncServerStart', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:syncServerProgress', ((data: number) => {
    eventBus.emit('im:syncServerProgress', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:totalUnreadMessageCountChanged', ((count: number) => {
    logger.info(TAG_IM, `收到 im:totalUnreadMessageCountChanged: ${count}`);
    eventBus.emit('im:totalUnreadChanged', count);
  }) as (event: unknown) => void);

  // ========== 消息事件 (AdvancedMsgListener) ==========
  emitter.addListener('im:recvNewMessage', ((msgData: unknown) => {
    logger.info(TAG_IM, '收到 im:recvNewMessage');
    eventBus.emit('im:newMessage', msgData);
  }) as (event: unknown) => void);

  emitter.addListener('im:recvOfflineNewMessage', ((msgData: unknown) => {
    logger.info(TAG_IM, '收到 im:recvOfflineNewMessage');
    eventBus.emit('im:offlineMessage', msgData);
  }) as (event: unknown) => void);

  emitter.addListener('im:recvOnlineOnlyMessage', ((msgData: unknown) => {
    logger.info(TAG_IM, '收到 im:recvOnlineOnlyMessage');
    eventBus.emit('im:onlineOnlyMessage', msgData);
  }) as (event: unknown) => void);

  emitter.addListener('im:msgDeleted', ((msgData: unknown) => {
    logger.info(TAG_IM, '收到 im:msgDeleted');
    eventBus.emit('im:messageDeleted', msgData);
  }) as (event: unknown) => void);

  emitter.addListener('im:recvC2CReadReceipt', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:recvC2CReadReceipt');
    eventBus.emit('im:readReceipt', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:newRecvMessageRevoked', ((msgData: unknown) => {
    logger.info(TAG_IM, '收到 im:newRecvMessageRevoked');
    eventBus.emit('im:messageRevoked', msgData);
  }) as (event: unknown) => void);

  // ========== 上传事件 (UploadListener) ==========
  emitter.addListener('im:uploadComplete', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:uploadComplete');
    eventBus.emit('im:uploadComplete', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:uploadOnProgress', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:uploadOnProgress');
    eventBus.emit('im:uploadOnProgress', data);
  }) as (event: unknown) => void);

  // ========== 上传文件详细事件 (UploadFileCallbackListener) ==========
  emitter.addListener('im:uploadOpen', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:uploadOpen');
    eventBus.emit('im:uploadOpen', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:uploadPartSize', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:uploadPartSize');
    eventBus.emit('im:uploadPartSize', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:uploadHashPartProgress', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:uploadHashPartProgress');
    eventBus.emit('im:uploadHashPartProgress', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:uploadHashPartComplete', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:uploadHashPartComplete');
    eventBus.emit('im:uploadHashPartComplete', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:uploadPartComplete', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:uploadPartComplete');
    eventBus.emit('im:uploadPartComplete', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:uploadID', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:uploadID');
    eventBus.emit('im:uploadID', data);
  }) as (event: unknown) => void);

  // ========== 批量消息事件 (BatchMsgListener) ==========
  emitter.addListener('im:recvNewMessages', ((msgList: unknown) => {
    logger.info(TAG_IM, '收到 im:recvNewMessages');
    eventBus.emit('im:newMessages', msgList);
  }) as (event: unknown) => void);

  emitter.addListener('im:recvOfflineNewMessages', ((msgList: unknown) => {
    logger.info(TAG_IM, '收到 im:recvOfflineNewMessages');
    eventBus.emit('im:offlineMessages', msgList);
  }) as (event: unknown) => void);

  // ========== 自定义业务消息事件 (SetCustomBusinessListener) ==========
  emitter.addListener('im:recvCustomBusinessMessage', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:recvCustomBusinessMessage');
    eventBus.emit('im:recvCustomBusinessMessage', data);
  }) as (event: unknown) => void);

  // ========== 发送消息进度 ==========
  emitter.addListener('im:sendMessageProgress', ((data: { progress: number; message: unknown }) => {
    eventBus.emit('im:sendProgress', data);
  }) as (event: unknown) => void);

  // ========== 好友事件 (OnFriendshipListener) ==========
  emitter.addListener('im:blackAdded', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:blackAdded');
    eventBus.emit('im:blackAdded', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:blackDeleted', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:blackDeleted');
    eventBus.emit('im:blackDeleted', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:friendApplicationAccepted', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:friendApplicationAccepted');
    eventBus.emit('im:friendApplicationAccepted', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:friendApplicationAdded', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:friendApplicationAdded');
    eventBus.emit('im:friendApplicationAdded', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:friendApplicationDeleted', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:friendApplicationDeleted');
    eventBus.emit('im:friendApplicationDeleted', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:friendApplicationRejected', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:friendApplicationRejected');
    eventBus.emit('im:friendApplicationRejected', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:friendAdded', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:friendAdded');
    eventBus.emit('im:friendAdded', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:friendDeleted', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:friendDeleted');
    eventBus.emit('im:friendDeleted', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:friendInfoChanged', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:friendInfoChanged');
    eventBus.emit('im:friendInfoChanged', data);
  }) as (event: unknown) => void);

  // ========== 群组事件 (OnGroupListener) ==========
  emitter.addListener('im:groupApplicationAccepted', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:groupApplicationAccepted');
    eventBus.emit('im:groupApplicationAccepted', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:groupApplicationAdded', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:groupApplicationAdded');
    eventBus.emit('im:groupApplicationAdded', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:groupApplicationDeleted', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:groupApplicationDeleted');
    eventBus.emit('im:groupApplicationDeleted', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:groupApplicationRejected', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:groupApplicationRejected');
    eventBus.emit('im:groupApplicationRejected', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:groupDismissed', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:groupDismissed');
    eventBus.emit('im:groupDismissed', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:groupInfoChanged', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:groupInfoChanged');
    eventBus.emit('im:groupInfoChanged', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:groupMemberAdded', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:groupMemberAdded');
    eventBus.emit('im:groupMemberAdded', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:groupMemberDeleted', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:groupMemberDeleted');
    eventBus.emit('im:groupMemberDeleted', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:groupMemberInfoChanged', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:groupMemberInfoChanged');
    eventBus.emit('im:groupMemberInfoChanged', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:joinedGroupAdded', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:joinedGroupAdded');
    eventBus.emit('im:joinedGroupAdded', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:joinedGroupDeleted', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:joinedGroupDeleted');
    eventBus.emit('im:joinedGroupDeleted', data);
  }) as (event: unknown) => void);

  // ========== 信令事件 (OnSignalingListener) ==========
  emitter.addListener('im:hangUp', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:hangUp');
    eventBus.emit('im:hangUp', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:invitationCancelled', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:invitationCancelled');
    eventBus.emit('im:invitationCancelled', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:invitationTimeout', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:invitationTimeout');
    eventBus.emit('im:invitationTimeout', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:inviteeAccepted', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:inviteeAccepted');
    eventBus.emit('im:inviteeAccepted', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:inviteeAcceptedByOtherDevice', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:inviteeAcceptedByOtherDevice');
    eventBus.emit('im:inviteeAcceptedByOtherDevice', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:inviteeRejected', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:inviteeRejected');
    eventBus.emit('im:inviteeRejected', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:inviteeRejectedByOtherDevice', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:inviteeRejectedByOtherDevice');
    eventBus.emit('im:inviteeRejectedByOtherDevice', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:receiveNewInvitation', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:receiveNewInvitation');
    eventBus.emit('im:receiveNewInvitation', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:roomParticipantConnected', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:roomParticipantConnected');
    eventBus.emit('im:roomParticipantConnected', data);
  }) as (event: unknown) => void);

  emitter.addListener('im:roomParticipantDisconnected', ((data: unknown) => {
    logger.info(TAG_IM, '收到 im:roomParticipantDisconnected');
    eventBus.emit('im:roomParticipantDisconnected', data);
  }) as (event: unknown) => void);

  logger.info(TAG_IM, 'Native 事件监听器设置完成（共 71 个事件）');
}

// ItcOpenIM 类：直接封装 OpenIM SDK，与官方 open-im-sdk-reactnative 保持一致
class ItcOpenIM extends Emitter {
  private static instance: ItcOpenIM;
  private listenersSetup = false;

  private constructor() {
    super();
  }

  static getInstance(): ItcOpenIM {
    if (!ItcOpenIM.instance) {
      ItcOpenIM.instance = new ItcOpenIM();
    }
    return ItcOpenIM.instance;
  }

  /** 确保监听器已设置 */
  private ensureListeners(): void {
    if (!this.listenersSetup) {
      this.listenersSetup = true;
      setupNativeListeners();
    }
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
    this.ensureListeners();
    return this.invoke(ItcOpenIMSDK.initSDK, [serialize(params), operationID]);
  }

  login(params: LoginParams, operationID: string = id()) {
    this.ensureListeners();
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
    // 连接状态
    'im:connectionChanged': ConnectionState;
    'im:kickedOffline': void;
    'im:tokenExpired': void;
    // 用户
    'im:selfInfoUpdated': unknown;
    'im:userStatusChanged': unknown;
    'im:userCommandAdd': unknown;
    'im:userCommandDelete': unknown;
    'im:userCommandUpdate': unknown;
    // 会话
    'im:conversationChanged': unknown;
    'im:newConversation': unknown;
    'im:typingStatus': { userId: string; status: boolean };
    'im:syncServerFailed': boolean;
    'im:syncServerFinish': boolean;
    'im:syncServerStart': boolean;
    'im:syncServerProgress': number;
    'im:totalUnreadChanged': number;
    // 消息
    'im:newMessage': unknown;
    'im:offlineMessage': unknown;
    'im:onlineOnlyMessage': unknown;
    'im:messageDeleted': unknown;
    'im:readReceipt': unknown;
    'im:messageRevoked': unknown;
    'im:newMessages': unknown;
    'im:offlineMessages': unknown;
    'im:sendProgress': { progress: number; message: unknown };
    // 上传
    'im:uploadComplete': unknown;
    'im:uploadOnProgress': unknown;
    'im:uploadOpen': unknown;
    'im:uploadPartSize': unknown;
    'im:uploadHashPartProgress': unknown;
    'im:uploadHashPartComplete': unknown;
    'im:uploadPartComplete': unknown;
    'im:uploadID': unknown;
    // 自定义业务消息
    'im:recvCustomBusinessMessage': unknown;
    // 好友
    'im:blackAdded': unknown;
    'im:blackDeleted': unknown;
    'im:friendApplicationAccepted': unknown;
    'im:friendApplicationAdded': unknown;
    'im:friendApplicationDeleted': unknown;
    'im:friendApplicationRejected': unknown;
    'im:friendAdded': unknown;
    'im:friendDeleted': unknown;
    'im:friendInfoChanged': unknown;
    // 群组
    'im:groupApplicationAccepted': unknown;
    'im:groupApplicationAdded': unknown;
    'im:groupApplicationDeleted': unknown;
    'im:groupApplicationRejected': unknown;
    'im:groupDismissed': unknown;
    'im:groupInfoChanged': unknown;
    'im:groupMemberAdded': unknown;
    'im:groupMemberDeleted': unknown;
    'im:groupMemberInfoChanged': unknown;
    'im:joinedGroupAdded': unknown;
    'im:joinedGroupDeleted': unknown;
    // 信令（音视频通话）
    'im:hangUp': unknown;
    'im:invitationCancelled': unknown;
    'im:invitationTimeout': unknown;
    'im:inviteeAccepted': unknown;
    'im:inviteeAcceptedByOtherDevice': unknown;
    'im:inviteeRejected': unknown;
    'im:inviteeRejectedByOtherDevice': unknown;
    'im:receiveNewInvitation': unknown;
    'im:roomParticipantConnected': unknown;
    'im:roomParticipantDisconnected': unknown;
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
    const platformId = Platform.OS === 'ios' ? 1 : 2;

    // 获取沙盒目录（Android: dataDir, iOS: 相对路径）
    let dataDir = _options.dataDir;
    if (!dataDir) {
      if (Platform.OS === 'android') {
        // Android 使用应用私有目录
        dataDir = 'open_im_android';
      } else if (Platform.OS === 'ios') {
        // iOS 使用 Documents 目录下的子目录
        dataDir = 'openim_ios';
      }
    }

    try {
      const config = {
        ..._options,
        platformID: platformId,
        dataDir,
      };

      logger.info(TAG, `初始化配置: api=${_options.apiAddr}, dataDir=${dataDir}`);
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

    logger.info(TAG, '_setupListeners: 开始设置事件监听器');
    const emitter = getNativeEmitter();

    // 连接状态事件
    logger.info(TAG, '_setupListeners: 监听 im:connectSuccess');
    emitter.addListener('im:connectSuccess', () => {
      logger.info(TAG, '_setupListeners: 收到 im:connectSuccess 事件');
      eventBus.emit('im:connectionChanged', 'connected');
    });

    logger.info(TAG, '_setupListeners: 监听 im:connecting');
    emitter.addListener('im:connecting', () => {
      logger.info(TAG, '_setupListeners: 收到 im:connecting 事件');
      eventBus.emit('im:connectionChanged', 'connecting');
    });

    logger.info(TAG, '_setupListeners: 监听 im:connectFailed');
    emitter.addListener('im:connectFailed', ((event: { errCode: number; errMsg: string }) => {
      logger.error(TAG, `_setupListeners: 收到 im:connectFailed 事件: ${event.errCode} ${event.errMsg}`);
      eventBus.emit('im:connectionChanged', 'disconnected');
    }) as (event: unknown) => void);

    logger.info(TAG, '_setupListeners: 监听 im:kickedOffline');
    emitter.addListener('im:kickedOffline', () => {
      logger.info(TAG, '_setupListeners: 收到 im:kickedOffline 事件');
      eventBus.emit('im:kickedOffline', undefined);
      eventBus.emit('im:connectionChanged', 'kickedOffline');
    });

    logger.info(TAG, '_setupListeners: 监听 im:userTokenExpired');
    emitter.addListener('im:userTokenExpired', () => {
      logger.info(TAG, '_setupListeners: 收到 im:userTokenExpired 事件');
      eventBus.emit('im:tokenExpired', undefined);
    });

    logger.info(TAG, '_setupListeners: 监听 im:userTokenInvalid');
    emitter.addListener('im:userTokenInvalid', () => {
      logger.info(TAG, '_setupListeners: 收到 im:userTokenInvalid 事件');
      eventBus.emit('im:tokenExpired', undefined);
    });

    logger.info(TAG, '_setupListeners: 所有监听器设置完成');
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
