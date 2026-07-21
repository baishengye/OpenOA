/**
 * 消息气泡组件
 * 支持多种消息类型的渲染
 */
import React, { memo } from 'react';
import { StyleSheet, View, Image, Pressable } from 'react-native';
import { XStack, YStack, Text } from '@itc/uikit';
import { UserAvatar } from '../UserAvatar';
import type { Message } from '../../types';
import { formatMessageTime } from '../../types';
import { MessageType as SDKMessageTypes } from '@itc/rn-client-sdk-plus';

export interface MessageBubbleProps {
  /** 消息数据 */
  message: Message;
  /** 是否是自己发送的 */
  isOwn: boolean;
  /** 是否显示头像 */
  showAvatar?: boolean;
  /** 是否显示时间 */
  showTime?: boolean;
  /** 点击事件 */
  onPress?: () => void;
  /** 长按事件 */
  onLongPress?: () => void;
}

/**
 * 消息气泡组件
 */
export const MessageBubble: React.FC<MessageBubbleProps> = memo((props) => {
  const {
    message,
    isOwn,
    showAvatar = true,
    showTime = false,
    onPress,
    onLongPress,
  } = props;

  const {
    sendID,
    senderNickname,
    senderFaceUrl,
    contentType,
    status,
  } = message;

  // 根据消息类型选择渲染函数
  const renderContent = () => {
    switch (contentType) {
      case SDKMessageTypes.TextMessage: // text
        return <TextMessageContent message={message} />;
      case SDKMessageTypes.PictureMessage: // image
        return <ImageMessageContent message={message} />;
      case SDKMessageTypes.VoiceMessage: // audio
        return <AudioMessageContent message={message} isOwn={isOwn} />;
      case SDKMessageTypes.VideoMessage: // video
        return <VideoMessageContent message={message} />;
      case SDKMessageTypes.FileMessage: // file
        return <FileMessageContent message={message} />;
      case SDKMessageTypes.LocationMessage: // location
        return <LocationMessageContent message={message} />;
      default:
        return <TextMessageContent message={message} />;
    }
  };

  return (
    <View style={[styles.container, isOwn && styles.ownContainer]}>
      {/* 头像（对方消息在左） */}
      {showAvatar && !isOwn && (
        <UserAvatar
          src={senderFaceUrl}
          nickname={senderNickname || sendID}
          size={40}
          style={styles.avatar}
        />
      )}

      {/* 消息内容 */}
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.bubbleContainer,
          isOwn ? styles.ownBubbleContainer : styles.otherBubbleContainer,
          pressed && styles.bubblePressed,
        ]}
      >
        {renderContent()}

        {/* 发送状态 */}
        {isOwn && status === 'sending' && (
          <View style={styles.statusIndicator}>
            <Text variant="caption" color="#8E8E93">...</Text>
          </View>
        )}
        {isOwn && status === 'failed' && (
          <View style={styles.statusIndicator}>
            <Text variant="caption" color="#FF3B30">!</Text>
          </View>
        )}
      </Pressable>

      {/* 头像（自己消息在右） */}
      {showAvatar && isOwn && (
        <UserAvatar
          src={senderFaceUrl}
          nickname={senderNickname || sendID}
          size={40}
          style={styles.avatarOwn}
        />
      )}
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

// ── 子组件 ───────────────────────────────────────────────────────────────────

/** 文本消息内容 */
const TextMessageContent: React.FC<{ message: Message }> = memo(({ message }) => (
  <Text
    variant="h3"
    color={message.isSelf ? '#fff' : '#1A1A1A'}
    style={styles.textContent}
  >
    {message.textElem?.content || message.content || ''}
  </Text>
));

/** 图片消息内容 */
const ImageMessageContent: React.FC<{ message: Message }> = memo(({ message }) => {
  const url = message.pictureElem?.bigPicture?.url || message.pictureElem?.sourcePicture?.url || message.content;
  if (!url) {
    return (
      <View style={styles.imagePlaceholder}>
        <Text variant="body" color="#8E8E93">图片加载中...</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: url }}
      style={styles.imageContent}
      resizeMode="cover"
    />
  );
});

/** 语音消息内容 */
const AudioMessageContent: React.FC<{ message: Message; isOwn: boolean }> = memo(
  ({ message, isOwn }) => {
    const duration = message.soundElem?.duration || 0;
    return (
      <XStack align="center" gap={8} padding={8}>
        <Text variant="body" color={isOwn ? '#fff' : '#1A1A1A'}>
          🔊
        </Text>
        <Text variant="body" color={isOwn ? '#fff' : '#8E8E93'}>
          {Math.ceil(duration)}"
        </Text>
      </XStack>
    );
  }
);

/** 视频消息内容 */
const VideoMessageContent: React.FC<{ message: Message }> = memo(({ message }) => {
  const thumbnailUrl = message.videoElem?.snapshotUrl || '';
  const duration = message.videoElem?.duration || 0;

  return (
    <View style={styles.videoContainer}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.videoThumbnail} />
      ) : (
        <View style={styles.videoPlaceholder}>
          <Text variant="body" color="#fff">🎬</Text>
        </View>
      )}
      <View style={styles.videoDuration}>
        <Text variant="caption" color="#fff">{Math.ceil(duration)}"</Text>
      </View>
    </View>
  );
});

/** 文件消息内容 */
const FileMessageContent: React.FC<{ message: Message }> = memo(({ message }) => {
  const fileName = message.fileElem?.fileName || message.content || '文件';
  const fileSize = message.fileElem?.fileSize || 0;

  return (
    <XStack align="center" gap={8} padding={8}>
      <Text variant="body">📎</Text>
      <YStack flex={1}>
        <Text variant="body" numberOfLines={1} color={message.isSelf ? '#fff' : '#1A1A1A'}>
          {fileName}
        </Text>
        {fileSize > 0 && (
          <Text variant="caption" color={message.isSelf ? '#ddd' : '#8E8E93'}>
            {formatFileSize(fileSize)}
          </Text>
        )}
      </YStack>
    </XStack>
  );
});

/** 位置消息内容 */
const LocationMessageContent: React.FC<{ message: Message }> = memo(({ message }) => {
  const description = message.locationElem?.description || message.content || '位置';

  return (
    <XStack align="center" gap={8} padding={8}>
      <Text variant="body">📍</Text>
      <Text variant="body" color={message.isSelf ? '#fff' : '#1A1A1A'}>
        {description}
      </Text>
    </XStack>
  );
});

/** 格式化文件大小 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  ownContainer: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    marginRight: 8,
  },
  avatarOwn: {
    marginLeft: 8,
  },
  bubbleContainer: {
    maxWidth: '70%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ownBubbleContainer: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubbleContainer: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  bubblePressed: {
    opacity: 0.8,
  },
  textContent: {
    lineHeight: 22,
  },
  imageContent: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#E9E9EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  videoContainer: {
    width: 180,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusIndicator: {
    position: 'absolute',
    right: -20,
    bottom: 4,
  },
});
