import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { currentPlatform, logger } from '@itc/base';
import { UIProvider } from '@itc/uikit';
import { DemoScreen } from './screens/DemoScreen';

logger.info('app', `OpenDingDing 启动，平台=${currentPlatform}`);

export default function App(): React.JSX.Element {
  return (
    <UIProvider defaultMode="light">
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
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
});
