/**
 * 会话列表页面
 */
import React, { memo, useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  RefreshControl,
  Alert,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { FlashList } from '@itc/flash-list';
import { XStack, Text, Input } from '@itc/uikit';
import { useConversationList } from '../../hooks';
import { ConversationItem } from '../../components';
import type { ConversationItem as ConversationItemType } from '../../types';

export interface ConversationListScreenProps {
  /** 跳转到聊天页面 */
  onNavigateToChat?: (conversationID: string, showName: string, conversationType: 'single' | 'group', userID?: string, groupID?: string) => void;
  /** 跳转到通讯录 */
  onNavigateToContacts?: () => void;
  /** 跳转到我的页面 */
  onNavigateToProfile?: () => void;
}

export const ConversationListScreen: React.FC<ConversationListScreenProps> = memo((props) => {
  const { onNavigateToChat, onNavigateToContacts, onNavigateToProfile } = props;

  const {
    conversations,
    isLoading,
    totalUnread,
    loadMore,
    refresh,
    operateConversation,
  } = useConversationList();

  const [searchText, setSearchText] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ConversationItemType | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // 过滤会话
  const filteredConversations = conversations.filter((conv: ConversationItemType) =>
    conv.showName.toLowerCase().includes(searchText.toLowerCase())
  );

  // 处理会话点击
  const handleConversationPress = useCallback(
    (conversation: ConversationItemType) => {
      console.log('[ConversationList] 点击会话:', {
        conversationID: conversation.conversationID,
        showName: conversation.showName,
        conversationType: conversation.conversationType,
        userID: conversation.userID,
        groupID: conversation.groupID,
      });
      onNavigateToChat?.(
        conversation.conversationID,
        conversation.showName,
        conversation.conversationType,
        conversation.userID,
        conversation.groupID
      );
    },
    [onNavigateToChat]
  );

  // 处理会话长按
  const handleConversationLongPress = useCallback(
    (conversation: ConversationItemType) => {
      setSelectedConversation(conversation);
      setShowMenu(true);
    },
    []
  );

  // 执行操作
  const handleAction = useCallback(
    (action: 'pin' | 'mute' | 'delete') => {
      if (!selectedConversation) return;

      if (action === 'delete') {
        Alert.alert('删除会话', `确定删除与 ${selectedConversation.showName} 的会话吗？`, [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: () => {
              operateConversation(selectedConversation.conversationID, 'delete');
              setShowMenu(false);
              setSelectedConversation(null);
            },
          },
        ]);
      } else {
        operateConversation(selectedConversation.conversationID, action);
        setShowMenu(false);
        setSelectedConversation(null);
      }
    },
    [selectedConversation, operateConversation]
  );

  // 渲染会话项
  const renderItem = useCallback(
    ({ item }: { item: ConversationItemType }) => (
      <ConversationItem
        conversation={item}
        onPress={() => handleConversationPress(item)}
        onLongPress={() => handleConversationLongPress(item)}
      />
    ),
    [handleConversationPress, handleConversationLongPress]
  );

  // 渲染空状态
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text variant="body" color="#8E8E93">暂无会话</Text>
      <View style={{ marginTop: 8 }}>
        <Text variant="h3" color="#8E8E93">开始聊天吧</Text>
      </View>
    </View>
  ), []);

  // 渲染分割线
  const renderSeparator = useCallback(() => <View style={styles.separator} />, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text variant="h3" fontWeight="bold">
          消息 {totalUnread > 0 ? `(${totalUnread})` : ''}
        </Text>
        <XStack gap={16}>
          <Pressable onPress={onNavigateToContacts}>
            <Text variant="body" color="#007AFF">👥</Text>
          </Pressable>
          <Pressable onPress={onNavigateToProfile}>
            <Text variant="body" color="#007AFF">👤</Text>
          </Pressable>
        </XStack>
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="搜索"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 会话列表 */}
      <View style={styles.listContainer}>
        <FlashList
          data={filteredConversations}
          renderItem={renderItem}
          estimatedItemSize={72}
          keyExtractor={(item: ConversationItemType) => item.conversationID}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor="#007AFF"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      </View>

      {/* 操作菜单 */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleAction('pin')}>
              <Text>{selectedConversation?.isPinned ? '取消置顶' : '置顶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleAction('mute')}>
              <Text>{selectedConversation?.isMuted ? '取消免打扰' : '免打扰'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleAction('delete')}>
              <Text color="#FF3B30">删除</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuCancel]}
              onPress={() => setShowMenu(false)}
            >
              <Text color="#8E8E93">取消</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
});

ConversationListScreen.displayName = 'ConversationListScreen';

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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
  },
  listContainer: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 76,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
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
