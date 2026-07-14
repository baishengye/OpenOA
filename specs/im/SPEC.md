# @itc/rn-client-sdk-plus（IM 模块）规范

## 概述

**@itc/rn-client-sdk-plus** 是 OpenOA 项目的即时通讯（IM）模块，封装 OpenIM SDK。实现 `ItcModule` 契约，提供统一的事件总线集成；高级用户可直接访问 SDK 单例 `itcOpenIM` 调用完整 OpenIM API。

**核心职责：**
- 封装 OpenIM SDK 登录/登出/消息发送
- 桥接原生 TurboModule 事件到 JS 层事件总线
- 提供 ItcModule 生命周期管理（init/destroy）

**设计原则：**
- 双层导出：`IMModule`（ItcModule 模式）+ `ItcOpenIM`（直接 SDK）
- 参数序列化：JS 层将对象参数序列化为 JSON 字符串，适配 TurboModule 基本类型约束
- operationID：每个 SDK 调用附带唯一 operationID 用于日志追踪

---

## 2. 模块契约

### 2.1 ItcModule 实现（IMModule）

```typescript
interface IMInitOptions {
  apiAddr: string;          // OpenIM API 地址
  wsAddr: string;           // OpenIM WebSocket 地址
  platformID?: number;      // 平台 ID：1=iOS, 2=Android（自动设置）
  dataDir?: string;         // 数据库目录（自动设置）
  logLevel?: number;        // 日志等级
  isAutoLogin?: boolean;    // 自动登录
  networkTimeout?: number;  // 超时（毫秒）
  logFilePath?: string;     // 日志路径
}

class IMModule extends BaseModule<IMInitOptions> {
  readonly name = 'im';

  async isSupported(): Promise<boolean>;
  protected async onInit(options: IMInitOptions): Promise<void>;
  protected async onDestroy(): Promise<void>;

  // 便捷方法
  async login(userId: string, token: string): Promise<void>;
  async logout(): Promise<void>;
  async sendText(conversationId: string, text: string): Promise<MessageItem>;
  async getLoginStatus(): Promise<number>;
  async getLoginUserID(): Promise<string>;
  async getAllConversationList(): Promise<string>;
  async getTotalUnreadMsgCount(): Promise<number>;
  async getHistoryMessageList(
    conversationId: string,
    count?: number,
    startTime?: number
  ): Promise<string>;
  async markConversationAsRead(conversationId: string): Promise<void>;
  async createGroup(params: CreateGroupParams, operationID?: string): Promise<string>;
  async getJoinedGroupList(operationID?: string): Promise<string>;
  async getConversationIDBySessionType(
    params: GetOneConversationParams,
    operationID?: string
  ): Promise<string>;
  async createTextMessage(text: string, operationID?: string): Promise<MessageItem>;
}
```

### 2.2 直接 SDK 导出（ItcOpenIM）

`ItcOpenIM` 是 `Emitter` 的子类，提供完整的 OpenIM SDK 90+ 方法封装：

```typescript
class ItcOpenIM extends Emitter {
  static getInstance(): ItcOpenIM;
  private constructor();

  // 登录相关
  initSDK(params: InitOptions, operationID?: string): Promise<unknown>;
  login(params: LoginParams, operationID?: string): Promise<unknown>;
  logout(operationID?: string): Promise<unknown>;
  getLoginStatus(operationID?: string): Promise<number>;
  getLoginUserID(operationID?: string): Promise<string>;

  // 用户相关
  getUsersInfo(userIDList: string[], operationID?: string): Promise<unknown>;
  getSelfUserInfo(operationID?: string): Promise<unknown>;
  setSelfInfo(params: Partial<SelfUserInfo>, operationID?: string): Promise<unknown>;
  subscribeUsersStatus(userIDs: string[], operationID?: string): Promise<unknown>;
  unsubscribeUsersStatus(userIDs: string[], operationID?: string): Promise<unknown>;
  setAppBackgroundStatus(isBackground: boolean, operationID?: string): Promise<unknown>;

  // 好友相关
  addFriend(params: AddFriendParams, operationID?: string): Promise<unknown>;
  deleteFriend(friendUserID: string, operationID?: string): Promise<unknown>;
  getFriendList(filterBlack: boolean, operationID?: string): Promise<unknown>;
  checkFriend(friendUserIDList: string[], operationID?: string): Promise<unknown>;
  // ... 更多好友方法（见 4.1 节）

  // 群组相关
  createGroup(params: CreateGroupParams, operationID?: string): Promise<unknown>;
  joinGroup(params: JoinGroupParams, operationID?: string): Promise<unknown>;
  getJoinedGroupList(operationID?: string): Promise<unknown>;
  dismissGroup(groupID: string, operationID?: string): Promise<unknown>;
  // ... 更多群组方法（见 4.1 节）

  // 会话相关
  getAllConversationList(operationID?: string): Promise<unknown>;
  getOneConversation(params: GetOneConversationParams, operationID?: string): Promise<unknown>;
  pinConversation(params: PinConversationParams, operationID?: string): Promise<unknown>;
  markConversationMessageAsRead(conversationID: string, operationID?: string): Promise<unknown>;
  // ... 更多会话方法（见 4.1 节）

  // 消息相关
  createTextMessage(text: string, operationID?: string): Promise<unknown>;
  sendMessage(params: SendMsgParams, operationID?: string): Promise<unknown>;
  revokeMessage(params: OperateMessageParams, operationID?: string): Promise<unknown>;
  deleteMessage(params: OperateMessageParams, operationID?: string): Promise<unknown>;
  searchLocalMessages(params: SearchLocalParams, operationID?: string): Promise<unknown>;
  getAdvancedHistoryMessageList(
    params: GetAdvancedHistoryMsgParams,
    operationID?: string
  ): Promise<unknown>;
  // ... 更多消息方法（见 4.1 节）

  // 消息创建（按类型）
  createImageMessageFromFullPath(imagePath: string, operationID?: string): Promise<unknown>;
  createVideoMessageFromFullPath(params: VideoMsgByPathParams, operationID?: string): Promise<unknown>;
  createSoundMessageFromFullPath(params: SoundMsgByPathParams, operationID?: string): Promise<unknown>;
  createFileMessageFromFullPath(params: FileMsgByPathParams, operationID?: string): Promise<unknown>;
  createImageMessageByURL(params: ImageMsgParams, operationID?: string): Promise<unknown>;
  createMergerMessage(params: MergerMsgParams, operationID?: string): Promise<unknown>;
  createQuoteMessage(params: QuoteMsgParams, operationID?: string): Promise<unknown>;
  createCustomMessage(params: CustomMsgParams, operationID?: string): Promise<unknown>;
  // ... 更多消息类型
}

export const itcOpenIM: ItcOpenIM;
```

---

## 3. 事件总线（71 个事件）

### 3.1 事件映射

| 原生事件 | JS 事件 | Payload 类型 |
|----------|---------|--------------|
| **连接状态** |
| `im:connectSuccess` | `im:connectionChanged` | `'connected'` |
| `im:connecting` | `im:connectionChanged` | `'connecting'` |
| `im:connectFailed` | `im:connectionChanged` | `'disconnected'` |
| `im:kickedOffline` | `im:kickedOffline` | `void` |
| `im:userTokenExpired` | `im:tokenExpired` | `void` |
| `im:userTokenInvalid` | `im:tokenExpired` | `void` |
| **用户** |
| `im:selfInfoUpdated` | `im:selfInfoUpdated` | `unknown` |
| `im:userStatusChanged` | `im:userStatusChanged` | `unknown` |
| `im:userCommandAdd` | `im:userCommandAdd` | `unknown` |
| `im:userCommandDelete` | `im:userCommandDelete` | `unknown` |
| `im:userCommandUpdate` | `im:userCommandUpdate` | `unknown` |
| **会话** |
| `im:conversationChanged` | `im:conversationChanged` | `unknown` |
| `im:newConversation` | `im:newConversation` | `unknown` |
| `im:inputStatusChanged` | `im:typingStatus` | `{ userId: string; status: boolean }` |
| `im:syncServerFailed` | `im:syncServerFailed` | `boolean` |
| `im:syncServerFinish` | `im:syncServerFinish` | `boolean` |
| `im:syncServerStart` | `im:syncServerStart` | `boolean` |
| `im:syncServerProgress` | `im:syncServerProgress` | `number` |
| `im:totalUnreadMessageCountChanged` | `im:totalUnreadChanged` | `number` |
| **消息** |
| `im:recvNewMessage` | `im:newMessage` | `unknown` |
| `im:recvOfflineNewMessage` | `im:offlineMessage` | `unknown` |
| `im:recvOnlineOnlyMessage` | `im:onlineOnlyMessage` | `unknown` |
| `im:msgDeleted` | `im:messageDeleted` | `unknown` |
| `im:recvC2CReadReceipt` | `im:readReceipt` | `unknown` |
| `im:newRecvMessageRevoked` | `im:messageRevoked` | `unknown` |
| `im:recvNewMessages` | `im:newMessages` | `unknown` |
| `im:recvOfflineNewMessages` | `im:offlineMessages` | `unknown` |
| `im:sendMessageProgress` | `im:sendProgress` | `{ progress: number; message: unknown }` |
| **上传** |
| `im:uploadComplete` | `im:uploadComplete` | `unknown` |
| `im:uploadOnProgress` | `im:uploadOnProgress` | `unknown` |
| `im:uploadOpen` | `im:uploadOpen` | `unknown` |
| `im:uploadPartSize` | `im:uploadPartSize` | `unknown` |
| `im:uploadHashPartProgress` | `im:uploadHashPartProgress` | `unknown` |
| `im:uploadHashPartComplete` | `im:uploadHashPartComplete` | `unknown` |
| `im:uploadPartComplete` | `im:uploadPartComplete` | `unknown` |
| `im:uploadID` | `im:uploadID` | `unknown` |
| **自定义业务** |
| `im:recvCustomBusinessMessage` | `im:recvCustomBusinessMessage` | `unknown` |
| **好友** |
| `im:blackAdded` | `im:blackAdded` | `unknown` |
| `im:blackDeleted` | `im:blackDeleted` | `unknown` |
| `im:friendApplicationAccepted` | `im:friendApplicationAccepted` | `unknown` |
| `im:friendApplicationAdded` | `im:friendApplicationAdded` | `unknown` |
| `im:friendApplicationDeleted` | `im:friendApplicationDeleted` | `unknown` |
| `im:friendApplicationRejected` | `im:friendApplicationRejected` | `unknown` |
| `im:friendAdded` | `im:friendAdded` | `unknown` |
| `im:friendDeleted` | `im:friendDeleted` | `unknown` |
| `im:friendInfoChanged` | `im:friendInfoChanged` | `unknown` |
| **群组** |
| `im:groupApplicationAccepted` | `im:groupApplicationAccepted` | `unknown` |
| `im:groupApplicationAdded` | `im:groupApplicationAdded` | `unknown` |
| `im:groupApplicationDeleted` | `im:groupApplicationDeleted` | `unknown` |
| `im:groupApplicationRejected` | `im:groupApplicationRejected` | `unknown` |
| `im:groupDismissed` | `im:groupDismissed` | `unknown` |
| `im:groupInfoChanged` | `im:groupInfoChanged` | `unknown` |
| `im:groupMemberAdded` | `im:groupMemberAdded` | `unknown` |
| `im:groupMemberDeleted` | `im:groupMemberDeleted` | `unknown` |
| `im:groupMemberInfoChanged` | `im:groupMemberInfoChanged` | `unknown` |
| `im:joinedGroupAdded` | `im:joinedGroupAdded` | `unknown` |
| `im:joinedGroupDeleted` | `im:joinedGroupDeleted` | `unknown` |
| **信令（音视频）** |
| `im:hangUp` | `im:hangUp` | `unknown` |
| `im:invitationCancelled` | `im:invitationCancelled` | `unknown` |
| `im:invitationTimeout` | `im:invitationTimeout` | `unknown` |
| `im:inviteeAccepted` | `im:inviteeAccepted` | `unknown` |
| `im:inviteeAcceptedByOtherDevice` | `im:inviteeAcceptedByOtherDevice` | `unknown` |
| `im:inviteeRejected` | `im:inviteeRejected` | `unknown` |
| `im:inviteeRejectedByOtherDevice` | `im:inviteeRejectedByOtherDevice` | `unknown` |
| `im:receiveNewInvitation` | `im:receiveNewInvitation` | `unknown` |
| `im:roomParticipantConnected` | `im:roomParticipantConnected` | `unknown` |
| `im:roomParticipantDisconnected` | `im:roomParticipantDisconnected` | `unknown` |

### 3.2 常用事件订阅

```typescript
import { eventBus } from '@itc/base';

// 连接状态
eventBus.on('im:connectionChanged', (state) => {
  console.log('连接状态:', state);
});

// 新消息
eventBus.on('im:newMessage', (msg) => {
  console.log('收到消息:', msg);
});

// 未读数变化
eventBus.on('im:totalUnreadChanged', (count) => {
  // 更新角标
});

// 被踢下线
eventBus.on('im:kickedOffline', () => {
  // 重新登录
});

// Token 过期
eventBus.on('im:tokenExpired', () => {
  // 刷新 token
});
```

---

## 4. 完整方法清单

### 4.1 ItcOpenIM（直接 SDK）完整方法

**登录相关（5 个）：**
- `initSDK`, `login`, `logout`, `getLoginStatus`, `getLoginUserID`

**用户相关（9 个）：**
- `getUsersInfo`, `getSelfUserInfo`, `setSelfInfo`, `subscribeUsersStatus`, `unsubscribeUsersStatus`, `getSubscribeUsersStatus`, `setAppBackgroundStatus`, `networkStatusChanged`, `setGlobalRecvMessageOpt`

**好友相关（17 个）：**
- `acceptFriendApplication`, `addBlack`, `addFriend`, `checkFriend`, `deleteFriend`, `getBlackList`, `getFriendApplicationListAsApplicant`, `getFriendApplicationListAsRecipient`, `getFriendApplicationUnhandledCount`, `getFriendList`, `getFriendListPage`, `getSpecifiedFriendsInfo`, `updateFriends`, `refuseFriendApplication`, `removeBlack`, `searchFriends`, `setFriendRemark`

**群组相关（25 个）：**
- `createGroup`, `joinGroup`, `inviteUserToGroup`, `getJoinedGroupList`, `getJoinedGroupListPage`, `searchGroups`, `getSpecifiedGroupsInfo`, `setGroupInfo`, `getGroupApplicationListAsRecipient`, `getGroupApplicationListAsApplicant`, `getGroupApplicationUnhandledCount`, `acceptGroupApplication`, `refuseGroupApplication`, `getGroupMemberList`, `getSpecifiedGroupMembersInfo`, `getUsersInGroup`, `searchGroupMembers`, `setGroupMemberInfo`, `getGroupMemberOwnerAndAdmin`, `getGroupMemberListByJoinTimeFilter`, `kickGroupMember`, `changeGroupMemberMute`, `changeGroupMute`, `transferGroupOwner`, `dismissGroup`, `quitGroup`, `isJoinGroup`

**会话相关（17 个）：**
- `getAllConversationList`, `getConversationListSplit`, `getOneConversation`, `getMultipleConversation`, `getConversationIDBySessionType`, `getTotalUnreadMsgCount`, `markConversationMessageAsRead`, `setConversation`, `setConversationDraft`, `pinConversation`, `setConversationRecvMessageOpt`, `setConversationPrivateChat`, `setConversationBurnDuration`, `resetConversationGroupAtType`, `hideConversation`, `hideAllConversations`, `clearConversationAndDeleteAllMsg`, `deleteConversationAndDeleteAllMsg`

**消息创建（按类型，15 个）：**
- `createImageMessageFromFullPath`, `createVideoMessageFromFullPath`, `createSoundMessageFromFullPath`, `createFileMessageFromFullPath`, `createTextMessage`, `createTextAtMessage`, `createImageMessageByURL`, `createSoundMessageByURL`, `createVideoMessageByURL`, `createFileMessageByURL`, `createMergerMessage`, `createForwardMessage`, `createLocationMessage`, `createQuoteMessage`, `createCardMessage`, `createCustomMessage`, `createFaceMessage`

**消息操作（14 个）：**
- `sendMessage`, `sendMessageNotOss`, `typingStatusUpdate`, `changeInputStates`, `getInputStates`, `revokeMessage`, `deleteMessage`, `deleteMessageFromLocalStorage`, `deleteAllMsgFromLocal`, `deleteAllMsgFromLocalAndSvr`, `searchLocalMessages`, `getAdvancedHistoryMessageList`, `getAdvancedHistoryMessageMessageListReverse`, `findMessageList`, `insertGroupMessageToLocalStorage`, `insertSingleMessageToLocalStorage`, `setMessageLocalEx`

**工具方法（4 个）：**
- `uploadLogs`, `logs`, `unInitSDK`, `updateFcmToken`, `setAppBadge`

### 4.2 IMModule（ItcModule 模式）方法

见 2.1 节，仅暴露常用方法子集。

---

## 5. 错误处理

### 5.1 OpenIMApiError

```typescript
class OpenIMApiError extends Error {
  code: number;
  message: string;
  method?: string;

  constructor(code: number, message: string, method?: string);
}
```

### 5.2 ItcError 映射

| 原生错误码 | ErrorCode | 场景 |
|-----------|-----------|------|
| SDK 未初始化 | `IM_SDK_NOT_INIT` | 调用前未 initSDK |
| 未登录 | `IM_NOT_LOGIN` | 未登录调用需登录方法 |
| 网络错误 | `IM_NETWORK_ERROR` | 连接失败/超时 |

```typescript
import { ItcError, ErrorCode } from '@itc/base';

try {
  await im.login(userId, token);
} catch (e) {
  if (e instanceof ItcError && e.code === ErrorCode.IM_NOT_LOGIN) {
    // 未登录错误处理
  }
}
```

---

## 6. 平台差异

| 平台 | 实现状态 | 说明 |
|------|----------|------|
| Android | ✅ 已实现 | Kotlin TurboModule |
| iOS | ✅ 已实现 | ObjC++ TurboModule |
| 鸿蒙 NEXT | ⚠️ 待实现 | 需 PoC：自编译 openim-sdk-core(Go) 为 OHOS .so + ArkTS NAPI |

---

## 7. 依赖关系

**peerDependencies：**
- `@itc/base`：依赖 `BaseModule`、`eventBus`、`ItcError`、`logger`
- `react`：`*`
- `react-native`：>= 0.77.0

**内部依赖：**
- `@itc/base`（workspace）

**外部依赖：**
- OpenIM SDK（原生实现）

---

## 8. 使用示例

### 8.1 ItcModule 模式（推荐）

```typescript
import { im } from '@itc/rn-client-sdk-plus';
import { eventBus } from '@itc/base';

// 初始化
await im.init({
  apiAddr: 'https://api.example.com',
  wsAddr: 'wss://ws.example.com',
});

// 监听连接状态
eventBus.on('im:connectionChanged', (state) => {
  console.log('连接状态:', state);
});

// 登录
await im.login('user123', 'token');

// 发送消息
const msg = await im.sendText('conversation_id', 'Hello');

// 登出
await im.destroy();
```

### 8.2 直接 SDK 模式（高级用户）

```typescript
import { itcOpenIM, eventBus } from '@itc/rn-client-sdk-plus';

// 监听所有事件
eventBus.on('im:newMessage', (msg) => {
  console.log('收到消息:', msg);
});

// 调用完整 OpenIM API
await itcOpenIM.initSDK({ apiAddr: '...', wsAddr: '...' });
await itcOpenIM.login({ userID: 'user123', token: '...' });

// 创建图片消息
const imageMsg = await itcOpenIM.createImageMessageFromFullPath('/path/to/image.jpg');

// 创建群组
const groupInfo = await itcOpenIM.createGroup({
  groupType: 2,
  groupName: '测试群',
  memberList: [{ userID: 'user456' }],
});
```

### 8.3 消息类型枚举

```typescript
import { MessageType } from '@itc/rn-client-sdk-plus';

const TEXT = MessageType.TEXT;        // 101
const IMAGE = MessageType.IMAGE;      // 102
const SOUND = MessageType.SOUND;      // 103
const VIDEO = MessageType.VIDEO;      // 104
const FILE = MessageType.FILE;        // 105
const AT = MessageType.AT;            // 106
const MERGER = MessageType.MERGER;    // 107
const CARD = MessageType.CARD;        // 108
const LOCATION = MessageType.LOCATION;// 109
const CUSTOM = MessageType.CUSTOM;    // 110
const QUOTE = MessageType.QUOTE;      // 111
```

---

## 9. 导出清单

```typescript
// ============ ItcModule 模式 ============
export { IMModule };
export const im: IMModule;

// ============ 直接 SDK 模式 ============
export { ItcOpenIM };
export const itcOpenIM: ItcOpenIM;
export default itcOpenIM;

// ============ 类型导出 ============
export * from './types/entity';
export * from './types/enum';
export * from './types/eventArgs';
export * from './types/params';
export { OpenIMApiError } from './errors/OpenIMApiError';

// ============ 事件发射器 ============
export { NativeItcOpenIM as ItcOpenIMEmitter } from './ItcOpenIMSDK';
```

---

## 10. 注意事项

1. **operationID**：每个 SDK 调用必须附带 operationID，用于日志追踪和错误定位
2. **参数序列化**：TurboModule 约束导致所有对象参数必须序列化为 JSON 字符串
3. **平台 ID**：Android=2，iOS=1（自动根据 Platform.OS 设置）
4. **dataDir**：自动设置默认值（Android: `open_im_android`，iOS: `openim_ios`）
5. **事件泄漏**：`onDestroy` 时移除核心事件监听，防止内存泄漏
6. **鸿蒙支持**：当前仅 Android/iOS 可用，鸿蒙需独立 PoC
