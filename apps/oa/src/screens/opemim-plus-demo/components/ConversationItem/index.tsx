/**
 * 会话列表项组件
 */
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { XStack, YStack, Text } from '@itc/uikit';
import { UserAvatar } from '../UserAvatar';
import type { ConversationItem as ConversationItemType } from '../../types';
import { formatTime, truncateText, formatUnreadCount } from '../../types';

export interface ConversationItemProps {
  /** 会话数据 */
  conversation: ConversationItemType;
  /** 点击事件 */
  onPress?: () => void;
  /** 长按事件 */
  onLongPress?: () => void;
}

/**
 * 会话列表项组件
 */
export const ConversationItem: React.FC<ConversationItemProps> = memo((props) => {
  const { conversation, onPress, onLongPress } = props;

  const {
    showName,
    faceURL,
    latestMsgContent,
    latestMsgSendTime,
    unreadCount,
    isPinned,
    isMuted,
  } = conversation;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <XStack flex={1} align="center" gap={12} padding={12}>
        {/* 头像 */}
        <View style={styles.avatarContainer}>
          <UserAvatar
            src={faceURL}
            nickname={showName}
            size={52}
          />
          {/* 在线状态指示器（预留） */}
          {isMuted && (
            <View style={styles.mutedIndicator}>
              <Text variant="caption" color="#fff">🔕</Text>
            </View>
          )}
        </View>

        {/* 右侧内容 */}
        <YStack flex={1} justify="center" gap={4}>
          <XStack justify="space-between" align="center">
            {/* 名称 */}
            <XStack align="center" gap={4} flex={1}>
              {isPinned && <Text variant="caption" color="#8E8E93">📌</Text>}
              <Text
                variant="h3"
                fontWeight={unreadCount > 0 ? '600' : '400'}
                numberOfLines={1}
                style={{ flex: 1 }}
              >
                {showName}
              </Text>
            </XStack>

            {/* 时间 */}
            {latestMsgSendTime && (
              <Text variant="caption" color="#8E8E93" style={{ flexShrink: 0 }}>
                {formatTime(latestMsgSendTime)}
              </Text>
            )}
          </XStack>

          <XStack justify="space-between" align="center">
            {/* 最新消息 */}
            <Text
              variant="body"
              color={unreadCount > 0 ? '#1A1A1A' : '#8E8E93'}
              fontWeight={unreadCount > 0 ? '500' : '400'}
              numberOfLines={1}
              style={{ flex: 1 }}
            >
              {truncateText(latestMsgContent || '暂无消息', 25)}
            </Text>

            {/* 未读数 */}
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text variant="caption" color="#fff">
                  {formatUnreadCount(unreadCount)}
                </Text>
              </View>
            )}
          </XStack>
        </YStack>
      </XStack>
    </Pressable>
  );
});

ConversationItem.displayName = 'ConversationItem';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  pressed: {
    backgroundColor: '#F2F2F7',
  },
  avatarContainer: {
    position: 'relative',
  },
  mutedIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    marginLeft: 8,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
