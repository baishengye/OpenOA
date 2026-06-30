import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { currentPlatform, logger } from '@itc/base';
import { UIProvider } from '@itc/uikit';
import { DemoScreen } from './screens/DemoScreen';
import { usePush } from './utils/usePush';

logger.info('app', `OpenDingDing 启动，平台=${currentPlatform}`);

// 改这里的数字/文字再保存，机上横幅应立即变 —— 用来确认 Metro 已连接、在跑最新 bundle。
const BUILD_MARK = 'MARK #1';

export default function App(): React.JSX.Element {
  usePush(); // 初始化推送（首次渲染时自动执行）

  return (
    <UIProvider defaultMode="light">
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.markBar}>
          <Text style={styles.markText}>
            🟢 {BUILD_MARK} · {currentPlatform}
          </Text>
        </View>
        <DemoScreen />
      </View>
    </UIProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f6fa',
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
