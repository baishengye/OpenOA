import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TabLayout, Tab, Button } from '@itc/uikit';
import { permission, ITC_PERMISSIONS } from '@itc/permission';
import type { PermissionStatus } from '@itc/permission';
import { useTranslation } from '@itc/i18n';

// ── 组件内部状态类型（包含 REQUESTING 状态）─────────────────────────────────

type ItemStatus = PermissionStatus | 'REQUESTING';

// ── 单个权限项组件 ───────────────────────────────────────────────────────────

interface PermissionItemProps {
  label: string;
  permissionKey: string;
  status: ItemStatus;
  disabled: boolean;
  onRequest: (key: string) => void;
  t: (key: string) => string;
}

function PermissionItem({
  label,
  permissionKey,
  status,
  disabled,
  onRequest,
  t,
}: PermissionItemProps) {
  const isRequesting = status === 'REQUESTING';

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    granted: { label: t('permission.granted'), color: '#fff', bgColor: '#22c55e' },
    denied: { label: t('permission.denied'), color: '#fff', bgColor: '#ef4444' },
    blocked: { label: t('permission.blocked'), color: '#fff', bgColor: '#6b7280' },
    unavailable: { label: t('permission.unavailable'), color: '#fff', bgColor: '#9ca3af' },
    limited: { label: t('permission.limited'), color: '#fff', bgColor: '#f59e0b' },
    REQUESTING: { label: t('permission.requesting'), color: '#fff', bgColor: '#3b82f6' },
  };

  const config = statusConfig[status] ?? statusConfig.denied!;

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
        {status === 'granted' ? t('permission.reRequest') : t('permission.request')}
      </Button>
    </View>
  );
}

// ── 平台权限列表组件 ─────────────────────────────────────────────────────────

interface PlatformPermissionListProps {
  permissions: { key: string; label: string }[];
  busy: boolean;
  append: (line: string) => void;
  t: (key: string) => string;
}

function PlatformPermissionList({
  permissions,
  busy,
  append,
  t,
}: PlatformPermissionListProps) {
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});

  const checkAll = useCallback(async () => {
    const keys = permissions.map(p => p.key);
    const results = await permission.checkMultiple(keys);
    setStatuses(results);
    const grantedCount = Object.values(results).filter(s => s === 'granted').length;
    append(`${t('common.success')} ${t('permission.batchCheckDone').replace('{{granted}}', String(grantedCount)).replace('{{total}}', String(permissions.length))}`);
  }, [permissions, append, t]);

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
          append(`${t('common.success')} ${label} ${t('permission.grantSuccess')}`);
        } else if (result === 'denied') {
          append(`${t('common.error')} ${label} ${t('permission.grantDenied')}`);
        } else if (result === 'blocked') {
          append(`${t('common.warning')} ${label} ${t('permission.grantBlocked')}`);
        } else if (result === 'unavailable') {
          append(`${t('common.warning')} ${label} ${t('permission.notSupported')}`);
        } else {
          append(`${t('common.info')} ${label} ${t('common.status')}: ${result}`);
        }
      } catch (error) {
        setStatuses(prev => ({ ...prev, [key]: 'denied' }));
        append(`${t('common.error')} ${label} ${t('permission.requestError')}: ${error}`);
      }
    },
    [permissions, append, t],
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
          t={t}
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
  const { t } = useTranslation();
  const safeAppend = append ?? (() => {});

  const PLATFORM_PERMISSIONS = [
    {
      key: 'android',
      label: t('permission.android'),
      permissions: [
        { key: ITC_PERMISSIONS.ANDROID.CAMERA, label: 'Camera' },
        { key: ITC_PERMISSIONS.ANDROID.RECORD_AUDIO, label: 'Microphone' },
        { key: ITC_PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, label: 'Precise Location' },
        { key: ITC_PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION, label: 'Coarse Location' },
        { key: ITC_PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION, label: 'Background Location' },
        { key: ITC_PERMISSIONS.ANDROID.READ_CONTACTS, label: 'Read Contacts' },
        { key: ITC_PERMISSIONS.ANDROID.WRITE_CONTACTS, label: 'Write Contacts' },
        { key: ITC_PERMISSIONS.ANDROID.READ_CALENDAR, label: 'Read Calendar' },
        { key: ITC_PERMISSIONS.ANDROID.WRITE_CALENDAR, label: 'Write Calendar' },
        { key: ITC_PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, label: 'Read Storage' },
        { key: ITC_PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, label: 'Write Storage' },
        { key: ITC_PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, label: 'Read Images' },
        { key: ITC_PERMISSIONS.ANDROID.READ_MEDIA_VIDEO, label: 'Read Video' },
        { key: ITC_PERMISSIONS.ANDROID.READ_MEDIA_AUDIO, label: 'Read Audio' },
        { key: ITC_PERMISSIONS.ANDROID.BLUETOOTH_SCAN, label: 'Bluetooth Scan' },
        { key: ITC_PERMISSIONS.ANDROID.BLUETOOTH_CONNECT, label: 'Bluetooth Connect' },
        { key: ITC_PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE, label: 'Bluetooth Advertise' },
        { key: ITC_PERMISSIONS.ANDROID.POST_NOTIFICATIONS, label: 'Notifications' },
        { key: ITC_PERMISSIONS.ANDROID.BODY_SENSORS, label: 'Body Sensors' },
        { key: ITC_PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION, label: 'Activity Recognition' },
        { key: ITC_PERMISSIONS.ANDROID.ACCEPT_HANDOVER, label: 'Call Handover' },
        { key: ITC_PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION, label: 'Media Location' },
        { key: ITC_PERMISSIONS.ANDROID.ADD_VOICEMAIL, label: 'Voicemail' },
        { key: ITC_PERMISSIONS.ANDROID.ANSWER_PHONE_CALLS, label: 'Answer Phone Calls' },
        { key: ITC_PERMISSIONS.ANDROID.CALL_PHONE, label: 'Make Calls' },
        { key: ITC_PERMISSIONS.ANDROID.GET_ACCOUNTS, label: 'Get Accounts' },
        { key: ITC_PERMISSIONS.ANDROID.NEARBY_WIFI_DEVICES, label: 'Nearby WiFi Devices' },
        { key: ITC_PERMISSIONS.ANDROID.PROCESS_OUTGOING_CALLS, label: 'Process Outgoing Calls' },
        { key: ITC_PERMISSIONS.ANDROID.READ_CALL_LOG, label: 'Read Call Log' },
        { key: ITC_PERMISSIONS.ANDROID.WRITE_CALL_LOG, label: 'Write Call Log' },
        { key: ITC_PERMISSIONS.ANDROID.READ_PHONE_NUMBERS, label: 'Read Phone Numbers' },
        { key: ITC_PERMISSIONS.ANDROID.READ_PHONE_STATE, label: 'Read Phone State' },
        { key: ITC_PERMISSIONS.ANDROID.READ_SMS, label: 'Read SMS' },
        { key: ITC_PERMISSIONS.ANDROID.RECEIVE_SMS, label: 'Receive SMS' },
        { key: ITC_PERMISSIONS.ANDROID.RECEIVE_MMS, label: 'Receive MMS' },
        { key: ITC_PERMISSIONS.ANDROID.SEND_SMS, label: 'Send SMS' },
        { key: ITC_PERMISSIONS.ANDROID.USE_SIP, label: 'Use SIP' },
        { key: ITC_PERMISSIONS.ANDROID.UWB_RANGING, label: 'UWB Ranging' },
      ],
    },
    {
      key: 'ios',
      label: t('permission.ios'),
      permissions: [
        { key: ITC_PERMISSIONS.IOS.CAMERA, label: 'Camera' },
        { key: ITC_PERMISSIONS.IOS.MICROPHONE, label: 'Microphone' },
        { key: ITC_PERMISSIONS.IOS.LOCATION_WHEN_IN_USE, label: 'Location (In Use)' },
        { key: ITC_PERMISSIONS.IOS.LOCATION_ALWAYS, label: 'Location (Always)' },
        { key: ITC_PERMISSIONS.IOS.CONTACTS, label: 'Contacts' },
        { key: ITC_PERMISSIONS.IOS.CALENDARS, label: 'Calendars' },
        { key: ITC_PERMISSIONS.IOS.PHOTO_LIBRARY, label: 'Photo Library' },
        { key: ITC_PERMISSIONS.IOS.MEDIA_LIBRARY, label: 'Media Library' },
        { key: ITC_PERMISSIONS.IOS.REMINDERS, label: 'Reminders' },
        { key: ITC_PERMISSIONS.IOS.SPEECH_RECOGNITION, label: 'Speech Recognition' },
        { key: ITC_PERMISSIONS.IOS.MOTION, label: 'Motion & Fitness' },
        { key: ITC_PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY, label: 'App Tracking' },
        { key: ITC_PERMISSIONS.IOS.FACE_ID, label: 'Face ID' },
        { key: ITC_PERMISSIONS.IOS.STOREKIT, label: 'StoreKit' },
        { key: ITC_PERMISSIONS.IOS.BLUETOOTH, label: 'Bluetooth' },
      ],
    },
    {
      key: 'harmony',
      label: t('permission.harmony'),
      permissions: [
        { key: ITC_PERMISSIONS.HARMONY.CAMERA, label: 'Camera' },
        { key: ITC_PERMISSIONS.HARMONY.MICROPHONE, label: 'Microphone' },
        { key: ITC_PERMISSIONS.HARMONY.LOCATION, label: 'Precise Location' },
        { key: ITC_PERMISSIONS.HARMONY.APPROXIMATELY_LOCATION, label: 'Coarse Location' },
        { key: ITC_PERMISSIONS.HARMONY.READ_CONTACTS, label: 'Read Contacts' },
        { key: ITC_PERMISSIONS.HARMONY.WRITE_CONTACTS, label: 'Write Contacts' },
        { key: ITC_PERMISSIONS.HARMONY.READ_CALENDAR, label: 'Read Calendar' },
        { key: ITC_PERMISSIONS.HARMONY.WRITE_CALENDAR, label: 'Write Calendar' },
        { key: ITC_PERMISSIONS.HARMONY.READ_HEALTH_DATA, label: 'Health Data' },
        { key: ITC_PERMISSIONS.HARMONY.ACTIVITY_MOTION, label: 'Activity Recognition' },
        { key: ITC_PERMISSIONS.HARMONY.READ_MEDIA, label: 'Read Media' },
        { key: ITC_PERMISSIONS.HARMONY.MEDIA_LOCATION, label: 'Media Location' },
        { key: ITC_PERMISSIONS.HARMONY.ACCESS_BLUETOOTH, label: 'Bluetooth Connect' },
        { key: ITC_PERMISSIONS.HARMONY.DISTRIBUTED_DATASYNC, label: 'Distributed Data' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('permission.title')}</Text>
      <Text style={styles.description}>{t('permission.description')}</Text>
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
          const current = PLATFORM_PERMISSIONS[index];
          return (
            <PlatformPermissionList
              permissions={current?.permissions ?? []}
              busy={busy}
              append={safeAppend}
              t={t}
            />
          );
        }}
      >
        {PLATFORM_PERMISSIONS.map(p => (
          <Tab key={p.key} label={p.label} />
        ))}
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
