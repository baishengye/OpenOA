/**
 * 设置页面
 */
import React, { memo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { XStack, YStack, Text } from '@itc/uikit';
import { useSettingsStore } from '../../stores';

export interface SettingsScreenProps {
  /** 返回回调 */
  onGoBack?: () => void;
  /** 跳转到关于我们 */
  onNavigateToAbout?: () => void;
  /** 跳转到清理缓存 */
  onNavigateToClearCache?: () => void;
  /** 跳转到版本更新 */
  onNavigateToCheckUpdate?: () => void;
}

interface SettingRowProps {
  icon: string;
  title: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

const SettingRow: React.FC<SettingRowProps> = memo(({
  icon,
  title,
  value,
  onPress,
  showArrow = true,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
}) => (
  <Pressable
    onPress={showSwitch ? undefined : onPress}
    style={({ pressed }) => [
      styles.settingRow,
      pressed && !showSwitch && styles.settingRowPressed,
    ]}
    disabled={showSwitch}
  >
    <XStack align="center" gap={12}>
      <Text variant="body" fontSize={20}>{icon}</Text>
      <View style={styles.settingRowTitle}>
        <Text variant="h3" color="#1A1A1A">{title}</Text>
      </View>
      {value && (
        <Text variant="body" color="#8E8E93">{value}</Text>
      )}
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
        />
      ) : showArrow ? (
        <Text variant="body" color="#C7C7CC">›</Text>
      ) : null}
    </XStack>
  </Pressable>
));

export const SettingsScreen: React.FC<SettingsScreenProps> = memo((props) => {
  const { onGoBack, onNavigateToAbout, onNavigateToClearCache, onNavigateToCheckUpdate } = props;

  const settings = useSettingsStore();

  const handleClearCache = useCallback(() => {
    Alert.alert(
      '清理缓存',
      '确定要清理缓存吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            // 清理缓存逻辑
            Alert.alert('提示', '缓存已清理');
          },
        },
      ]
    );
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: () => {
            // 退出登录逻辑
            onGoBack?.();
          },
        },
      ]
    );
  }, [onGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Pressable onPress={onGoBack} style={styles.backButton}>
          <Text variant="h3" color="#007AFF">← 返回</Text>
        </Pressable>
        <Text variant="h3" fontWeight="600">设置</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 消息通知 */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text variant="body" color="#8E8E93">消息通知</Text>
          </View>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="🔔"
              title="接收新消息通知"
              showSwitch
              switchValue={settings.notifyEnabled}
              onSwitchChange={(value) => settings.setNotifyEnabled(value)}
            />
            <SettingRow
              icon="🔊"
              title="消息声音"
              showSwitch
              switchValue={settings.soundEnabled}
              onSwitchChange={(value) => settings.setSoundEnabled(value)}
            />
            <SettingRow
              icon="📳"
              title="震动"
              showSwitch
              switchValue={settings.vibrateEnabled}
              onSwitchChange={(value) => settings.setVibrateEnabled(value)}
            />
            <SettingRow
              icon="🌙"
              title="免打扰"
              showSwitch
              switchValue={settings.doNotDisturb}
              onSwitchChange={(value) => settings.setDoNotDisturb(value)}
            />
          </View>
        </View>

        {/* 通话设置 */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text variant="body" color="#8E8E93">通话设置</Text>
          </View>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="📞"
              title="接听方式"
              value="自动接听"
              showArrow
            />
            <SettingRow
              icon="📹"
              title="允许 VoIP 呼叫"
              showSwitch
              switchValue={settings.allowVoIP}
              onSwitchChange={(value) => settings.setAllowVoIP(value)}
            />
          </View>
        </View>

        {/* 通用设置 */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text variant="body" color="#8E8E93">通用</Text>
          </View>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="🖼️"
              title="聊天背景"
              value="默认"
              onPress={() => {}}
            />
            <SettingRow
              icon="📁"
              title="清理缓存"
              value="23.5 MB"
              onPress={handleClearCache}
            />
            <SettingRow
              icon="📱"
              title="检查更新"
              value="v1.0.0"
              onPress={onNavigateToCheckUpdate}
            />
          </View>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Text variant="body" color="#8E8E93">关于</Text>
          </View>
          <View style={styles.sectionContent}>
            <SettingRow
              icon="📋"
              title="关于我们"
              onPress={onNavigateToAbout}
            />
            <SettingRow
              icon="📜"
              title="用户协议"
              onPress={() => {}}
            />
            <SettingRow
              icon="🔒"
              title="隐私政策"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* 退出登录 */}
        <View style={styles.logoutContainer}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <Text variant="h3" color="#FF3B30" textAlign="center">
              退出登录
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

SettingsScreen.displayName = 'SettingsScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
    width: 60,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    paddingLeft: 16,
  },
  settingRow: {
    paddingRight: 16,
    paddingVertical: 12,
  },
  settingRowPressed: {
    backgroundColor: '#F2F2F7',
  },
  settingRowTitle: {
    flex: 1,
  },
  logoutContainer: {
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
  },
  logoutButtonPressed: {
    backgroundColor: '#F2F2F7',
  },
});
