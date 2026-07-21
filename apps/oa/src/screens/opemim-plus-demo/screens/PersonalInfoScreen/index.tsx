/**
 * 个人中心页面
 */
import React, { memo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { XStack, YStack, Text } from '@itc/uikit';
import { UserAvatar } from '../../components';
import { useAuthStore } from '../../stores';

export interface PersonalInfoScreenProps {
  /** 返回回调 */
  onGoBack?: () => void;
  /** 跳转到设置 */
  onNavigateToSettings?: () => void;
  /** 跳转到二维码 */
  onShowQRCode?: () => void;
  /** 跳转到收藏 */
  onNavigateToFavorites?: () => void;
  /** 跳转到钱包 */
  onNavigateToWallet?: () => void;
  /** 退出登录回调 */
  onLogout?: () => void;
}

interface MenuItemProps {
  icon: string;
  title: string;
  onPress?: () => void;
  showArrow?: boolean;
  badge?: string;
}

const MenuItem: React.FC<MenuItemProps> = memo(({ icon, title, onPress, showArrow = true, badge }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.menuItem,
      pressed && styles.menuItemPressed,
    ]}
  >
    <XStack align="center" gap={12}>
      <Text variant="body" fontSize={20}>{icon}</Text>
      <View style={styles.menuItemTitle}>
        <Text variant="h3" color="#1A1A1A">{title}</Text>
      </View>
      {badge && (
        <Text variant="caption" color="#8E8E93">{badge}</Text>
      )}
      {showArrow && (
        <Text variant="body" color="#C7C7CC">›</Text>
      )}
    </XStack>
  </Pressable>
));

export const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = memo((props) => {
  const { onGoBack, onNavigateToSettings, onShowQRCode, onNavigateToFavorites, onNavigateToWallet, onLogout } = props;

  const { user } = useAuthStore();

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
            useAuthStore.getState().logout();
            onLogout?.();
          },
        },
      ]
    );
  }, [onLogout]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Pressable onPress={onGoBack} style={styles.backButton}>
          <Text variant="h3" color="#007AFF">← 返回</Text>
        </Pressable>
        <Text variant="h3" fontWeight="600">我的</Text>
        <Pressable onPress={onNavigateToSettings}>
          <Text variant="body" color="#007AFF">设置</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 用户信息卡片 */}
        <Pressable onPress={onShowQRCode} style={styles.profileCard}>
          <XStack align="center" gap={16}>
            <UserAvatar
              src={user?.faceURL}
              nickname={user?.nickname || user?.userID}
              size={64}
            />
            <View style={styles.profileInfo}>
              <Text variant="body" fontWeight="600" fontSize={18}>
                {user?.nickname || user?.userID || '未设置昵称'}
              </Text>
              <View style={styles.profileInfoRow}>
                <Text variant="caption" color="#8E8E93">
                  手机号: {user?.phone || '未绑定'}
                </Text>
              </View>
              <View style={styles.profileInfoRow}>
                <XStack align="center" gap={4}>
                  <Text variant="caption" color="#8E8E93">二维码</Text>
                  <Text variant="caption" color="#8E8E93">›</Text>
                </XStack>
              </View>
            </View>
          </XStack>
        </Pressable>

        {/* 功能菜单 */}
        <View style={styles.menuSection}>
          <MenuItem icon="⭐" title="收藏" onPress={onNavigateToFavorites} />
          <MenuItem icon="💰" title="钱包" onPress={onNavigateToWallet} badge="0.00" />
        </View>

        <View style={styles.sectionGap} />

        {/* 其他设置 */}
        <View style={styles.menuSection}>
          <MenuItem icon="🛡️" title="隐私" />
          <MenuItem icon="🎨" title="通用" />
          <MenuItem icon="📱" title="关于" />
        </View>

        <View style={styles.sectionGap} />

        {/* 退出登录 */}
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
      </ScrollView>
    </SafeAreaView>
  );
});

PersonalInfoScreen.displayName = 'PersonalInfoScreen';

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
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileInfoRow: {
    marginTop: 4,
  },
  menuSection: {
    marginTop: 12,
  },
  menuItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemPressed: {
    backgroundColor: '#F2F2F7',
  },
  menuItemTitle: {
    flex: 1,
  },
  sectionGap: {
    height: 20,
  },
  logoutButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    marginTop: 20,
  },
  logoutButtonPressed: {
    backgroundColor: '#F2F2F7',
  },
});
