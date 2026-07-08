import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, StyleSheet, TextInput, Alert } from 'react-native';
import { eventBus } from '@itc/base';
import { im } from '@itc/rn-client-sdk-plus';
import { Text, Button, Card, YStack, XStack } from '@itc/uikit';
import { describe } from './shared';
import type { TabProps } from './shared';

/** IM 测试 Tab */
export function ImTab({ run, append, busy }: TabProps) {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUserId, setLoginUserId] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<string>('未初始化');
  const [conversations, setConversations] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 初始化
  const doInit = useCallback(async () => {
    try {
      await im.init({
        apiAddr: 'http://192.168.1.1:10000',
        wsAddr: 'ws://192.168.1.1:17778',
        dataDir: '',
      });
      setReady(true);
      setStatus('已初始化');
      append('✅ OpenIM SDK 初始化成功');
    } catch (e) {
      append(`❌ 初始化失败: ${describe(e)}`);
    }
  }, [append]);

  // 登录
  const doLogin = useCallback(async () => {
    if (!loginUserId || !token) {
      Alert.alert('提示', '请输入 UserID 和 Token');
      return;
    }
    try {
      await im.login(loginUserId, token);
      setLoggedIn(true);
      setStatus('已登录');
      append(`✅ 登录成功: ${loginUserId}`);
    } catch (e) {
      append(`❌ 登录失败: ${describe(e)}`);
    }
  }, [loginUserId, token, append]);

  // 登出
  const doLogout = useCallback(async () => {
    try {
      await im.logout();
      setLoggedIn(false);
      setStatus('已登出');
      append('✅ 登出成功');
    } catch (e) {
      append(`❌ 登出失败: ${describe(e)}`);
    }
  }, [append]);

  // 获取会话列表
  const doGetConversations = useCallback(async () => {
    try {
      const result = await im.getAllConversationList();
      const list = JSON.parse(result);
      setConversations(list);
      append(`✅ 获取会话列表成功 (${list.length} 个)`);
    } catch (e) {
      append(`❌ 获取会话列表失败: ${describe(e)}`);
    }
  }, [append]);

  // 获取未读数
  const doGetUnread = useCallback(async () => {
    try {
      const count = await im.getTotalUnreadMsgCount();
      setUnreadCount(count);
      append(`✅ 未读消息数: ${count}`);
    } catch (e) {
      append(`❌ 获取未读数失败: ${describe(e)}`);
    }
  }, [append]);

  // 监听事件
  useEffect(() => {
    const offConn = eventBus.on('im:connectionChanged', (state: string) => {
      setStatus(state);
      append(`📡 连接状态: ${state}`);
    });

    const offNewMsg = eventBus.on('im:newMessage', (msg: any) => {
      append(`💬 新消息: ${msg.clientMsgID?.slice(0, 8) || '?'}...`);
    });

    const offUnread = eventBus.on('im:totalUnreadChanged', (count: number) => {
      setUnreadCount(count);
    });

    const offKicked = eventBus.on('im:kickedOffline', () => {
      setLoggedIn(false);
      append('⚠️ 被踢下线');
    });

    return () => {
      offConn();
      offNewMsg();
      offUnread();
      offKicked();
    };
  }, [append]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 状态卡片 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">① 初始化 & 登录</Text>
          <XStack align="center" gap={8}>
            <Text>状态:</Text>
            <Text color={ready ? '$green9' : '$red9'}>{status}</Text>
          </XStack>
          {!ready ? (
            <Button onPress={() => run('初始化', doInit)} disabled={busy}>
              初始化 SDK
            </Button>
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
                <Button onPress={() => run('登录', doLogin)} disabled={busy}>
                  登录
                </Button>
              ) : (
                <Button onPress={() => run('登出', doLogout)} disabled={busy}>
                  登出
                </Button>
              )}
            </YStack>
          )}
        </YStack>
      </Card>

      {/* 功能卡片 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">② 功能测试</Text>
          <XStack gap={8}>
            <Button
              onPress={() => run('获取会话', doGetConversations)}
              disabled={busy || !loggedIn}
            >
              获取会话
            </Button>
            <Button
              onPress={() => run('获取未读', doGetUnread)}
              disabled={busy || !loggedIn}
            >
              未读数({unreadCount})
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* 会话列表 */}
      {conversations.length > 0 && (
        <Card padding={16}>
          <YStack gap={8}>
            <Text variant="h3">③ 会话列表</Text>
            {conversations.map((conv: any, i: number) => (
              <View key={i} style={styles.convItem}>
                <Text variant="caption">
                  {conv.showName || conv.conversationID}
                </Text>
                <Text variant="caption" color="$gray9">
                  {conv.latestMsgDate || ''}
                </Text>
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
