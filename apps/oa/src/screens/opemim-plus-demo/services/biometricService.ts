/**
 * 生物识别服务
 * 封装 @itc/biometric 的常用操作
 */
import { biometric, type BiometryKind, type AuthResult } from '@itc/biometric';

/** 生物识别别名（用于存储密钥） */
export const BIOMETRIC_KEY_ALIAS = 'opemim-demo-auth';

/** 检查是否支持生物识别 */
export async function checkBiometricSupport(): Promise<{
  isSupported: boolean;
  biometryType?: BiometryKind;
}> {
  try {
    const result = await biometric.getCapabilities();
    if (result.capabilities.length === 0) {
      return { isSupported: false };
    }
    // 返回第一个可用的生物识别类型
    return {
      isSupported: true,
      biometryType: result.capabilities[0]?.kind,
    };
  } catch (error) {
    console.error('检查生物识别支持失败:', error);
    return { isSupported: false };
  }
}

/** 执行生物识别认证 */
export async function authenticateBiometric(
  title: string = '身份验证',
  subtitle: string = '验证以继续登录',
  allowDeviceCredential: boolean = false
): Promise<AuthResult> {
  return biometric.authenticate({
    title,
    subtitle,
    allowDeviceCredential,
    strength: 'strong',
  });
}

/** 创建生物识别密钥（用于免密登录） */
export async function createBiometricKey(): Promise<string> {
  const keyInfo = await biometric.createKey(BIOMETRIC_KEY_ALIAS);
  return keyInfo.publicKey;
}

/** 检查密钥是否存在 */
export async function hasBiometricKey(): Promise<boolean> {
  return biometric.keyExists(BIOMETRIC_KEY_ALIAS);
}

/** 删除生物识别密钥 */
export async function deleteBiometricKey(): Promise<void> {
  return biometric.deleteKey(BIOMETRIC_KEY_ALIAS);
}

/** 使用生物识别签名（用于免密登录验证） */
export async function signWithBiometric(
  payload: string
): Promise<{ signature: string } | null> {
  try {
    const result = await biometric.signWithKey(
      BIOMETRIC_KEY_ALIAS,
      payload,
      '登录验证'
    );
    return { signature: result.signatureBase64 };
  } catch (error) {
    console.error('生物识别签名失败:', error);
    return null;
  }
}

/** 获取生物识别类型显示名称 */
export function getBiometryTypeName(kind?: BiometryKind): string {
  switch (kind) {
    case 'face':
      return '面容ID';
    case 'fingerprint':
      return '指纹';
    case 'iris':
      return '虹膜';
    default:
      return '生物识别';
  }
}
