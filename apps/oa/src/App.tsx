import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { currentPlatform, logger } from '@itc/base';
import { BiometricDemoScreen } from './screens/BiometricDemoScreen';

logger.info('app', `OpenDingDing 启动，平台=${currentPlatform}`);

export default function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <BiometricDemoScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
});
