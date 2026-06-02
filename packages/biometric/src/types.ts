/** 业务无关的生物识别公共类型。 */

export type BiometryType = 'fingerprint' | 'face' | 'iris' | 'none';

export interface BiometryAvailability {
  available: boolean;
  biometryType: BiometryType;
  /** 不可用原因（available 为 false 时有意义），便于上层决定降级文案 */
  reason?: string;
}

export interface AuthenticateOptions {
  /** 弹窗主标题（必填，系统弹窗用） */
  title: string;
  /** 副标题（Android/鸿蒙支持） */
  subtitle?: string;
  /** 认证用途说明（iOS Face ID 弹窗的 reason） */
  reason?: string;
  /** 取消按钮文案 */
  cancelLabel?: string;
  /** 生物识别不可用时是否允许回退到设备密码/PIN */
  allowDeviceCredential?: boolean;
  /**
   * 是否允许弱生物识别（Class 2，如安卓摄像头人脸）做基础认证。默认 false（仅强生物识别）。
   * 注意：仅作用于 authenticate()；免密登录的密钥签名（createKey/signWithKey）始终要求强生物识别。
   * iOS Face ID 本身即强，忽略此项。
   */
  allowWeakBiometric?: boolean;
}

export interface KeyPairInfo {
  /** Base64(DER) 编码的 EC P-256 公钥，提交后端注册 */
  publicKey: string;
}

export interface SignatureResult {
  /** Base64(DER) 编码的 ECDSA 签名 */
  signatureBase64: string;
}
