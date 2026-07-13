/**
 * ArkTS 实体类型定义（用于解析 JSON 输入参数）
 *
 * 这些类型用于描述从 React Native 传入的 JSON 数据的结构
 * 与 imsdk.har 中的 entity.d.ets 类型相对应
 */

/** 消息实体（用于高级文本消息） */
/** 消息实体（用于高级文本消息） */
export interface MessageEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
  info?: string;
}

/** 图片基础信息 */
/** 图片基础信息 */
export type PicBaseInfo = Picture

/** @ 人的信息 */
/** @ 人的信息 */
export interface AtUsersInfoItem {
  atUserID: string;
  groupNickname: string;
}

/** 群申请项 */
/** 群申请项 */
export interface GroupApplicationItem {
  createTime: number;
  creatorUserID: string;
  ex: string;
  groupFaceURL: string;
  groupID: string;
  groupName: string;
  groupType: number;
  handleResult: number;
  handleUserID: string;
  handledMsg: string;
  handledTime: number;
  introduction: string;
  memberCount: number;
  nickname: string;
  notification: string;
  ownerUserID: string;
  reqMsg: string;
  reqTime: number;
  joinSource: number;
  status: number;
  userFaceURL: string;
  userID: string;
}

/** 好友申请项 */
/** 好友申请项 */
export interface FriendApplicationItem {
  createTime: number;
  ex: string;
  fromFaceURL: string;
  fromNickname: string;
  fromUserID: string;
  handleMsg: string;
  handleResult: number;
  handleTime: number;
  handlerUserID: string;
  reqMsg: string;
  toFaceURL: string;
  toNickname: string;
  toUserID: string;
}

/** 公开用户信息 */
/** 公开用户信息 */
export interface PublicUserItem {
  nickname: string;
  userID: string;
  faceURL: string;
  ex: string;
}

/** 自身用户信息 */
/** 自身用户信息 */
export interface SelfUserInfo {
  createTime: number;
  ex: string;
  faceURL: string;
  nickname: string;
  userID: string;
  globalRecvMsgOpt: number;
}

/** 部分用户信息 */
/** 部分用户信息 */
export interface PartialUserInfo {
  userID: string;
  createTime?: number;
  ex?: string;
  faceURL?: string;
  nickname?: string;
  globalRecvMsgOpt?: number;
}

/** 好友用户项 */
/** 好友用户项 */
export interface FriendUserItem {
  addSource: number;
  createTime: number;
  ex: string;
  faceURL: string;
  userID: string;
  nickname: string;
  operatorUserID: string;
  ownerUserID: string;
  remark: string;
  isPinned: boolean;
  attachedInfo: string;
}

/** 搜索到的好友信息 */
export interface SearchedFriendsInfo {
  friendUserItem:FriendUserItem;
  relationship: number;
}

/** 好友关系信息 */
/** 好友关系信息 */
export interface FriendshipInfo {
  result: number;
  userID: string;
}

/** 黑名单用户项 */
/** 黑名单用户项 */
export interface BlackUserItem {
  addSource: number;
  userID: string;
  createTime: number;
  ex: string;
  faceURL: string;
  nickname: string;
  operatorUserID: string;
  ownerUserID: string;
}

/** 群信息项 */
/** 群信息项 */
export interface GroupItem {
  groupID: string;
  groupName: string;
  notification: string;
  notificationUserID: string;
  notificationUpdateTime: number;
  introduction: string;
  faceURL: string;
  ownerUserID: string;
  createTime: number;
  memberCount: number;
  status: number;
  creatorUserID: string;
  groupType: number;
  needVerification: number;
  ex: string;
  applyMemberFriend: number;
  lookMemberInfo: number;
  displayIsRead: boolean;
}

/** 群成员项 */
/** 群成员项 */
export interface GroupMemberItem {
  groupID: string;
  userID: string;
  nickname: string;
  faceURL: string;
  roleLevel: number;
  muteEndTime: number;
  joinTime: number;
  joinSource: number;
  inviterUserID: string;
  operatorUserID: string;
  ex: string;
}

/** 会话项 */
/** 会话项 */
export interface ConversationItem {
  conversationID: string;
  conversationType: number;
  userID: string;
  groupID: string;
  showName: string;
  faceURL: string;
  recvMsgOpt: number;
  unreadCount: number;
  groupAtType: number;
  latestMsg: string;
  latestMsgSendTime: number;
  draftText: string;
  draftTextTime: number;
  burnDuration: number;
  msgDestructTime: number;
  isPinned: boolean;
  isNotInGroup: boolean;
  isPrivateChat: boolean;
  isMsgDestruct: boolean;
  attachedInfo: string;
  ex?: string;
}

/** 群已读信息 */
/** 群已读信息 */
export interface GroupHasReadInfo {
  hasReadCount: number;
  unreadCount: number;
  hasReadUserIDList: string[];
  groupMemberCount: number;
}

/** 上传进度 */
/** 上传进度 */
export interface UploadProgress {
  total: number;
  save: number;
  current: number;
}

/** 附加信息元素 */
export interface AttachedInfoElem {
  groupHasReadInfo: GroupHasReadInfo;
  isPrivateChat: boolean;
  isEncryption: boolean;
  inEncryptStatus: boolean;
  burnDuration: number;
  hasReadTime: number;
  messageEntityList?: MessageEntity[];
  uploadProgress?: UploadProgress;
}

/** 文本元素 */
/** 文本元素 */
export interface TextElem {
  content: string;
}

/** 名片元素 */
/** 名片元素 */
export interface CardElem {
  userID: string;
  nickname: string;
  faceURL: string;
  ex: string;
}

/** @ 文本元素 */
/** @ 文本元素 */
export interface AtTextElem {
  text: string;
  atUserList: string[];
  atUsersInfo?: AtUsersInfoItem[];
  quoteMessage?: MessageItem;
  isAtSelf?: boolean;
}

/** 通知元素 */
/** 通知元素 */
export interface NotificationElem {
  detail: string;
}

/** 高级文本元素 */
/** 高级文本元素 */
export interface AdvancedTextElem {
  text: string;
  messageEntityList: MessageEntity[];
}

/** 正在输入元素 */
/** 正在输入元素 */
export interface TypingElem {
  msgTips: string;
}

/** 自定义元素 */
export interface CustomElem {
  data: string;
  description: string;
  extension: string;
}

/** 文件元素 */
export interface FileElem {
  filePath: string;
  uuid: string;
  sourceUrl: string;
  fileName: string;
  fileSize: number;
}

/** 表情元素 */
export interface FaceElem {
  index: number;
  data: string;
}

/** 位置元素 */
/** 位置元素 */
export interface LocationElem {
  description: string;
  longitude: number;
  latitude: number;
}

/** 合并消息元素 */
/** 合并消息元素 */
export interface MergeElem {
  title: string;
  abstractList: string[];
  multiMessage: MessageItem[];
  messageEntityList: MessageEntity[];
}

/** 离线推送信息 */
export interface OfflinePush {
  title: string;
  desc: string;
  ex: string;
  iOSPushSound: string;
  iOSBadgeCount: boolean;
}

/** 图片信息 */
export interface Picture {
  uuid: string;
  type: string;
  size: number;
  width: number;
  height: number;
  url: string;
}

/** 图片元素 */
export interface PictureElem {
  sourcePath: string;
  sourcePicture: Picture;
  bigPicture: Picture;
  snapshotPicture: Picture;
}

/** 引用消息元素 */
export interface QuoteElem {
  text: string;
  quoteMessage: MessageItem;
}

/** 语音元素 */
export interface SoundElem {
  uuid: string;
  soundPath: string;
  sourceUrl: string;
  dataSize: number;
  duration: number;
}

/** 视频元素 */
export interface VideoElem {
  videoPath: string;
  videoUUID: string;
  videoUrl: string;
  videoType: string;
  videoSize: number;
  duration: number;
  snapshotPath: string;
  snapshotUUID: string;
  snapshotSize: number;
  snapshotUrl: string;
  snapshotWidth: number;
  snapshotHeight: number;
}

/** 消息项（核心类型） */
export interface MessageItem {
  clientMsgID: string;
  serverMsgID: string;
  createTime: number;
  sendTime: number;
  sessionType: number;
  sendID: string;
  recvID: string;
  msgFrom: number;
  contentType: number;
  senderPlatformID: number;
  senderNickname: string;
  senderFaceUrl: string;
  groupID: string;
  content: string;
  seq: number;
  isRead: boolean;
  status: number;
  isReact?: boolean;
  isExternalExtensions?: boolean;
  offlinePush?: OfflinePush;
  ex?: string;
  localEx?: string;
  attachedInfoElem: AttachedInfoElem;

  // 可选元素
  textElem?: TextElem;
  cardElem?: CardElem;
  pictureElem?: PictureElem;
  soundElem?: SoundElem;
  videoElem?: VideoElem;
  fileElem?: FileElem;
  mergeElem?: MergeElem;
  atTextElem?: AtTextElem;
  faceElem?: FaceElem;
  locationElem?: LocationElem;
  customElem?: CustomElem;
  quoteElem?: QuoteElem;
  notificationElem?: NotificationElem;
  advancedTextElem?: AdvancedTextElem;
  typingElem?: TypingElem;
}

/** 高级撤回内容 */
export interface AdvancedRevokeContent {
  clientMsgID: string;
  revokeTime: number;
  revokerID: string;
  revokerNickname: string;
  revokerRole: number;
  seq: number;
  sessionType: number;
  sourceMessageSendID: string;
  sourceMessageSendTime: number;
  sourceMessageSenderNickname: string;
}

/** 撤回信息 */
export interface RevokedInfo {
  revokerID: string;
  revokerRole: number;
  clientMsgID: string;
  revokerNickname: string;
  revokeTime: number;
  sourceMessageSendTime: number;
  sourceMessageSendID: string;
  sourceMessageSenderNickname: string;
  sessionType: number;
  seq: number;
  ex: string;
}

/** 回执信息 */
export interface ReceiptInfo {
  userID: string;
  groupID: string;
  msgIDList: string[];
  readTime: number;
  msgFrom: number;
  contentType: number;
  sessionType: number;
}

/** 搜索消息结果 */
export interface SearchMessageResult {
  totalCount: number;
  searchResultItems?: SearchMessageResultItem[];
  findResultItems?: SearchMessageResultItem[];
}

/** 搜索消息结果项 */
export interface SearchMessageResultItem {
  conversationID: string;
  messageCount: number;
  conversationType: number;
  showName: string;
  faceURL: string;
  messageList: MessageItem[];
}

/** 高级获取消息结果 */
export interface AdvancedGetMessageResult {
  isEnd: boolean;
  errCode: number;
  errMsg: string;
  messageList: MessageItem[];
}

/** 音视频邀请 */
export interface RtcInvite {
  inviterUserID: string;
  inviteeUserIDList: string[];
  customData?: string;
  groupID: string;
  roomID: string;
  timeout: number;
  mediaType: string;
  sessionType: number;
  platformID: number;
  initiateTime?: number;
  busyLineUserIDList?: string[];
}

/** 用户在线状态 */
/** 用户在线状态 */
export interface UserOnlineState {
  platformIDs?: number[];
  status: number;
  userID: string;
}

/** 会话输入状态 */
export interface ConversationInputStatus {
  conversationID: string;
  userID: string;
  platformIDs: number[];
}

/** 群消息回执信息 */
export interface GroupMessageReceiptInfo {
  conversationID: string;
  groupMessageReadInfo: GroupMessageReadInfo[];
}

/** 群消息已读信息 */
/** 群消息已读信息 */
export interface GroupMessageReadInfo {
  clientMsgID: string;
  hasReadCount: number;
  unreadCount: number;
  readMembers: GroupMemberItem[];
}
