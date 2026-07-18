import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TabLayout, Tab, Button } from '@itc/uikit';
import { permission, ITC_PERMISSIONS } from '@itc/permission';
import type { PermissionStatus } from '@itc/permission';

// ── 组件内部状态类型（包含 REQUESTING 状态）─────────────────────────────────

type ItemStatus = PermissionStatus | 'REQUESTING';

// ── 权限状态配置 ───────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  granted: { label: '已授权', color: '#fff', bgColor: '#22c55e' },
  denied: { label: '已拒绝', color: '#fff', bgColor: '#ef4444' },
  blocked: { label: '永久拒绝', color: '#fff', bgColor: '#6b7280' },
  unavailable: { label: '不可用', color: '#fff', bgColor: '#9ca3af' },
  limited: { label: '受限', color: '#fff', bgColor: '#f59e0b' },
  REQUESTING: { label: '请求中', color: '#fff', bgColor: '#3b82f6' },
} as const;

function getStatusConfig(status: ItemStatus) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.denied;
}

// ── 平台权限数据 ──────────────────────────────────────────────────────────────

const PLATFORM_PERMISSIONS = {
  ANDROID: [
    { key: ITC_PERMISSIONS.ANDROID.CAMERA, label: '相机' },
    { key: ITC_PERMISSIONS.ANDROID.RECORD_AUDIO, label: '麦克风' },
    { key: ITC_PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, label: '精确位置' },
    { key: ITC_PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION, label: '模糊位置' },
    { key: ITC_PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION, label: '后台位置' },
    { key: ITC_PERMISSIONS.ANDROID.READ_CONTACTS, label: '读取联系人' },
    { key: ITC_PERMISSIONS.ANDROID.WRITE_CONTACTS, label: '写入联系人' },
    { key: ITC_PERMISSIONS.ANDROID.READ_CALENDAR, label: '读取日历' },
    { key: ITC_PERMISSIONS.ANDROID.WRITE_CALENDAR, label: '写入日历' },
    { key: ITC_PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, label: '读取存储' },
    { key: ITC_PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, label: '写入存储' },
    { key: ITC_PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, label: '读取图片' },
    { key: ITC_PERMISSIONS.ANDROID.READ_MEDIA_VIDEO, label: '读取视频' },
    { key: ITC_PERMISSIONS.ANDROID.READ_MEDIA_AUDIO, label: '读取音频' },
    { key: ITC_PERMISSIONS.ANDROID.BLUETOOTH_SCAN, label: '蓝牙扫描' },
    { key: ITC_PERMISSIONS.ANDROID.BLUETOOTH_CONNECT, label: '蓝牙连接' },
    { key: ITC_PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE, label: '蓝牙广播' },
    { key: ITC_PERMISSIONS.ANDROID.POST_NOTIFICATIONS, label: '通知' },
    { key: ITC_PERMISSIONS.ANDROID.BODY_SENSORS, label: '身体传感器' },
    { key: ITC_PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION, label: '活动识别' },
    { key: ITC_PERMISSIONS.ANDROID.ACCEPT_HANDOVER, label: '通话转接' },
    { key: ITC_PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION, label: '媒体位置' },
    { key: ITC_PERMISSIONS.ANDROID.ADD_VOICEMAIL, label: '语音邮件' },
    { key: ITC_PERMISSIONS.ANDROID.ANSWER_PHONE_CALLS, label: '接听电话' },
    { key: ITC_PERMISSIONS.ANDROID.CALL_PHONE, label: '拨打电话' },
    { key: ITC_PERMISSIONS.ANDROID.GET_ACCOUNTS, label: '获取账户' },
    { key: ITC_PERMISSIONS.ANDROID.NEARBY_WIFI_DEVICES, label: '附近WiFi设备' },
    { key: ITC_PERMISSIONS.ANDROID.PROCESS_OUTGOING_CALLS, label: '处理外呼' },
    { key: ITC_PERMISSIONS.ANDROID.READ_CALL_LOG, label: '读取通话记录' },
    { key: ITC_PERMISSIONS.ANDROID.WRITE_CALL_LOG, label: '写入通话记录' },
    { key: ITC_PERMISSIONS.ANDROID.READ_PHONE_NUMBERS, label: '读取电话号码' },
    { key: ITC_PERMISSIONS.ANDROID.READ_PHONE_STATE, label: '读取手机状态' },
    { key: ITC_PERMISSIONS.ANDROID.READ_SMS, label: '读取短信' },
    { key: ITC_PERMISSIONS.ANDROID.RECEIVE_SMS, label: '接收短信' },
    { key: ITC_PERMISSIONS.ANDROID.RECEIVE_MMS, label: '接收彩信' },
    { key: ITC_PERMISSIONS.ANDROID.SEND_SMS, label: '发送短信' },
    { key: ITC_PERMISSIONS.ANDROID.USE_SIP, label: '使用SIP' },
    { key: ITC_PERMISSIONS.ANDROID.UWB_RANGING, label: 'UWB测距' },
  ],
  IOS: [
    { key: ITC_PERMISSIONS.IOS.CAMERA, label: '相机' },
    { key: ITC_PERMISSIONS.IOS.MICROPHONE, label: '麦克风' },
    { key: ITC_PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, label: '位置(使用时)' },
    { key: ITC_PERMISSIONS.IOS.LOCATION_ALWAYS, label: '位置(始终)' },
    { key: ITC_PERMISSIONS.IOS.CONTACTS, label: '联系人' },
    { key: ITC_PERMISSIONS.IOS.CALENDARS, label: '日历' },
    { key: ITC_PERMISSIONS.IOS.PHOTO_LIBRARY, label: '照片库' },
    { key: ITC_PERMISSIONS.IOS.MEDIA_LIBRARY, label: '媒体库' },
    { key: ITC_PERMISSIONS.IOS.REMINDERS, label: '提醒' },
    { key: ITC_PERMISSIONS.IOS.SPEECH_RECOGNITION, label: '语音识别' },
    { key: ITC_PERMISSIONS.IOS.MOTION, label: '运动与健身' },
    { key: ITC_PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY, label: '追踪透明化' },
    { key: ITC_PERMISSIONS.IOS.FACE_ID, label: 'Face ID' },
    { key: ITC_PERMISSIONS.IOS.SIRI, label: 'Siri' },
    { key: ITC_PERMISSIONS.IOS.STOREKIT, label: 'StoreKit' },
    { key: ITC_PERMISSIONS.IOS.BLUETOOTH, label: '蓝牙' },
    { key: ITC_PERMISSIONS.IOS.LOCAL_NETWORK, label: '本地网络' },
    { key: ITC_PERMISSIONS.IOS.FILES, label: '文件访问' },
  ],
  HARMONY: [
    { key: ITC_PERMISSIONS.HARMONY.CAMERA, label: '相机' },
    { key: ITC_PERMISSIONS.HARMONY.MICROPHONE, label: '麦克风' },
    { key: ITC_PERMISSIONS.HARMONY.LOCATION, label: '精确位置' },
    { key: ITC_PERMISSIONS.HARMONY.APPROXIMATELY_LOCATION, label: '模糊位置' },
    { key: ITC_PERMISSIONS.HARMONY.READ_CONTACTS, label: '读取联系人' },
    { key: ITC_PERMISSIONS.HARMONY.WRITE_CONTACTS, label: '写入联系人' },
    { key: ITC_PERMISSIONS.HARMONY.READ_CALENDAR, label: '读取日历' },
    { key: ITC_PERMISSIONS.HARMONY.WRITE_CALENDAR, label: '写入日历' },
    { key: ITC_PERMISSIONS.HARMONY.READ_HEALTH_DATA, label: '健康数据' },
    { key: ITC_PERMISSIONS.HARMONY.ACTIVITY_MOTION, label: '活动识别' },
    { key: ITC_PERMISSIONS.HARMONY.READ_MEDIA, label: '读取媒体' },
    { key: ITC_PERMISSIONS.HARMONY.MEDIA_LOCATION, label: '媒体位置' },
    { key: ITC_PERMISSIONS.HARMONY.ACCESS_BLUETOOTH, label: '蓝牙连接' },
    { key: ITC_PERMISSIONS.HARMONY.DISTRIBUTED_DATASYNC, label: '分布式数据同步' },
  ],
};

// ── 单个权限项组件 ───────────────────────────────────────────────────────────

interface PermissionItemProps {
  label: string;
  permissionKey: string;
  status: ItemStatus;
  disabled: boolean;
  onRequest: (key: string) => void;
}

function PermissionItem({
  label,
  permissionKey,
  status,
  disabled,
  onRequest,
}: PermissionItemProps) {
  const isRequesting = status === 'REQUESTING';
  const config = getStatusConfig(status);

  return (
    <View style={styles.permissionItem}>
      <View style={styles.permissionInfo}>
        <Text style={styles.permissionLabel}>{label}</Text>
        <Text style={styles.permissionKey} numberOfLines={1}>
          {permissionKey}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
      <Button
        size="sm"
        variant={status === 'granted' ? 'outline' : 'solid'}
        disabled={disabled || isRequesting || status === 'unavailable'}
        loading={isRequesting}
        onPress={() => onRequest(permissionKey)}
      >
        {status === 'granted' ? '重新申请' : '请求'}
      </Button>
    </View>
  );
}

// ── 平台权限列表组件 ─────────────────────────────────────────────────────────

interface PlatformPermissionListProps {
  permissions: { key: string; label: string }[];
  busy: boolean;
  append: (line: string) => void;
}

function PlatformPermissionList({
  permissions,
  busy,
  append,
}: PlatformPermissionListProps) {
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});

  const checkAll = useCallback(async () => {
    const keys = permissions.map(p => p.key);
    const results = await permission.checkMultiple(keys);
    setStatuses(results);
    const grantedCount = Object.values(results).filter(s => s === 'granted').length;
    append(`✅ 批量检查完成: ${grantedCount}/${permissions.length} 已授权`);
  }, [permissions, append]);

  useEffect(() => {
    checkAll();
  }, [checkAll]);

  const requestPermission = useCallback(
    async (key: string) => {
      const label = permissions.find(p => p.key === key)?.label ?? key;
      setStatuses(prev => ({ ...prev, [key]: 'REQUESTING' }));

      try {
        await permission.request(key);
        const result = await permission.check(key);

        setStatuses(prev => ({ ...prev, [key]: result }));

        if (result === 'granted') {
          append(`✅ ${label} 授权成功`);
        } else if (result === 'denied') {
          append(`❌ ${label} 授权被拒绝`);
        } else if (result === 'blocked') {
          append(`⚠️ ${label} 永久拒绝，请在设置中开启`);
        } else if (result === 'unavailable') {
          append(`⚠️ ${label} 设备不支持该权限`);
        } else {
          append(`ℹ️ ${label} 状态: ${result}`);
        }
      } catch (error) {
        setStatuses(prev => ({ ...prev, [key]: 'denied' }));
        append(`❌ ${label} 请求异常: ${error}`);
      }
    },
    [permissions, append],
  );

  return (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {permissions.map(perm => (
        <PermissionItem
          key={perm.key}
          label={perm.label}
          permissionKey={perm.key}
          status={statuses[perm.key] ?? 'denied'}
          disabled={busy}
          onRequest={requestPermission}
        />
      ))}
    </ScrollView>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────────────────

interface PermissionTabProps {
  busy: boolean;
  append?: (line: string) => void;
}

export function PermissionTab({ busy, append }: PermissionTabProps) {
  const safeAppend = append ?? (() => {});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>权限演示 (@itc/permission)</Text>
      <Text style={styles.description}>
        跨平台权限请求，支持 Android / iOS / HarmonyOS
      </Text>
      <TabLayout
        defaultValue={0}
        tabSize={50}
        renderTabList={({ isActive, label }) => (
          <View style={styles.tabItem}>
            <Text
              style={[
                styles.tabText,
                isActive && styles.tabTextActive,
              ]}
            >
              {label}
            </Text>
          </View>
        )}
        renderTabContent={({ index }) => {
          const platformData = [
            { label: 'Android', permissions: PLATFORM_PERMISSIONS.ANDROID },
            { label: 'iOS', permissions: PLATFORM_PERMISSIONS.IOS },
            { label: 'HarmonyOS', permissions: PLATFORM_PERMISSIONS.HARMONY },
          ];
          const current = platformData[index];
          return (
            <PlatformPermissionList
              permissions={current?.permissions ?? []}
              busy={busy}
              append={safeAppend}
            />
          );
        }}
      >
        <Tab label="Android" />
        <Tab label="iOS" />
        <Tab label="HarmonyOS" />
      </TabLayout>
    </View>
  );
}

// ── 样式 ──────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    color: '#1f2937',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  permissionInfo: {
    flex: 1,
    minWidth: 0,
  },
  permissionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  permissionKey: {
    fontSize: 10,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 64,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
