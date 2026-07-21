/**
 * 主入口页面
 * 提供进入各个模块的入口
 */
import React, { memo } from 'react';
import { StyleSheet, View, SafeAreaView, Pressable } from 'react-native';
import { YStack, XStack, Text, Card } from '@itc/uikit';

/**
 * MainScreen - 主入口页面
 */
export interface MainScreenProps {
  onNavigate: (screen: 'Demo' | 'OpenIMPlus') => void;
}

export const MainScreen: React.FC<MainScreenProps> = memo((props) => {
  const { onNavigate } = props;

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1} justify="center" align="center" gap={24}>
        {/* 标题卡片 */}
        <Card padding={16}>
          <YStack align="center" gap={8}>
            <Text variant="h1" color="#1A1A1A">OpenOA</Text>
            <Text variant="body" color="#8E8E93">组件演示 & 即时通讯</Text>
          </YStack>
        </Card>

        {/* 按钮列表 */}
        <YStack gap={16} width="100%" maxWidth={320} padding={16}>
          {/* Demo 演示按钮 */}
          <Pressable
            onPress={() => onNavigate('Demo')}
            style={({ pressed }) => [
              styles.button,
              styles.demoButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <XStack align="center" gap={16}>
              <Text variant="h1" fontSize={28}>🧪</Text>
              <YStack flex={1} gap={4}>
                <Text variant="h3" fontWeight="600" color="#fff">
                  组件演示
                </Text>
                <Text variant="body" color="rgba(255,255,255,0.8)">
                  UIKit 组件、FlashList、权限等
                </Text>
              </YStack>
              <Text variant="caption" color="rgba(255,255,255,0.6)">›</Text>
            </XStack>
          </Pressable>

          {/* IM 通讯按钮 */}
          <Pressable
            onPress={() => onNavigate('OpenIMPlus')}
            style={({ pressed }) => [
              styles.button,
              styles.imButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <XStack align="center" gap={16}>
              <Text variant="h1" fontSize={28}>💬</Text>
              <YStack flex={1} gap={4}>
                <Text variant="h3" fontWeight="600" color="#fff">
                  OpenIM Plus
                </Text>
                <Text variant="body" color="rgba(255,255,255,0.8)">
                  即时通讯、会话列表、聊天
                </Text>
              </YStack>
              <Text variant="caption" color="rgba(255,255,255,0.6)">›</Text>
            </XStack>
          </Pressable>
        </YStack>

        {/* 底部信息 */}
        <Card padding={16}>
          <YStack align="center" gap={4}>
            <Text variant="body" color="#8E8E93">OpenOA Demo</Text>
            <Text variant="caption" color="#C7C7CC">v2.0.0</Text>
          </YStack>
        </Card>
      </YStack>
    </SafeAreaView>
  );
});

MainScreen.displayName = 'MainScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  button: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  demoButton: {
    backgroundColor: '#5856D6',
  },
  imButton: {
    backgroundColor: '#007AFF',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
