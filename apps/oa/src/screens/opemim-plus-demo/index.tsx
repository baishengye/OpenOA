/**
 * OpenIM Plus Demo
 * 钉钉风格即时通讯应用
 */
import React, { memo, useState, useCallback } from 'react';
import { StyleSheet, View, StatusBar, LogBox, Text, ActivityIndicator } from 'react-native';
import {
  LoginScreen,
  ConversationListScreen,
  ChatScreen,
  PersonalInfoScreen,
  SettingsScreen,
} from './screens';
import { useIM } from './hooks';
import type { RootStackParamList } from './types';

// 忽略一些常见警告
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

/**
 * 主应用组件
 */
const AppContent: React.FC<{ onLogout?: () => void }> = memo((props) => {
  const { onLogout } = props;
  // 路由状态
  const [currentScreen, setCurrentScreen] = useState<keyof RootStackParamList>('Login');
  const [params, setParams] = useState<Record<string, any>>({});

  // IM 状态
  const { isInitialized, error, connect } = useIM();

  // 路由导航
  const navigate = useCallback((screen: keyof RootStackParamList, screenParams?: Record<string, any>) => {
    setCurrentScreen(screen);
    setParams(screenParams || {});
  }, []);

  // 登录成功 - 连接 IM
  const handleLoginSuccess = useCallback(async () => {
    if (!isInitialized) {
      console.log('[App] 等待 SDK 初始化...');
      return;
    }
    console.log('[App] 跳转到会话列表');
    navigate('ConversationList');
  }, [isInitialized, navigate]);

  // 导航到聊天页面
  const handleNavigateToChat = useCallback((conversationID: string, showName: string, userID?: string) => {
    navigate('Chat', { conversationID, showName, userID });
  }, [navigate]);

  // 导航到个人中心
  const handleNavigateToProfile = useCallback(() => {
    navigate('PersonalInfo');
  }, [navigate]);

  // 导航到设置
  const handleNavigateToSettings = useCallback(() => {
    navigate('Settings');
  }, [navigate]);

  // 返回
  const handleGoBack = useCallback(() => {
    navigate('ConversationList');
  }, [navigate]);

  // 退出登录
  const handleLogout = useCallback(() => {
    navigate('Login');
    onLogout?.();
  }, [navigate, onLogout]);

  // 始终显示登录页面
  if (currentScreen === 'Login') {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onIMInitialized={isInitialized}
        onIMConnect={connect}
      />
    );
  }

  // IM 未初始化时显示加载页
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066ff" />
          <Text style={styles.loadingText}>正在初始化...</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>
    );
  }

  // 渲染页面
  const renderScreen = () => {
    switch (currentScreen) {
      case 'ConversationList':
        return (
          <ConversationListScreen
            onNavigateToChat={handleNavigateToChat}
            onNavigateToProfile={handleNavigateToProfile}
          />
        );

      case 'Chat':
        return (
          <ChatScreen
            conversationID={params.conversationID}
            showName={params.showName}
            userID={params.userID}
            onGoBack={handleGoBack}
          />
        );

      case 'PersonalInfo':
        return (
          <PersonalInfoScreen
            onGoBack={handleGoBack}
            onNavigateToSettings={handleNavigateToSettings}
            onLogout={handleLogout}
          />
        );

      case 'Settings':
        return <SettingsScreen onGoBack={handleGoBack} />;

      default:
        return (
          <ConversationListScreen
            onNavigateToChat={handleNavigateToChat}
            onNavigateToProfile={handleNavigateToProfile}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {renderScreen()}
    </View>
  );
});

AppContent.displayName = 'AppContent';

/**
 * OpenIM Plus Demo 入口
 */
export const OpenIMPlusDemo: React.FC<{ onLogout?: () => void }> = (props) => {
  return (
    <AppContent onLogout={props.onLogout} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ff3b30',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
