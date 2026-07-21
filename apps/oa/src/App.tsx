import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View, BackHandler } from 'react-native';
import { PortalProvider } from '@gorhom/portal';
import { currentPlatform, logger } from '@itc/base';
import { UIProvider, ToastProvider } from '@itc/uikit';
import { I18nProvider } from '@itc/i18n';
import { DemoScreen } from './screens/DemoScreen';
import { MainScreen } from './screens/MainScreen';
import { OpenIMPlusDemo } from './screens/opemim-plus-demo';
import { usePush } from './utils/usePush';

// 导入 locales
import enUS from './locales/en-US.json';
import zhCN from './locales/zh-CN.json';

logger.info('app', `OpenOA 启动，平台=${currentPlatform}`);

// 改这里的数字/文字再保存，机上横幅应立即变 —— 用来确认 Metro 已连接、在跑最新 bundle。
const BUILD_MARK = 'MARK #1';

/** 路由名称 */
type ScreenName = 'Main' | 'Demo' | 'OpenIMPlus';

export default function App(): React.JSX.Element {
  usePush(); // 初始化推送（首次渲染时自动执行）

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Main');

  // 导航到指定页面
  const navigate = useCallback((screen: ScreenName) => {
    setCurrentScreen(screen);
  }, []);

  // 从子页面返回主页面
  const goBack = useCallback(() => {
    setCurrentScreen('Main');
  }, []);

  // 拦截 Android 返回键
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen !== 'Main') {
        setCurrentScreen('Main');
        return true; // 拦截返回键
      }
      return false; // 不拦截，让系统处理
    });

    return () => backHandler.remove();
  }, [currentScreen]);

  // 渲染当前页面
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Demo':
        return (
          <View style={styles.fullScreen}>
            <DemoScreen onGoBack={goBack} />
          </View>
        );

      case 'OpenIMPlus':
        return (
          <View style={styles.fullScreen}>
            <OpenIMPlusDemo onLogout={goBack} />
          </View>
        );

      case 'Main':
      default:
        return <MainScreen onNavigate={navigate} />;
    }
  };

  return (
    <I18nProvider
      options={{
        lng: 'en-US',
        resources: {
          'en-US': { translation: enUS },
          'zh-CN': { translation: zhCN },
        },
      }}
    >
      <UIProvider defaultMode="light">
        <PortalProvider>
          <ToastProvider
            defaultOptions={{
              duration: 3000,
              style: { backgroundColor: 'rgba(0,0,0,0.9)' },
            }}
          >
            <View style={styles.root}>
              <StatusBar barStyle="dark-content" />
              <View style={styles.markBar}>
                <Text style={styles.markText}>
                  🟢 {BUILD_MARK} · {currentPlatform}
                </Text>
              </View>
              {renderScreen()}
            </View>
          </ToastProvider>
        </PortalProvider>
      </UIProvider>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  fullScreen: {
    flex: 1,
  },
  markBar: {
    backgroundColor: '#16a34a',
    paddingVertical: 6,
    alignItems: 'center',
  },
  markText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
