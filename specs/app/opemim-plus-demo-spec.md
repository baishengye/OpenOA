# OpenIM Plus Demo 应用规格说明书

## 1. 应用概述

### 1.1 应用定位
OpenIM Plus Demo 是一个类钉钉即时通讯应用，用于演示 `@itc/im` SDK 与 `@itc/uikit` 组件库的深度集成。应用覆盖登录、会话列表、聊天、个人资料、设置等核心场景。

### 1.2 目标用户
内部开发团队，用于快速验证 IM SDK 能力与 UI 组件的协同效果。

### 1.3 技术栈
- **框架**：React Native 0.83+ (New Architecture)
- **状态管理**：Zustand (轻量级，~1kb，支持持久化)
- **列表**：@shopify/flash-list (via @itc/flash-list)
- **UI 组件**：tamagui (via @itc/uikit)
- **IM 能力**：@itc/im (OpenIM SDK)
- **持久化**：Zustand persist middleware + @itc/storage (MMKV)
- **生物识别**：@itc/biometric
- **权限**：@itc/permission
- **文件**：@itc/fs
- **文档选择**：@itc/document-picker

---

## 2. 应用结构

### 2.1 目录结构

```
apps/oa/src/screens/opemim-plus-demo/
├── index.tsx                          # 入口 + 路由配置
├── config/
│   └── index.ts                      # API 配置常量
│       ├── API_ADDR                   # IM API 地址
│       ├── WS_ADDR                    # IM WebSocket 地址
│       └── LOGIN_API                   # 后端登录接口
├── components/
│   ├── ChatInput/                     # 聊天输入框
│   │   ├── index.tsx
│   │   ├── MoreActions.tsx            # 更多功能面板
│   │   ├── VoiceRecord.tsx            # 语音录制
│   │   └── EmojiPicker.tsx             # 表情选择器
│   ├── MessageBubble/                  # 消息气泡
│   │   ├── index.tsx
│   │   ├── TextMessage.tsx             # 文本消息
│   │   ├── ImageMessage.tsx            # 图片消息
│   │   ├── VideoMessage.tsx            # 视频消息
│   │   ├── AudioMessage.tsx            # 语音消息
│   │   ├── FileMessage.tsx             # 文件消息
│   │   ├── LocationMessage.tsx          # 位置消息
│   │   └── QuoteMessage.tsx            # 引用消息
│   ├── ConversationItem/               # 会话列表项
│   │   └── index.tsx
│   └── UserAvatar/                    # 用户头像
│       └── index.tsx
├── screens/
│   ├── LoginScreen.tsx                 # 登录页
│   ├── ConversationListScreen.tsx      # 会话列表页
│   ├── ChatScreen.tsx                  # 聊天页
│   ├── PersonalInfoScreen.tsx           # 个人资料页
│   └── SettingsScreen.tsx              # 设置页
├── hooks/
│   ├── useIM.ts                        # IM SDK 初始化与连接
│   ├── useConversationList.ts          # 会话列表 Hook
│   ├── useChat.ts                      # 聊天消息 Hook
│   └── useBiometric.ts                 # 生物识别 Hook
├── services/
│   ├── authService.ts                # 后端认证服务 (LOGIN_API)
│   ├── imService.ts                  # IM SDK 业务封装
│   └── biometricService.ts           # 生物识别服务
├── config/
│   └── index.ts                      # API 配置常量
├── stores/
│   ├── authStore.ts                  # 认证状态 (Zustand)
│   ├── chatStore.ts                  # 聊天状态 (Zustand)
│   └── settingsStore.ts              # 设置状态 (Zustand)
└── types/
    └── index.ts                        # 共享类型定义
```

### 2.2 导航结构

```
StackNavigator (根导航)
├── LoginScreen                        # 登录页
└── MainTabs (TabNavigator)
    ├── Tab: 会话
    │   └── Stack: 会话栈
    │       ├── ConversationListScreen  # 会话列表
    │       └── ChatScreen             # 聊天页
    ├── Tab: 我的
    │   └── Stack: 我的栈
    │       ├── PersonalInfoScreen     # 个人资料
    │       └── SettingsScreen         # 设置页
```

---

## 3. 页面详细规格

### 3.1 LoginScreen (登录页)

#### 3.1.1 功能描述
支持账号密码登录、记住密码、生物识别快捷登录。

#### 3.1.2 UI 布局

```
┌─────────────────────────────────┐
│         SafeAreaView            │
│  ┌───────────────────────────┐  │
│  │       Logo (居中)         │  │
│  │       AppName             │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ PhoneInput (手机号输入)   │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ PasswordInput (密码输入)   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ [ ] 记住密码              │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │     登录 Button            │  │
│  └───────────────────────────┘  │
│                                 │
│       🔓 生物识别快捷登录       │
│                                 │
│  ┌───────────────────────────┐  │
│  │   服务器配置 (调试用)     │  │
│  │   IP: [____________]       │  │
│  │   Port: [____]            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

#### 3.1.3 核心逻辑

**API 配置**：
```typescript
const API_ADDR = 'http://172.16.204.62:10002';     // IM API 地址
const WS_ADDR = 'ws://172.16.204.62:10001';       // IM WebSocket 地址
const LOGIN_API = 'http://172.16.204.62:10008/account/login'; // 登录接口
```

**登录流程（两阶段）**：

```
┌─────────────────────────────────────────────────────────────┐
│  阶段一：后端认证                                            │
│  POST LOGIN_API                                             │
│  Body: { phone: string, password: string }                  │
│  ↓                                                         │
│  Response: { userID: string, token: string }                │
│                                                              │
│  阶段二：IM SDK 登录                                         │
│  await im.login(userID, token)                              │
│  ↓                                                         │
│  连接 WebSocket                                             │
└─────────────────────────────────────────────────────────────┘
```

1. 检查本地存储是否有记住的账号密码
2. 检查生物识别是否可用且有已保存的凭证
3. 显示登录表单，预填充已记住的账号
4. 用户点击登录 → 调用 `LOGIN_API` 获取 `userID` + `token`
5. 调用 `im.login(userID, token)` 登录 IM SDK
6. 登录成功 → 存储凭证 → 跳转会话列表

**生物识别登录**：
1. 用户点击生物识别快捷登录
2. 调用 `biometric.authenticate({ title: '登录验证' })`
3. 认证成功 → 使用本地存储的凭证 → 调用 `im.login()`
4. 如果 token 过期 → 重新调用 `LOGIN_API` 刷新 token → 再登录 IM

**记住密码**：
- 存储 phone + encryptedPassword 到 MMKV
- 存储 userID + token 用于后续免密登录
- 生物识别密钥绑定凭证，用于后续免密登录

#### 3.1.4 使用的 @itc 包

| 包 | 用途 |
|---|---|
| @itc/im | `login()` 方法 |
| @itc/storage | 持久化 userID、token |
| @itc/biometric | `authenticate()`, `signWithKey()` |
| @itc/uikit | Input, Button, Checkbox, XStack, YStack |

#### 3.1.5 认证服务接口

```typescript
// services/authService.ts

// POST LOGIN_API
interface LoginRequest {
  phone: string;
  password: string;
}

interface LoginResponse {
  userID: string;
  token: string;
}

async function login(phone: string, password: string): Promise<LoginResponse> {
  const response = await fetch(LOGIN_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  if (!response.ok) {
    throw new Error('登录失败，请检查账号密码');
  }
  return response.json();
}
```

---

### 3.2 ConversationListScreen (会话列表页)

#### 3.2.1 功能描述
展示所有会话，支持置顶、免打扰、会话未读数显示、下拉刷新。

#### 3.2.2 UI 布局

```
┌─────────────────────────────────┐
│  NavBar: 会话          [+新会话]│
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 🔍 搜索会话              │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│  FlashList                      │
│  ┌───────────────────────────┐  │
│  │ [头像] 昵称/群名    09:30 │  │
│  │      最新消息...    [99+] │  │
│  ├───────────────────────────┤  │
│  │ [头像] 昵称/群名    昨天 │  │
│  │      [语音] 你好...      │  │
│  ├───────────────────────────┤  │
│  │ ...                       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

#### 3.2.3 核心逻辑

**数据获取**：
```typescript
const conversations = await im.getAllConversationList();
```

**事件监听**：
- `im:newMessage` → 更新会话最新消息 + 未读数
- `im:conversationChanged` → 刷新会话列表
- `im:totalUnreadChanged` → 更新底部 Tab 未读数

**交互**：
- 左滑会话 → 显示置顶/删除选项
- 点击会话 → 跳转 ChatScreen
- 长按会话 → 显示操作菜单（置顶、免打扰、删除）

**状态管理**：
- 会话列表缓存本地，按 `conversationID` 索引
- 支持增量更新，避免全量刷新

#### 3.2.4 使用的 @itc 包

| 包 | 用途 |
|---|---|
| @itc/im | `getAllConversationList()`, `pinConversation()`, 事件监听 |
| @itc/flash-list | FlashList 高性能列表 |
| @itc/uikit | List, Avatar, Badge, XStack, YStack, PopupMenu |

---

### 3.3 ChatScreen (聊天页)

#### 3.3.1 功能描述
支持多种消息类型（文本、图片、语音、视频、文件、位置、引用消息），支持消息发送、撤回、回复、复制。

#### 3.3.2 UI 布局

```
┌─────────────────────────────────┐
│ NavBar: 昵称/群名    [···更多]  │
├─────────────────────────────────┤
│                                 │
│  FlashList (MessageList)        │
│  ┌───────────────────────────┐  │
│  │        [时间: 09:30]      │  │
│  ├───────────────────────────┤  │
│  │  [头像]                   │  │
│  │  [气泡] 你好              │  │
│  ├───────────────────────────┤  │
│  │           [气泡] 你好啊   │  │
│  │                    [头像] │  │
│  ├───────────────────────────┤  │
│  │        [时间: 10:15]      │  │
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│ ChatInput                       │
│ ┌─────┬─────────────────────┐  │
│ │ 🎤  │ 请输入消息...       │  │😀 │
│ └─────┴─────────────────────┘  │
│ ┌───────────────────────────┐  │
│ │ [+] [📷] [🎥] [📁] [📍]  │  │
│ └───────────────────────────┘  │
└─────────────────────────────────┘
```

#### 3.3.3 消息类型处理

| 消息类型 | SDK 方法 | 渲染组件 |
|---|---|---|
| 文本 | `createTextMessage()` | TextMessage |
| 图片 | `createImageMessageFromFullPath()` | ImageMessage |
| 视频 | `createVideoMessageFromFullPath()` | VideoMessage |
| 语音 | `createSoundMessageFromFullPath()` | AudioMessage |
| 文件 | `createFileMessageFromFullPath()` | FileMessage |
| 位置 | `createLocationMessage()` | LocationMessage |
| 引用 | `createQuoteMessage()` | QuoteMessage |

#### 3.3.4 核心逻辑

**消息加载**：
```typescript
// 获取历史消息
const messages = await im.getHistoryMessageList({
  userID: isSingleChat ? friendID : undefined,
  groupID: isGroupChat ? groupID : undefined,
  count: 20,
  startClientMsgID: lastMsgID,
});

// 发送消息
const msg = await im.sendMessage(newMsg, {
  senderID: myUserID,
  receiverID: friendID,
  groupID: isGroupChat ? groupID : undefined,
});
```

**事件监听**：
- `im:newMessage` → 追加消息到列表，播放提示音
- `im:typingStatus` → 显示"对方正在输入..."
- `im:kickedOffline` → 弹出提示，重新登录
- `im:tokenExpired` → 自动刷新 token

**输入框功能**：
- 文本输入 + 发送
- 表情选择器
- 语音录制（权限：麦克风）
- 图片选择（权限：相册/相机）
- 视频拍摄（权限：相机/麦克风）
- 文件选择（@itc/document-picker）
- 位置发送（权限：位置）

**交互**：
- 长按消息 → 显示操作菜单（复制、回复、撤回、删除）
- 点击图片/视频 → 全屏预览
- 点击语音 → 播放音频
- 点击文件 → 打开/下载

#### 3.3.5 使用的 @itc 包

| 包 | 用途 |
|---|---|
| @itc/im | 消息创建、发送、历史记录、事件监听 |
| @itc/flash-list | MessageList 消息列表 |
| @itc/permission | 麦克风、相机、相册、位置权限 |
| @itc/document-picker | 文件选择 |
| @itc/fs | 保存/读取媒体文件 |
| @itc/uikit | Dialog, Toast, Avatar, XStack, YStack, PopupMenu |

---

### 3.4 PersonalInfoScreen (个人资料页)

#### 3.4.1 功能描述
展示当前用户信息，支持修改昵称、头像。

#### 3.4.2 UI 布局

```
┌─────────────────────────────────┐
│ NavBar: 个人资料      [编辑]   │
├─────────────────────────────────┤
│                                 │
│       [头像] (点击修改)         │
│        昵称                     │
│       手机号: 138****8888       │
│                                 │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 我的二维码              > │  │
│  ├───────────────────────────┤  │
│  │ 二维码名片              > │  │
│  ├───────────────────────────┤  │
│  │ 手机号码              > │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

#### 3.4.3 核心逻辑

```typescript
const userInfo = await im.getSelfUserInfo();
```

- 修改头像 → 调用 `@itc/document-picker` 选择图片 → 上传 → 更新 IM 资料
- 修改昵称 → 输入弹窗 → 调用 `im.setSelfInfo({ nickname })`

#### 3.4.4 使用的 @itc 包

| 包 | 用途 |
|---|---|
| @itc/im | `getSelfUserInfo()`, `setSelfInfo()` |
| @itc/document-picker | 图片选择 |
| @itc/uikit | Avatar, Input, Dialog, XStack, YStack |

---

### 3.5 SettingsScreen (设置页)

#### 3.5.1 功能描述
应用设置，包括通知、隐私、账号安全、清除缓存、退出登录。

#### 3.5.2 UI 布局

```
┌─────────────────────────────────┐
│ NavBar: 设置                    │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ 新消息通知            [✓] │  │
│  ├───────────────────────────┤  │
│  │ 声音                   [✓] │  │
│  ├───────────────────────────┤  │
│  │ 震动                   [✓] │  │
│  ├───────────────────────────┤  │
│  │ 免打扰模式            [ ] │  │
│  ├───────────────────────────┤  │
│  │ 语音和视频通话        [ ] │  │
│  ├───────────────────────────┤  │
│  │ 清理缓存              >  │  │
│  ├───────────────────────────┤  │
│  │ 关于                   >  │  │
│  ├───────────────────────────┤  │
│  │ 退出登录 (红色)       >  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

#### 3.5.3 核心逻辑

**退出登录**：
```typescript
await im.logout();
storage.clearAll();
navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
```

**清除缓存**：
```typescript
// 清理图片、视频、音频缓存
const cacheSize = await fs.getCacheSize?.() ?? '0 MB';
await fs.clearCache?.();
Toast.show('缓存已清理');
```

**设置持久化**：
- 使用 `@itc/storage` 保存用户偏好设置
- 设置项：`notifyEnabled`, `soundEnabled`, `vibrateEnabled`, `doNotDisturb`

#### 3.5.4 使用的 @itc 包

| 包 | 用途 |
|---|---|
| @itc/im | `logout()` |
| @itc/storage | 设置持久化 |
| @itc/fs | 缓存清理 |
| @itc/uikit | Switch, XStack, YStack, Dialog, Toast |

---

## 4. 通用组件规格

### 4.1 ConversationItem (会话列表项)

```typescript
interface ConversationItemProps {
  conversation: ConversationItem;
  onPress: () => void;
  onLongPress: () => void;
}
```

| 字段 | 说明 |
|---|---|
| avatar | 用户/群头像，使用 Avatar 组件 |
| title | 昵称/群名 |
| subtitle | 最新消息预览（文本截断，表情替换） |
| time | 格式化时间（刚刚/时分/日期） |
| unread | 未读数 Badge |
| pinned | 置顶标识 |
| muted | 免打扰标识 |

### 4.2 MessageBubble (消息气泡)

```typescript
interface MessageBubbleProps {
  message: MessageItem;
  isOwn: boolean;        // 是否自己发送
  showAvatar: boolean;   // 是否显示头像
  onLongPress: () => void;
}
```

| 样式 | 自己发送 | 对方接收 |
|---|---|---|
| 气泡颜色 | 蓝色 | 灰色 |
| 气泡位置 | 右侧 | 左侧 |
| 头像位置 | 右侧 | 左侧 |

### 4.3 ChatInput (聊天输入框)

```typescript
interface ChatInputProps {
  conversationType: 'single' | 'group';
  onSendText: (text: string) => void;
  onSendImage: (path: string) => void;
  onSendVideo: (path: string) => void;
  onSendFile: (path: string) => void;
  onSendLocation: (lat: number, lng: number, name: string) => void;
  onSendVoice: (path: string, duration: number) => void;
}
```

| 功能 | 触发方式 | 权限 |
|---|---|---|
| 语音 | 🎤 按钮 | 麦克风 |
| 图片 | 📷 按钮 | 相册 |
| 拍照 | 长按 📷 | 相机 |
| 视频 | 🎥 按钮 | 相机 + 麦克风 |
| 文件 | 📁 按钮 | - |
| 位置 | 📍 按钮 | 位置 |

### 4.4 UserAvatar (用户头像)

```typescript
interface UserAvatarProps {
  userID: string;
  size?: number;
  source?: string;  // 优先使用传入的 source
}
```

| 优先级 | 来源 |
|---|---|
| 1 | 传入的 `source` 属性 |
| 2 | 本地缓存的头像 URL |
| 3 | IM SDK 获取的用户信息 |
| 4 | 默认头像（首字母） |

---

## 5. 数据流设计

### 5.1 认证数据流（两阶段登录）

```
┌─────────────────────────────────────────────────────────────┐
│                     LoginScreen                              │
│                                                              │
│  [1] 检查本地存储                                             │
│      ├── 有记住密码 → 自动填充 phone                          │
│      └── 无 → 显示空表单                                     │
│                                                              │
│  [2] 检查生物识别                                            │
│      └── 可用 → 显示快捷登录入口                             │
│                                                              │
│  [3] 用户登录（阶段一：后端认证）                            │
│      └── POST LOGIN_API                                     │
│          Body: { phone, password }                           │
│          ↓                                                   │
│          Response: { userID, token }                         │
│                                                              │
│  [4] IM SDK 登录（阶段二）                                   │
│      └── im.login(userID, token)                            │
│          ↓                                                   │
│          连接 WebSocket                                      │
│                                                              │
│  [5] 存储凭证                                                │
│      ├── storage.set('user_id', userID)                     │
│      ├── storage.set('auth_token', token)                   │
│      └── biometric.createKey() 绑定密钥                     │
│                                                              │
│  [6] 跳转主页面                                              │
│      └── navigation.reset → MainTabs                         │
└─────────────────────────────────────────────────────────────┘
```

**生物识别快捷登录流程**：
```
用户点击 🔓
    ↓
biometric.authenticate()
    ↓
成功 → 读取本地 userID + token
    ↓
尝试 im.login(userID, token)
    ↓
Token 有效 → 登录成功
Token 过期 → POST LOGIN_API 刷新 → im.login()
```

### 5.2 消息数据流

```
┌─────────────────────────────────────────────────────────────┐
│                     ChatScreen                               │
│                                                              │
│  [1] 初始化                                                   │
│      └── im.getHistoryMessageList() → 加载历史消息          │
│                                                              │
│  [2] 监听新消息                                              │
│      └── eventBus.on('im:newMessage') → 追加到列表          │
│                                                              │
│  [3] 发送消息                                                │
│      ├── 创建消息体                                          │
│      ├── 更新本地 UI                                         │
│      ├── im.sendMessage() → 服务端                          │
│      └── 发送失败 → 显示重试按钮                             │
│                                                              │
│  [4] 标记已读                                                │
│      └── im.markConversationMessageAsRead()                 │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 状态管理架构 (Zustand)

使用 Zustand 管理全局状态，无需 Provider 包裹，直接在组件中调用 hook。

```
├── authStore.ts        # 认证状态
│   ├── user: UserInfo | null
│   ├── token: string | null
│   ├── isLoggedIn: boolean
│   ├── login()
│   ├── logout()
│   └── updateUserInfo()
│
├── chatStore.ts        # 聊天状态
│   ├── conversations: ConversationItem[]
│   ├── currentMessages: MessageItem[]
│   ├── typingUsers: string[]
│   ├── totalUnread: number
│   ├── addMessage()
│   ├── updateMessage()
│   ├── deleteMessage()
│   ├── setTypingStatus()
│   └── refreshConversations()
│
└── settingsStore.ts    # 设置状态
    ├── settings: UserSettings
    ├── updateSettings()
    └── resetSettings()
```

#### 持久化示例

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@itc/storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      login: (user, token) => set({ user, token, isLoggedIn: true }),
      logout: () => set({ user: null, token: null, isLoggedIn: false }),
      updateUserInfo: (info) => set((state) => ({ user: { ...state.user, ...info } })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage), // 使用 @itc/storage
    }
  )
);
```

---

## 6. 错误处理

### 6.1 网络错误
- 网络断开 → 显示 Toast "网络不可用"，自动重连
- 请求超时 → 显示 Toast "请求超时，请重试"

### 6.2 登录错误
- 账号密码错误 → 显示 Dialog 提示
- Token 过期 → 自动刷新或跳转登录页
- 被踢下线 → 显示 Dialog "您的账号已在其他设备登录"，跳转登录页

### 6.3 消息错误
- 发送失败 → 消息气泡显示红色感叹号，点击重试
- 图片加载失败 → 显示占位图，点击重新加载

### 6.4 权限错误
- 权限拒绝 → 显示 Dialog 引导去设置开启
- 权限永久拒绝 → 显示 Dialog 并提供"去设置"按钮

---

## 7. 性能优化

### 7.1 列表优化
- 使用 `FlashList` 替代 `FlatList`，提升大数据量渲染性能
- 使用 `MessageList` 组件，支持自动跳转到未读位置
- 消息列表使用虚拟化，仅渲染可视区域消息
- 图片懒加载，进入可视区域才加载

### 7.2 消息发送优化
- 乐观更新：发送时立即显示消息，发送成功更新状态
- 失败重试：发送失败显示重试按钮，用户可手动重试
- 本地缓存：消息先存储本地，发送成功同步服务端

### 7.3 图片处理
- 缩略图：发送前压缩图片，减少上传时间
- 渐进加载：先加载低分辨率，再加载高分辨率
- 缓存：已加载的图片缓存到本地，避免重复下载

---

## 8. 安全考虑

### 8.1 账号安全
- 密码本地加密存储
- 生物识别密钥绑定设备，不可导出
- Token 有时效性，过期自动刷新

### 8.2 隐私保护
- 聊天数据本地加密存储
- 敏感信息（如密码）不在日志中输出
- 退出登录时清除所有本地数据

---

## 9. 依赖版本

| 包 | 版本 | 用途 |
|---|---|---|
| react | 19.x | React 核心 |
| react-native | 0.83+ | 跨平台框架 |
| zustand | 5.x | 轻量级状态管理 |
| @itc/im | latest | IM SDK |
| @itc/uikit | latest | UI 组件库 |
| @itc/flash-list | latest | 高性能列表 |
| @itc/storage | latest | 持久化存储 |
| @itc/biometric | latest | 生物识别 |
| @itc/permission | latest | 权限管理 |
| @itc/fs | latest | 文件系统 |
| @itc/document-picker | latest | 文档选择 |
| @tamagui/core | 1.x | 原子化 CSS |
| react-native-reanimated | 4.x | 动画 |
| react-native-gesture-handler | 2.x | 手势 |

---

## 10. 附录

### 10.1 IM SDK 核心 API 速查

```typescript
// 登录
im.login(userID: string, token: string): Promise<void>
im.logout(): Promise<void>
im.getLoginStatus(): LoginStatus
im.getCurrentUserID(): string

// 消息
im.sendMessage(message: MessageItem, options: SendMessageOptions): Promise<MessageItem>
im.getHistoryMessageList(params: GetMessageOptions): Promise<MessageItem[]>
im.revokeMessage(message: MessageItem): Promise<void>
im.deleteMessageFromLocalStorage(message: MessageItem): Promise<void>

// 会话
im.getAllConversationList(): Promise<ConversationItem[]>
im.pinConversation(conversationID: string, isPinned: boolean): Promise<void>
im.markConversationMessageAsRead(conversationID: string): Promise<void>
im.setConversationDraft(conversationID: string, draftText: string): Promise<void>

// 用户
im.getSelfUserInfo(): Promise<UserInfo>
im.setSelfInfo(info: Partial<UserInfo>): Promise<void>
im.getUsersInfo(userIDs: string[]): Promise<UserInfo[]>

// 群组
im.createGroup(groupInfo: CreateGroupParams): Promise<GroupInfo>
im.inviteUserToGroup(groupID: string, userIDs: string[]): Promise<void>
im.quitGroup(groupID: string): Promise<void>
im.getGroupMemberList(groupID: string): Promise<GroupMember[]>

// 事件
im.on(event: string, listener: Function): void
im.off(event: string, listener: Function): void
```

### 10.2 事件类型速查

```typescript
// 消息事件
'im:newMessage'           // 新消息
'im:msgListChanged'       // 消息列表变更
'im:typingStatus'         // 对方正在输入

// 会话事件
'im:conversationChanged'  // 会话列表变更
'im:totalUnreadChanged'   // 总未读数变更

// 账号事件
'im:kickedOffline'        // 被踢下线
'im:tokenExpired'         // Token 过期
'im:userStatusChanged'    // 用户状态变更
```
