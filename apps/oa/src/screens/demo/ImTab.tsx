import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { itcOpenIM } from '@itc/rn-client-sdk-plus';
import { Text as UiText, Button, Card, YStack, XStack } from '@itc/uikit';
import { ImDemoMain } from '../demo/imDemo';
import type { TabProps } from './shared';
import { loggedAppend } from './shared';

// 注册 API 地址（后续可改为动态配置）
const REGISTER_API = 'http://172.16.82.54:10002';

/** IM 测试 Tab - 入口页面 */
export function ImTab({ append, busy: _busy }: TabProps) {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUserId, setLoginUserId] = useState('');
  const [token, setToken] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  // 包装 append，同时输出到 logger
  const log = loggedAppend(append);

  // 注册
  const handleRegister = async () => {
    if (!loginUserId.trim()) {
      Alert.alert('提示', '请输入要注册的用户ID');
      return;
    }
    try {
      log(`正在注册: ${loginUserId}...`);
      const response = await fetch(`${REGISTER_API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: loginUserId.trim() }),
      });
      const data = await response.json();
      if (data.code === 0 || data.errCode === 0) {
        log(`✅ 注册成功，用户ID: ${loginUserId}`);
        // 自动填充 token（如果有返回）
        if (data.data?.token) {
          setToken(data.data.token);
          log(`Token 已自动填充`);
        }
      } else {
        log(`❌ 注册失败: ${data.msg || data.errmsg || JSON.stringify(data)}`);
      }
    } catch (e: any) {
      log(`❌ 注册失败: ${e.message}`);
    }
  };

  // 初始化 SDK
  const handleInit = async () => {
    try {
      log('正在初始化 SDK...');
      await itcOpenIM.initSDK({
        apiAddr: 'http://172.16.82.54:10002',
        wsAddr: 'ws://172.16.82.54:10001',
        dataDir: 'itc_openim_data',
      });
      setReady(true);
      log('✅ SDK 初始化成功');
    } catch (e: any) {
      log(`❌ 初始化失败: ${e.message}`);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (!loginUserId || !token) {
      Alert.alert('提示', '请输入 UserID 和 Token');
      return;
    }
    try {
      log(`正在登录: ${loginUserId}...`);
      await itcOpenIM.login({ userID: loginUserId.trim(), token: token.trim() });
      setLoggedIn(true);
      log(`✅ 登录成功: ${loginUserId}`);
    } catch (e: any) {
      log(`❌ 登录失败: ${e.message}`);
    }
  };

  // 登出
  const handleLogout = async () => {
    try {
      await itcOpenIM.logout();
      setLoggedIn(false);
      log('✅ 已登出');
    } catch (e: any) {
      log(`❌ 登出失败: ${e.message}`);
    }
  };

  // 跳转到测试页面
  const navigateToDemo = () => {
    if (!loggedIn) {
      Alert.alert('提示', '请先登录');
      return;
    }
    setShowDemo(true);
  };

  // 从 Demo 返回
  const handleBackFromDemo = () => {
    setShowDemo(false);
  };

  // 如果已显示 Demo 页面，直接渲染
  if (showDemo && loggedIn) {
    return (
      <ImDemoMain
        onBack={handleBackFromDemo}
        onLog={(msg: string) => log(msg)}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 初始化卡片 */}
      <Card padding={16}>
        <YStack gap={12}>
          <UiText variant="h2">IM 功能测试</UiText>
          {!ready ? (
            <Button onPress={handleInit}>初始化 SDK</Button>
          ) : (
            <XStack align="center" gap={8}>
              <UiText color="$green9">✓ 已初始化</UiText>
            </XStack>
          )}
        </YStack>
      </Card>

      {/* 注册卡片 */}
      <Card padding={16}>
        <YStack gap={12}>
          <UiText variant="h3">注册</UiText>
          <TextInput
            style={styles.input}
            placeholder="用户ID"
            value={loginUserId}
            onChangeText={setLoginUserId}
            autoCapitalize="none"
          />
          <Button onPress={handleRegister} disabled={!ready}>
            注册
          </Button>
        </YStack>
      </Card>

      {/* 登录卡片 */}
      <Card padding={16}>
        <YStack gap={12}>
          <UiText variant="h3">登录</UiText>
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
            <Button onPress={handleLogin} disabled={!ready}>
              登录
            </Button>
          ) : (
            <YStack gap={8}>
              <UiText color="$green9">✓ 已登录: {loginUserId}</UiText>
              <Button onPress={handleLogout}>登出</Button>
            </YStack>
          )}
        </YStack>
      </Card>

      {/* 进入完整测试 */}
      {loggedIn && (
        <Card padding={16}>
          <YStack gap={12}>
            <UiText variant="h3">完整功能测试</UiText>
            <UiText variant="caption" color="$gray9">
              测试用户信息、好友管理、群组管理、会话列表、消息发送等功能
            </UiText>
            <Button onPress={navigateToDemo}>
              进入 IM 测试
            </Button>
          </YStack>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
});
