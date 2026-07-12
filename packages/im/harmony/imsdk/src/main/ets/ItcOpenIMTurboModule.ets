/**
 * OpenIM SDK TurboModule（鸿蒙 NEXT / RNOH）。
 *
 * 包装 imsdk.har NAPI SDK，将其方法暴露为 TurboModule。
 * 使用 UITurboModule 基类和 RNOH 0.82 架构。
 */

import { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { getSDK } from 'imsdk';
import { CbEvents } from 'imsdk/src/main/ets/sdk/enum';
import Logger from './common/utils/Logger';

const TAG = 'ItcOpenIMTurboModule';

export class ItcOpenIMTurboModule extends UITurboModule {
  static readonly NAME: string = 'ItcOpenIM';

  private isInitialized: boolean = false;

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
    this.initEventListener();
  }

  private initEventListener(): void {
    getSDK().startListener();
    this.isInitialized = true;
    Logger.info(TAG, 'Event listener initialized');
  }

  private emitRNEvent(eventName: string, data: string): void {
    try {
      const rnInstance = this.ctx.rnInstance;
      rnInstance.emitDeviceEvent(eventName, data);
    } catch (e) {
      Logger.error(TAG, `emitRNEvent failed: ${e}`);
    }
  }

  private handleSdkEvent(event: number, data: string): void {
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
          const failedData: Record<string, number | string> = JSON.parse(data);
          this.emitRNEvent('im:connectFailed', JSON.stringify({
            errCode: failedData.errCode ?? 0,
            errMsg: failedData.errMsg ?? ''
          }));
        } catch {
          this.emitRNEvent('im:connectFailed', JSON.stringify({ errCode: 0, errMsg: data }));
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
      case CbEvents.OnSyncServerFailed:
        jsEventName = 'im:syncFailed';
        break;
      case CbEvents.OnTotalUnreadMessageCountChanged:
        jsEventName = 'im:unreadCountChanged';
        try {
          const count = parseInt(data) || 0;
          jsData = JSON.stringify({ count: count });
        } catch {
          jsData = JSON.stringify({ count: 0 });
        }
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
      const cfg: Record<string, string | number> = JSON.parse(config);
      getSDK().initSDK({
        platformID: (cfg.platformID as number) ?? 1,
        apiAddr: (cfg.apiAddr as string) ?? '',
        wsAddr: (cfg.wsAddr as string) ?? '',
        dataDir: (cfg.dataDir as string) ?? '',
        logLevel: 4,
        isLogStandardOutput: false,
        logFilePath: '',
        isExternalExtensions: false,
      });
      Logger.info(TAG, 'initSDK successful');
      return true;
    } catch (e) {
      Logger.error(TAG, `initSDK failed: ${e}`);
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
    try {
      const opts: Record<string, string | number> = JSON.parse(options);
      await getSDK().login({
        userID: opts.userID as string,
        token: opts.token as string,
        platformID: (opts.platformID as number) ?? 1,
        apiAddr: opts.apiAddr as string,
        wsAddr: opts.wsAddr as string,
      });
      Logger.info(TAG, `login successful: ${opts.userID}`);
      return true;
    } catch (e) {
      Logger.error(TAG, `login failed: ${e}`);
      return false;
    }
  }

  async logout(_operationID: string): Promise<boolean> {
    try {
      await getSDK().logout();
      Logger.info(TAG, 'logout successful');
      return true;
    } catch (e) {
      Logger.error(TAG, `logout failed: ${e}`);
      return false;
    }
  }

  async getLoginStatus(_operationID: string): Promise<number> {
    try {
      const status = await getSDK().getLoginStatus();
      return status;
    } catch {
      return 0;
    }
  }

  async getLoginUserID(_operationID: string): Promise<string> {
    try {
      const userInfo = await getSDK().getSelfUserInfo();
      return userInfo.userID;
    } catch {
      return '';
    }
  }

  // ============ 用户相关 ============

  async getUsersInfo(userIDList: string, _operationID: string): Promise<string> {
    try {
      const userIDs: string[] = JSON.parse(userIDList);
      const users = await getSDK().getUsersInfo(userIDs);
      return JSON.stringify(users);
    } catch (e) {
      Logger.error(TAG, `getUsersInfo failed: ${e}`);
      return '[]';
    }
  }

  async getSelfUserInfo(_operationID: string): Promise<string> {
    try {
      const userInfo = await getSDK().getSelfUserInfo();
      return JSON.stringify(userInfo);
    } catch (e) {
      Logger.error(TAG, `getSelfUserInfo failed: ${e}`);
      return '{}';
    }
  }

  async setSelfInfo(_userInfo: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setSelfInfo not implemented');
    return false;
  }

  // ============ 会话相关 ============

  async getAllConversationList(_operationID: string): Promise<string> {
    try {
      const list = await getSDK().getAllConversationList();
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getAllConversationList failed: ${e}`);
      return '[]';
    }
  }

  async getConversationListSplit(params: string, _operationID: string): Promise<string> {
    try {
      const p: Record<string, number> = JSON.parse(params);
      const list = await getSDK().getConversationListSplit({
        offset: p.offset ?? 0,
        count: p.count ?? 20,
      });
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getConversationListSplit failed: ${e}`);
      return '[]';
    }
  }

  async getOneConversation(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getOneConversation not implemented');
    return '{}';
  }

  async getMultipleConversation(conversationIDList: string, _operationID: string): Promise<string> {
    try {
      const ids: string[] = JSON.parse(conversationIDList);
      const convs = await getSDK().getMultipleConversation(ids);
      return JSON.stringify(convs);
    } catch (e) {
      Logger.error(TAG, `getMultipleConversation failed: ${e}`);
      return '[]';
    }
  }

  async getTotalUnreadMsgCount(_operationID: string): Promise<number> {
    try {
      const count = await getSDK().getTotalUnreadMsgCount();
      return count;
    } catch {
      return 0;
    }
  }

  async markConversationMessageAsRead(conversationID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().markConversationMessageAsRead(conversationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `markConversationMessageAsRead failed: ${e}`);
      return false;
    }
  }

  async setConversationDraft(params: string, _operationID: string): Promise<boolean> {
    try {
      const p: Record<string, string> = JSON.parse(params);
      await getSDK().setConversationDraft({
        conversationID: p.conversationID,
        draftText: p.draftText,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `setConversationDraft failed: ${e}`);
      return false;
    }
  }

  async pinConversation(params: string, _operationID: string): Promise<boolean> {
    try {
      const p: Record<string, string | boolean> = JSON.parse(params);
      await getSDK().pinConversation({
        conversationID: p.conversationID as string,
        isPinned: p.isPinned as boolean,
      });
      return true;
    } catch (e) {
      Logger.error(TAG, `pinConversation failed: ${e}`);
      return false;
    }
  }

  async deleteConversationAndDeleteAllMsg(conversationID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().deleteConversationAndDeleteAllMsg(conversationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `deleteConversationAndDeleteAllMsg failed: ${e}`);
      return false;
    }
  }

  async hideConversation(conversationID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().hideConversation(conversationID);
      return true;
    } catch (e) {
      Logger.error(TAG, `hideConversation failed: ${e}`);
      return false;
    }
  }

  // ============ 消息相关 ============

  async createTextMessage(text: string, _operationID: string): Promise<string> {
    try {
      const msg = await getSDK().createTextMessage(text);
      return JSON.stringify(msg);
    } catch (e) {
      Logger.error(TAG, `createTextMessage failed: ${e}`);
      return '{}';
    }
  }

  async createImageMessageFromFullPath(_imagePath: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createImageMessageFromFullPath not implemented');
    return '{}';
  }

  async createVideoMessageFromFullPath(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createVideoMessageFromFullPath not implemented');
    return '{}';
  }

  async createSoundMessageFromFullPath(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createSoundMessageFromFullPath not implemented');
    return '{}';
  }

  async createFileMessageFromFullPath(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createFileMessageFromFullPath not implemented');
    return '{}';
  }

  async createQuoteMessage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createQuoteMessage not implemented');
    return '{}';
  }

  async createAtTextMessage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createAtTextMessage not implemented');
    return '{}';
  }

  async sendMessage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'sendMessage not implemented');
    return '{}';
  }

  async revokeMessage(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'revokeMessage not implemented');
    return false;
  }

  async deleteMessage(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'deleteMessage not implemented');
    return false;
  }

  async deleteAllMsgFromLocal(_operationID: string): Promise<boolean> {
    try {
      await getSDK().deleteAllMsgFromLocal();
      return true;
    } catch (e) {
      Logger.error(TAG, `deleteAllMsgFromLocal failed: ${e}`);
      return false;
    }
  }

  async getAdvancedHistoryMessageList(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getAdvancedHistoryMessageList not implemented');
    return '{}';
  }

  async getAdvancedHistoryMessageListReverse(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getAdvancedHistoryMessageListReverse not implemented');
    return '{}';
  }

  async searchLocalMessages(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'searchLocalMessages not implemented');
    return '[]';
  }

  // ============ 好友相关 ============

  async getFriendList(filterBlack: boolean, _operationID: string): Promise<string> {
    try {
      const list = await getSDK().getFriendList(filterBlack);
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getFriendList failed: ${e}`);
      return '[]';
    }
  }

  async getBlackList(_operationID: string): Promise<string> {
    try {
      const list = await getSDK().getBlackList();
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getBlackList failed: ${e}`);
      return '[]';
    }
  }

  async addBlack(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'addBlack not implemented');
    return false;
  }

  async removeBlack(userID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().removeBlack(userID);
      return true;
    } catch (e) {
      Logger.error(TAG, `removeBlack failed: ${e}`);
      return false;
    }
  }

  async addFriend(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'addFriend not implemented');
    return false;
  }

  async deleteFriend(userID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().deleteFriend(userID);
      return true;
    } catch (e) {
      Logger.error(TAG, `deleteFriend failed: ${e}`);
      return false;
    }
  }

  async checkFriend(userIDList: string, _operationID: string): Promise<string> {
    try {
      const ids: string[] = JSON.parse(userIDList);
      const result = await getSDK().checkFriend(ids);
      return JSON.stringify(result);
    } catch (e) {
      Logger.error(TAG, `checkFriend failed: ${e}`);
      return '[]';
    }
  }

  async setFriendRemark(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setFriendRemark not implemented');
    return false;
  }

  async getFriendApplicationListAsApplicant(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getFriendApplicationListAsApplicant not implemented');
    return '[]';
  }

  async getFriendApplicationListAsRecipient(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getFriendApplicationListAsRecipient not implemented');
    return '[]';
  }

  async acceptFriendApplication(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'acceptFriendApplication not implemented');
    return false;
  }

  async refuseFriendApplication(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'refuseFriendApplication not implemented');
    return false;
  }

  // ============ 群组相关 ============

  async createGroup(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createGroup not implemented');
    return '{}';
  }

  async joinGroup(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'joinGroup not implemented');
    return false;
  }

  async quitGroup(groupID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().quitGroup(groupID);
      return true;
    } catch (e) {
      Logger.error(TAG, `quitGroup failed: ${e}`);
      return false;
    }
  }

  async dismissGroup(groupID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().dismissGroup(groupID);
      return true;
    } catch (e) {
      Logger.error(TAG, `dismissGroup failed: ${e}`);
      return false;
    }
  }

  async getJoinedGroupList(_operationID: string): Promise<string> {
    try {
      const list = await getSDK().getJoinedGroupList();
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getJoinedGroupList failed: ${e}`);
      return '[]';
    }
  }

  async getGroupMemberList(params: string, _operationID: string): Promise<string> {
    try {
      const p: Record<string, string | number> = JSON.parse(params);
      const list = await getSDK().getGroupMemberList({
        groupID: p.groupID as string,
        filter: p.filter as number,
        offset: p.offset as number,
        count: p.count as number,
      });
      return JSON.stringify(list);
    } catch (e) {
      Logger.error(TAG, `getGroupMemberList failed: ${e}`);
      return '[]';
    }
  }

  async inviteUserToGroup(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'inviteUserToGroup not implemented');
    return false;
  }

  async kickGroupMember(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'kickGroupMember not implemented');
    return false;
  }

  async getGroupApplicationListAsRecipient(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getGroupApplicationListAsRecipient not implemented');
    return '[]';
  }

  async getGroupApplicationListAsApplicant(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getGroupApplicationListAsApplicant not implemented');
    return '[]';
  }

  async acceptGroupApplication(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'acceptGroupApplication not implemented');
    return false;
  }

  async refuseGroupApplication(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'refuseGroupApplication not implemented');
    return false;
  }

  async changeGroupMute(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'changeGroupMute not implemented');
    return false;
  }

  async changeGroupMemberMute(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'changeGroupMemberMute not implemented');
    return false;
  }

  async setGroupInfo(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setGroupInfo not implemented');
    return false;
  }

  async setGroupMemberInfo(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setGroupMemberInfo not implemented');
    return false;
  }

  async searchGroups(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'searchGroups not implemented');
    return '[]';
  }

  async getSpecifiedGroupsInfo(groupIDList: string, _operationID: string): Promise<string> {
    try {
      const ids: string[] = JSON.parse(groupIDList);
      const groups = await getSDK().getSpecifiedGroupsInfo(ids);
      return JSON.stringify(groups);
    } catch (e) {
      Logger.error(TAG, `getSpecifiedGroupsInfo failed: ${e}`);
      return '[]';
    }
  }

  async transferGroupOwner(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'transferGroupOwner not implemented');
    return false;
  }

  // ============ 工具方法 ============

  async uploadFile(_reqData: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'uploadFile not implemented');
    return '{}';
  }

  async uploadLogs(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'uploadLogs not implemented');
    return false;
  }

  async setAppBackgroundStatus(_isBackground: boolean, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setAppBackgroundStatus not implemented');
    return false;
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
      const ids: string[] = JSON.parse(userIDList);
      await getSDK().subscribeUsersStatus(ids);
      return true;
    } catch (e) {
      Logger.error(TAG, `subscribeUsersStatus failed: ${e}`);
      return false;
    }
  }

  async unsubscribeUsersStatus(userIDList: string, _operationID: string): Promise<boolean> {
    try {
      const ids: string[] = JSON.parse(userIDList);
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

  async typingStatusUpdate(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'typingStatusUpdate not implemented');
    return false;
  }

  async getInputStates(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getInputStates not implemented');
    return '[]';
  }

  async changeInputStates(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'changeInputStates not implemented');
    return false;
  }

  async setConversation(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setConversation not implemented');
    return false;
  }

  async setConversationRecvMessageOpt(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setConversationRecvMessageOpt not implemented');
    return false;
  }

  async setConversationPrivateChat(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setConversationPrivateChat not implemented');
    return false;
  }

  async setConversationBurnDuration(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setConversationBurnDuration not implemented');
    return false;
  }

  async resetConversationGroupAtType(_conversationID: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'resetConversationGroupAtType not implemented');
    return false;
  }

  async hideAllConversations(_operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'hideAllConversations not implemented');
    return false;
  }

  async clearConversationAndDeleteAllMsg(conversationID: string, _operationID: string): Promise<boolean> {
    try {
      await getSDK().deleteConversationAndDeleteAllMsg(conversationID);
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

  async insertGroupMessageToLocalStorage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'insertGroupMessageToLocalStorage not implemented');
    return '{}';
  }

  async insertSingleMessageToLocalStorage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'insertSingleMessageToLocalStorage not implemented');
    return '{}';
  }

  async setMessageLocalEx(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setMessageLocalEx not implemented');
    return false;
  }

  async findMessageList(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'findMessageList not implemented');
    return '[]';
  }

  async getFriendListPage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getFriendListPage not implemented');
    return '[]';
  }

  async getSpecifiedFriendsInfo(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getSpecifiedFriendsInfo not implemented');
    return '[]';
  }

  async updateFriends(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'updateFriends not implemented');
    return false;
  }

  async searchFriends(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'searchFriends not implemented');
    return '[]';
  }

  async getFriendApplicationUnhandledCount(_params: string, _operationID: string): Promise<number> {
    Logger.warn(TAG, 'getFriendApplicationUnhandledCount not implemented');
    return 0;
  }

  async getJoinedGroupListPage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getJoinedGroupListPage not implemented');
    return '[]';
  }

  async getGroupApplicationUnhandledCount(_params: string, _operationID: string): Promise<number> {
    Logger.warn(TAG, 'getGroupApplicationUnhandledCount not implemented');
    return 0;
  }

  async getSpecifiedGroupMembersInfo(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getSpecifiedGroupMembersInfo not implemented');
    return '[]';
  }

  async getUsersInGroup(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getUsersInGroup not implemented');
    return '[]';
  }

  async searchGroupMembers(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'searchGroupMembers not implemented');
    return '[]';
  }

  async getGroupMemberOwnerAndAdmin(_groupID: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getGroupMemberOwnerAndAdmin not implemented');
    return '[]';
  }

  async getGroupMemberListByJoinTimeFilter(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getGroupMemberListByJoinTimeFilter not implemented');
    return '[]';
  }

  async isJoinGroup(_groupID: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'isJoinGroup not implemented');
    return false;
  }

  async getConversationIDBySessionType(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'getConversationIDBySessionType not implemented');
    return '""';
  }

  async createImageMessageByURL(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createImageMessageByURL not implemented');
    return '{}';
  }

  async createSoundMessageByURL(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createSoundMessageByURL not implemented');
    return '{}';
  }

  async createVideoMessageByURL(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createVideoMessageByURL not implemented');
    return '{}';
  }

  async createFileMessageByURL(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createFileMessageByURL not implemented');
    return '{}';
  }

  async createMergerMessage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createMergerMessage not implemented');
    return '{}';
  }

  async createForwardMessage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createForwardMessage not implemented');
    return '{}';
  }

  async createLocationMessage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createLocationMessage not implemented');
    return '{}';
  }

  async createCardMessage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createCardMessage not implemented');
    return '{}';
  }

  async createCustomMessage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createCustomMessage not implemented');
    return '{}';
  }

  async createFaceMessage(_params: string, _operationID: string): Promise<string> {
    Logger.warn(TAG, 'createFaceMessage not implemented');
    return '{}';
  }

  async sendMessageNotOss(params: string, _operationID: string): Promise<string> {
    return this.sendMessage(params, _operationID);
  }

  async deleteMessageFromLocalStorage(_params: string, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'deleteMessageFromLocalStorage not implemented');
    return false;
  }

  async logs(params: string, _operationID: string): Promise<void> {
    try {
      const p: Record<string, string> = JSON.parse(params);
      Logger.info(TAG, p.logs);
    } catch {
      Logger.info(TAG, params);
    }
  }

  async updateFcmToken(_fcmToken: string, _expireTime: number, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'updateFcmToken not implemented');
    return false;
  }

  async setAppBadge(_appUnreadCount: number, _operationID: string): Promise<boolean> {
    Logger.warn(TAG, 'setAppBadge not implemented');
    return false;
  }
}
