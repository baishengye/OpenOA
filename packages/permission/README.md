# @itc/permission

跨平台权限管理模块，统一封装 Android/iOS/HarmonyOS 三端的权限请求 API。

## 安装

```bash
# Android / iOS
pnpm add react-native-permissions

# HarmonyOS NEXT
pnpm add @react-native-ohos/react-native-permissions

# 本地包
pnpm add @itc/permission
```

## 平台配置

> **权限演示 Demo**：如需在 `@itc/permission` 的 PermissionTab 中测试权限申请，三端原生配置参考 `apps/oa` 目录：
> - [AndroidManifest.xml](https://github.com/example/OpenOA/blob/main/apps/oa/android/app/src/main/AndroidManifest.xml)
> - [Info.plist](https://github.com/example/OpenOA/blob/main/apps/oa/ios/OpenOA/Info.plist)
> - [module.json5](https://github.com/example/OpenOA/blob/main/apps/oa/harmony/entry/src/main/module.json5)

### Android

在 `android/app/src/main/AndroidManifest.xml` 添加所需权限：

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Android 存储权限版本兼容

Android 存储权限根据系统版本有不同的实现方式：

#### 分区存储 (Scoped Storage) - Android 10 (API 29) 起

Android 10 引入了分区存储，App 只能访问自己的文件和媒体文件。需要使用细粒度媒体权限：

| 权限常量 | 说明 | Android 版本 |
|---------|------|-------------|
| `READ_MEDIA_IMAGES` | 读取图片 | Android 13+ (API 33) |
| `READ_MEDIA_VIDEO` | 读取视频 | Android 13+ (API 33) |
| `READ_MEDIA_AUDIO` | 读取音频 | Android 13+ (API 33) |
| `ACCESS_MEDIA_LOCATION` | 读取媒体文件中的位置信息 | Android 10+ (API 29) |

```xml
<!-- Android 13+ -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
```

#### 传统存储权限 - Android 9 (API 28) 及以下

如果需要兼容旧版本设备或访问共享存储，使用传统存储权限：

| 权限常量 | 说明 | Android 版本 |
|---------|------|-------------|
| `READ_EXTERNAL_STORAGE` | 读取外部存储 | Android 4.4+ (API 19) |
| `WRITE_EXTERNAL_STORAGE` | 写入外部存储 | Android 4.4+ (API 19) |

```xml
<!-- Android 9 及以下 -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

#### 版本兼容建议

```typescript
import { Platform } from 'react-native';
import { permission, ITC_PERMISSIONS } from '@itc/permission';

// 根据 Android 版本选择合适的权限
const getStoragePermissions = () => {
  if (Platform.OS === 'android') {
    const version = Platform.Version;
    // Android 13+ 使用媒体权限
    if (version >= 33) {
      return [
        ITC_PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        ITC_PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
        ITC_PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
      ];
    }
    // Android 10-12 可以选择使用传统存储权限或媒体权限
    // 如果 targetSdkVersion < 30，仍然可以使用传统存储权限
    if (version >= 29) {
      return [ITC_PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
    }
    // Android 9 及以下
    return [
      ITC_PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ITC_PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    ];
  }
  return [];
};
```

#### 权限申请示例

```typescript
// 请求存储权限
async function requestStoragePermission() {
  // 根据版本获取对应权限
  const permissions = getStoragePermissions();

  // Android 10+ 需要额外请求媒体位置权限（如果需要读取照片位置信息）
  if (Platform.OS === 'android' && Platform.Version >= 29) {
    await permission.request(ITC_PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION);
  }

  // 请求存储相关权限
  const result = await permission.requestMultiple(permissions);

  // 检查结果
  if (result[ITC_PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === 'granted') {
    // 有权限访问
  }
}
```

### iOS

在 `ios/Runner/Info.plist` 添加权限描述：

```xml
<key>NSCameraUsageDescription</key>
<string>需要使用相机权限</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>需要访问位置信息</string>
```

### HarmonyOS NEXT

在 `entry/src/main/module.json5` 添加权限声明：

```json
"requestPermissions": [
  "ohos.permission.CAMERA",
  "ohos.permission.LOCATION"
]
```

## API

### 权限常量 PERMISSIONS

所有支持的权限枚举，按平台支持分类：

| 后缀 | 含义 |
|------|------|
| `_AIH` | Android / iOS / HarmonyOS 三端支持 |
| `_AH` | Android / HarmonyOS 支持 |
| `_IH` | iOS / HarmonyOS 支持 |
| `_H` | 仅 HarmonyOS 支持 |

**通用权限**

| 常量 | 说明 |
|------|------|
| `CAMERA_AIH` | 相机 |
| `MICROPHONE_AIH` | 麦克风 |
| `LOCATION_AIH` | 精确位置 |
| `APPROXIMATELY_LOCATION_AIH` | 模糊位置 |
| `LOCATION_BACKGROUND_AH` | 后台位置 |
| `READ_CALENDAR_AIH` | 读日历 |
| `WRITE_CALENDAR_AIH` | 写日历 |
| `READ_HEALTH_DATA_AH` | 健康数据 |
| `READ_MEDIA_AIH` | 读媒体文件 |
| `MEDIA_LOCATION_AIH` | 媒体位置 |
| `ACCESS_BLUETOOTH_AIH` | 蓝牙连接 |

**通讯录**

| 常量 | 说明 |
|------|------|
| `READ_CONTACTS_AH` | 读联系人 |
| `WRITE_CONTACTS_AH` | 写联系人 |

**通话**

| 常量 | 说明 |
|------|------|
| `READ_CALL_LOG_IH` | 读通话记录 |
| `WRITE_CALL_LOG_H` | 写通话记录 |
| `ANSWER_CALL_AH` | 接听电话 |
| `CALL_PHONE_H` | 拨打电话 |
| `READ_PHONE_NUMBERS_H` | 读取手机号 |
| `READ_PHONE_STATE_H` | 读取手机状态 |

**短信**

| 常量 | 说明 |
|------|------|
| `READ_MESSAGES_H` | 读消息 |
| `SEND_MESSAGES_H` | 发消息 |
| `RECEIVE_SMS_H` | 收短信 |
| `RECEIVE_MMS_H` | 收彩信 |
| `RECEIVE_WAP_MESSAGES_H` | 收WAP消息 |
| `READ_CELL_MESSAGES_H` | 收蜂窝消息 |

**文件/存储**

| 常量 | 说明 |
|------|------|
| `READ_DOCUMENT_AIH` | 读文档 |
| `WRITE_DOCUMENT_AIH` | 写文档 |
| `READ_IMAGEVIDEO_AIH` | 读图片/视频 |
| `WRITE_IMAGEVIDEO_AIH` | 写图片/视频 |
| `READ_AUDIO_AIH` | 读音频 |
| `WRITE_AUDIO_AIH` | 写音频 |

**HarmonyOS 专属**

| 常量 | 说明 |
|------|------|
| `GET_CURRENT_LOCATION_H` | 获取当前位置 |
| `START_BLUETOOTH_DISCOVERY_H` | 蓝牙发现 |
| `BLUETOOTH_LOGIN_H` | 蓝牙登录 |
| `NEARLINK_H` | 星闪 |
| `WIFI_CONNECT_H` | WiFi连接 |
| `WIFI_HOTSPOT_H` | WiFi热点 |
| `GET_WIFI_INFO_H` | 获取WiFi信息 |
| `NFC_TAG_H` | NFC标签 |
| `NFC_CARD_EMULATION_H` | NFC卡模拟 |
| `SCREEN_SHARE_H` | 屏幕共享 |
| `APP_USAGE_STATS_H` | 应用使用统计 |
| `NOTIFICATIONS_H` | 通知控制 |
| `SUBSCRIBE_NOTIFICATIONS_H` | 订阅通知 |
| `DEVICE_MANAGER_H` | 设备管理器 |
| `VIBRATOR_H` | 振动器 |

### 权限状态 PermissionStatus

```typescript
type PermissionStatus = 'UNAVAILABLE' | 'DENIED' | 'BLOCKED' | 'GRANTED' | 'LIMITED';
```

| 状态 | 含义 |
|------|------|
| `GRANTED` | 权限已授权 |
| `DENIED` | 权限被拒绝（可再次请求） |
| `BLOCKED` | 权限被永久拒绝（需跳转设置） |
| `UNAVAILABLE` | 设备不支持该权限 |
| `LIMITED` | 权限受限（如仅照片选择） |

### permission.check(permission)

检查单个权限状态。

```typescript
import { permission, PERMISSIONS } from '@itc/permission';

const status = await permission.check(PERMISSIONS.CAMERA_AIH);
if (status === 'GRANTED') {
  // 已授权
}
```

### permission.request(permission)

请求单个权限，返回最终状态。

```typescript
const status = await permission.request(PERMISSIONS.CAMERA_AIH);
if (status === 'GRANTED') {
  // 授权成功
} else if (status === 'BLOCKED') {
  // 永久拒绝，引导用户去设置
  await permission.openSettings();
}
```

### permission.checkMultiple(permissions)

批量检查多个权限状态。

```typescript
const results = await permission.checkMultiple([
  PERMISSIONS.CAMERA_AIH,
  PERMISSIONS.MICROPHONE_AIH,
]);

for (const [perm, status] of Object.entries(results)) {
  console.log(`${perm}: ${status}`);
}
```

### permission.requestMultiple(permissions)

批量请求多个权限。

```typescript
const results = await permission.requestMultiple([
  PERMISSIONS.CAMERA_AIH,
  PERMISSIONS.MICROPHONE_AIH,
]);
```

### permission.openSettings()

打开系统设置页面，引导用户手动开启权限。

```typescript
await permission.openSettings();
```

### 通知权限 (部分平台)

```typescript
// 检查通知权限
const result = await permission.checkNotifications();

// 请求通知权限
const result = await permission.requestNotifications({
  sound: true,
  alert: true,
  badge: true,
});
```

## 完整示例

```typescript
import { permission, PERMISSIONS } from '@itc/permission';

async function takePhoto() {
  // 1. 检查权限
  const status = await permission.check(PERMISSIONS.CAMERA_AIH);

  if (status === 'GRANTED') {
    // 已授权，直接拍照
    return;
  }

  if (status === 'DENIED') {
    // 2. 请求权限
    const result = await permission.request(PERMISSIONS.CAMERA_AIH);
    if (result === 'GRANTED') return;
  }

  if (status === 'BLOCKED' || status === 'DENIED') {
    // 3. 引导用户去设置
    await permission.openSettings();
  }
}
```
