/**
 * 生物识别 Hook
 * 管理生物识别的状态和操作
 */
import { useCallback, useEffect, useState } from 'react';
import {
  checkBiometricSupport,
  authenticateBiometric,
  hasBiometricKey,
  getBiometryTypeName,
} from '../services';
import type { BiometryKind } from '@itc/biometric';

export interface UseBiometricOptions {
  /** 是否在挂载时自动检查支持情况 */
  autoCheck?: boolean;
}

export interface UseBiometricResult {
  /** 是否支持生物识别 */
  isSupported: boolean;
  /** 生物识别类型 */
  biometryType?: BiometryKind;
  /** 类型名称 */
  biometryTypeName: string;
  /** 是否有已注册的密钥 */
  hasKey: boolean;
  /** 是否正在认证中 */
  isAuthenticating: boolean;
  /** 错误信息 */
  error: string | null;
  /** 执行认证 */
  authenticate: (options?: {
    title?: string;
    subtitle?: string;
    allowDeviceCredential?: boolean;
  }) => Promise<boolean>;
  /** 检查支持情况 */
  checkSupport: () => Promise<void>;
}

/**
 * 生物识别 Hook
 */
export function useBiometric(
  options: UseBiometricOptions = {}
): UseBiometricResult {
  const { autoCheck = true } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryKind | undefined>();
  const [hasKey, setHasKey] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 获取类型名称 */
  const biometryTypeName = getBiometryTypeName(biometryType);

  /** 检查生物识别支持情况 */
  const checkSupport = useCallback(async () => {
    try {
      setError(null);
      const result = await checkBiometricSupport();
      setIsSupported(result.isSupported);
      setBiometryType(result.biometryType);
    } catch (err) {
      const message = err instanceof Error ? err.message : '检查生物识别支持失败';
      setError(message);
      setIsSupported(false);
    }
  }, []);

  /** 检查是否有已注册的密钥 */
  const checkKey = useCallback(async () => {
    try {
      const exists = await hasBiometricKey();
      setHasKey(exists);
    } catch (err) {
      setHasKey(false);
    }
  }, []);

  /** 执行认证 */
  const authenticate = useCallback(
    async (opts?: {
      title?: string;
      subtitle?: string;
      allowDeviceCredential?: boolean;
    }): Promise<boolean> => {
      if (!isSupported) {
        setError('设备不支持生物识别');
        return false;
      }

      try {
        setError(null);
        setIsAuthenticating(true);

        const result = await authenticateBiometric(
          opts?.title || '身份验证',
          opts?.subtitle || '验证以继续登录',
          opts?.allowDeviceCredential ?? false
        );

        if (result.ok) {
          return true;
        } else {
          setError(getAuthErrorMessage(result.reason));
          return false;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : '认证失败';
        setError(message);
        return false;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [isSupported]
  );

  // 自动检查
  useEffect(() => {
    if (autoCheck) {
      checkSupport();
      checkKey();
    }
  }, [autoCheck, checkSupport, checkKey]);

  return {
    isSupported,
    biometryType,
    biometryTypeName,
    hasKey,
    isAuthenticating,
    error,
    authenticate,
    checkSupport,
  };
}

/** 获取认证错误消息 */
function getAuthErrorMessage(reason?: string): string {
  switch (reason) {
    case 'canceled':
      return '用户取消';
    case 'failed':
      return '认证失败';
    case 'lockout':
      return '认证被锁定，请稍后再试';
    case 'timeout':
      return '认证超时';
    case 'not_enrolled':
      return '未设置生物识别';
    case 'not_supported':
      return '设备不支持生物识别';
    default:
      return '认证失败';
  }
}
