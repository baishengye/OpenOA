/**
 * 聊天页面
 */
import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  ActionSheetIOS,
  Modal,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@itc/flash-list';
import { XStack, Text, Toast } from '@itc/uikit';
import { useChat } from '../../hooks';
import { MessageBubble, ChatInput } from '../../components';
import type { Message } from '../../types';

export interface ChatScreenProps {
  /** 会话 ID */
  conversationID: string;
  /** 显示名称 */
  showName: string;
  /** 会话类型：single 单聊，group 群聊 */
  conversationType?: 'single' | 'group';
  /** 对方用户 ID（单聊） */
  userID?: string;
  /** 群 ID（群聊） */
  groupID?: string;
  /** 返回回调 */
  onGoBack?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = memo((props) => {
  const { conversationID, showName, conversationType = 'single', userID, groupID, onGoBack } = props;

  console.log('[ChatScreen] 接收参数:', {
    conversationID,
    showName,
    conversationType,
    userID,
    groupID,
  });

  const insets = useSafeAreaInsets();

  const {
    messages,
    isLoading,
    isSending,
    sendText,
    sendImage,
    sendAudio,
    sendVideo,
    sendFile,
    sendLocation,
    revoke,
    removeMessage,
    loadMore,
  } = useChat({ conversationID, conversationType, userID, groupID });

  const listRef = useRef<any>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  // 消息发送成功后滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // 处理发送文本
  const handleSendText = useCallback(
    async (text: string) => {
      try {
        await sendText(text);
      } catch (error) {
        Toast.show({
          message: '发送失败',
          type: 'fail',
        });
      }
    },
    [sendText]
  );

  // 处理发送图片
  const handleSendImage = useCallback(async () => {
    setShowMoreMenu(false);
    Toast.show({
      message: '请实现图片选择功能',
      type: 'info',
    });
  }, []);

  // 处理发送语音
  const handleSendVoice = useCallback(() => {
    Toast.show({
      message: '请实现语音录制功能',
      type: 'info',
    });
  }, []);

  // 处理发送位置
  const handleSendLocation = useCallback(async () => {
    setShowMoreMenu(false);
    try {
      await sendLocation(116.404, 39.915, '我的位置');
    } catch (error) {
      Toast.show({
        message: '发送位置失败',
        type: 'fail',
      });
    }
  }, [sendLocation]);

  // 处理发送文件
  const handleSendFile = useCallback(() => {
    setShowMoreMenu(false);
    Toast.show({
      message: '请实现文件选择功能',
      type: 'info',
    });
  }, []);

  // 处理消息点击
  const handleMessagePress = useCallback((message: Message) => {
    // 可以显示消息详情
  }, []);

  // 处理消息长按
  const handleMessageLongPress = useCallback((message: Message) => {
    setSelectedMessage(message);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['取消', '撤回', '删除'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            revoke(message.clientMsgID);
          } else if (buttonIndex === 2) {
            Alert.alert('删除消息', '确定删除这条消息吗？', [
              { text: '取消', style: 'cancel' },
              {
                text: '删除',
                style: 'destructive',
                onPress: () => removeMessage(message.clientMsgID),
              },
            ]);
          }
        }
      );
    } else {
      setShowMoreMenu(true);
    }
  }, [revoke, removeMessage]);

  // 渲染消息项
  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        isOwn={item.isSelf ?? false}
        onPress={() => handleMessagePress(item)}
        onLongPress={() => handleMessageLongPress(item)}
      />
    ),
    [handleMessagePress, handleMessageLongPress]
  );

  // 渲染空状态
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text variant="body" color="#8E8E93">暂无消息</Text>
      <View style={{ marginTop: 8 }}>
        <Text variant="h3" color="#8E8E93">开始聊天吧</Text>
      </View>
    </View>
  ), []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* 顶部导航栏 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <XStack align="center" gap={8}>
          <Pressable onPress={onGoBack} style={styles.backButton}>
            <Text variant="h3" color="#007AFF">←</Text>
          </Pressable>
          <Text variant="h3" fontWeight="600" numberOfLines={1} style={styles.title}>
            {showName}
          </Text>
        </XStack>
        <XStack gap={16}>
          <Pressable onPress={() => Toast.show({ message: '语音通话', type: 'info' })}>
            <Text variant="body" color="#007AFF">📞</Text>
          </Pressable>
          <Pressable onPress={() => Toast.show({ message: '视频通话', type: 'info' })}>
            <Text variant="body" color="#007AFF">📹</Text>
          </Pressable>
        </XStack>
      </View>

      {/* 消息列表 */}
      <View style={styles.listContainer}>
        <FlashList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          estimatedItemSize={60}
          keyExtractor={(item) => item.clientMsgID}
          ListEmptyComponent={renderEmptyState}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
          inverted={false}
        />
      </View>

      {/* 输入框 */}
      <View style={[styles.inputWrapper, { paddingBottom: insets.bottom }]}>
        <ChatInput
          disabled={isSending}
          onSendText={handleSendText}
          onPressEmoji={() => setShowEmojiPicker(!showEmojiPicker)}
          onPressMore={() => setShowMoreMenu(true)}
          onPressVoice={handleSendVoice}
        />
      </View>

      {/* 更多功能菜单 */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleSendImage}>
              <Text>📷 图片</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSendLocation}>
              <Text>📍 位置</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSendFile}>
              <Text>📎 文件</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuCancel]}
              onPress={() => setShowMoreMenu(false)}
            >
              <Text color="#8E8E93">取消</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
});

ChatScreen.displayName = 'ChatScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  title: {
    maxWidth: 200,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  inputWrapper: {
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 34,
  },
  menuItem: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  menuCancel: {
    marginTop: 8,
  },
});
