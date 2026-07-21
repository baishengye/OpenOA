/**
 * 登录页面
 * 支持手机号+密码登录和生物识别
 */
import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { XStack, YStack, Text, Input, Button } from '@itc/uikit';
import { useBiometric } from '../../hooks';
import { useAuthStore } from '../../stores';
import type { UserInfo } from '../../types';

export interface LoginScreenProps {
  /** 登录成功回调 */
  onLoginSuccess?: () => void;
  /** IM SDK 是否已初始化 */
  onIMInitialized?: boolean;
  /** IM 连接函数 */
  onIMConnect?: (userID: string, token: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = memo((props) => {
  const { onLoginSuccess, onIMInitialized, onIMConnect } = props;

  const { login, loginWithBiometric, isLoading, error, token, userID } = useAuthStore();
  const { isSupported, biometryTypeName, hasKey, authenticate } = useBiometric();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // 等待 IM 初始化完成后，登录 IM
  useEffect(() => {
    const tryConnectIM = async () => {
      if (onIMInitialized && token && userID && onIMConnect) {
        setIsConnecting(true);
        try {
          await onIMConnect(userID, token);
          onLoginSuccess?.();
        } catch (err) {
          console.error('[LoginScreen] IM 连接失败:', err);
          Alert.alert('连接失败', 'IM 连接失败，请重试');
        } finally {
          setIsConnecting(false);
        }
      }
    };

    tryConnectIM();
  }, [onIMInitialized, token, userID, onIMConnect, onLoginSuccess]);

  // 处理登录
  const handleLogin = useCallback(async () => {
    if (!phone.trim()) {
      Alert.alert('提示', '请输入手机号');
      return;
    }
    if (!password) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    try {
      await login(phone.trim(), password);
    } catch (err) {
      // 错误已在 store 中处理
    }
  }, [phone, password, login]);

  // 处理生物识别登录
  const handleBiometricLogin = useCallback(async () => {
    if (!hasKey) {
      Alert.alert('提示', '请先使用密码登录并开启生物识别');
      return;
    }

    const success = await authenticate({
      title: '登录',
      subtitle: '验证以继续登录',
      allowDeviceCredential: true,
    });

    if (success) {
      try {
        await loginWithBiometric();
      } catch (err) {
        // 错误已在 store 中处理
      }
    }
  }, [hasKey, authenticate, loginWithBiometric]);

  const isProcessing = isLoading || isConnecting;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <YStack flex={1} justify="center" align="center" padding={24}>
          {/* Logo 区域 */}
          <View style={styles.logoSection}>
            <YStack align="center">
              <View style={styles.logoContainer}>
                <Text variant="caption" color="#fff" fontSize={40}>💬</Text>
              </View>
              <View style={styles.titleContainer}>
                <Text variant="caption" fontSize={28} fontWeight="bold" color="#1A1A1A">
                  OpenIM Plus
                </Text>
              </View>
              <View style={styles.subtitleContainer}>
                <Text variant="body" color="#8E8E93">
                  安全、可靠的即时通讯
                </Text>
              </View>
            </YStack>
          </View>

          {/* 输入区域 */}
          <YStack width="100%" gap={16}>
            {/* 手机号输入 */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Text variant="body" color="#8E8E93">手机号</Text>
              </View>
              <Input
                placeholder="请输入手机号"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isProcessing}
              />
            </View>

            {/* 密码输入 */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabel}>
                <Text variant="body" color="#8E8E93">密码</Text>
              </View>
              <XStack align="center">
                <Input
                  placeholder="请输入密码"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isProcessing}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordButton}
                >
                  <Text variant="body" color="#007AFF">
                    {showPassword ? '隐藏' : '显示'}
                  </Text>
                </Pressable>
              </XStack>
            </View>

            {/* 错误提示 */}
            {error && (
              <Text variant="body" color="#FF3B30" textAlign="center">
                {error}
              </Text>
            )}

            {/* 连接中提示 */}
            {isConnecting && (
              <YStack align="center" gap={8}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text variant="body" color="#666">正在连接...</Text>
              </YStack>
            )}

            {/* 登录按钮 */}
            <Button
              onPress={handleLogin}
              disabled={isProcessing}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>

            {/* 记住密码选项 */}
            <XStack justify="center" align="center" gap={8}>
              <Pressable onPress={() => useAuthStore.getState().setRememberPassword(!useAuthStore.getState().rememberPassword)}>
                <XStack align="center" gap={4}>
                  <Text variant="body" color="#007AFF">
                    {useAuthStore.getState().rememberPassword ? '✓' : '○'}
                  </Text>
                  <Text variant="body" color="#8E8E93">记住密码</Text>
                </XStack>
              </Pressable>
            </XStack>
          </YStack>

          {/* 生物识别登录 */}
          {isSupported && hasKey && !isProcessing && (
            <Pressable onPress={handleBiometricLogin} style={styles.biometricButton}>
              <YStack align="center" gap={8}>
                <Text variant="caption" fontSize={32}>
                  {biometryTypeName === 'Face ID' ? '👤' : '👆'}
                </Text>
                <Text variant="body" color="#007AFF">
                  使用 {biometryTypeName} 登录
                </Text>
              </YStack>
            </Pressable>
          )}
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

LoginScreen.displayName = 'LoginScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  logoSection: {
    marginBottom: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginTop: 16,
  },
  subtitleContainer: {
    marginTop: 8,
  },
  inputContainer: {
    width: '100%',
  },
  inputLabel: {
    marginBottom: 8,
  },
  showPasswordButton: {
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
  },
  biometricButton: {
    marginTop: 40,
    padding: 16,
  },
});
