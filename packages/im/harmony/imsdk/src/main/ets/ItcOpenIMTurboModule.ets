/**
 * OpenIM SDK TurboModule（鸿蒙 NEXT / RNOH）。
 *
 * 包装 imsdk.har NAPI SDK，将其方法暴露为 TurboModule。
 * 使用 UITurboModule 基类和 RNOH 0.82 架构。
 */

import { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { getSDK } from 'imsdk';
import { CbEvents,GroupType,GroupVerificationType ,AllowType,GroupStatus} from 'imsdk/src/main/ets/sdk/enum';
import type {
  CbEventData,
  MessageItem as SDKMessageItem,
  TextElem as SDKTextElem,
  CardElem as SDKCardElem,
  AtTextElem as SDKAtTextElem,
  NotificationElem as SDKNotificationElem,
  AdvancedTextElem as SDKAdvancedTextElem,
  TypingElem as SDKTypingElem,
  CustomElem as SDKCustomElem,
  FileElem as SDKFileElem,
  FaceElem as SDKFaceElem,
  LocationElem as SDKLocationElem,
  Picture as SDKPicture,
  PictureElem as SDKPictureElem,
  SoundElem as SDKSoundElem,
  VideoElem as SDKVideoElem,
  MergeElem as SDKMergeElem,
  QuoteElem as SDKQuoteElem,
  OfflinePush as SDKOfflinePush,
  AttachedInfoElem as SDKAttachedInfoElem,
  GroupHasReadInfo as SDKGroupHasReadInfo,
  MessageEntity as SDKMessageEntity,
} from 'imsdk/src/main/ets/sdk/entity';
import type {
  FindMessageParams as SDKFindMessageParams,
  SendMsgParams as SDKSendMsgParams,
  MergerMsgParams as SDKMergerMsgParams,
  ImageMsgParamsByURL as SDKImageMsgParamsByURL,
  SearchGroupMemberParams as SDKSearchGroupMemberParams,
} from 'imsdk/src/main/ets/sdk/params';
import type {
  MessageItem,
  TextElem,
  CardElem,
  AtTextElem,
  NotificationElem,
  AdvancedTextElem,
  TypingElem,
  CustomElem,
  FileElem,
  FaceElem,
  LocationElem,
  Picture,
  PictureElem,
  SoundElem,
  VideoElem,
  MergeElem,
  QuoteElem,
  OfflinePush,
  AttachedInfoElem,
  GroupHasReadInfo,
  MessageEntity,
} from './types/entity.d';
import type {
  FindMessageParams,
  SendMsgParams,
  MergerMsgParams,
  ImageMsgParamsByURL,
  SearchGroupMemberParams,
  InsertGroupMsgParams,
  InsertSingleMsgParams,
  SearchLocalParams,
  InitOptions,
  LoginParams,
  SetSelfInfoParams,
  GetUserInfoWithCacheParams,
  SplitConversationParams,
  GetOneConversationParams,
  SetConversationParams,
  SetConversationDraftParams,
  PinConversationParams,
  SetConversationRecvOptParams,
  SetConversationPrivateParams,
  SetBurnDurationParams,
  GetSpecifiedFriendsParams,
  UpdateFriendsParams,
  GetFriendListPageParams,
  AccessFriendParams,
  AddBlackParams,
  AddFriendParams,
  GetFriendApplicationListAsRecipientParams,
  GetSelfApplicationUnhandledCountParams,
  GetFriendApplicationListAsApplicantParams,
  SearchFriendParams,
  SetFriendRemarkParams,
  CreateGroupParams,
  JoinGroupParams,
  OperateGroupParams,
  SearchGroupParams,
  SetGroupInfoParams,
  GetGroupApplicationListAsRecipientParams,
  GetGroupApplicationListAsApplicantParams,
  AccessGroupParams,
  GetGroupMembersParams,
  GetGroupMembersInfoParams,
  SearchGroupMemberParamsSimple,
  UpdateGroupMemberInfoParams,
  GetGroupMemberByTimeParams,
  ChangeGroupMemberMuteParams,
  ChangeGroupMuteParams,
  TransferGroupOwnerParams,
  TypingUpdateParams,
  ChangeInputStatesParams,
  GetInputStatesParams,
  OperateMessageParams,
  GetAdvancedHistoryMsgParams,
  FindMessageListParams,
  SetMessageLocalExParams,
  SearchGroupMembersParams,
  SoundMsgParams,
  VideoMsgParams,
  FileMsgParams,
  MessageReceiptParams,
  MarkReadParams,
  GetUnreadMsgCountParams,
  GetConversationListParams,
  SetConversationHasReadParams,
  DeleteConversationParams,
  HideConversationParams,
  QuoteMsgParams,
  AtMsgParams,
  SoundMsgByPathParams,
  VideoMsgByPathParams,
  FileMsgByPathParams,
  MessageOperateParams,
  OperateGroupMemberParams,
  FriendApplicationListAsApplicantParams,
  FriendApplicationListAsRecipientParams,
  GetGroupMemberListParams,
  GetJoinedGroupListParams,
  GetConversationIDBySessionTypeParams,
  LocationMsgParams,
  CardMsgParams,
  CustomMsgParams,
  FaceMessageParams,
  LogsParams,
  UploadFileParams,
  UploadLogsParams
} from './types/params.d';
import Logger from './common/utils/Logger';
import { fileIo } from '@kit.CoreFileKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { JSON } from '@kit.ArkTS';

const TAG = 'ItcOpenIMTurboModule';

// 辅助函数：从解析的JSON数据构建SDK类型
// 输入类型使用本地的 entity.d 类型，输出类型使用 imsdk.har 的 SDK 类型
function buildSDKMessageItem(data: MessageItem): SDKMessageItem {
  const sdkAttachedInfoElem: SDKAttachedInfoElem = {
    groupHasReadInfo: {
      hasReadCount: data.attachedInfoElem?.groupHasReadInfo?.hasReadCount ?? 0,
      unreadCount: data.attachedInfoElem?.groupHasReadInfo?.unreadCount ?? 0,
      hasReadUserIDList: data.attachedInfoElem?.groupHasReadInfo?.hasReadUserIDList ?? [],
      groupMemberCount: data.attachedInfoElem?.groupHasReadInfo?.groupMemberCount ?? 0,
    },
    isPrivateChat: data.attachedInfoElem?.isPrivateChat ?? false,
    isEncryption: data.attachedInfoElem?.isEncryption ?? false,
    inEncryptStatus: data.attachedInfoElem?.inEncryptStatus ?? false,
    burnDuration: data.attachedInfoElem?.burnDuration ?? 0,
    hasReadTime: data.attachedInfoElem?.hasReadTime ?? 0,
  };

  const msg: SDKMessageItem = {
    clientMsgID: data.clientMsgID ?? '',
    serverMsgID: data.serverMsgID ?? '',
    createTime: data.createTime ?? 0,
    sendTime: data.sendTime ?? 0,
    sessionType: data.sessionType ?? 0,
    sendID: data.sendID ?? '',
    recvID: data.recvID ?? '',
    msgFrom: data.msgFrom ?? 0,
    contentType: data.contentType ?? 0,
    senderPlatformID: data.senderPlatformID ?? 0,
    senderNickname: data.senderNickname ?? '',
    senderFaceUrl: data.senderFaceUrl ?? '',
    groupID: data.groupID ?? '',
    content: data.content ?? '',
    seq: data.seq ?? 0,
    isRead: data.isRead ?? false,
    status: data.status ?? 0,
    attachedInfoElem: sdkAttachedInfoElem,
    ex: data.ex ?? '',
    localEx: data.localEx ?? '',
  };

  // 可选元素
  if (data.textElem !== undefined) {
    msg.textElem = buildSDKTextElem(data.textElem);
  }
  if (data.cardElem !== undefined) {
    msg.cardElem = buildSDKCardElem(data.cardElem);
  }
  if (data.pictureElem !== undefined) {
    msg.pictureElem = buildSDKPictureElem(data.pictureElem);
  }
  if (data.soundElem !== undefined) {
    msg.soundElem = buildSDKSoundElem(data.soundElem);
  }
  if (data.videoElem !== undefined) {
    msg.videoElem = buildSDKVideoElem(data.videoElem);
  }
  if (data.fileElem !== undefined) {
    msg.fileElem = buildSDKFileElem(data.fileElem);
  }
  if (data.mergeElem !== undefined) {
    msg.mergeElem = buildSDKMergeElem(data.mergeElem);
  }
  if (data.atTextElem !== undefined) {
    msg.atTextElem = buildSDKAtTextElem(data.atTextElem);
  }
  if (data.faceElem !== undefined) {
    msg.faceElem = buildSDKFaceElem(data.faceElem);
  }
  if (data.locationElem !== undefined) {
    msg.locationElem = buildSDKLocationElem(data.locationElem);
  }
  if (data.customElem !== undefined) {
    msg.customElem = buildSDKCustomElem(data.customElem);
  }
  if (data.quoteElem !== undefined) {
    msg.quoteElem = buildSDKQuoteElem(data.quoteElem);
  }
  if (data.notificationElem !== undefined) {
    msg.notificationElem = buildSDKNotificationElem(data.notificationElem);
  }
  if (data.advancedTextElem !== undefined) {
    msg.advancedTextElem = buildSDKAdvancedTextElem(data.advancedTextElem);
  }
  if (data.typingElem !== undefined) {
    msg.typingElem = buildSDKTypingElem(data.typingElem);
  }
  if (data.offlinePush !== undefined) {
    msg.offlinePush = buildSDKOfflinePush(data.offlinePush);
  }

  return msg;
}

// SDK类型构建函数
function buildSDKTextElem(data: TextElem): SDKTextElem {
  return {
    content: data.content ?? '',
  };
}

function buildSDKCardElem(data: CardElem): SDKCardElem {
  return {
    userID: data.userID ?? '',
    nickname: data.nickname ?? '',
    faceURL: data.faceURL ?? '',
    ex: data.ex ?? '',
  };
}

function buildSDKAtTextElem(data: AtTextElem): SDKAtTextElem {
  return {
    text: data.text ?? '',
    atUserList: data.atUserList ?? [],
  };
}

function buildSDKNotificationElem(data: NotificationElem): SDKNotificationElem {
  return {
    detail: data.detail ?? '',
  };
}

function buildSDKAdvancedTextElem(data: AdvancedTextElem): SDKAdvancedTextElem {
  return {
    text: data.text ?? '',
    messageEntityList: data.messageEntityList ?? [],
  };
}

function buildSDKTypingElem(data: TypingElem): SDKTypingElem {
  return {
    msgTips: data.msgTips ?? '',
  };
}

function buildSDKCustomElem(data: CustomElem): SDKCustomElem {
  return {
    data: data.data ?? '',
    description: data.description ?? '',
    extension: data.extension ?? '',
  };
}

function buildSDKFileElem(data: FileElem): SDKFileElem {
  return {
    filePath: data.filePath ?? '',
    uuid: data.uuid ?? '',
    sourceUrl: data.sourceUrl ?? '',
    fileName: data.fileName ?? '',
    fileSize: data.fileSize ?? 0,
  };
}

function buildSDKFaceElem(data: FaceElem): SDKFaceElem {
  return {
    index: data.index ?? 0,
    data: data.data ?? '',
  };
}

function buildSDKLocationElem(data: LocationElem): SDKLocationElem {
  return {
    description: data.description ?? '',
    longitude: data.longitude ?? 0,
    latitude: data.latitude ?? 0,
  };
}

function buildSDKMergeElem(data: MergeElem): SDKMergeElem {
  return {
    title: data.title ?? '',
    abstractList: data.abstractList ?? [],
    multiMessage: data.multiMessage?.map(msg => buildSDKMessageItem(msg)) ?? [],
    messageEntityList: data.messageEntityList ?? [],
  };
}

function buildSDKOfflinePush(data: OfflinePush): SDKOfflinePush {
  return {
    title: data.title ?? '',
    desc: data.desc ?? '',
    ex: data.ex ?? '',
    iOSPushSound: data.iOSPushSound ?? '',
    iOSBadgeCount: data.iOSBadgeCount ?? false,
  };
}

function buildSDKPicture(data: Picture): SDKPicture {
  return {
    uuid: data.uuid ?? '',
    type: data.type ?? '',
    size: data.size ?? 0,
    width: data.width ?? 0,
    height: data.height ?? 0,
    url: data.url ?? '',
  };
}

function buildSDKPictureElem(data: PictureElem): SDKPictureElem {
  return {
    sourcePath: data.sourcePath ?? '',
    sourcePicture: buildSDKPicture(data.sourcePicture),
    bigPicture: buildSDKPicture(data.bigPicture),
    snapshotPicture: buildSDKPicture(data.snapshotPicture),
  };
}

function buildSDKQuoteElem(data: QuoteElem): SDKQuoteElem {
  return {
    text: data.text ?? '',
    quoteMessage: buildSDKMessageItem(data.quoteMessage),
  };
}

function buildSDKSoundElem(data: SoundElem): SDKSoundElem {
  return {
    uuid: data.uuid ?? '',
    soundPath: data.soundPath ?? '',
    sourceUrl: data.sourceUrl ?? '',
    dataSize: data.dataSize ?? 0,
    duration: data.duration ?? 0,
  };
}

function buildSDKVideoElem(data: VideoElem): SDKVideoElem {
  return {
    videoPath: data.videoPath ?? '',
    videoUUID: data.videoUUID ?? '',
    videoUrl: data.videoUrl ?? '',
    videoType: data.videoType ?? '',
    videoSize: data.videoSize ?? 0,
    duration: data.duration ?? 0,
    snapshotPath: data.snapshotPath ?? '',
    snapshotUUID: data.snapshotUUID ?? '',
    snapshotSize: data.snapshotSize ?? 0,
    snapshotUrl: data.snapshotUrl ?? '',
    snapshotWidth: data.snapshotWidth ?? 0,
    snapshotHeight: data.snapshotHeight ?? 0,
  };
}

// 用于兼容性：旧的 buildMessageItem 函数，使用本地 MessageItem 类型
function buildMessageItem(data: MessageItem): SDKMessageItem {
  return buildSDKMessageItem(data);
}

export class ItcOpenIMTurboModule extends UITurboModule {
  static readonly NAME: string = 'ItcOpenIM';

  private isInitialized: boolean = false;

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
    Logger.info(TAG, '🏗️ ItcOpenIMTurboModule constructor called!');
    Logger.info(TAG, `🧪 ctx type: ${typeof ctx}`);
    Logger.info(TAG, `🧪 ctx.rnInstance: ${typeof this.ctx.rnInstance}`);
    this.initEventListener();
    Logger.info(TAG, '🏗️ Constructor completed');
  }

  private initEventListener(): void {
    Logger.info(TAG, '=== initEventListener START ===');
    const sdk = getSDK();
    Logger.info(TAG, `getSDK() returned: ${typeof sdk}`);
    Logger.info(TAG, `sdk.on exists: ${typeof sdk.on === 'function'}`);
    Logger.info(TAG, `sdk.startListener exists: ${typeof sdk.startListener === 'function'}`);

    // 注册 SDK 事件监听器
    // 连接状态事件
    sdk.on(CbEvents.OnConnectSuccess, () => {
      Logger.info(TAG, '🔥 OnConnectSuccess callback triggered!');
      this.handleSdkEvent(CbEvents.OnConnectSuccess, '');
    });

    sdk.on(CbEvents.OnConnecting, () => {
      Logger.info(TAG, '🔥 OnConnecting callback triggered!');
      this.handleSdkEvent(CbEvents.OnConnecting, '');
    });

    sdk.on(CbEvents.OnConnectFailed, (data: CbEventData) => {
      Logger.info(TAG, `🔥 OnConnectFailed callback triggered! data: ${this.safeSerializeEventData(data)}`);
      this.handleSdkEvent(CbEvents.OnConnectFailed, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnKickedOffline, () => {
      Logger.info(TAG, '🔥 OnKickedOffline callback triggered!');
      this.handleSdkEvent(CbEvents.OnKickedOffline, '');
    });

    sdk.on(CbEvents.OnUserTokenExpired, () => {
      Logger.info(TAG, '🔥 OnUserTokenExpired callback triggered!');
      this.handleSdkEvent(CbEvents.OnUserTokenExpired, '');
    });

    sdk.on(CbEvents.OnUserTokenInvalid, () => {
      this.handleSdkEvent(CbEvents.OnUserTokenInvalid, '');
    });

    sdk.on(CbEvents.OnSelfInfoUpdated, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnSelfInfoUpdated, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnUserStatusChanged, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnUserStatusChanged, this.safeSerializeEventData(data));
    });

    // 消息事件
    sdk.on(CbEvents.OnRecvNewMessage, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvNewMessage, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnRecvNewMessages, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvNewMessages, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnRecvOfflineNewMessage, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvOfflineNewMessage, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnRecvOfflineNewMessages, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvOfflineNewMessages, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnRecvOnlineOnlyMessage, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvOnlineOnlyMessage, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnMsgDeleted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnMsgDeleted, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnRecvC2CReadReceipt, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvC2CReadReceipt, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnRecvGroupReadReceipt, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvGroupReadReceipt, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnNewRecvMessageRevoked, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnNewRecvMessageRevoked, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnRecvMessageExtensionsChanged, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvMessageExtensionsChanged, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnRecvMessageExtensionsDeleted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvMessageExtensionsDeleted, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnRecvMessageExtensionsAdded, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnRecvMessageExtensionsAdded, this.safeSerializeEventData(data));
    });

    // 会话事件
    sdk.on(CbEvents.OnConversationChanged, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnConversationChanged, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnNewConversation, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnNewConversation, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnTotalUnreadMessageCountChanged, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnTotalUnreadMessageCountChanged, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnConversationUserInputStatusChanged, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnConversationUserInputStatusChanged, this.safeSerializeEventData(data));
    });

    // 同步事件
    sdk.on(CbEvents.OnSyncServerStart, () => {
      this.handleSdkEvent(CbEvents.OnSyncServerStart, '');
    });

    sdk.on(CbEvents.OnSyncServerFinish, () => {
      this.handleSdkEvent(CbEvents.OnSyncServerFinish, '');
    });

    sdk.on(CbEvents.OnSyncServerProgress, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnSyncServerProgress, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnSyncServerFailed, () => {
      this.handleSdkEvent(CbEvents.OnSyncServerFailed, '');
    });

    // 好友事件
    sdk.on(CbEvents.OnFriendApplicationAccepted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnFriendApplicationAccepted, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnFriendApplicationAdded, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnFriendApplicationAdded, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnFriendApplicationDeleted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnFriendApplicationDeleted, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnFriendApplicationRejected, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnFriendApplicationRejected, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnFriendInfoChanged, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnFriendInfoChanged, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnFriendAdded, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnFriendAdded, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnFriendDeleted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnFriendDeleted, this.safeSerializeEventData(data));
    });

    // 黑名单事件
    sdk.on(CbEvents.OnBlackAdded, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnBlackAdded, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnBlackDeleted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnBlackDeleted, this.safeSerializeEventData(data));
    });

    // 群组事件
    sdk.on(CbEvents.OnGroupApplicationAccepted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnGroupApplicationAccepted, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnGroupApplicationRejected, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnGroupApplicationRejected, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnGroupApplicationAdded, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnGroupApplicationAdded, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnGroupApplicationDeleted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnGroupApplicationDeleted, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnGroupInfoChanged, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnGroupInfoChanged, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnGroupMemberInfoChanged, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnGroupMemberInfoChanged, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnGroupMemberAdded, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnGroupMemberAdded, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnGroupMemberDeleted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnGroupMemberDeleted, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnJoinedGroupAdded, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnJoinedGroupAdded, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnJoinedGroupDeleted, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnJoinedGroupDeleted, this.safeSerializeEventData(data));
    });

    sdk.on(CbEvents.OnGroupDismissed, (data: CbEventData) => {
      this.handleSdkEvent(CbEvents.OnGroupDismissed, this.safeSerializeEventData(data));
    });

    this.isInitialized = true;
    Logger.info(TAG, 'Event listener initialized');
  }

  private safeSerializeEventData(data: CbEventData): string {
    if (data === undefined || data === null || data === void 0) {
      return '{}';
    }
    if (typeof data === 'boolean' || typeof data === 'number') {
      return JSON.stringify(data);
    }
    if (Array.isArray(data)) {
      return JSON.stringify(data);
    }
    if (typeof data === 'object') {
      try {
        return JSON.stringify(data);
      } catch {
        return '{}';
      }
    }
    return '{}';
  }

  private safeParse<T>(jsonStr: string, defaultValue?: T): T | undefined {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed === null || parsed === undefined) {
        return defaultValue;
      }
      return parsed as T;
    } catch {
      return defaultValue;
    }
  }

  private emitRNEvent(eventName: string, data: string): void {
    try {
      const rnInstance = this.ctx.rnInstance;
      rnInstance.emitDeviceEvent(eventName, data);
    } catch (e) {
      Logger.error(TAG, `emitRNEvent failed: ${e}`);
    }
  }

  private handleSdkEvent(event: CbEvents, data: string): void {
    let jsEventName: string | null = null;
    let jsData: string = data;

    switch (event) {
      case CbEvents.OnConnectSuccess:
        jsEventName = 'im:connectSuccess';
        break;
      case CbEvents.OnConnecting:
        jsEventName = 'im:connecting';
        break;
      case CbEvents.OnConnectFailed:
        try {
          const failedData: Record<string, number | string> = typeof data === 'string' ? JSON.parse(data) as Record<string, number | string> : data as Record<string, number | string>;
          this.emitRNEvent('im:connectFailed', JSON.stringify({
            errCode: failedData.errCode ?? 0,
            errMsg: failedData.errMsg ?? ''
          }));
        } catch {
          this.emitRNEvent('im:connectFailed', JSON.stringify({ errCode: 0, errMsg: data as string }));
        }
        return;
      case CbEvents.OnKickedOffline:
        jsEventName = 'im:kickedOffline';
        break;
      case CbEvents.OnUserTokenExpired:
        jsEventName = 'im:userTokenExpired';
        break;
      case CbEvents.OnUserTokenInvalid:
        jsEventName = 'im:userTokenInvalid';
        break;
      case CbEvents.OnSelfInfoUpdated:
        jsEventName = 'im:selfInfoUpdated';
        break;
      case CbEvents.OnUserStatusChanged:
        jsEventName = 'im:userStatusChanged';
        break;
      case CbEvents.OnRecvNewMessage:
        jsEventName = 'im:messageReceived';
        break;
      case CbEvents.OnRecvNewMessages:
        jsEventName = 'im:messagesReceived';
        break;
      case CbEvents.OnRecvOfflineNewMessage:
        jsEventName = 'im:offlineMessageReceived';
        break;
      case CbEvents.OnRecvOfflineNewMessages:
        jsEventName = 'im:offlineMessagesReceived';
        break;
      case CbEvents.OnRecvOnlineOnlyMessage:
        jsEventName = 'im:onlineOnlyMessageReceived';
        break;
      case CbEvents.OnMsgDeleted:
        jsEventName = 'im:messagesDeleted';
        break;
      case CbEvents.OnRecvC2CReadReceipt:
        jsEventName = 'im:c2cReadReceipt';
        break;
      case CbEvents.OnRecvGroupReadReceipt:
        jsEventName = 'im:groupReadReceipt';
        break;
      case CbEvents.OnNewRecvMessageRevoked:
        jsEventName = 'im:messageRevoked';
        break;
      case CbEvents.OnConversationChanged:
        jsEventName = 'im:conversationChanged';
        break;
      case CbEvents.OnNewConversation:
        jsEventName = 'im:newConversation';
        break;
      case CbEvents.OnSyncServerStart:
        jsEventName = 'im:syncStart';
        jsData = JSON.stringify({ isSyncing: true });
        break;
      case CbEvents.OnSyncServerFinish:
        jsEventName = 'im:syncFinish';
        break;
      case CbEvents.OnSyncServerProgress:
        jsEventName = 'im:syncProgress';
        break;
      case CbEvents.OnSyncServerFailed:
        jsEventName = 'im:syncFailed';
        break;
      case CbEvents.OnTotalUnreadMessageCountChanged:
        jsEventName = 'im:unreadCountChanged';
        try {
          let count = 0;
          if (typeof data === 'number') {
            count = data;
          } else if (typeof data === 'string') {
            count = parseInt(data) || 0;
          } else if (typeof data === 'object' && data !== null) {
            count = (data as Record<string, number>).count ?? 0;
          }
          jsData = JSON.stringify({ count: count });
        } catch {
          jsData = JSON.stringify({ count: 0 });
        }
        break;
      case CbEvents.OnConversationUserInputStatusChanged:
        jsEventName = 'im:inputStatusChanged';
        break;
      case CbEvents.OnRecvMessageExtensionsChanged:
        jsEventName = 'im:messageExtensionsChanged';
        break;
      case CbEvents.OnRecvMessageExtensionsDeleted:
        jsEventName = 'im:messageExtensionsDeleted';
        break;
      case CbEvents.OnRecvMessageExtensionsAdded:
        jsEventName = 'im:messageExtensionsAdded';
        break;
      case CbEvents.OnRecvCustomBusinessMessage:
        jsEventName = 'im:customBusinessMessage';
        break;
      case CbEvents.OnMessageKVInfoChanged:
        jsEventName = 'im:messageKVInfoChanged';
        break;
      case CbEvents.OnFriendApplicationAccepted:
        jsEventName = 'im:friendApplicationAccepted';
        break;
      case CbEvents.OnFriendApplicationAdded:
        jsEventName = 'im:friendApplicationAdded';
        break;
      case CbEvents.OnFriendApplicationDeleted:
        jsEventName = 'im:friendApplicationDeleted';
        break;
      case CbEvents.OnFriendApplicationRejected:
        jsEventName = 'im:friendApplicationRejected';
        break;
      case CbEvents.OnFriendInfoChanged:
        jsEventName = 'im:friendInfoChanged';
        break;
      case CbEvents.OnFriendAdded:
        jsEventName = 'im:friendAdded';
        break;
      case CbEvents.OnFriendDeleted:
        jsEventName = 'im:friendDeleted';
        break;
      case CbEvents.OnBlackAdded:
        jsEventName = 'im:blackAdded';
        break;
      case CbEvents.OnBlackDeleted:
        jsEventName = 'im:blackDeleted';
        break;
      case CbEvents.OnGroupApplicationAccepted:
        jsEventName = 'im:groupApplicationAccepted';
        break;
      case CbEvents.OnGroupApplicationRejected:
        jsEventName = 'im:groupApplicationRejected';
        break;
      case CbEvents.OnGroupApplicationAdded:
        jsEventName = 'im:groupApplicationAdded';
        break;
      case CbEvents.OnGroupApplicationDeleted:
        jsEventName = 'im:groupApplicationDeleted';
        break;
      case CbEvents.OnGroupInfoChanged:
        jsEventName = 'im:groupInfoChanged';
        break;
      case CbEvents.OnGroupMemberInfoChanged:
        jsEventName = 'im:groupMemberInfoChanged';
        break;
      case CbEvents.OnGroupMemberAdded:
        jsEventName = 'im:groupMemberAdded';
        break;
      case CbEvents.OnGroupMemberDeleted:
        jsEventName = 'im:groupMemberDeleted';
        break;
      case CbEvents.OnJoinedGroupAdded:
        jsEventName = 'im:joinedGroupAdded';
        break;
      case CbEvents.OnJoinedGroupDeleted:
        jsEventName = 'im:joinedGroupDeleted';
        break;
      case CbEvents.OnGroupDismissed:
        jsEventName = 'im:groupDismissed';
        break;
      // 上传相关事件
      case CbEvents.OnOpen:
        jsEventName = 'im:uploadOpen';
        break;
      case CbEvents.OnPartSize:
        jsEventName = 'im:uploadPartSize';
        break;
      case CbEvents.OnHashPartProgress:
        jsEventName = 'im:uploadHashProgress';
        break;
      case CbEvents.OnHashPartComplete:
        jsEventName = 'im:uploadHashComplete';
        break;
      case CbEvents.OnUploadID:
        jsEventName = 'im:uploadId';
        break;
      case CbEvents.OnUploadPartComplete:
        jsEventName = 'im:uploadPartComplete';
        break;
      case CbEvents.OnUploadComplete:
        jsEventName = 'im:uploadComplete';
        break;
      case CbEvents.OnComplete:
        jsEventName = 'im:uploadDone';
        break;
      case CbEvents.OnProgress:
        jsEventName = 'im:uploadProgress';
        break;
      default:
        Logger.warn(TAG, `Unknown event: ${event}, data: ${data}`);
        return;
    }

    if (jsEventName) {
      this.emitRNEvent(jsEventName, jsData);
    }
  }

  // ============ SDK 初始化 ============

  async initSDK(config: string, _operationID: string): Promise<boolean> {
    try {
      Logger.info(TAG, `initSDK raw config: ${config}`);
      const cfg = this.safeParse<InitOptions>(config);
      if(cfg == undefined){
        return false;
      }

      // 处理 dataDir 路径（参考 Android 实现）
      let dataDir = cfg.dataDir ?? '';
      if (!dataDir || dataDir.trim() === '') {
        dataDir = 'default_openim_data';
      }

      // 如果是相对路径，转换为应用私有目录下的绝对路径
      if (!dataDir.startsWith('/')) {
        // 使用 RNOH context 的 uiAbilityContext 获取应用文件目录（API 12+ 兼容）
        const abilityContext = this.ctx.uiAbilityContext;
        const filesDir: string = abilityContext.filesDir;
        dataDir = `${filesDir}/${dataDir}`;
        Logger.info(TAG, `initSDK filesDir: ${filesDir}, dataDir: ${dataDir}`);
      }

      Logger.info(TAG, `initSDK dataDir: ${dataDir}`);

      // 确保目录存在
      try {
        const dirExists: boolean = fileIo.accessSync(dataDir);
        if (!dirExists) {
          fileIo.mkdirSync(dataDir, true);
          Logger.info(TAG, `Created dataDir: ${dataDir}`);
        }
      } catch (err) {
        const bErr = err as BusinessError;
        Logger.warn(TAG, `dataDir check failed: ${bErr.code}, ${bErr.message}`);
      }

      const initResult = getSDK().initSDK({
        platformID: cfg.platformID ?? 1,
        apiAddr: cfg.apiAddr ?? '',
        wsAddr: cfg.wsAddr ?? '',
        dataDir: dataDir,
        logLevel: 4,
        isLogStandardOutput: false,
        logFilePath: '',
        isExternalExtensions: false,
      });
      Logger.info(TAG, `initSDK result: ${initResult}`);
      Logger.info(TAG, 'initSDK successful');
      return true;
    } catch (e) {
      const bErr = e as BusinessError;
      Logger.error(TAG, `initSDK failed: ${bErr.code}, ${bErr.message}`);
      return false;
    }
  }

  async unInitSDK(_operationID: string): Promise<boolean> {
    try {
      getSDK().unInitSDK();
      this.isInitialized = false;
      return true;
    } catch (e) {
      Logger.error(TAG, `unInitSDK failed: ${e}`);
      return false;
    }
  }

  // ============ 登录相关 ============

  async login(options: string, _operationID: string): Promise<boolean> {
    Logger.info(TAG, '📞 login() called');
    Logger.info(TAG, `📞 login options: ${options}`);
    try {
      const opts = this.safeParse<LoginParams>(options);
      if (opts == undefined) {
        return false;
      }
      Logger.info(TAG, `📞 Parsed userID: ${opts.userID}`);

      const sdk = getSDK();
      Logger.info(TAG, `📞 getSDK() in login, type: ${typeof sdk}`);
      Logger.info(TAG, `📞 getSDK().login exists: ${typeof sdk.login === 'function'}`);

      Logger.info(TAG, '📞 Calling sdk.login...');
      const result = await sdk.login({
        userID: opts.userID ?? '',
        token: opts.token ?? '',
        platformID: opts.platformID ?? 1,
        apiAddr: opts.apiAddr,
        wsAddr: opts.wsAddr,
      });
      Logger.info(TAG, `📞 sdk.login returned: "${result}"`);
      if (result && result.length > 0) {
        throw new Error(`SDK login failed with result: ${result}`);
      }
      Logger.info(TAG, `✅ login() completed successfully for: ${opts.userID}`);
      return true;
    } catch (e) {
      const errorMsg = e instanceof Error ? `${e.message}, stack: ${e.stack}` : JSON.stringify(e);
      Logger.error(TAG, `❌ login() failed: ${errorMsg}`);
      return false;
    }
  }

  async logout(_operationID: string): Promise<boolean> {
    try {
      await getSDK().logout(_operationID);
      Logger.info(TAG, 'logout successful');
      return true;
    } catch (e) {
      Logger.error(TAG, `logout failed: ${e}`);
      return false;
    }
  }

  async getLoginStatus(_operationID: string): Promise<number> {
    try {
      const status = await getSDK().getLoginStatus(_operationID);
      return status;
    } catch {
      return 0;
    }
  }

  async getLoginUserID(_operationID: string): Promise<string> {
    try {
      const userInfo = await getSDK().getSelfUserInfo(_operationID);
      return userInfo.userID;
    } catch {
      return '';
    }
  }

  // ============ 用户相关 ============

  async getUsersInfo(userIDList: string, _operationID: string): Promise<string> {
    try {
      const userIDs = this.safeParse<string[]>(userIDList);
      if(userIDs == undefined){
        return '[]';
      }
      const users = await getSDK().getUsersInfo(userIDs, _operationID);
      return JSON.stringify(users);
    } catch (e) {
      Logger.error(TAG, `getUsersInfo failed: ${e}`);
      return '[]';
    }
  }

  async getSelfUserInfo(_operationID: string): Promise<string> {
    try {
      const userInfo = await getSDK().getSelfUserInfo(_operationID);
      return JSON.stringify(userInfo);
    } catch (e) {
      Logger.error(TAG, `getSelfUserInfo failed: ${e}`);
      return '{}';
    }
  }

  async setSelfInfo(userInfo: string, _operationID: string): Promise<boolean> {
    try {
      const info = this.safeParse<SetSelfInfoParams>(userInfo);
      if (info == undefined) {
        return false;
      }
      await getSDK().setSelfInfo({
        createTime: info.createTime ?? 0,
        ex: info.ex ?? '',
        faceURL: info.faceURL ?? '',
        nickname: info.nickname ?? '',
        userID: info.userID ?? '',
        globalRecvMsgOpt: info.globalRecvMsgOpt ?? 0,
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `setSelfInfo failed: ${e}`);
      return false;
    }
  }

  // ============ 会话相关 ============

  async getAllConversationList(_operationID: string): Promise<string> {
    try {
      const list = await getSDK().getAllConversationList(_operationID);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getAllConversationList failed: ${e}`);
      return '[]';
    }
  }

  async getConversationListSplit(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<SplitConversationParams>(params);
      if (p == undefined) {
        return '[]';
      }
      const list = await getSDK().getConversationListSplit({
        offset: p.offset ?? 0,
        count: p.count ?? 20,
      }, _operationID);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getConversationListSplit failed: ${e}`);
      return '[]';
    }
  }

  async getOneConversation(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetOneConversationParams>(params);
      if (p == undefined) {
        return '{}';
      }
      const conv = await getSDK().getOneConversation({
        sourceID: p.sourceID ?? '',
        sessionType: p.sessionType ?? 1,
      }, _operationID);
      return JSON.stringify(conv);
    } catch (e) {
      Logger.error(TAG, `getOneConversation failed: ${e}`);
      return '{}';
    }
  }

  async getMultipleConversation(conversationIDList: string, _operationID: string): Promise<string> {
    try {
      const ids = this.safeParse<string[]>(conversationIDList);
      if (ids == undefined) {
        return '[]';
      }
      const convs = await getSDK().getMultipleConversation(ids, _operationID);
      return JSON.stringify(convs);
    } catch (e) {
      Logger.error(TAG, `getMultipleConversation failed: ${e}`);
      return '[]';
    }
  }

  async getTotalUnreadMsgCount(_operationID: string): Promise<number> {
    try {
      const count = await getSDK().getTotalUnreadMsgCount(_operationID);
      return count;
    } catch {
      return 0;
    }
  }

  async markConversationMessageAsRead(conversationID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().markConversationMessageAsRead(conversationID, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `markConversationMessageAsRead failed: ${e}`);
      return false;
    }
  }

  async setConversationDraft(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<SetConversationDraftParams>(params);
      if (p == undefined) {
        return false;
      }
      await getSDK().setConversationDraft({
        conversationID: p.conversationID ?? '',
        draftText: p.draftText ?? '',
      },_operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `setConversationDraft failed: ${e}`);
      return false;
    }
  }

  async pinConversation(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<PinConversationParams>(params);
      if (p == undefined) {
        return false;
      }
      await getSDK().pinConversation({
        conversationID: p.conversationID ?? '',
        isPinned: p.isPinned ?? false,
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `pinConversation failed: ${e}`);
      return false;
    }
  }

  async deleteConversationAndDeleteAllMsg(conversationID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().deleteConversationAndDeleteAllMsg(conversationID, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `deleteConversationAndDeleteAllMsg failed: ${e}`);
      return false;
    }
  }

  async hideConversation(conversationID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().hideConversation(conversationID, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `hideConversation failed: ${e}`);
      return false;
    }
  }

  // ============ 消息相关 ============

  async createTextMessage(text: string, _operationID: string): Promise<string> {
    try {
      const msg = await getSDK().createTextMessage(text,
        _operationID);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createTextMessage failed: ${e}`);
      return '{}';
    }
  }

  async createImageMessageFromFullPath(imagePath: string, _operationID: string): Promise<string> {
    try {
      // ImageMsgParamsByURL需要完整的PicBaseInfo结构
      const msg = await getSDK().createImageMessageFromFullPath(
        imagePath,
        _operationID
      );
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createImageMessageFromFullPath failed: ${e}`);
      return '{}';
    }
  }

  async createVideoMessageFromFullPath(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<VideoMsgByPathParams>(params);
      if (p == undefined) { return "{}"; }
      const msg = await getSDK().createVideoMessageFromFullPath({
        duration: p.duration,
        videoFullPath: p.videoPath,
        videoType: p.videoPath,
        snapshotFullPath: p.snapshotFullPath ?? ''
      },_operationID);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createVideoMessageFromFullPath failed: ${e}`);
      return '{}';
    }
  }

  async createSoundMessageFromFullPath(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<SoundMsgByPathParams>(params);
      if (p == undefined) { return "{}"; }
      const msg = await getSDK().createSoundMessageFromFullPath({
        soundPath: p.soundPath ?? '',
        duration: p.duration ?? 0,
      },_operationID);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createSoundMessageFromFullPath failed: ${e}`);
      return '{}';
    }
  }

  async createFileMessageFromFullPath(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<FileMsgByPathParams>(params);
      if (p == undefined) { return "{}"; }
      const msg = await getSDK().createFileMessageByFile({
        filePath: p.filePath ?? '',
        fileName: p.fileName ?? 'file',
        uuid: '',
        sourceUrl: '',
        fileSize: 0,
      }, _operationID);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createFileMessageFromFullPath failed: ${e}`);
      return '{}';
    }
  }

  async createQuoteMessage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<QuoteMsgParams>(params);
      if (p == undefined) { return "{}"; }
      const msg = await getSDK().createQuoteMessage({
        text: p.text ?? '',
        message: buildSDKMessageItem(p.message),
      });
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createQuoteMessage failed: ${e}`);
      return '{}';
    }
  }

  async createAtTextMessage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<AtMsgParams>(params);
      if (p == undefined) { return "{}"; }
      const msg = await getSDK().createTextAtMessage({
        text: p.text ?? '',
        atUserIDList: p.atUserIDList ?? [],
      }, _operationID);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createAtTextMessage failed: ${e}`);
      return '{}';
    }
  }

  async sendMessage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<SendMsgParams>(params);
      if (p == undefined) { return "{}"; }
      const message = buildSDKMessageItem(p.message);
      const sendParams: SDKSendMsgParams = {
        message: message,
        recvID: p.recvID ?? '',
        groupID: p.groupID ?? '',
        isOnlineOnly: p.isOnlineOnly ?? false,
      };
      if (p.offlinePushInfo !== undefined) {
        sendParams.offlinePushInfo = buildSDKOfflinePush(p.offlinePushInfo);
      }
      const msg = await getSDK().sendMessage(sendParams, _operationID);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `sendMessage failed: ${e}`);
      return '{}';
    }
  }

  async revokeMessage(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<MessageOperateParams>(params);
      if (p == undefined) { return false; }
      await getSDK().revokeMessage({
        conversationID: p.conversationID ?? '',
        clientMsgID: p.clientMsgID ?? '',
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `revokeMessage failed: ${e}`);
      return false;
    }
  }

  async deleteMessage(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<MessageOperateParams>(params);
      if (p == undefined) { return false; }
      await getSDK().deleteMessage({
        conversationID: p.conversationID ?? '',
        clientMsgID: p.clientMsgID ?? '',
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `deleteMessage failed: ${e}`);
      return false;
    }
  }

  async deleteAllMsgFromLocal(_operationID: string): Promise<boolean> {
    try {
      await getSDK().deleteAllMsgFromLocal(_operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `deleteAllMsgFromLocal failed: ${e}`);
      return false;
    }
  }

  async getAdvancedHistoryMessageList(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetAdvancedHistoryMsgParams>(params);
      if (p == undefined) { return "{}"; }
      const result = await getSDK().getAdvancedHistoryMessageList({
        conversationID: p.conversationID ?? '',
        startClientMsgID: p.startClientMsgID ?? '',
        count: p.count ?? 20,
        lastMinSeq: p.lastMinSeq,
        userID: p.userID,
        groupID: p.groupID,
      }, _operationID);
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `getAdvancedHistoryMessageList failed: ${e}`);
      return '{}';
    }
  }

  async getAdvancedHistoryMessageListReverse(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetAdvancedHistoryMsgParams>(params);
      if(p == undefined){
        return '{}';
      }
      const result = await getSDK().getAdvancedHistoryMessageListReverse({
        conversationID: p.conversationID ?? '',
        startClientMsgID: p.startClientMsgID ?? '',
        count: p.count ?? 20,
        lastMinSeq: p.lastMinSeq,
        userID: p.userID,
        groupID: p.groupID,
      }, _operationID);
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `getAdvancedHistoryMessageListReverse failed: ${e}`);
      return '{}';
    }
  }

  async searchLocalMessages(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<SearchLocalParams>(params);
      if (p == undefined) { return "[]"; }
      const result = await getSDK().searchLocalMessages({
        conversationID: p.conversationID,
        keywordList: p.keywordList,
        messageTypeList: p.messageTypeList,
        searchTimePosition: p.searchTimePosition,
        searchTimePeriod: p.searchTimePeriod,
        pageIndex: p.pageIndex,
        count: p.count,
      }, _operationID);
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `searchLocalMessages failed: ${e}`);
      return '[]';
    }
  }

  // ============ 好友相关 ============

  async getFriendList(filterBlack: boolean, _operationID: string): Promise<string> {
    try {
      const list = await getSDK().getFriendList(filterBlack, _operationID);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getFriendList failed: ${e}`);
      return '[]';
    }
  }

  async getBlackList(_operationID: string): Promise<string> {
    try {
      const list = await getSDK().getBlackList(_operationID);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getBlackList failed: ${e}`);
      return '[]';
    }
  }

  async addBlack(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<AddBlackParams>(params);
      if (p == undefined) { return false; }
      await getSDK().addBlack({
        toUserID: p.toUserID ?? '',
        ex: p.ex ,
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `addBlack failed: ${e}`);
      return false;
    }
  }

  async removeBlack(userID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().removeBlack(userID, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `removeBlack failed: ${e}`);
      return false;
    }
  }

  async addFriend(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<AddFriendParams>(params);
      if (p == undefined) { return false; }
      await getSDK().addFriend({
        toUserID: p.toUserID ?? '',
        reqMsg: p.reqMsg ?? '',
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `addFriend failed: ${e}`);
      return false;
    }
  }

  async deleteFriend(userID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().deleteFriend(userID, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `deleteFriend failed: ${e}`);
      return false;
    }
  }

  async checkFriend(userIDList: string, _operationID: string): Promise<string> {
    try {
      const ids = this.safeParse<string[]>(userIDList);
      if(ids == undefined){
        return '[]'
      }
      const result = await getSDK().checkFriend(ids, _operationID);
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `checkFriend failed: ${e}`);
      return '[]';
    }
  }

  async setFriendRemark(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<SetFriendRemarkParams>(params);
      if (p == undefined) { return false; }
      await getSDK().setFriendRemark({
        toUserID: p.friendUserID ?? '',
        remark: p.remark ?? '',
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `setFriendRemark failed: ${e}`);
      return false;
    }
  }

  async getFriendApplicationListAsApplicant(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetFriendApplicationListAsApplicantParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().getFriendApplicationListAsApplicant({
        offset: p.offset ?? 0,
        count: p.count ?? 20,
      }, _operationID);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getFriendApplicationListAsApplicant failed: ${e}`);
      return '[]';
    }
  }

  async getFriendApplicationListAsRecipient(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetFriendApplicationListAsRecipientParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().getFriendApplicationListAsRecipient({
        offset: p.offset ?? 0,
        count: p.count ?? 20,
        handleResults: p.handleResults,
      }, _operationID);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getFriendApplicationListAsRecipient failed: ${e}`);
      return '[]';
    }
  }

  async acceptFriendApplication(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<AccessFriendParams>(params);
      if (p == undefined) { return false; }
      await getSDK().acceptFriendApplication({
        toUserID: p.toUserID ?? '',
        handleMsg: p.handleMsg ?? '',
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `acceptFriendApplication failed: ${e}`);
      return false;
    }
  }

  async refuseFriendApplication(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<AccessFriendParams>(params);
      if (p == undefined) { return false; }
      await getSDK().refuseFriendApplication({
        toUserID: p.toUserID ?? '',
        handleMsg: p.handleMsg ?? '',
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `refuseFriendApplication failed: ${e}`);
      return false;
    }
  }

  // ============ 群组相关 ============

  async createGroup(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<CreateGroupParams>(params);
      if (p == undefined) { return '{}'; }
      const group = await getSDK().createGroup({
        memberUserIDs: p.memberUserIDs ?? [],
        groupInfo: {
          groupType: p.groupInfo?.groupType ?? 2,
          groupName: p.groupInfo?.groupName ?? '',
          introduction: p.groupInfo?.introduction ?? '',
          notification: p.groupInfo?.notification ?? '',
          faceURL: p.groupInfo?.faceURL ?? '',
        },
        adminUserIDs: p.adminUserIDs,
        ownerUserID: p.ownerUserID,
      });
      return JSON.stringify(group);
    } catch (e) {
      Logger.error(TAG, `createGroup failed: ${e}`);
      return '{}';
    }
  }

  async joinGroup(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<JoinGroupParams>(params);
      if (p == undefined) { return false; }
      await getSDK().joinGroup({
        groupID: p.groupID ?? '',
        reqMsg: p.reqMsg ?? '',
        joinSource: p.joinSource ?? 0,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `joinGroup failed: ${e}`);
      return false;
    }
  }

  async quitGroup(groupID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().quitGroup(groupID, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `quitGroup failed: ${e}`);
      return false;
    }
  }

  async dismissGroup(groupID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().dismissGroup(groupID, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `dismissGroup failed: ${e}`);
      return false;
    }
  }

  async getJoinedGroupList(_operationID: string): Promise<string> {
    try {
      const list = await getSDK().getJoinedGroupList(_operationID);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getJoinedGroupList failed: ${e}`);
      return '[]';
    }
  }

  async getGroupMemberList(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetGroupMemberListParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().getGroupMemberList({
        groupID: p.groupID ?? '',
        filter: p.filter ?? 0,
        offset: p.offset ?? 0,
        count: p.count ?? 20,
      }, _operationID);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getGroupMemberList failed: ${e}`);
      return '[]';
    }
  }

  async inviteUserToGroup(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<OperateGroupMemberParams>(params);
      if (p == undefined) { return false; }
      await getSDK().inviteUserToGroup({
        groupID: p.groupID ?? '',
        userIDList: p.userIDList ?? [],
        reason: p.reason ?? '',
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `inviteUserToGroup failed: ${e}`);
      return false;
    }
  }

  async kickGroupMember(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<OperateGroupMemberParams>(params);
      if (p == undefined) { return false; }
      await getSDK().kickGroupMember({
        groupID: p.groupID ?? '',
        userIDList: p.userIDList ?? [],
        reason: p.reason ?? '',
      }, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `kickGroupMember failed: ${e}`);
      return false;
    }
  }

  async getGroupApplicationListAsRecipient(params: string, _operationID: string): Promise<string> {
    try {
      const list = await getSDK().getGroupApplicationListAsRecipient();
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getGroupApplicationListAsRecipient failed: ${e}`);
      return '[]';
    }
  }

  async getGroupApplicationListAsApplicant(params: string, _operationID: string): Promise<string> {
    try {
      const list = await getSDK().getGroupApplicationListAsApplicant();
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getGroupApplicationListAsApplicant failed: ${e}`);
      return '[]';
    }
  }

  async acceptGroupApplication(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<AccessGroupParams>(params);
      if (p == undefined) { return false; }
      await getSDK().acceptGroupApplication({
        groupID: p.groupID ?? '',
        fromUserID: p.fromUserID ?? '',
        handleMsg: p.handleMsg ?? '',
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `acceptGroupApplication failed: ${e}`);
      return false;
    }
  }

  async refuseGroupApplication(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<AccessGroupParams>(params);
      if (p == undefined) { return false; }
      await getSDK().refuseGroupApplication({
        groupID: p.groupID ?? '',
        fromUserID: p.fromUserID ?? '',
        handleMsg: p.handleMsg ?? '',
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `refuseGroupApplication failed: ${e}`);
      return false;
    }
  }

  async changeGroupMute(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<ChangeGroupMuteParams>(params);
      if (p == undefined) { return false; }
      await getSDK().changeGroupMute({
        groupID: p.groupID ?? '',
        isMute: p.isMute ?? false,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `changeGroupMute failed: ${e}`);
      return false;
    }
  }

  async changeGroupMemberMute(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<ChangeGroupMemberMuteParams>(params);
      if (p == undefined) { return false; }
      await getSDK().changeGroupMemberMute({
        groupID: p.groupID ?? '',
        userID: p.userID,
        mutedSeconds: p.mutedSeconds
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `changeGroupMemberMute failed: ${e}`);
      return false;
    }
  }

  async setGroupInfo(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<SetGroupInfoParams>(params);
      if (p == undefined) { return false; }
      await getSDK().setGroupInfo({
        groupID: p.groupID ?? '',
        groupName: p.groupName ?? '',
        faceURL: p.faceURL ?? '',
        notification: p.notification ?? '',
        introduction: p.introduction ?? '',
        notificationUserID: '',
        notificationUpdateTime: 0,
        ownerUserID: '',
        createTime: 0,
        memberCount: 0,
        creatorUserID: '',
        groupType: GroupType.Group,
        needVerification: GroupVerificationType.ApplyNeedInviteNot,
        ex: '',
        applyMemberFriend: AllowType.Allowed,
        lookMemberInfo: AllowType.Allowed,
        displayIsRead: false,
        status: GroupStatus.Normal
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `setGroupInfo failed: ${e}`);
      return false;
    }
  }

  async setGroupMemberInfo(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<UpdateGroupMemberInfoParams>(params);
      if (p == undefined) { return false; }
      await getSDK().setGroupMemberInfo({
        groupID: p.groupID ?? '',
        userID: p.userID ?? '',
        nickname: p.nickname ?? '',
        faceURL: p.faceURL ?? '',
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `setGroupMemberInfo failed: ${e}`);
      return false;
    }
  }

  async searchGroups(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<SearchGroupParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().searchGroups({
        keywordList: p.keywordList ?? [],
        isSearchGroupID: p.isSearchGroupID ?? false,
        isSearchGroupName: p.isSearchGroupName ?? true,
      });
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `searchGroups failed: ${e}`);
      return '[]';
    }
  }

  async transferGroupOwner(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<TransferGroupOwnerParams>(params);
      if (p == undefined) { return false; }
      await getSDK().transferGroupOwner({
        groupID: p.groupID ?? '',
        newOwnerUserID: p.newOwnerUserID ?? '',
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `transferGroupOwner failed: ${e}`);
      return false;
    }
  }

  // ============ 工具方法 ============

  async uploadFile(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<UploadFileParams>(params);
      if (p == undefined) { return '{}'; }

      return await getSDK().uploadFile({
        filepath: p.filePath,
        name: p.name,
        contentType: p.contentType,
        uuid: p.uuid,
        cause: p.cause,
        token: p.token
      },_operationID)
    } catch (e) {
      Logger.error(TAG, `uploadFile failed: ${e}`);
      return '{}';
    }
  }

  async uploadLogs(params: string, _operationID: string): Promise<boolean> {
    try {
      Logger.info(TAG, `uploadLogs called with: ${params}`);
      const p = this.safeParse<UploadLogsParams>(params);
      if (p == undefined) { return false; }
      await getSDK().uploadLogs({
        line: p.line,
        ex: p.ex
      },_operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `uploadLogs failed: ${e}`);
      return false;
    }
  }

  async setAppBackgroundStatus(isBackground: boolean, _operationID: string): Promise<boolean> {
    try {
      await getSDK().setAppBackgroundStatus(isBackground.toString(), isBackground);
      return true;
    } catch (e) {
      Logger.error(TAG, `setAppBackgroundStatus failed: ${e}`);
      return false;
    }
  }

  async networkStatusChanged(_operationID: string): Promise<boolean> {
    try {
      await getSDK().networkStatusChanged();
      return true;
    } catch (e) {
      Logger.error(TAG, `networkStatusChanged failed: ${e}`);
      return false;
    }
  }

  async getSubscribeUsersStatus(_operationID: string): Promise<string> {
    try {
      const result = await getSDK().getSubscribeUsersStatus();
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `getSubscribeUsersStatus failed: ${e}`);
      return '[]';
    }
  }

  async subscribeUsersStatus(userIDList: string, _operationID: string): Promise<boolean> {
    try {
      const ids = this.safeParse<string[]>(userIDList);
      if(ids == undefined){ return false;}
      await getSDK().subscribeUsersStatus(ids);
      return true;
    } catch (e) {
      Logger.error(TAG, `subscribeUsersStatus failed: ${e}`);
      return false;
    }
  }

  async unsubscribeUsersStatus(userIDList: string, _operationID: string): Promise<boolean> {
    try {
      const ids = this.safeParse<string[]>(userIDList);
      if(ids == undefined){ return false;}
      await getSDK().unsubscribeUsersStatus(ids);
      return true;
    } catch (e) {
      Logger.error(TAG, `unsubscribeUsersStatus failed: ${e}`);
      return false;
    }
  }

  async setGlobalRecvMessageOpt(opt: number, _operationID: string): Promise<boolean> {
    try {
      await getSDK().setGlobalRecvMessageOpt(opt);
      return true;
    } catch (e) {
      Logger.error(TAG, `setGlobalRecvMessageOpt failed: ${e}`);
      return false;
    }
  }

  // ============ 占位方法（未在 imsdk.har 中直接对应）============

  async typingStatusUpdate(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<TypingUpdateParams>(params);
      if (p == undefined) { return false; }
      await getSDK().typingStatusUpdate({
        recvID: p.recvID ?? '',
        msgTip: p.msgTip ?? '',
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `typingStatusUpdate failed: ${e}`);
      return false;
    }
  }

  async getInputStates(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetInputStatesParams>(params);
      if (p == undefined) { return '[]'; }
      const result = await getSDK().getInputStates({
        conversationID: p.conversationID ?? '',
        userID: p.userID ?? '',
      });
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `getInputStates failed: ${e}`);
      return '[]';
    }
  }

  async changeInputStates(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<ChangeInputStatesParams>(params);
      if (p == undefined) { return false; }
      await getSDK().changeInputStates({
        conversationID: p.conversationID ?? '',
        focus: p.focus ?? false,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `changeInputStates failed: ${e}`);
      return false;
    }
  }

  async setConversation(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<SetConversationParams>(params);
      if (p == undefined) { return false; }
      await getSDK().setConversation({
        conversationID: p.conversationID ?? '',
        isPinned: p.isPinned,
        isPrivateChat: p.isPrivateChat,
        isMsgDestruct: p.isMsgDestruct,
        burnDuration: p.burnDuration,
        ex: p.ex,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `setConversation failed: ${e}`);
      return false;
    }
  }

  async setConversationRecvMessageOpt(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<SetConversationRecvOptParams>(params);
      if (p == undefined) { return false; }
      await getSDK().setConversationRecvMessageOpt({
        conversationID: p.conversationID ?? '',
        opt: p.opt ?? 0,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `setConversationRecvMessageOpt failed: ${e}`);
      return false;
    }
  }

  async setConversationPrivateChat(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<SetConversationPrivateParams>(params);
      if (p == undefined) { return false; }
      await getSDK().setConversationPrivateChat({
        conversationID: p.conversationID ?? '',
        isPrivate: p.isPrivate ?? false,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `setConversationPrivateChat failed: ${e}`);
      return false;
    }
  }

  async setConversationBurnDuration(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<SetBurnDurationParams>(params);
      if (p == undefined) { return false; }
      await getSDK().setConversationBurnDuration({
        conversationID: p.conversationID ?? '',
        burnDuration: p.burnDuration ?? 0,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `setConversationBurnDuration failed: ${e}`);
      return false;
    }
  }

  async resetConversationGroupAtType(conversationID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().resetConversationGroupAtType(conversationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `resetConversationGroupAtType failed: ${e}`);
      return false;
    }
  }

  async hideAllConversations(_operationID: string): Promise<boolean> {
    try {
      const list = await getSDK().getAllConversationList();
      for (const conv of list) {
        await getSDK().hideConversation(conv.conversationID);
      }
      return true;
    } catch (e) {
      Logger.error(TAG, `hideAllConversations failed: ${e}`);
      return false;
    }
  }

  async clearConversationAndDeleteAllMsg(conversationID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().deleteConversationAndDeleteAllMsg(conversationID, _operationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `clearConversationAndDeleteAllMsg failed: ${e}`);
      return false;
    }
  }

  async deleteAllMsgFromLocalAndSvr(_operationID: string): Promise<boolean> {
    try {
      await getSDK().deleteAllMsgFromLocalAndSvr();
      return true;
    } catch (e) {
      Logger.error(TAG, `deleteAllMsgFromLocalAndSvr failed: ${e}`);
      return false;
    }
  }

  async insertGroupMessageToLocalStorage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<InsertGroupMsgParams>(params);
      if (p == undefined) { return '{}'; }
      const message = buildSDKMessageItem(p.message);
      const result = await getSDK().insertGroupMessageToLocalStorage({
        groupID: p.groupID ?? '',
        sendID: p.sendID ?? '',
        message: message,
      });
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `insertGroupMessageToLocalStorage failed: ${e}`);
      return '{}';
    }
  }

  async insertSingleMessageToLocalStorage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<InsertSingleMsgParams>(params);
      if (p == undefined) { return '{}'; }
      const message = buildSDKMessageItem(p.message);
      const result = await getSDK().insertSingleMessageToLocalStorage({
        recvID: p.recvID ?? '',
        sendID: p.sendID ?? '',
        message: message,
      });
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `insertSingleMessageToLocalStorage failed: ${e}`);
      return '{}';
    }
  }

  async setMessageLocalEx(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<SetMessageLocalExParams>(params);
      if (p == undefined) { return false; }
      await getSDK().setMessageLocalEx({
        conversationID: p.conversationID ?? '',
        clientMsgID: p.clientMsgID ?? '',
        localEx: p.localEx ?? '',
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `setMessageLocalEx failed: ${e}`);
      return false;
    }
  }

  async findMessageList(params: string, _operationID: string): Promise<string> {
    try {
      const p= this.safeParse<FindMessageListParams[]>(params);
      if (p == undefined) { return '{}'; }
      const findMsgParams: FindMessageParams[] = p.map((item: FindMessageListParams) => {
        const findMsg: FindMessageParams = {
          conversationID: item.conversationID ?? '',
          clientMsgIDList: item.clientMsgIDList ?? [],
        };
        return findMsg;
      });
      const result = await getSDK().findMessageList(findMsgParams);
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `findMessageList failed: ${e}`);
      return '{}';
    }
  }

  async getFriendListPage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetFriendListPageParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().getFriendListPage(
        p.offset ?? 0,
        p.count ?? 20,
        p.filterBlack ?? false
      );
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getFriendListPage failed: ${e}`);
      return '[]';
    }
  }

  async getSpecifiedFriendsInfo(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetSpecifiedFriendsParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().getSpecifiedFriendsInfo({
        friendUserIDList: p.userIDList ?? [],
        filterBlack: p.filterBlack ?? false,
      });
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getSpecifiedFriendsInfo failed: ${e}`);
      return '[]';
    }
  }

  async updateFriends(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<UpdateFriendsParams>(params);
      if (p == undefined) { return false; }
      await getSDK().updateFriends({
        friendUserIDs: p.friendUserIDs ?? [],
        isPinned: p.isPinned,
        remark: p.remark,
        ex: p.ex,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `updateFriends failed: ${e}`);
      return false;
    }
  }

  async searchFriends(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<SearchFriendParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().searchFriends({
        keywordList: p.keywordList ?? [],
        isSearchUserID: p.isSearchUserID ?? true,
        isSearchNickname: p.isSearchNickname ?? true,
        isSearchRemark: p.isSearchRemark ?? false,
      });
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `searchFriends failed: ${e}`);
      return '[]';
    }
  }

  async getFriendApplicationUnhandledCount(params: string, _operationID: string): Promise<number> {
    try {
      const p = this.safeParse<GetSelfApplicationUnhandledCountParams>(params);
      if (p == undefined) { return 0; }
      const list = await getSDK().getFriendApplicationUnhandledCount(p.time.toString(),_operationID);
      return list.length;
    } catch (e) {
      Logger.error(TAG, `getFriendApplicationUnhandledCount failed: ${e}`);
      return 0;
    }
  }

  async getJoinedGroupListPage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetJoinedGroupListParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().getJoinedGroupListPage({
        offset: p.offset ?? 0,
        count: p.count ?? 20,
      });
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getJoinedGroupListPage failed: ${e}`);
      return '[]';
    }
  }

  async getGroupApplicationUnhandledCount(params: string, _operationID: string): Promise<number> {
    try {
      const list = await getSDK().getGroupApplicationListAsRecipient();
      return list.length;
    } catch (e) {
      Logger.error(TAG, `getGroupApplicationUnhandledCount failed: ${e}`);
      return 0;
    }
  }

  async getSpecifiedGroupMembersInfo(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetGroupMembersInfoParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().getSpecifiedGroupMembersInfo({
        reason: p.reason ?? '',
        groupID: p.groupID ?? '',
        userIDList: p.userIDList ?? [],
      });
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getSpecifiedGroupMembersInfo failed: ${e}`);
      return '[]';
    }
  }

  async getUsersInGroup(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetGroupMembersInfoParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().getUsersInGroup({
        reason: p.reason ?? '',
        groupID: p.groupID ?? '',
        userIDList: p.userIDList ?? [],
      });
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getUsersInGroup failed: ${e}`);
      return '[]';
    }
  }

  async searchGroupMembers(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<SearchGroupMembersParams>(params);
      if (p == undefined) { return '{}'; }
      const searchParams: SDKSearchGroupMemberParams = {
        groupID: p.groupID ?? '',
        keywordList: p.searchParam?.keywordList ?? [],
        isSearchMemberNickname: p.searchParam?.isSearchMemberNickName ?? false,
        isSearchUserID: p.searchParam?.isSearchUserID ?? false,
        offset: p.offset ?? 0,
        count: p.count ?? 20,
      };
      const result = await getSDK().searchGroupMembers(searchParams);
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `searchGroupMembers failed: ${e}`);
      return '{}';
    }
  }

  async getGroupMemberOwnerAndAdmin(groupID: string, _operationID: string): Promise<string> {
    try {
      const list = await getSDK().getGroupMemberOwnerAndAdmin(groupID);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getGroupMemberOwnerAndAdmin failed: ${e}`);
      return '[]';
    }
  }

  async getGroupMemberListByJoinTimeFilter(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetGroupMemberByTimeParams>(params);
      if (p == undefined) { return '[]'; }
      const list = await getSDK().getGroupMemberListByJoinTimeFilter({
        groupID: p.groupID ?? '',
        joinTimeBegin: p.joinTimeBegin ?? 0,
        joinTimeEnd: p.joinTimeEnd ?? 0,
        offset: p.offset ?? 0,
        count: p.count ?? 20,
        filterUserIDList: p.filterUserIDList
      });
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getGroupMemberListByJoinTimeFilter failed: ${e}`);
      return '[]';
    }
  }

  async isJoinGroup(groupID: string, _operationID: string): Promise<boolean> {
    try {
      const joinedGroups = await getSDK().getJoinedGroupList();
      return joinedGroups.some(g => g.groupID === groupID);
    } catch (e) {
      Logger.error(TAG, `isJoinGroup failed: ${e}`);
      return false;
    }
  }

  async getConversationIDBySessionType(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<GetConversationIDBySessionTypeParams>(params);
      if (p == undefined) { return '""'; }
      const conv = await getSDK().getConversationIDBySessionType({
        sourceID: p.sourceID ?? '',
        sessionType: p.sessionType ?? 1,
      });
      return `"${conv}"`;
    } catch (e) {
      Logger.error(TAG, `getConversationIDBySessionType failed: ${e}`);
      return '""';
    }
  }

  async createImageMessageByURL(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<ImageMsgParamsByURL>(params);
      if (p == undefined) { return '{}'; }
      const imageParams: SDKImageMsgParamsByURL = {
        sourcePicture: buildSDKPicture(p.sourcePicture),
        bigPicture: buildSDKPicture(p.bigPicture),
        snapshotPicture: buildSDKPicture(p.snapshotPicture),
        sourcePath: p.sourcePath ?? '',
      };
      const msg = await getSDK().createImageMessageByURL(imageParams);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createImageMessageByURL failed: ${e}`);
      return '{}';
    }
  }

  async createSoundMessageByURL(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<SoundMsgParams>(params);
      if (p == undefined) { return '{}'; }
      const msg = await getSDK().createSoundMessageByURL({
        uuid: p.uuid ?? '',
        soundPath: p.soundPath ?? '',
        sourceUrl: p.sourceUrl ?? '',
        dataSize: p.dataSize ?? 0,
        duration: p.duration ?? 0,
      });
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createSoundMessageByURL failed: ${e}`);
      return '{}';
    }
  }

  async createVideoMessageByURL(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<VideoMsgParams>(params);
      if (p == undefined) { return '{}'; }
      const msg = await getSDK().createVideoMessageByURL({
        videoPath: p.videoPath ?? '',
        duration: p.duration ?? 0,
        videoType: p.videoType ?? 'mp4',
        snapshotPath: p.snapshotPath ?? '',
        videoUUID: p.videoUUID ?? '',
        videoUrl: p.videoUrl ?? '',
        videoSize: p.videoSize ?? 0,
        snapshotUUID: p.snapshotUUID ?? '',
        snapshotSize: p.snapshotSize ?? 0,
        snapshotUrl: p.snapshotUrl ?? '',
        snapshotWidth: p.snapshotWidth ?? 0,
        snapshotHeight: p.snapshotHeight ?? 0,
      });
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createVideoMessageByURL failed: ${e}`);
      return '{}';
    }
  }

  async createFileMessageByURL(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<FileMsgParams>(params);
      if (p == undefined) { return '{}'; }
      const msg = await getSDK().createFileMessageByURL({
        filePath: p.filePath ?? '',
        fileName: p.fileName ?? '',
        uuid: p.uuid ?? '',
        sourceUrl: p.sourceUrl ?? '',
        fileSize: p.fileSize ?? 0,
      });
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createFileMessageByURL failed: ${e}`);
      return '{}';
    }
  }

  async createMergerMessage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<MergerMsgParams>(params);
      if (p == undefined) { return '{}'; }
      const messageList = p.messageList.map((msgData: MessageItem) => buildSDKMessageItem(msgData));
      const mergerParams: SDKMergerMsgParams = {
        messageList: messageList,
        title: p.title ?? '',
        summaryList: p.summaryList ?? [],
      };
      const msg = await getSDK().createMergerMessage(mergerParams);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createMergerMessage failed: ${e}`);
      return '{}';
    }
  }

  async createForwardMessage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<MessageItem>(params);
      if (p == undefined) { return '{}'; }
      const message = buildSDKMessageItem(p);
      const msg = await getSDK().createForwardMessage(message);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createForwardMessage failed: ${e}`);
      return '{}';
    }
  }

  async createLocationMessage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<LocationMsgParams>(params);
      if (p == undefined) { return '{}'; }
      const msg = await getSDK().createLocationMessage({
        description: p.description ?? '',
        longitude: p.longitude ?? 0,
        latitude: p.latitude ?? 0,
      });
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createLocationMessage failed: ${e}`);
      return '{}';
    }
  }

  async createCardMessage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<CardMsgParams>(params);
      if (p == undefined) { return '{}'; }
      const msg = await getSDK().createCardMessage({
        userID: p.userID ?? '',
        nickname: p.nickname ?? '',
        faceURL: p.faceURL ?? '',
        ex: p.ex ?? '',
      });
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createCardMessage failed: ${e}`);
      return '{}';
    }
  }

  async createCustomMessage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<CustomMsgParams>(params);
      if (p == undefined) { return '{}'; }
      const msg = await getSDK().createCustomMessage({
        data: p.data ?? '',
        extension: p.extension ?? '',
        description: p.description ?? '',
      });
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createCustomMessage failed: ${e}`);
      return '{}';
    }
  }

  async createFaceMessage(params: string, _operationID: string): Promise<string> {
    try {
      const p = this.safeParse<FaceMessageParams>(params);
      if (p == undefined) { return '{}'; }
      const msg = await getSDK().createFaceMessage({
        index: p.index ?? 0,
        data: p.data ?? '',
      });
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createFaceMessage failed: ${e}`);
      return '{}';
    }
  }

  async sendMessageNotOss(params: string, _operationID: string): Promise<string> {
    return this.sendMessage(params, _operationID);
  }

  async deleteMessageFromLocalStorage(params: string, _operationID: string): Promise<boolean> {
    try {
      const p = this.safeParse<MessageOperateParams>(params);
      if (p == undefined) { return false; }
      await getSDK().deleteMessageFromLocalStorage({
        conversationID: p.conversationID ?? '',
        clientMsgID: p.clientMsgID ?? '',
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `deleteMessageFromLocalStorage failed: ${e}`);
      return false;
    }
  }

  async logs(params: string, _operationID: string): Promise<void> {
    try {
      const p = this.safeParse<LogsParams>(params);
      if (p == undefined) { return ; }
      await getSDK().logs({
        logLevel:p.logLevel,
        file: p.file,
        line: p.line,
        msgs: p.msgs,
        err: p.err,
        keyAndValue: p.keyAndValue
      },_operationID)
      return;
    } catch {
      Logger.info(TAG, params);
    }
  }

  async updateFcmToken(_fcmToken: string, _expireTime: number, _operationID: string): Promise<boolean> {
    // FCM token update is Android-specific, no-op on HarmonyOS
    return true;
  }

  async setAppBadge(appUnreadCount: number, _operationID: string): Promise<boolean> {
    try {
      return await getSDK().setAppBadge(appUnreadCount,_operationID)
    } catch (e) {
      Logger.error(TAG, `setAppBadge failed: ${e}`);
      return false;
    }
  }
}
