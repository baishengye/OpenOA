import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { itcOpenIM } from '@itc/rn-client-sdk-plus';
import { eventBus } from '@itc/base';
import { Text as UiText, Button, Card, YStack, XStack } from '@itc/uikit';
import { ImDemoMain } from '../demo/imDemo';
import type { TabProps } from './shared';
import { logger } from '@itc/base';
import { useTranslation } from '@itc/i18n';

// 生成唯一操作ID（时间戳 + 随机数）
const getOperationID = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `openim-${timestamp}-${randomPart}`;
};

const TAG = 'Demo';

// ConnectionState 类型定义（与 SDK 保持一致）
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'kickedOffline';

// 服务器配置
const API_ADDR = 'http://172.16.204.62:10002';
const WS_ADDR = 'ws://172.16.204.62:10001';
const LOGIN_API = 'http://172.16.204.62:10008/account/login';

/** IM 测试 Tab - 入口页面 */
export function ImTab({ append, busy: _busy }: TabProps) {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUserId, setLoginUserId] = useState('');
  const [token, setToken] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  // 使用 useRef 存储 append，避免 useCallback 依赖变化
  const appendRef = useRef(append);
  appendRef.current = append;

  // 使用 useCallback 稳定 log 函数
  const log = useCallback((line: string) => {
    // 判断日志级别
    if (line.startsWith('❌')) {
      logger.error(TAG, line);
    } else if (line.startsWith('⚠️')) {
      logger.warn(TAG, line);
    } else {
      logger.info(TAG, line);
    }
    appendRef.current(line);
  }, []);

  // 设置连接状态监听器
  useEffect(() => {
    log(`${t('common.info')} useEffect ${t('common.triggered')}, ready=` + ready);

    if (!ready) {
      log(`${t('common.info')} ready ${t('common.is')} false，${t('im.skipListenerSetup')}`);
      return;
    }

    log(`${t('common.info')} ${t('im.settingUpListeners')}...`);

    // 监听连接状态变化
    const unsubscribe1 = eventBus.on('im:connectionChanged', (state: ConnectionState) => {
      log(`${t('im.connectionChanged')}: ${state}`);
      if (state === 'connected') {
        setLoggedIn(true);
        log(`${t('common.success')} ${t('im.loginSuccess')}`);
      } else if (state === 'disconnected' || state === 'kickedOffline') {
        setLoggedIn(false);
        log(`${t('common.error')} ${t('im.connectionLost')}: ${state}`);
      }
    });
    log(`${t('im.subscribed')} im:connectionChanged`);

    // 监听被踢下线
    const unsubscribe2 = eventBus.on('im:kickedOffline', () => {
      log(`${t('common.warning')} ${t('im.kickedOffline')}`);
      setLoggedIn(false);
    });
    log(`${t('im.subscribed')} im:kickedOffline`);

    // 监听 Token 过期
    const unsubscribe3 = eventBus.on('im:tokenExpired', () => {
      log(`${t('common.warning')} ${t('im.tokenExpired')}`);
      setLoggedIn(false);
    });
    log(`${t('im.subscribed')} im:tokenExpired`);

    log(`${t('im.allListenersSetup')}`);

    return () => {
      log(`${t('im.cleaningUpListeners')}`);
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }, [ready, log, t]);

  // 注册
  const handleRegister = async () => {
    if (!loginUserId.trim()) {
      Alert.alert(t('common.info'), t('im.pleaseInputUserId'));
      return;
    }
    try {
      log(`${t('im.registering')}: ${loginUserId}...`);
      const response = await fetch(`${API_ADDR}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'operationID': getOperationID(),
          'token': token || 'admin_token', // 注册可能需要管理员token
        },
        body: JSON.stringify({ userID: loginUserId.trim() }),
      });
      const data = await response.json();
      if (data.code === 0 || data.errCode === 0) {
        log(`${t('common.success')} ${t('im.registerSuccess')}，${t('im.userId')}: ${loginUserId}`);
        // 自动填充 token（如果有返回）
        if (data.data?.token) {
          setToken(data.data.token);
          log(`${t('im.tokenAutoFilled')}`);
        }
      } else {
        log(`${t('common.error')} ${t('im.registerFailed')}: ${data.msg || data.errmsg || JSON.stringify(data)}`);
      }
    } catch (e: any) {
      log(`${t('common.error')} ${t('im.registerFailed')}: ${e.message}`);
    }
  };

  // 初始化 SDK
  const handleInit = async () => {
    try {
      log(`${t('im.initializing')} SDK...`);
      await itcOpenIM.initSDK({
        apiAddr: API_ADDR,
        wsAddr: WS_ADDR,
        dataDir: 'itc_openim_data',
      });
      setReady(true);
      log(`${t('common.success')} ${t('im.initSuccess')}`);
    } catch (e: any) {
      log(`${t('common.error')} ${t('im.initFailed')}: ${e.message}`);
    }
  };

  // 从服务器登录获取 Token
  const handleGetToken = async () => {
    if (!loginUserId.trim()) {
      Alert.alert(t('common.info'), t('im.pleaseInputUserId'));
      return;
    }
    try {
      log(`${t('im.gettingToken')}: ${loginUserId}...`);
      const response = await fetch(LOGIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'operationID': getOperationID(),
        },
        body: JSON.stringify({ userID: loginUserId.trim() }),
      });
      const data = await response.json();
      if (data.code === 0 && data.data?.token) {
        setToken(data.data.token);
        log(`${t('common.success')} ${t('im.tokenSuccess')}`);
      } else {
        log(`${t('common.error')} ${t('im.tokenFailed')}: ${data.msg || JSON.stringify(data)}`);
      }
    } catch (e: any) {
      log(`${t('common.error')} ${t('im.tokenFailed')}: ${e.message}`);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (!loginUserId || !token) {
      Alert.alert(t('common.info'), t('im.pleaseInputCredentials'));
      return;
    }
    try {
      log(`${t('im.loggingIn')}: ${loginUserId}...`);
      logger.info(TAG, `login called with userID=${loginUserId}, token length=${token.length}`);
      await itcOpenIM.login({ userID: loginUserId.trim(), token: token.trim() });
      logger.info(TAG, 'login() completed without throwing');
    } catch (e: any) {
      logger.error(TAG, `${t('im.loginFailed')}: ${e.message}`, e);
      log(`${t('common.error')} ${t('im.loginFailed')}: ${e.message}`);
    }
  };

  // 登出
  const handleLogout = async () => {
    try {
      await itcOpenIM.logout();
      setLoggedIn(false);
      log(`${t('common.success')} ${t('im.logoutSuccess')}`);
    } catch (e: any) {
      log(`${t('common.error')} ${t('im.logoutFailed')}: ${e.message}`);
    }
  };

  // 跳转到测试页面
  const navigateToDemo = () => {
    if (!loggedIn) {
      Alert.alert(t('common.info'), t('im.pleaseLoginFirst'));
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
          <UiText variant="h2">{t('im.imTest')}</UiText>
          {!ready ? (
            <Button onPress={handleInit}>{t('im.initSdk')}</Button>
          ) : (
            <XStack align="center" gap={8}>
              <UiText color="$green9">✓ {t('im.initialized')}</UiText>
            </XStack>
          )}
        </YStack>
      </Card>

      {/* 注册卡片 */}
      <Card padding={16}>
        <YStack gap={12}>
          <UiText variant="h3">{t('im.register')}</UiText>
          <TextInput
            style={styles.input}
            placeholder={t('im.userId')}
            value={loginUserId}
            onChangeText={setLoginUserId}
            autoCapitalize="none"
          />
          <Button onPress={handleRegister} disabled={!ready}>
            {t('im.register')}
          </Button>
        </YStack>
      </Card>

      {/* 登录卡片 */}
      <Card padding={16}>
        <YStack gap={12}>
          <UiText variant="h3">{t('im.login')}</UiText>
          <TextInput
            style={styles.input}
            placeholder={t('im.userId')}
            value={loginUserId}
            onChangeText={setLoginUserId}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder={t('im.token')}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
          />
          {!loggedIn ? (
            <XStack gap={8}>
              <Button onPress={handleGetToken} disabled={!ready}>
                {t('im.getToken')}
              </Button>
              <Button onPress={handleLogin} disabled={!ready || !token}>
                {t('im.login')}
              </Button>
            </XStack>
          ) : (
            <YStack gap={8}>
              <UiText color="$green9">✓ {t('im.loggedIn')}: {loginUserId}</UiText>
              <Button onPress={handleLogout}>{t('im.logout')}</Button>
            </YStack>
          )}
        </YStack>
      </Card>

      {/* 进入完整测试 */}
      {loggedIn && (
        <Card padding={16}>
          <YStack gap={12}>
            <UiText variant="h3">{t('im.fullTest')}</UiText>
            <UiText variant="caption" color="$gray9">
              {t('im.fullTestDesc')}
            </UiText>
            <Button onPress={navigateToDemo}>
              {t('im.enterTest')}
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
