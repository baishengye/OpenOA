# @itc/permission 模块规范

## 1. 概述

**@itc/permission** 是 OpenOA 项目的权限管理模块，通过 `PermissionProvider` 接口抽象权限能力，统一封装 iOS/Android/HarmonyOS 三端的原生权限 API，提供跨平台一致的权限申请体验。

**核心职责：**
- 统一权限检查 API（check / checkMultiple）
- 统一权限请求 API（request / requestMultiple）
- 统一设置页面跳转（openSettings）
- 封装 HarmonyOS 原生权限库（@react-native-ohos/react-native-permissions）

**设计原则：**
- 接口驱动：`PermissionProvider` 接口隔离具体实现
- 三端一致：JS API 跨平台统一，原生差异由底层库透明处理
- 按需引入：只引入实际使用的权限类型，避免打包无用代码

**版本对应：**

| 平台 | npm 包 | 版本 | 说明 |
|------|--------|------|------|
| iOS | `react-native-permissions` | 5.6.0+ | 官方包，支持 LocationAccuracy、Photo Picker 等新 API |
| Android | `react-native-permissions` | 5.6.0+ | 官方包，支持精确闹钟等新 API |
| HarmonyOS | `@react-native-ohos/react-native-permissions` | ~5.4.3 | RNOH 移植包 |

---

## 2. 核心接口

### 2.1 PermissionProvider 接口

```typescript
interface PermissionProvider {
  /** 检查单个权限状态 */
  check(permission: string): Promise<PermissionStatus>;

  /** 检查多个权限状态 */
  checkMultiple(permissions: string[]): Promise<Record<string, PermissionStatus>>;

  /** 请求单个权限 */
  request(permission: string): Promise<PermissionStatus>;

  /** 请求多个权限 */
  requestMultiple(permissions: string[]): Promise<Record<string, PermissionStatus>>;

  /** 打开系统设置页面 */
  openSettings(): Promise<void>;

  /** 检查通知权限（部分平台） */
  checkNotifications?(): Promise<NotificationPermissionResult>;

  /** 请求通知权限（部分平台） */
  requestNotifications?(options?: NotificationOptions): Promise<NotificationPermissionResult>;

  // ── Android 5.6.0+ 专用方法 ──────────────────────────────────────────────

  /** 检查是否可以设置精确闹钟（Android 12+） */
  canScheduleExactAlarms?(): Promise<boolean>;

  // ── iOS 5.6.0+ 专用方法 ──────────────────────────────────────────────────

  /** 检查位置精确度（iOS 14+） */
  checkLocationAccuracy?(): Promise<LocationAccuracy>;

  /** 请求位置精确度（iOS 14+） */
  requestLocationAccuracy?(options?: { purposeKey?: string }): Promise<LocationAccuracy>;

  /** 打开联系人选择器（iOS 18+） */
  openContactPicker?(): Promise<boolean>;

  /** 打开照片选择器（iOS 14+） */
  openPhotoPicker?(): Promise<boolean>;
}
```

### 2.1.1 位置精确度类型

```typescript
type LocationAccuracy = 'full' | 'reduced';
```

| 值 | 说明 |
|----|------|
| `full` | 完整精确位置 |
| `reduced` | 降低精确度（节能模式） |
```

### 2.2 权限状态类型

```typescript
type PermissionStatus =
  | 'UNAVAILABLE'   // 设备不支持该功能
  | 'DENIED'        // 权限被拒绝（可再次请求）
  | 'BLOCKED'       // 权限被永久拒绝（需跳转设置）
  | 'GRANTED'       // 权限已授权
  | 'LIMITED';      // 权限受限授权（如 iOS 照片有限访问）
```

> **平台不支持的处理**：当权限常量后缀不包含当前平台时（如 `READ_DOCUMENT_AI` 在 HarmonyOS 上调用），应返回 `'UNAVAILABLE'`。业务代码应根据此状态判断是否继续相关功能，而非直接报错。

### 2.3 通知权限类型

```typescript
interface NotificationPermissionResult {
  status: PermissionStatus;
  settings: boolean;  // 是否开启通知
}

interface NotificationOptions {
  sound?: boolean;
  alert?: boolean;
  badge?: boolean;
  carPlay?: boolean;
  criticalAlert?: boolean;
  provisional?: boolean;
}
```

---

## 3. 预定义权限常量

### 3.1 权限命名规范

权限枚举使用后缀标识支持的平台：
- `A` = Android
- `I` = iOS
- `H` = HarmonyOS
- 组合如 `AIH` = 三端都支持

### 3.2 通用权限（Normal 权限）

用户隐私风险较小的普通系统资源，三端通用：

```typescript
const PERMISSIONS = {
  // ============ 相机相关 ============
  /** 相机 - 三端 */
  CAMERA_AIH: 'camera',

  /** 麦克风 - 三端 */
  MICROPHONE_AIH: 'microphone',

  // ============ 位置相关 ============
  /** 精确位置 - 三端 */
  LOCATION_AIH: 'location',

  /** 模糊位置 - 三端 */
  APPROXIMATELY_LOCATION_AIH: 'approximatelyLocation',

  /** 后台位置 - Android/Harmony */
  LOCATION_BACKGROUND_AH: 'locationBackground',

  // ============ 日历相关 ============
  /** 读日历 - 三端 */
  READ_CALENDAR_AIH: 'readCalendar',

  /** 写日历 - 三端 */
  WRITE_CALENDAR_AIH: 'writeCalendar',

  /** 读完整日历（包含所有日程） - Harmony */
  READ_WHOLE_CALENDAR_H: 'readWholeCalendar',

  /** 写完整日历（包含所有日程） - Harmony */
  WRITE_WHOLE_CALENDAR_H: 'writeWholeCalendar',

  // ============ 健康相关 ============
  /** 活动识别 - 三端 */
  ACTIVITY_MOTION_AIH: 'activityMotion',

  /** 健康数据 - Android/Harmony */
  READ_HEALTH_DATA_AH: 'readHealthData',

  // ============ 媒体相关 ============
  /** 读媒体文件 - 三端 */
  READ_MEDIA_AIH: 'readMedia',

  /** 媒体位置 - 三端 */
  MEDIA_LOCATION_AIH: 'mediaLocation',

  // ============ 蓝牙相关 ============
  /** 蓝牙连接 - 三端 */
  ACCESS_BLUETOOTH_AIH: 'accessBluetooth',

  /** 蓝牙扫描 - Android/Harmony */
  DISTRIBUTED_DATASYNC_AH: 'distributedDataSync',
} as const;
```

### 3.3 通讯录相关

```typescript
const CONTACT_PERMISSIONS = {
  /** 读联系人 - Android/Harmony */
  READ_CONTACTS_AH: 'readContacts',

  /** 写联系人 - Android/Harmony */
  WRITE_CONTACTS_AH: 'writeContacts',
} as const;
```

### 3.4 通话相关

```typescript
const CALL_PERMISSIONS = {
  /** 读通话记录 - iOS/Harmony */
  READ_CALL_LOG_IH: 'readCallLog',

  /** 写通话记录 - Harmony */
  WRITE_CALL_LOG_H: 'writeCallLog',

  /** 接听电话 - Android/Harmony */
  ANSWER_CALL_AH: 'answerCall',

  /** 拨打电话 - Harmony */
  CALL_PHONE_H: 'callPhone',

  /** 读取手机号 - Harmony */
  READ_PHONE_NUMBERS_H: 'readPhoneNumbers',

  /** 读取手机状态 - Harmony */
  READ_PHONE_STATE_H: 'readPhoneState',
} as const;
```

### 3.5 短信相关

```typescript
const MESSAGE_PERMISSIONS = {
  /** 读消息 - Harmony */
  READ_MESSAGES_H: 'readMessages',

  /** 发消息 - Harmony */
  SEND_MESSAGES_H: 'sendMessages',

  /** 收短信 - Harmony */
  RECEIVE_SMS_H: 'receiveSms',

  /** 收彩信 - Harmony */
  RECEIVE_MMS_H: 'receiveMms',

  /** 收WAP消息 - Harmony */
  RECEIVE_WAP_MESSAGES_H: 'receiveWapMessages',

  /** 读蜂窝消息 - Harmony */
  READ_CELL_MESSAGES_H: 'readCellMessages',
} as const;
```

### 3.6 文件/存储相关

```typescript
const STORAGE_PERMISSIONS = {
  /** 读文档 - 三端 */
  READ_DOCUMENT_AIH: 'readDocument',

  /** 写文档 - 三端 */
  WRITE_DOCUMENT_AIH: 'writeDocument',

  /** 读图片/视频 - 三端 */
  READ_IMAGEVIDEO_AIH: 'readImageVideo',

  /** 写图片/视频 - Harmony */
  WRITE_IMAGEVIDEO_H: 'writeImageVideo',

  /** 读音频 - 三端 */
  READ_AUDIO_AIH: 'readAudio',

  /** 写音频 - Harmony */
  WRITE_AUDIO_H: 'writeAudio',
} as const;
```

### 3.7 系统相关

```typescript
const SYSTEM_PERMISSIONS = {
  /** 查询已安装应用 - Android/Harmony */
  GET_INSTALLED_BUNDLE_LIST_AH: 'getInstalledBundleList',

  /** 语音邮件 - Harmony */
  MANAGE_VOICEMAIL_H: 'manageVoicemail',
} as const;
```

### 3.8 HarmonyOS 专属权限

```typescript
const HARMONY_PERMISSIONS = {
  /** 获取当前位置 - Harmony */
  GET_CURRENT_LOCATION_H: 'getCurrentLocation',

  /** 蓝牙发现 - Harmony */
  START_BLUETOOTH_DISCOVERY_H: 'startBluetoothDiscovery',

  /** 蓝牙登录 - Harmony */
  BLUETOOTH_LOGIN_H: 'bluetoothLogin',

  /** 星闪 - Harmony */
  NEARLINK_H: 'nearlink',

  /** WiFi连接 - Harmony */
  WIFI_CONNECT_H: 'wifiConnect',

  /** WiFi热点 - Harmony */
  WIFI_HOTSPOT_H: 'wifiHotspot',

  /** 获取WiFi信息 - Harmony */
  GET_WIFI_INFO_H: 'getWifiInfo',

  /** NFC标签 - Harmony */
  NFC_TAG_H: 'nfcTag',

  /** NFC卡模拟 - Harmony */
  NFC_CARD_EMULATION_H: 'nfcCardEmulation',

  /** 屏幕共享 - Harmony */
  SCREEN_SHARE_H: 'screenShare',

  /** 应用使用统计 - Harmony */
  APP_USAGE_STATS_H: 'appUsageStats',

  /** 通知控制 - Harmony */
  NOTIFICATIONS_H: 'notifications',

  /** 订阅通知 - Harmony */
  SUBSCRIBE_NOTIFICATIONS_H: 'subscribeNotifications',

  /** 设备管理器 - Harmony */
  DEVICE_MANAGER_H: 'deviceManager',

  /** 振动 - Harmony */
  VIBRATOR_H: 'vibrator',
} as const;
```

---

## 4. 平台权限映射表

### 4.1 Android 映射

> react-native-permissions 提供的 Android 权限字符串列表：

| 逻辑权限 ID | Android 字符串 |
|------------|---------------|
| `camera` | `android.permission.CAMERA` |
| `microphone` | `android.permission.RECORD_AUDIO` |
| `location` | `android.permission.ACCESS_FINE_LOCATION` |
| `approximatelyLocation` | `android.permission.ACCESS_COARSE_LOCATION` |
| `locationBackground` | `android.permission.ACCESS_BACKGROUND_LOCATION` |
| `readCalendar` | `android.permission.READ_CALENDAR` |
| `writeCalendar` | `android.permission.WRITE_CALENDAR` |
| `activityMotion` | `android.permission.ACTIVITY_RECOGNITION` |
| `readHealthData` | `android.permission.BODY_SENSORS` |
| `readMedia` | `android.permission.READ_MEDIA_IMAGES` |
| `mediaLocation` | `android.permission.ACCESS_MEDIA_LOCATION` |
| `accessBluetooth` | `android.permission.BLUETOOTH_CONNECT` |
| `distributedDataSync` | `android.permission.BLUETOOTH_SCAN` |
| `readContacts` | `android.permission.READ_CONTACTS` |
| `writeContacts` | `android.permission.WRITE_CONTACTS` |
| `readCallLog` | `android.permission.READ_CALL_LOG` |
| `writeCallLog` | `android.permission.WRITE_CALL_LOG` |
| `answerCall` | `android.permission.ANSWER_PHONE_CALLS` |
| `callPhone` | `android.permission.CALL_PHONE` |
| `readPhoneNumbers` | `android.permission.READ_PHONE_NUMBERS` |
| `readPhoneState` | `android.permission.READ_PHONE_STATE` |
| `readMessages` | `android.permission.READ_SMS` |
| `sendMessages` | `android.permission.SEND_SMS` |
| `receiveSms` | `android.permission.RECEIVE_SMS` |
| `receiveMms` | `android.permission.RECEIVE_MMS` |
| `readAudio` | `android.permission.READ_MEDIA_AUDIO` |
| `writeAudio` | `android.permission.WRITE_EXTERNAL_STORAGE` |
| `readDocument` | `android.permission.READ_EXTERNAL_STORAGE` |
| `writeDocument` | `android.permission.WRITE_EXTERNAL_STORAGE` |
| `readImageVideo` | `android.permission.READ_MEDIA_VIDEO` |
| `writeImageVideo` | `android.permission.WRITE_EXTERNAL_STORAGE` |
| `getInstalledBundleList` | `android.permission.QUERY_ALL_PACKAGES` |

**Android 完整权限列表（react-native-permissions）：**
```
ACCEPT_HANDOVER, 
ACCESS_BACKGROUND_LOCATION, 
ACCESS_COARSE_LOCATION,
ACCESS_FINE_LOCATION,
ACCESS_MEDIA_LOCATION, 
ACTIVITY_RECOGNITION,
ADD_VOICEMAIL, 
ANSWER_PHONE_CALLS, 
BLUETOOTH_ADVERTISE, 
BLUETOOTH_CONNECT,
BLUETOOTH_SCAN, 
BODY_SENSORS, 
BODY_SENSORS_BACKGROUND, 
CALL_PHONE, 
CAMERA,
GET_ACCOUNTS, 
NEARBY_WIFI_DEVICES, 
POST_NOTIFICATIONS, 
PROCESS_OUTGOING_CALLS,
READ_CALENDAR, 
READ_CALL_LOG, 
READ_CONTACTS, 
READ_EXTERNAL_STORAGE,
READ_MEDIA_AUDIO, 
READ_MEDIA_IMAGES, 
READ_MEDIA_VIDEO,
READ_MEDIA_VISUAL_USER_SELECTED, 
READ_PHONE_NUMBERS, READ_PHONE_STATE,
READ_SMS, 
RECEIVE_MMS, 
RECEIVE_SMS, 
RECEIVE_WAP_PUSH, 
RECORD_AUDIO,
SEND_SMS, 
USE_SIP, 
UWB_RANGING, 
WRITE_CALENDAR, 
WRITE_CALL_LOG,
WRITE_CONTACTS, 
WRITE_EXTERNAL_STORAGE
```

### 4.2 iOS 映射

> react-native-permissions 提供的 iOS 权限字符串列表：

| 逻辑权限 ID | iOS 字符串 |
|------------|-----------|
| `camera` | `ios.permission.CAMERA` |
| `microphone` | `ios.permission.MICROPHONE` |
| `location` | `ios.permission.LOCATION_WHEN_IN_USE` |
| `approximatelyLocation` | `ios.permission.LOCATION_ALWAYS` |
| `locationBackground` | `ios.permission.LOCATION_ALWAYS` |
| `readCalendar` | `ios.permission.CALENDARS` |
| `writeCalendar` | `ios.permission.CALENDARS` |
| `activityMotion` | `ios.permission.MOTION` |
| `readMedia` | `ios.permission.PHOTO_LIBRARY` |
| `mediaLocation` | `ios.permission.PHOTO_LIBRARY_ADD_ONLY` |
| `accessBluetooth` | `ios.permission.BLUETOOTH` |
| `distributedDataSync` | `ios.permission.BLUETOOTH` |
| `readContacts` | `ios.permission.CONTACTS` |
| `writeContacts` | `ios.permission.CONTACTS` |
| `readAudio` | `ios.permission.MEDIA_LIBRARY` |
| `writeAudio` | `ios.permission.MEDIA_LIBRARY` |
| `readDocument` | `ios.permission.FILES` |
| `writeDocument` | `ios.permission.FILES` |
| `readImageVideo` | `ios.permission.PHOTO_LIBRARY` |
| `writeImageVideo` | `ios.permission.PHOTO_LIBRARY` |

**iOS 完整权限列表（react-native-permissions）：**
```
APP_TRACKING_TRANSPARENCY, 
BLUETOOTH, 
CALENDARS, 
CALENDARS_WRITE_ONLY,
CAMERA, 
CONTACTS, 
FACE_ID, 
LOCATION_ALWAYS, 
LOCATION_WHEN_IN_USE,
MEDIA_LIBRARY, 
MICROPHONE, 
MOTION, 
PHOTO_LIBRARY, 
PHOTO_LIBRARY_ADD_ONLY,
REMINDERS, 
SIRI, 
SPEECH_RECOGNITION, 
STOREKIT
```

**不支持的权限（iOS）：**

| 权限 | 原因 |
|------|------|
| `readCallLog` | iOS 不允许第三方应用访问通话记录 |
| `writeCallLog` | iOS 不允许第三方应用写入通话记录 |
| `answerCall` | iOS 不允许第三方应用接听电话 |
| `callPhone` | iOS 不允许第三方应用拨打电话 |
| `readPhoneNumbers` | iOS 不允许第三方应用读取手机号 |
| `readPhoneState` | iOS 不允许第三方应用读取手机状态 |
| `readMessages` | iOS 不允许第三方应用读取短信 |
| `sendMessages` | iOS 不允许第三方应用发送短信 |
| `receiveSms` | iOS 不允许第三方应用接收短信 |
| `receiveMms` | iOS 不允许第三方应用接收彩信 |
| `receiveWapMessages` | iOS 不允许第三方应用接收 WAP 消息 |
| `readCellMessages` | iOS 不允许第三方应用读取蜂窝消息 |
| `readHealthData` | iOS 使用独立的 HealthKit，需单独集成 |
| `manageVoicemail` | iOS 语音邮件是系统功能，不开放 API |
| 所有 HarmonyOS 专属权限 | iOS 不支持 |

### 4.3 HarmonyOS 映射

> @react-native-ohos/react-native-permissions 提供的 HarmonyOS 权限字符串列表：

| 逻辑权限 ID | HarmonyOS 字符串 |
|------------|-----------------|
| `camera` | `ohos.permission.CAMERA` |
| `microphone` | `ohos.permission.MICROPHONE` |
| `location` | `ohos.permission.LOCATION` |
| `approximatelyLocation` | `ohos.permission.APPROXIMATELY_LOCATION` |
| `locationBackground` | `ohos.permission.LOCATION_IN_BACKGROUND` |
| `readCalendar` | `ohos.permission.READ_CALENDAR` |
| `writeCalendar` | `ohos.permission.WRITE_CALENDAR` |
| `readWholeCalendar` | `ohos.permission.READ_WHOLE_CALENDAR` |
| `writeWholeCalendar` | `ohos.permission.WRITE_WHOLE_CALENDAR` |
| `activityMotion` | `ohos.permission.ACTIVITY_MOTION` |
| `readHealthData` | `ohos.permission.READ_HEALTH_DATA` |
| `readMedia` | `ohos.permission.READ_MEDIA` |
| `mediaLocation` | `ohos.permission.MEDIA_LOCATION` |
| `accessBluetooth` | `ohos.permission.ACCESS_BLUETOOTH` |
| `distributedDataSync` | `ohos.permission.DISTRIBUTED_DATASYNC` |
| `readContacts` | `ohos.permission.READ_CONTACTS` |
| `writeContacts` | `ohos.permission.WRITE_CONTACTS` |
| `readCallLog` | `ohos.permission.READ_CALL_LOG` |
| `writeCallLog` | `ohos.permission.WRITE_CALL_LOG` |
| `answerCall` | `ohos.permission.ANSWER_CALL` |
| `callPhone` | `ohos.permission.CALL_PHONE` |
| `readPhoneNumbers` | `ohos.permission.READ_PHONE_NUMBERS` |
| `readPhoneState` | `ohos.permission.READ_PHONE_STATE` |
| `readMessages` | `ohos.permission.READ_MESSAGES` |
| `sendMessages` | `ohos.permission.SEND_MESSAGES` |
| `receiveSms` | `ohos.permission.RECEIVE_SMS` |
| `receiveMms` | `ohos.permission.RECEIVE_MMS` |
| `receiveWapMessages` | `ohos.permission.RECEIVE_WAP_MESSAGES` |
| `readCellMessages` | `ohos.permission.READ_CELL_MESSAGES` |
| `readAudio` | `ohos.permission.READ_AUDIO` |
| `writeAudio` | `ohos.permission.WRITE_AUDIO` |
| `readDocument` | `ohos.permission.READ_DOCUMENT` |
| `writeDocument` | `ohos.permission.WRITE_DOCUMENT` |
| `readImageVideo` | `ohos.permission.READ_IMAGEVIDEO` |
| `writeImageVideo` | `ohos.permission.WRITE_IMAGEVIDEO` |
| `getInstalledBundleList` | `ohos.permission.GET_INSTALLED_BUNDLE_LIST` |
| `manageVoicemail` | `ohos.permission.MANAGE_VOICEMAIL` |
| `getCurrentLocation` | `ohos.permission.GET_CURRENT_LOCATION` |
| `startBluetoothDiscovery` | `ohos.permission.START_BLUETOOTH_DISCOVERY` |
| `bluetoothLogin` | `ohos.permission.BLUETOOTH_LOGIN` |
| `nearlink` | `ohos.permission.ACCESS_NEARLINK` |
| `wifiConnect` | `ohos.permission.WIFI_CONNECT` |
| `wifiHotspot` | `ohos.permission.WIFI_HOTSPOT` |
| `getWifiInfo` | `ohos.permission.GET_WIFI_INFO` |
| `nfcTag` | `ohos.permission.NFC_TAG` |
| `nfcCardEmulation` | `ohos.permission.NFC_CARD_EMULATION` |
| `screenShare` | `ohos.permission.SCREEN_SHARE` |
| `appUsageStats` | `ohos.permission.APP_USAGE_STATS` |
| `notifications` | `ohos.permission.NOTIFICATION_CONTROLLER` |
| `subscribeNotifications` | `ohos.permission.SUBSCRIBE_NOTIFICATION` |
| `deviceManager` | `ohos.permission.DEVICE_MANAGER` |
| `vibrator` | `ohos.permission.VIBRATE` |

**HarmonyOS 完整权限列表（@react-native-ohos/react-native-permissions）：**
```
LOCATION_IN_BACKGROUND, 
LOCATION, 
APPROXIMATELY_LOCATION, 
CAMERA,
MICROPHONE, 
READ_CALENDAR, 
WRITE_CALENDAR, 
READ_WHOLE_CALENDAR,
WRITE_WHOLE_CALENDAR, 
ACTIVITY_MOTION, 
READ_HEALTH_DATA,
DISTRIBUTED_DATASYNC, 
ANSWER_CALL, 
MANAGE_VOICEMAIL, 
READ_CONTACTS,
WRITE_CONTACTS, 
READ_CALL_LOG, 
WRITE_CALL_LOG, 
READ_CELL_MESSAGES,
READ_MESSAGES, 
RECEIVE_MMS, 
RECEIVE_SMS, 
RECEIVE_WAP_MESSAGES,
SEND_MESSAGES, 
WRITE_AUDIO, 
READ_AUDIO, 
READ_DOCUMENT, 
WRITE_DOCUMENT,
READ_MEDIA, 
WRITE_MEDIA, 
WRITE_IMAGEVIDEO, 
READ_IMAGEVIDEO,
MEDIA_LOCATION, 
APP_TRACKING_CONSENT, 
GET_INSTALLED_BUNDLE_LIST,
ACCESS_BLUETOOTH
```

---

## 5. 全局代理

### 5.1 permission 对象

```typescript
export const permission: PermissionProvider = {
  check: (perm: string) => _provider.check(perm),
  checkMultiple: (perms: string[]) => _provider.checkMultiple(perms),
  request: (perm: string) => _provider.request(perm),
  requestMultiple: (perms: string[]) => _provider.requestMultiple(perms),
  openSettings: () => _provider.openSettings(),
  checkNotifications: () => _provider.checkNotifications?.(),
  requestNotifications: (opts) => _provider.requestNotifications?.(opts),
};
```

### 5.2 后端注入

```typescript
/**
 * 覆盖默认权限后端。用于测试或未来切换权限方案。
 */
export function installPermission(provider: PermissionProvider): void;
```

---

## 6. 默认实现（@react-native-ohos/react-native-permissions）

### 6.1 实现类

```typescript
class ItcPermission implements PermissionProvider {
  async check(permission: string): Promise<PermissionStatus>;

  async checkMultiple(permissions: string[]): Promise<Record<string, PermissionStatus>>;

  async request(permission: string): Promise<PermissionStatus>;

  async requestMultiple(permissions: string[]): Promise<Record<string, PermissionStatus>>;

  async openSettings(): Promise<void>;

  async checkNotifications(): Promise<NotificationPermissionResult>;

  async requestNotifications(options?: NotificationOptions): Promise<NotificationPermissionResult>;
}
```

### 6.2 状态映射

| react-native-permissions 状态 | @itc/permission 状态 |
|------------------------------|---------------------|
| `GRANTED` | `'GRANTED'` |
| `DENIED` | `'DENIED'` |
| `UNAVAILABLE` | `'UNAVAILABLE'` |
| `BLOCKED` | `'BLOCKED'` |
| `LIMITED` | `'LIMITED'` |

---

## 7. Noop 实现

测试或特殊环境下使用：

```typescript
class NoopPermissionProvider implements PermissionProvider {
  check() { return Promise.resolve<PermissionStatus>('GRANTED'); }
  checkMultiple(permissions: string[]) {
    return Promise.resolve(
      Object.fromEntries(permissions.map(p => [p, 'GRANTED']))
    );
  }
  request() { return Promise.resolve<PermissionStatus>('GRANTED'); }
  requestMultiple(permissions: string[]) {
    return Promise.resolve(
      Object.fromEntries(permissions.map(p => [p, 'GRANTED']))
    );
  }
  openSettings() { return Promise.resolve(); }
}
```

---

## 8. 平台差异

| 平台 | 实现包 | Autolink | API 版本 |
|------|--------|----------|----------|
| Android | `react-native-permissions` | 部分支持 | Android 5.0+ (API 21+) |
| iOS | `react-native-permissions` | 部分支持 | iOS 11+ |
| HarmonyOS | `@react-native-ohos/react-native-permissions` | 不支持（需手动配置） | API 8+ |

> **注意**：具体权限可能需要更高的系统版本，例如 Android 13+ 所需的细粒度媒体权限（如 `READ_MEDIA_IMAGES`）、iOS 14+ 所需的本地网络权限等。

### 8.1 HarmonyOS 特殊说明

1. **不支持 Autolink**：版本 ~5.4.3 需手动配置
2. **权限需在 module.json5 中声明**：

```json5
// entry/src/main/module.json5
{
  "requestPermissions": [
    {
      "name": "ohos.permission.CAMERA",
      "reason": "$string:reason",
      "usedScene": {
        "abilities": ["EntryAbility"],
        "when": "inuse"
      }
    },
    {
      "name": "ohos.permission.MICROPHONE",
      "reason": "$string:reason",
      "usedScene": {
        "abilities": ["EntryAbility"],
        "when": "inuse"
      }
    }
  ]
}
```

3. **reason 字段规范**：
   - 保持简洁，不加多余分隔符
   - 建议句式：`用于某事`
   - 示例：`用于扫码拍照`

### 8.2 API 支持差异

| API | Android | iOS | HarmonyOS |
|-----|---------|-----|-----------|
| `check` | ✅ | ✅ | ✅ |
| `checkMultiple` | ✅ | ❌ | ✅ |
| `request` | ✅ | ✅ | ✅ |
| `requestMultiple` | ✅ | ❌ | ✅ |
| `openSettings` | ✅ | ✅ | ✅ |
| `checkNotifications` | ✅ | ✅ | ✅ |
| `requestNotifications` | ✅ | ✅ | ✅ |
| `canScheduleExactAlarms` | ✅ (Android 12+) | ❌ | ❌ |
| `checkLocationAccuracy` | ❌ | ✅ (iOS 14+) | ❌ |
| `requestLocationAccuracy` | ❌ | ✅ (iOS 14+) | ❌ |
| `openContactPicker` | ❌ | ✅ (iOS 18+) | ❌ |
| `openPhotoPicker` | ❌ | ✅ (iOS 14+) | ❌ |

### 8.3 蓝牙权限变更（API 13+）

从 HarmonyOS API 13 开始，原有的蓝牙相关权限组不再使用，统一改为"设备发现和连接"权限组：

- `ohos.permission.ACCESS_BLUETOOTH`
- `ohos.permission.ACCESS_NEARLINK`
- `ohos.permission.DISTRIBUTED_DATASYNC`

---

## 9. 权限申请流程

```
check(permission)
      │
      ▼
┌─────────────────────┐
│ 设备是否支持该功能？  │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
   YES         NO
    │           │
    ▼           ▼
┌────────┐  UNAVAILABLE
│已授权？ │
└───┬────┘
    │
┌───┴────────┐
│            │
  YES         NO
    │           │
    ▼           ▼
 GRANTED    request(permission)
              │
              ▼
      ┌───────────────┐
      │ 用户是否可见并  │
      │ 接受请求？     │
      └───────┬───────┘
              │
        ┌─────┴─────┐
        │           │
       YES         NO
        │           │
        ▼           ▼
    GRANTED      BLOCKED
```

---

## 10. 依赖关系

**dependencies：**
- `react-native-permissions@^5.6.0`（iOS/Android）
- `@react-native-ohos/react-native-permissions@~5.4.3`（HarmonyOS）

**peerDependencies：**
- `react-native`：>= 0.82.0

**内部依赖：**
- 无（permission 不依赖 @itc/base）

---

## 11. 使用示例

### 11.1 检查单个权限

```typescript
import { permission, PERMISSIONS, type PermissionStatus } from '@itc/permission';

async function checkCameraPermission() {
  const status = await permission.check(PERMISSIONS.CAMERA_AIH);

  switch (status) {
    case 'GRANTED':
      console.log('相机权限已授权');
      break;
    case 'DENIED':
      console.log('相机权限被拒绝，可再次请求');
      break;
    case 'BLOCKED':
      console.log('相机权限被永久拒绝，需跳转设置');
      await permission.openSettings();
      break;
    case 'UNAVAILABLE':
      console.log('设备不支持相机');
      break;
  }
}
```

### 11.2 请求单个权限

```typescript
import { permission, PERMISSIONS } from '@itc/permission';

async function requestCameraPermission() {
  const status = await permission.request(PERMISSIONS.CAMERA_AIH);

  if (status === 'GRANTED') {
    console.log('已获得相机权限');
    // 执行相机相关操作
  } else if (status === 'DENIED') {
    console.log('用户拒绝了相机权限请求');
  } else if (status === 'BLOCKED') {
    console.log('权限被永久拒绝，请前往设置开启');
    await permission.openSettings();
  }
}
```

### 11.3 批量检查权限

```typescript
import { permission, PERMISSIONS } from '@itc/permission';

async function checkMultiplePermissions() {
  const permissions = [
    PERMISSIONS.CAMERA_AIH,
    PERMISSIONS.MICROPHONE_AIH,
    PERMISSIONS.ACCESS_BLUETOOTH_AIH,
  ];

  const results = await permission.checkMultiple(permissions);

  for (const [perm, status] of Object.entries(results)) {
    console.log(`${perm}: ${status}`);
  }
}
```

### 11.4 批量请求权限

```typescript
import { permission, PERMISSIONS } from '@itc/permission';

async function requestMultiplePermissions() {
  const permissions = [
    PERMISSIONS.CAMERA_AIH,
    PERMISSIONS.MICROPHONE_AIH,
    PERMISSIONS.READ_MEDIA_AIH,
  ];

  const results = await permission.requestMultiple(permissions);

  // 检查是否有未授权的权限
  const denied = Object.entries(results)
    .filter(([, status]) => status !== 'GRANTED')
    .map(([perm]) => perm);

  if (denied.length > 0) {
    console.log('以下权限未授权:', denied);
  }
}
```

### 11.5 请求通知权限

```typescript
import { permission } from '@itc/permission';

async function requestNotificationPermission() {
  // 检查通知权限状态
  if (permission.checkNotifications) {
    const result = await permission.checkNotifications();
    console.log('通知权限状态:', result.status);
    console.log('通知设置:', result.settings);
  }

  // 请求通知权限
  if (permission.requestNotifications) {
    const result = await permission.requestNotifications({
      sound: true,
      alert: true,
      badge: true,
    });
    console.log('通知权限请求结果:', result.status);
  }
}
```

### 11.6 引导用户开启权限

```typescript
import { permission, PERMISSIONS, type PermissionStatus } from '@itc/permission';

async function ensurePermission(
  permKey: keyof typeof PERMISSIONS,
  title: string,
  description: string
) {
  const perm = PERMISSIONS[permKey];
  const status = await permission.check(perm);

  if (status === 'GRANTED') {
    return true;
  }

  if (status === 'DENIED') {
    // 首次拒绝后，再次请求
    const newStatus = await permission.request(perm);
    if (newStatus === 'GRANTED') return true;
  }

  if (status === 'BLOCKED' || status === 'DENIED') {
    // 显示引导弹窗
    const shouldOpenSettings = await showSettingsDialog(title, description);
    if (shouldOpenSettings) {
      await permission.openSettings();
    }
    return false;
  }

  return false;
}

// 使用示例
async function takePhoto() {
  const granted = await ensurePermission(
    'CAMERA_AIH',
    '相机权限',
    '需要使用相机来拍照，请授予权限'
  );

  if (granted) {
    // 执行拍照逻辑
  }
}
```

### 11.7 切换权限后端（测试场景）

```typescript
import { installPermission } from '@itc/permission';
import { NoopPermissionProvider } from '@itc/permission';

// 在测试环境中注入空实现
installPermission(new NoopPermissionProvider());
```

### 11.8 检查位置精确度（iOS 14+）

```typescript
import { permission, type LocationAccuracy } from '@itc/permission';

async function checkLocationAccuracyStatus() {
  const accuracy = await permission.checkLocationAccuracy!();
  console.log('位置精确度:', accuracy);
  // 'full' - 完整精确位置
  // 'reduced' - 降低精确度（节能模式）
}
```

### 11.9 请求位置精确度（iOS 14+）

```typescript
import { permission } from '@itc/permission';

async function requestFullLocationAccuracy() {
  const accuracy = await permission.requestLocationAccuracy!({
    purposeKey: '高精度定位用途说明',
  });
  console.log('位置精确度:', accuracy);
}
```

### 11.10 打开照片选择器（iOS 14+）

```typescript
import { permission } from '@itc/permission';

async function openPhotoPicker() {
  // 无需权限，直接打开系统照片选择器
  const success = await permission.openPhotoPicker!();
  if (success) {
    console.log('照片选择器已打开');
  }
}
```

### 11.11 打开联系人选择器（iOS 18+）

```typescript
import { permission } from '@itc/permission';

async function openContactPicker() {
  // 无需权限，直接打开系统联系人选择器
  const success = await permission.openContactPicker!();
  if (success) {
    console.log('联系人选择器已打开');
  }
}
```

### 11.12 检查精确闹钟权限（Android 12+）

```typescript
import { permission } from '@itc/permission';

async function checkExactAlarmPermission() {
  const canSchedule = await permission.canScheduleExactAlarms!();
  if (!canSchedule) {
    console.log('无法设置精确闹钟，请前往设置开启');
    // 引导用户打开设置
    await permission.openSettings();
  }
}

---

## 12. 导出清单

```typescript
// 权限代理
export const permission: PermissionProvider;

// 后端注入
export function installPermission(provider: PermissionProvider): void;

// 类型
export type {
  PermissionProvider,
  PermissionStatus,
  NotificationPermissionResult,
  NotificationOptions,
  LocationAccuracy,
  LocationAccuracyOptions,
};

// 权限常量（跨平台统一标识）
export { ITC_PERMISSIONS, ITC_RESULTS };
```

---

## 13. 注意事项

1. **统一权限标识**：业务层使用 `ITC_PERMISSIONS` 中的常量（如 `ITC_PERMISSIONS.ANDROID.CAMERA`），不要直接使用平台特定字符串
2. **权限映射**：权限提供者在内部将逻辑标识转换为平台特定字符串，iOS/Android/HarmonyOS 三端字符串完全不同
3. **HarmonyOS 原生配置**：必须在 `module.json5` 中声明所需权限，并配置 `reason` 字符串
4. **BLOCKED 处理**：权限被永久拒绝时，必须引导用户跳转设置页面
5. **批量请求**：使用 `requestMultiple` 可以一次请求多个权限，提升用户体验
6. **状态检查**：在请求权限前先检查状态，避免重复弹窗
7. **平台检测**：部分 API（如 `checkNotifications`）在某些平台可能不存在，使用前需检查方法是否存在
8. **零依赖**：@itc/permission 不依赖 @itc/base，保持轻量
9. **新 API 兼容性**：5.6.0 新增的 `canScheduleExactAlarms`、`checkLocationAccuracy`、`requestLocationAccuracy`、`openContactPicker`、`openPhotoPicker` 方法在不支持的平台会返回默认值或 `false`，使用前建议检查方法是否存在

---

## 14. 附录：实现说明

### 14.1 权限映射实现建议

权限提供者在内部实现时，应根据当前平台将逻辑权限 ID 转换为平台特定字符串：

```typescript
// 内部映射表结构示例
const PERMISSION_MAPPER: Record<ItcPlatform, Record<string, string>> = {
  android: {
    camera: 'android.permission.CAMERA',
    microphone: 'android.permission.RECORD_AUDIO',
    // ...
  },
  ios: {
    camera: 'ios.permission.CAMERA',
    microphone: 'ios.permission.MICROPHONE',
    // ...
  },
  harmony: {
    camera: 'ohos.permission.CAMERA',
    microphone: 'ohos.permission.MICROPHONE',
    // ...
  },
};

function resolvePermission(permId: string, platform: ItcPlatform): string | null {
  // 如果平台不支持该权限，返回 null，由调用方返回 UNAVAILABLE
  return PERMISSION_MAPPER[platform][permId] ?? null;
}

// check 实现示例
async function check(permId: string): Promise<PermissionStatus> {
  const platformPermission = resolvePermission(permId, currentPlatform);
  if (!platformPermission) {
    return 'UNAVAILABLE'; // 平台不支持该权限
  }
  // 调用原生 API...
}
```

### 14.2 HarmonyOS 额外配置

HarmonyOS 除了 JS 层调用外，还需要在原生配置文件中声明权限：

**module.json5 配置示例：**

```json5
{
  "requestPermissions": [
    {
      "name": "ohos.permission.CAMERA",
      "reason": "$string:reason_camera",
      "usedScene": {
        "abilities": ["EntryAbility"],
        "when": "inuse"
      }
    },
    {
      "name": "ohos.permission.MICROPHONE",
      "reason": "$string:reason_microphone",
      "usedScene": {
        "abilities": ["EntryAbility"],
        "when": "inuse"
      }
    }
  ]
}
```

**string.json 配置：**

```json
{
  "string": [
    {
      "name": "reason_camera",
      "value": "用于扫码拍照"
    },
    {
      "name": "reason_microphone",
      "value": "用于语音通话"
    }
  ]
}
```

### 14.3 后台位置权限特殊说明

`locationBackground` 权限由于安全隐私要求，不能通过弹窗授予，必须引导用户手动在设置中开启：

1. 先请求 `location` 或 `approximatelyLocation` 前台权限
2. 用户授予后，提示用户前往设置开启"始终允许位置权限"
3. 使用 `openSettings()` 跳转系统设置页面
