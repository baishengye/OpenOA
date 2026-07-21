/**
 * 用户头像组件
 * 支持网络图片、本地图片、默认首字母
 */
import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Avatar as TAvatar, Text } from '@itc/uikit';
import type { AvatarProps as TAvatarProps } from '@itc/uikit';

export interface UserAvatarProps {
  /** 用户 ID */
  userID?: string;
  /** 头像 URL */
  src?: string;
  /** 昵称（用于默认头像） */
  nickname?: string;
  /** 头像尺寸 */
  size?: number;
  /** 自定义样式 */
  style?: object;
}

/**
 * 用户头像组件
 */
export const UserAvatar: React.FC<UserAvatarProps> = memo((props) => {
  const { userID, src, nickname, size = 48, style } = props;

  // 获取首字母用于默认头像
  const getInitial = (): string => {
    if (nickname) {
      return nickname.charAt(0).toUpperCase();
    }
    if (userID) {
      return userID.charAt(0).toUpperCase();
    }
    return '?';
  };

  // 背景色映射（根据 userID 哈希）
  const getBackgroundColor = (): string => {
    if (!userID) return '#8E8E93';
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    ];
    const hash = userID.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length]!;
  };

  if (src) {
    return (
      <View style={[{ width: size, height: size }, style]}>
        <TAvatar size={size} src={src} fallback={getInitial()} />
      </View>
    );
  }

  return (
    <View style={[{ width: size, height: size, backgroundColor: getBackgroundColor(), borderRadius: size / 2 }, style]}>
      <Text
        variant="h3"
        color="#fff"
        fontWeight="bold"
        style={{ textAlign: 'center', lineHeight: size }}
      >
        {getInitial()}
      </Text>
    </View>
  );
});

UserAvatar.displayName = 'UserAvatar';
