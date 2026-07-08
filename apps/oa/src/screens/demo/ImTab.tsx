import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, TextInput } from 'react-native';
import { eventBus } from '@itc/base';
import { im } from '@itc/rn-client-sdk-plus';
import { Text as UiText, Button, Card, YStack, XStack } from '@itc/uikit';
import type { TabProps } from './shared';

const DEBUG = true;

interface Conversation {
  conversationID: string;
  showName: string;
  latestMsgDate: string;
}

/** IM 测试 Tab - v5.0: 恢复完整 IM SDK 功能 */
export function ImTab({ append }: TabProps) {
  useEffect(() => {
    if (DEBUG) console.log('ImTab mounted');
    return () => {
      if (DEBUG) console.log('ImTab unmounted');
    };
  }, []);

  const [status, setStatus] = useState('未初始化');
  const [unreadCount, setUnreadCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUserId, setLoginUserId] = useState('');
  const [token, setToken] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // 所有事件监听器
  useEffect(() => {
    console.log('ImTab: 正在设置事件监听器...');

    const offConn = eventBus.on('im:connectionChanged', (state) => {
      console.log('ImTab: 收到 connectionChanged', state);
      setStatus(String(state));
    });

    const offNewMsg = eventBus.on('im:newMessage', (msg) => {
      console.log('ImTab: 收到 newMessage', msg);
      append('💬 收到新消息');
    });

    const offUnread = eventBus.on('im:totalUnreadChanged', (count) => {
      console.log('ImTab: 收到 totalUnreadChanged', count);
      setUnreadCount(Number(count));
    });

    const offKicked = eventBus.on('im:kickedOffline', () => {
      console.log('ImTab: 收到 kickedOffline');
      setLoggedIn(false);
      append('⚠️ 被踢下线');
    });

    console.log('ImTab: 所有事件监听器已设置');
    return () => {
      console.log('ImTab: 移除事件监听器');
      offConn();
      offNewMsg();
      offUnread();
      offKicked();
    };
  }, [append]);

  // 初始化 IM SDK
  const handleInit = async () => {
    try {
      append('正在初始化 IM SDK...');
      await im.init({
        platformID: 2,
        apiAddr: 'http://your-api-server.com',
        wsAddr: 'ws://your-ws-server.com',
      });
      setReady(true);
      append('✅ IM SDK 初始化成功');
    } catch (e: any) {
      append(`❌ 初始化失败: ${e.message}`);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (!loginUserId || !token) {
      append('⚠️ 请输入 UserID 和 Token');
      return;
    }
    try {
      append('正在登录...');
      await im.login(loginUserId, token);
      setLoggedIn(true);
      append(`✅ 登录成功: ${loginUserId}`);
    } catch (e: any) {
      append(`❌ 登录失败: ${e.message}`);
    }
  };

  // 登出
  const handleLogout = async () => {
    try {
      await im.logout();
      setLoggedIn(false);
      setConversations([]);
      append('✅ 已登出');
    } catch (e: any) {
      append(`❌ 登出失败: ${e.message}`);
    }
  };

  // 获取会话列表
  const handleGetConversations = async () => {
    try {
      append('正在获取会话列表...');
      const result = await im.getAllConversationList();
      const list = JSON.parse(result);
      const convList: Conversation[] = list.map((conv: any) => ({
        conversationID: conv.conversationID || conv.groupID || '',
        showName: conv.showName || conv.conversationID || '',
        latestMsgDate: conv.latestMsgDate
          ? new Date(conv.latestMsgDate).toLocaleString()
          : '',
      }));
      setConversations(convList);
      append(`✅ 获取会话列表成功 (${convList.length} 个)`);
    } catch (e: any) {
      append(`❌ 获取会话失败: ${e.message}`);
    }
  };

  // 获取未读数
  const handleGetUnread = async () => {
    try {
      const count = await im.getTotalUnreadMsgCount();
      setUnreadCount(count);
      append(`✅ 未读消息数: ${count}`);
    } catch (e: any) {
      append(`❌ 获取未读数失败: ${e.message}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 状态卡片 */}
      <Card padding={16}>
        <YStack gap={12}>
          <UiText variant="h3">IM 测试</UiText>
          <XStack align="center" gap={8}>
            <UiText>状态:</UiText>
            <UiText color={ready ? '$green9' : '$red9'}>{status}</UiText>
          </XStack>
          <XStack align="center" gap={8}>
            <UiText>未读:</UiText>
            <UiText color="$blue9">{unreadCount}</UiText>
          </XStack>
          {!ready ? (
            <Button onPress={handleInit}>初始化</Button>
          ) : (
            <YStack gap={8}>
              <TextInput
                style={styles.input}
                placeholder="UserID"
                value={loginUserId}
                onChangeText={setLoginUserId}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Token"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
              />
              {!loggedIn ? (
                <Button onPress={handleLogin}>登录</Button>
              ) : (
                <Button onPress={handleLogout}>登出</Button>
              )}
            </YStack>
          )}
        </YStack>
      </Card>

      {/* 功能卡片 */}
      <Card padding={16}>
        <YStack gap={12}>
          <UiText variant="h3">功能测试</UiText>
          <XStack gap={8}>
            <Button onPress={handleGetConversations} disabled={!loggedIn}>
              获取会话
            </Button>
            <Button onPress={handleGetUnread} disabled={!loggedIn}>
              {`未读数(${unreadCount})`}
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* 会话列表 */}
      {conversations.length > 0 && (
        <Card padding={16}>
          <YStack gap={8}>
            <UiText variant="h3">会话列表</UiText>
            {conversations.map((conv: Conversation, i: number) => (
              <View key={i} style={styles.convItem}>
                <UiText variant="caption">
                  {conv.showName || conv.conversationID}
                </UiText>
                <UiText variant="caption" color="$gray9">
                  {conv.latestMsgDate || ''}
                </UiText>
              </View>
            ))}
          </YStack>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  convItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
});
