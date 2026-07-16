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
| iOS | `react-native-permissions` | 5.0.0+ | 官方包 |
| Android | `react-native-permissions` | 5.0.0+ | 官方包 |
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
}
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
  Provisional?: boolean;
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

  /** 写图片/视频 - 三端 */
  WRITE_IMAGEVIDEO_AIH: 'writeImageVideo',

  /** 读音频 - 三端 */
  READ_AUDIO_AIH: 'readAudio',

  /** 写音频 - 三端 */
  WRITE_AUDIO_AIH: 'writeAudio',
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

| 逻辑权限 ID | Android 字符串 | 说明 |
|------------|---------------|------|
| `camera` | `android.permission.CAMERA` | 相机 |
| `microphone` | `android.permission.RECORD_AUDIO` | 麦克风 |
| `location` | `android.permission.ACCESS_FINE_LOCATION` | 精确位置 |
| `approximatelyLocation` | `android.permission.ACCESS_COARSE_LOCATION` | 模糊位置 |
| `locationBackground` | `android.permission.ACCESS_BACKGROUND_LOCATION` | 后台位置 |
| `readCalendar` | `android.permission.READ_CALENDAR` | 读日历 |
| `writeCalendar` | `android.permission.WRITE_CALENDAR` | 写日历 |
| `activityMotion` | `android.permission.ACTIVITY_RECOGNITION` | 活动识别 |
| `readHealthData` | `android.permission.BODY_SENSORS` | 健康数据 |
| `readMedia` | `android.permission.READ_MEDIA_IMAGES` | 读图片 |
| `mediaLocation` | `android.permission.READ_MEDIA_VISUAL_USER_SELECTED` | 媒体位置 |
| `accessBluetooth` | `android.permission.BLUETOOTH_CONNECT` | 蓝牙连接 |
| `distributedDataSync` | `android.permission.BLUETOOTH_SCAN` | 蓝牙扫描 |
| `readContacts` | `android.permission.READ_CONTACTS` | 读联系人 |
| `writeContacts` | `android.permission.WRITE_CONTACTS` | 写联系人 |
| `readCallLog` | `android.permission.READ_CALL_LOG` | 读通话记录 |
| `writeCallLog` | `android.permission.WRITE_CALL_LOG` | 写通话记录 |
| `answerCall` | `android.permission.ANSWER_PHONE_CALLS` | 接听电话 |
| `readMessages` | `android.permission.READ_SMS` | 读短信 |
| `sendMessages` | `android.permission.SEND_SMS` | 发短信 |
| `receiveSms` | `android.permission.RECEIVE_SMS` | 收短信 |
| `receiveMms` | `android.permission.RECEIVE_MMS` | 收彩信 |
| `readAudio` | `android.permission.READ_MEDIA_AUDIO` | 读音频 |
| `writeAudio` | `android.permission.WRITE_EXTERNAL_STORAGE` | 写音频 |
| `readImageVideo` | `android.permission.READ_MEDIA_VIDEO` | 读视频 |
| `writeImageVideo` | `android.permission.WRITE_EXTERNAL_STORAGE` | 写视频 |
| `readDocument` | `android.permission.READ_EXTERNAL_STORAGE` | 读文档 |
| `writeDocument` | `android.permission.WRITE_EXTERNAL_STORAGE` | 写文档 |
| `getInstalledBundleList` | `android.permission.QUERY_ALL_PACKAGES` | 查询已安装应用 |

### 4.2 iOS 映射

| 逻辑权限 ID | iOS 字符串 | 说明 |
|------------|-----------|------|
| `camera` | `ios.permission.CAMERA` | 相机 |
| `microphone` | `ios.permission.MICROPHONE` | 麦克风 |
| `location` | `ios.permission.LOCATION_WHEN_IN_USE` | 使用时位置 |
| `approximatelyLocation` | `ios.permission.LOCATION_ALWAYS` | 始终位置 |
| `locationBackground` | `ios.permission.LOCATION_ALWAYS` | 后台位置 |
| `readCalendar` | `ios.permission.CALENDARS` | 读日历 |
| `writeCalendar` | `ios.permission.EVENTS` | 写日历 |
| `activityMotion` | `ios.permission.ACTIVITY_RECOGNITION` | 活动识别 |
| `readMedia` | `ios.permission.PHOTO_LIBRARY` | 读相册 |
| `mediaLocation` | `ios.permission.PHOTO_LIBRARY_ADD_ONLY` | 添加照片 |
| `accessBluetooth` | `ios.permission.BLUETOOTH` | 蓝牙 |
| `readContacts` | `ios.permission.CONTACTS` | 联系人 |
| `writeContacts` | `ios.permission.CONTACTS_WRITE` | 写联系人 |
| `readCallLog` | `ios.permission.CONTACTS` | 通话记录 |
| `sendMessages` | `ios.permission.SMS` | 短信 |
| `readAudio` | `ios.permission.MEDIA_LIBRARY` | 媒体库 |
| `writeAudio` | `ios.permission.MEDIA_LIBRARY` | 写媒体 |
| `readDocument` | `ios.permission.FILES` | 文件 |
| `writeDocument` | `ios.permission.FILES` | 写文件 |
| `readHealthData` | `ios.permission.HEALTH_SHARE` | 健康数据 |
| `manageVoicemail` | `ios.permission.VOICEMAIL` | 语音邮件 |

### 4.3 HarmonyOS 映射

| 逻辑权限 ID | HarmonyOS 字符串 | 说明 |
|------------|-----------------|------|
| `camera` | `ohos.permission.CAMERA` | 相机 |
| `microphone` | `ohos.permission.MICROPHONE` | 麦克风 |
| `location` | `ohos.permission.LOCATION` | 精确位置 |
| `approximatelyLocation` | `ohos.permission.APPROXIMATELY_LOCATION` | 模糊位置 |
| `locationBackground` | `ohos.permission.LOCATION_IN_BACKGROUND` | 后台位置 |
| `readCalendar` | `ohos.permission.READ_CALENDAR` | 读日历 |
| `writeCalendar` | `ohos.permission.WRITE_CALENDAR` | 写日历 |
| `readWholeCalendar` | `ohos.permission.READ_WHOLE_CALENDAR` | 读完整日历 |
| `writeWholeCalendar` | `ohos.permission.WRITE_WHOLE_CALENDAR` | 写完整日历 |
| `activityMotion` | `ohos.permission.ACTIVITY_MOTION` | 活动识别 |
| `readHealthData` | `ohos.permission.READ_HEALTH_DATA` | 健康数据 |
| `readMedia` | `ohos.permission.READ_MEDIA` | 读媒体 |
| `mediaLocation` | `ohos.permission.MEDIA_LOCATION` | 媒体位置 |
| `accessBluetooth` | `ohos.permission.ACCESS_BLUETOOTH` | 蓝牙 |
| `distributedDataSync` | `ohos.permission.DISTRIBUTED_DATASYNC` | 分布式数据同步 |
| `readContacts` | `ohos.permission.READ_CONTACTS` | 读联系人 |
| `writeContacts` | `ohos.permission.WRITE_CONTACTS` | 写联系人 |
| `readCallLog` | `ohos.permission.READ_CALL_LOG` | 读通话记录 |
| `writeCallLog` | `ohos.permission.WRITE_CALL_LOG` | 写通话记录 |
| `answerCall` | `ohos.permission.ANSWER_CALL` | 接听电话 |
| `callPhone` | `ohos.permission.CALL_PHONE` | 拨打电话 |
| `readPhoneNumbers` | `ohos.permission.READ_PHONE_NUMBERS` | 读取手机号 |
| `readPhoneState` | `ohos.permission.READ_PHONE_STATE` | 读取手机状态 |
| `readMessages` | `ohos.permission.READ_MESSAGES` | 读消息 |
| `sendMessages` | `ohos.permission.SEND_MESSAGES` | 发消息 |
| `receiveSms` | `ohos.permission.RECEIVE_SMS` | 收短信 |
| `receiveMms` | `ohos.permission.RECEIVE_MMS` | 收彩信 |
| `receiveWapMessages` | `ohos.permission.RECEIVE_WAP_MESSAGES` | 收WAP消息 |
| `readCellMessages` | `ohos.permission.READ_CELL_MESSAGES` | 读蜂窝消息 |
| `readAudio` | `ohos.permission.READ_AUDIO` | 读音频 |
| `writeAudio` | `ohos.permission.WRITE_AUDIO` | 写音频 |
| `readDocument` | `ohos.permission.READ_DOCUMENT` | 读文档 |
| `writeDocument` | `ohos.permission.WRITE_DOCUMENT` | 写文档 |
| `readImageVideo` | `ohos.permission.READ_IMAGEVIDEO` | 读图片视频 |
| `writeImageVideo` | `ohos.permission.WRITE_IMAGEVIDEO` | 写图片视频 |
| `getInstalledBundleList` | `ohos.permission.GET_INSTALLED_BUNDLE_LIST` | 查询已安装应用 |
| `manageVoicemail` | `ohos.permission.MANAGE_VOICEMAIL` | 语音邮件 |
| `getCurrentLocation` | `ohos.permission.GET_CURRENT_LOCATION` | 获取当前位置 |
| `startBluetoothDiscovery` | `ohos.permission.START_BLUETOOTH_DISCOVERY` | 蓝牙发现 |
| `bluetoothLogin` | `ohos.permission.BLUETOOTH_LOGIN` | 蓝牙登录 |
| `nearlink` | `ohos.permission.ACCESS_NEARLINK` | 星闪 |
| `wifiConnect` | `ohos.permission.WIFI_CONNECT` | WiFi连接 |
| `wifiHotspot` | `ohos.permission.WIFI_HOTSPOT` | WiFi热点 |
| `getWifiInfo` | `ohos.permission.GET_WIFI_INFO` | 获取WiFi信息 |
| `nfcTag` | `ohos.permission.NFC_TAG` | NFC标签 |
| `nfcCardEmulation` | `ohos.permission.NFC_CARD_EMULATION` | NFC卡模拟 |
| `screenShare` | `ohos.permission.SCREEN_SHARE` | 屏幕共享 |
| `appUsageStats` | `ohos.permission.APP_USAGE_STATS` | 应用使用统计 |
| `notifications` | `ohos.permission.NOTIFICATION_CONTROLLER` | 通知控制 |
| `subscribeNotifications` | `ohos.permission.SUBSCRIBE_NOTIFICATION` | 订阅通知 |
| `deviceManager` | `ohos.permission.DEVICE_MANAGER` | 设备管理器 |
| `vibrator` | `ohos.permission.VIBRATE` | 振动 |

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

### 4.2 后端注入

```typescript
/**
 * 覆盖默认权限后端。用于测试或未来切换权限方案。
 */
export function installPermission(provider: PermissionProvider): void;
```

---

## 5. 默认实现（@react-native-ohos/react-native-permissions）

### 5.1 实现类

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

### 5.2 状态映射

| HarmonyOS 状态 | @itc/permission 状态 |
|---------------|---------------------|
| `AUTHORIZED` | `'GRANTED'` |
| `DENIED` | `'DENIED'` |
| `NOT_DETERMINED` | `'DENIED'` |
| `RESTRICTED` | `'LIMITED'` |
| `UNAUTHORIZED` | `'BLOCKED'` |

---

## 6. Noop 实现

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

## 7. 平台差异

| 平台 | 实现包 | Autolink | API 版本 |
|------|--------|----------|----------|
| Android | `react-native-permissions` | 部分支持 | Android 5.0+ (API 21+) |
| iOS | `react-native-permissions` | 部分支持 | iOS 11+ |
| HarmonyOS | `@react-native-ohos/react-native-permissions` | 不支持（需手动配置） | API 8+ |

> **注意**：具体权限可能需要更高的系统版本，例如 Android 13+ 所需的细粒度媒体权限（如 `READ_MEDIA_IMAGES`）、iOS 14+ 所需的本地网络权限等。

### 7.1 HarmonyOS 特殊说明

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

### 7.2 API 支持差异

| API | Android | iOS | HarmonyOS |
|-----|---------|-----|-----------|
| `check` | ✅ | ✅ | ✅ |
| `checkMultiple` | ✅ | ❌ | ✅ |
| `request` | ✅ | ✅ | ✅ |
| `requestMultiple` | ✅ | ❌ | ✅ |
| `openSettings` | ✅ | ✅ | ✅ |
| `checkNotifications` | ✅ | ✅ | ✅ |
| `requestNotifications` | ✅ | ✅ | ✅ |
| `openPhotoPicker` | ❌ | ✅ | ✅ |

### 7.3 蓝牙权限变更（API 13+）

从 HarmonyOS API 13 开始，原有的蓝牙相关权限组不再使用，统一改为"设备发现和连接"权限组：

- `ohos.permission.ACCESS_BLUETOOTH`
- `ohos.permission.ACCESS_NEARLINK`
- `ohos.permission.DISTRIBUTED_DATASYNC`

---

## 8. 权限申请流程

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

## 9. 依赖关系

**dependencies：**
- `react-native-permissions@^5.0.0`（iOS/Android）
- `@react-native-ohos/react-native-permissions@~5.4.3`（HarmonyOS）

**peerDependencies：**
- `react-native`：>= 0.82.0

**内部依赖：**
- 无（permission 不依赖 @itc/base）

---

## 10. 使用示例

### 10.1 检查单个权限

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

### 10.2 请求单个权限

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

### 10.3 批量检查权限

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

### 10.4 批量请求权限

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

### 10.5 请求通知权限

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

### 10.6 引导用户开启权限

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

### 10.7 切换权限后端（测试场景）

```typescript
import { installPermission } from '@itc/permission';
import { NoopPermissionProvider } from '@itc/permission';

// 在测试环境中注入空实现
installPermission(new NoopPermissionProvider());
```

---

## 11. 导出清单

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
};

// 权限常量（跨平台统一标识）
export { PERMISSIONS };
```

---

## 12. 注意事项

1. **统一权限标识**：业务层使用 `PERMISSIONS` 中的常量（如 `CAMERA_AIH`），不要直接使用平台特定字符串（如 `ohos.permission.CAMERA`）
2. **权限映射**：权限提供者在内部将逻辑标识转换为平台特定字符串，iOS/Android/HarmonyOS 三端字符串完全不同
3. **HarmonyOS 原生配置**：必须在 `module.json5` 中声明所需权限，并配置 `reason` 字符串
4. **BLOCKED 处理**：权限被永久拒绝时，必须引导用户跳转设置页面
5. **批量请求**：使用 `requestMultiple` 可以一次请求多个权限，提升用户体验
6. **状态检查**：在请求权限前先检查状态，避免重复弹窗
7. **平台检测**：部分 API（如 `checkNotifications`）在某些平台可能不存在
8. **零依赖**：@itc/permission 不依赖 @itc/base，保持轻量

---

## 13. 附录：实现说明

### 13.1 权限映射实现建议

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

### 13.2 HarmonyOS 额外配置

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

### 13.3 后台位置权限特殊说明

`locationBackground` 权限由于安全隐私要求，不能通过弹窗授予，必须引导用户手动在设置中开启：

1. 先请求 `location` 或 `approximatelyLocation` 前台权限
2. 用户授予后，提示用户前往设置开启"始终允许位置权限"
3. 使用 `openSettings()` 跳转系统设置页面
