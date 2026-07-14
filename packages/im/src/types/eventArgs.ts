/**
 * OpenIM 事件参数类型定义
 *
 * 与 OpenIM SDK 官方保持一致
 */
import {
  BlackUserItem,
  ConversationInputStatus,
  ConversationItem,
  FriendApplicationItem,
  FriendUserItem,
  GroupApplicationItem,
  GroupItem,
  GroupMemberItem,
  MessageItem,
  ReceiptInfo,
  RevokedInfo,
  SelfUserInfo,
  UserOnlineState,
} from './entity';

/** 基础错误类型 */
export interface OpenIMEventBaseErrorType {
  code: number;
  errMsg: string;
}

/** 事件回调参数映射 */
export type EventCallbackArgsMap = {
  // 连接事件
  'onConnectSuccess': [];
  'onConnecting': [];
  'onConnectFailed': [error: OpenIMEventBaseErrorType];
  'onKickedOffline': [];
  'onSelfInfoUpdated': [selfUserInfo: SelfUserInfo];
  'onUserStatusChanged': [userStatus: UserOnlineState];
  'onUserTokenExpired': [];
  'onUserTokenInvalid': [];

  // 消息事件
  'onRecvNewMessage': [message: MessageItem];
  'onRecvNewMessages': [messages: MessageItem[]];
  'onRecvOfflineNewMessage': [message: MessageItem];
  'onRecvOnlineOnlyMessage': [message: MessageItem];
  'onRecvOfflineNewMessages': [messages: MessageItem[]];
  'onMsgDeleted': [message: MessageItem];
  'onRecvC2CReadReceipt': [receipts: ReceiptInfo[]];
  'onNewRecvMessageRevoked': [revokedInfo: RevokedInfo];
  'onSendMessageProgress': [info: { progress: number; message: MessageItem }];

  // 会话事件
  'onConversationChanged': [conversations: ConversationItem[]];
  'onInputStatusChanged': [inputStatus: ConversationInputStatus];
  'onNewConversation': [conversations: ConversationItem[]];
  'onSyncServerFailed': [];
  'onSyncServerFinish': [];
  'onSyncServerStart': [isSyncing: boolean];
  'onSyncServerProgress': [progress: number];
  'onTotalUnreadMessageCountChanged': [totalUnread: number];

  // 好友事件
  'onBlackAdded': [blackUser: BlackUserItem];
  'onBlackDeleted': [blackUser: BlackUserItem];
  'onFriendApplicationAccepted': [application: FriendApplicationItem];
  'onFriendApplicationAdded': [application: FriendApplicationItem];
  'onFriendApplicationDeleted': [application: FriendApplicationItem];
  'onFriendApplicationRejected': [application: FriendApplicationItem];
  'onFriendInfoChanged': [friend: FriendUserItem];
  'onFriendAdded': [friend: FriendUserItem];
  'onFriendDeleted': [friend: FriendUserItem];

  // 群组事件
  'onGroupApplicationAccepted': [application: GroupApplicationItem];
  'onGroupApplicationRejected': [application: GroupApplicationItem];
  'onGroupApplicationAdded': [application: GroupApplicationItem];
  'onGroupApplicationDeleted': [application: GroupApplicationItem];
  'onGroupInfoChanged': [group: GroupItem];
  'onGroupMemberInfoChanged': [member: GroupMemberItem];
  'onGroupMemberAdded': [member: GroupMemberItem];
  'onGroupMemberDeleted': [member: GroupMemberItem];
  'onJoinedGroupAdded': [group: GroupItem];
  'onJoinedGroupDeleted': [group: GroupItem];
  'onGroupDismissed': [group: GroupItem];

  // 上传事件
  'uploadComplete': [payload: { data: { fileSize: number; streamSize: number; storageSize: number; operationID: string } }];
  'uploadOnProgress': [payload: { current: number; size: number; operationID: string }];

  // 自定义业务消息
  'onRecvCustomBusinessMessage': [data: unknown];
};

/** 根据事件名获取参数类型 */
export type ArgsOfEvent<E extends keyof EventCallbackArgsMap> = EventCallbackArgsMap[E];
