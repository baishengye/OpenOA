/**
 * ArkTS 参数类型定义（用于解析 JSON 输入参数）
 *
 * 这些类型用于描述从 React Native 传入的 JSON 参数的结构
 * 对应各 SDK 方法的输入参数
 */

import type { MessageItem, OfflinePush, PicBaseInfo, AtUsersInfoItem, GroupItem } from './entity.d';

/** 初始化选项 */
export interface  InitOptions {
  platformID?: number;
  apiAddr: string;
  wsAddr: string;
  dataDir?: string;
  logFilePath?: string;
  logLevel?: number;
  isLogStandardOutput?: boolean;
  isExternalExtensions?: boolean;
}

/** 登录参数 */
export interface  LoginParams {
  userID: string;
  token: string;
  platformID?: number;
  apiAddr?: string;
  wsAddr?: string;
}

/** 偏移量参数 */
export interface  OffsetParams {
  offset: number;
  count: number;
}

/** 设置自身信息参数 */
export interface  SetSelfInfoParams {
  userID?: string;
  createTime?: number;
  ex?: string;
  faceURL?: string;
  nickname?: string;
  globalRecvMsgOpt?: number;
}

/** 用户信息输入类型 */
export interface  PartialUserInfoInput {
  userID?: string;
  createTime?: number;
  ex?: string;
  faceURL?: string;
  nickname?: string;
  globalRecvMsgOpt?: number;
}

/** 获取用户信息参数 */
export interface  GetUserInfoWithCacheParams {
  userIDList: string[];
  groupID?: string;
}

/** 分页会话参数 */
export interface  SplitConversationParams {
  offset: number;
  count: number;
}

/** 获取单一会话参数 */
export interface  GetOneConversationParams {
  sourceID: string;
  sessionType: number;
}

/** 设置会话参数 */
export interface  SetConversationParams {
  conversationID: string;
  recvMsgOpt?: number;
  groupAtType?: number;
  burnDuration?: number;
  msgDestructTime?: number;
  isPinned?: boolean;
  isPrivateChat?: boolean;
  isMsgDestruct?: boolean;
  ex?: string;
}

/** 设置会话草稿参数 */
export interface  SetConversationDraftParams {
  conversationID: string;
  draftText: string;
}

/** 置顶会话参数 */
export interface  PinConversationParams {
  conversationID: string;
  isPinned: boolean;
}

/** 设置会话接收选项参数 */
export interface  SetConversationRecvOptParams {
  conversationID: string;
  opt: number;
}

/** 设置会话私密聊天参数 */
export interface  SetConversationPrivateParams {
  conversationID: string;
  isPrivate: boolean;
}

/** 设置消息销毁时间参数 */
export interface  SetBurnDurationParams {
  conversationID: string;
  burnDuration: number;
}

/** 获取指定好友参数 */
export interface GetSpecifiedFriendsParams {
  userIDList: string[];
  filterBlack?: boolean;
}

/** 获取好友列表（分页）参数 */
export interface GetFriendListPageParams {
  offset: number;
  count: number;
  filterBlack?: boolean;
}

/** 更新好友参数 */
export interface  UpdateFriendsParams {
  friendUserIDs: string[];
  isPinned?: boolean;
  remark?: string;
  ex?: string;
}

/** 审批好友参数 */
export interface  AccessFriendParams {
  toUserID: string;
  handleMsg: string;
}

/** 添加黑名单参数 */
export interface  AddBlackParams {
  toUserID: string;
  ex?: string;
}

/** 添加好友参数 */
export interface  AddFriendParams {
  toUserID: string;
  reqMsg: string;
}

/** 获取好友申请列表（作为接收者）参数 */
export interface  GetFriendApplicationListAsRecipientParams {
  handleResults: number[];
  offset: number;
  count: number;
}

/** 获取未处理好友申请数参数 */
export interface  GetSelfApplicationUnhandledCountParams {
  time: number;
}

/** 获取好友申请列表（作为申请者）参数 */
export interface  GetFriendApplicationListAsApplicantParams {
  offset: number;
  count: number;
}

/** 搜索好友参数 */
export interface  SearchFriendParams {
  keywordList: string[];
  isSearchUserID: boolean;
  isSearchNickname: boolean;
  isSearchRemark: boolean;
}

/** 设置好友备注参数 */
export interface  SetFriendRemarkParams {
  friendUserID: string;
  remark: string;
}

/** 创建群参数 */
export interface  CreateGroupParams {
  memberUserIDs: string[];
  groupInfo: Partial<GroupItem>;
  adminUserIDs?: string[];
  ownerUserID?: string;
}

/** 入群参数 */
export interface  JoinGroupParams {
  groupID: string;
  reqMsg: string;
  joinSource: number;
  ex?: string;
}

/** 操作群参数 */
export interface  OperateGroupParams {
  groupID: string;
  reason: string;
  userIDList: string[];
}

/** 搜索群参数 */
export interface  SearchGroupParams {
  keywordList: string[];
  isSearchGroupID: boolean;
  isSearchGroupName: boolean;
}

/** 设置群信息参数 */
export interface  SetGroupInfoParams {
  groupID: string;
  groupName?: string;
  faceURL?: string;
  notification?: string;
  introduction?: string;
}

/** 获取群申请列表（作为接收者）参数 */
export interface  GetGroupApplicationListAsRecipientParams {
  groupIDs: string[];
  handleResults: number[];
  offset: number;
  count: number;
}

/** 获取群申请列表（作为申请者）参数 */
export interface  GetGroupApplicationListAsApplicantParams {
  groupIDs: string[];
  handleResults: number[];
  offset: number;
  count: number;
}

/** 审批入群参数 */
export interface  AccessGroupParams {
  groupID: string;
  fromUserID: string;
  handleMsg: string;
}

/** 获取群成员参数 */
export interface  GetGroupMembersParams {
  groupID: string;
  filter: number;
  offset: number;
  count: number;
}

/** 获取群成员信息参数 */
export interface  GetGroupMembersInfoParams {
  reason?: string;
  groupID: string;
  userIDList: string[];
}

/** 搜索群成员参数 */
export interface  SearchGroupMemberParams {
  groupID: string;
  keywordList: string[];
  isSearchUserID: boolean;
  isSearchMemberNickname: boolean;
  offset: number;
  count: number;
}

/** 更新群成员信息参数 */
export interface  UpdateMemberInfoParams {
  groupID: string;
  userID: string;
  nickname?: string;
  faceURL?: string;
  roleLevel?: number;
  ex?: string;
}

/** 按时间获取群成员参数 */
export interface  GetGroupMemberByTimeParams {
  groupID: string;
  filterUserIDList: string[];
  offset: number;
  count: number;
  joinTimeBegin: number;
  joinTimeEnd: number;
  joinTime?: number;
  joinStatus?: number;
}

/** 禁言群成员参数 */
export interface  ChangeGroupMemberMuteParams {
  groupID: string;
  userID: string;
  mutedSeconds: number;
}

/** 全群禁言参数 */
export interface  ChangeGroupMuteParams {
  groupID: string;
  isMute: boolean;
}

/** 转让群主参数 */
export interface  TransferGroupParams {
  groupID: string;
  newOwnerUserID: string;
}

/** 语音消息参数（路径方式） */
export interface  SoundMsgByPathParams {
  soundPath: string;
  duration: number;
}

/** 视频消息参数（路径方式） */
export interface  VideoMsgByPathParams {
  videoPath: string;
  videoType: string;
  duration: number;
  snapshotPath: string;
  snapshotFullPath?:string;
}

/** 文件消息参数（路径方式） */
export interface  FileMsgByPathParams {
  filePath: string;
  fileName: string;
}

/** @ 消息参数 */
export interface  AtMsgParams {
  text: string;
  atUserIDList: string[];
  atUsersInfo?: AtUsersInfoItem[];
  message?: MessageItem;
}

/** 图片消息参数 */
export interface  ImageMsgParams {
  sourcePicture: PicBaseInfo;
  bigPicture: PicBaseInfo;
  snapshotPicture: PicBaseInfo;
  sourcePath: string;
}

/** 语音消息参数 */
export interface  SoundMsgParams {
  uuid: string;
  soundPath: string;
  sourceUrl: string;
  dataSize: number;
  duration: number;
  soundType?: string;
}

/** 视频消息参数 */
/** 视频消息参数 */
export interface VideoMsgParams {
  videoPath: string;
  duration: number;
  videoType: string;
  snapshotPath: string;
  videoUUID: string;
  videoUrl: string;
  videoSize: number;
  snapshotUUID: string;
  snapshotSize: number;
  snapshotUrl: string;
  snapshotWidth: number;
  snapshotHeight: number;
  snapShotType?: string;
}

/** 文件消息参数 */
export interface  FileMsgParams {
  filePath: string;
  fileName: string;
  uuid: string;
  sourceUrl: string;
  fileSize: number;
  fileType?: string;
}

/** 合并消息参数 */
export interface  MergerMsgParams {
  messageList: MessageItem[];
  title: string;
  summaryList: string[];
}

/** 位置消息参数 */
export interface  LocationMsgParams {
  description: string;
  longitude: number;
  latitude: number;
}

/** 引用消息参数 */
export interface  QuoteMsgParams {
  text: string;
  message: MessageItem;
}

/** 自定义消息参数 */
export interface  CustomMsgParams {
  data: string;
  extension: string;
  description: string;
}

/** 表情消息参数 */
export interface  FaceMessageParams {
  index: number;
  data: string;
}

/** 发送消息参数 */
export interface  SendMsgParams {
  recvID?: string;
  groupID?: string;
  offlinePushInfo?: OfflinePush;
  message: MessageItem;
  isOnlineOnly?: boolean;
  conversationID?: string;
}

/** 正在输入状态更新参数 */
export interface  TypingUpdateParams {
  recvID: string;
  msgTip: string;
}

/** 改变输入状态参数 */
export interface  ChangeInputStatesParams {
  conversationID: string;
  focus: boolean;
}

/** 获取输入状态参数 */
export interface  GetInputStatesParams {
  conversationID: string;
  userID: string;
}

/** 操作消息参数 */
export interface  OperateMessageParams {
  conversationID: string;
  clientMsgID: string;
}

/** 本地搜索消息参数 */
export interface  SearchLocalParams {
  conversationID: string;
  keywordList: string[];
  keywordListMatchType?: number;
  senderUserIDList?: string[];
  messageTypeList?: number[];
  searchTimePosition?: number;
  searchTimePeriod?: number;
  pageIndex?: number;
  count?: number;
}

/** 获取高级历史消息参数 */
export interface  GetAdvancedHistoryMsgParams {
  conversationID: string;
  startClientMsgID: string;
  count: number;
  lastMinSeq?: number;
  userID?: string;
  groupID?: string;
}

/** 查找消息参数 */
export interface  FindMessageParams {
  conversationID: string;
  clientMsgIDList: string[];
}

/** 插入群消息到本地参数 */
export interface  InsertGroupMsgParams {
  message: MessageItem;
  groupID: string;
  sendID: string;
}

/** 插入单聊消息到本地参数 */
export interface  InsertSingleMsgParams {
  message: MessageItem;
  recvID: string;
  sendID: string;
}

/** 设置消息本地扩展参数 */
export interface  SetMessageLocalExParams {
  conversationID: string;
  clientMsgID: string;
  localEx: string;
}

/** 上传文件参数 */
export interface  UploadFileParams {
  filePath: string;
  name?: string;
  contentType?: string;
  uuid?: string;
  cause?: string;
  token?: string;
}

/** 上传日志参数 */
export interface  UploadLogsParams {
  line: number;
  ex?: string;
}

/** 日志参数 */
export interface  LogsParams {
  logLevel?: number;
  file?: string;
  line?: number;
  msgs?: string;
  err?: string;
  keyAndValue?: string[];
}

/** 搜索群成员参数（简化版） */
export interface  SearchGroupMemberParamsSimple {
  groupID: string;
  keywordList: string[];
  offset: number;
  count: number;
}

/** 图片消息参数（URL方式） */
export interface  ImageMsgParamsByURL {
  sourcePicture: PicBaseInfo;
  bigPicture: PicBaseInfo;
  snapshotPicture: PicBaseInfo;
  sourcePath: string;
}

export interface SearchParams{
  keywordList: string[];
  isSearchMemberNickName?: boolean;
  isSearchUserID?: boolean;
}

/** 搜索群成员参数（完整版） */
export interface  SearchGroupMembersParams {
  groupID: string;
  offset?: number;
  count?: number;
  searchParam?: SearchParams
}

/** 查找消息列表参数 */
export interface  FindMessageListParams {
  conversationID: string;
  clientMsgIDList: string[];
}

/** 名片消息参数 */
export interface  CardMsgParams {
  userID: string;
  nickname: string;
  faceURL: string;
  ex?: string;
}

/** 消息回执参数 */
export interface  MessageReceiptParams {
  conversationID: string;
  clientMsgID: string;
}

/** 标记消息已读参数 */
export interface  MarkReadParams {
  conversationID: string;
  msgIDList?: string[];
}

/** 获取未读数参数 */
export interface  GetUnreadMsgCountParams {
  conversationID: string;
}

/** 获取会话列表参数 */
export interface  GetConversationListParams {
  conversationIDList: string[];
}

/** 设置已读参数 */
export interface  SetConversationHasReadParams {
  conversationID: string;
}

/** 删除会话参数 */
export interface  DeleteConversationParams {
  conversationID: string;
  conversationType: number;
}

/** 隐藏会话参数 */
export interface  HideConversationParams {
  conversationID: string;
  conversationType: number;
}

/** 操作消息参数（撤销/删除） */
export interface  MessageOperateParams {
  conversationID: string;
  clientMsgID: string;
}

/** 操作群成员参数（邀请/踢出） */
export interface  OperateGroupMemberParams {
  groupID: string;
  userIDList: string[];
  reason?: string;
}

/** 好友申请列表参数（申请者） */
export interface  FriendApplicationListAsApplicantParams {
  offset: number;
  count: number;
}

/** 好友申请列表参数（接收者） */
export interface  FriendApplicationListAsRecipientParams {
  offset: number;
  count: number;
  handleResults?: number[];
}

/** 获取群成员列表参数 */
export interface  GetGroupMemberListParams {
  groupID: string;
  filter: number;
  offset: number;
  count: number;
}

/** 获取已加入群列表参数 */
export interface  GetJoinedGroupListParams {
  offset: number;
  count: number;
}

/** 按会话类型获取会话ID参数 */
export interface  GetConversationIDBySessionTypeParams {
  sourceID: string;
  sessionType: number;
}

/** 转让群主参数（完整版） */
export interface  TransferGroupOwnerParams {
  groupID: string;
  newOwnerUserID: string;
}

/** 更新群成员信息参数（完整版） */
export interface  UpdateGroupMemberInfoParams {
  groupID: string;
  userID: string;
  nickname?: string;
  faceURL?: string;
  roleLevel?: number;
  ex?: string;
}
