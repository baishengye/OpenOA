/** 业务无关的生物识别公共类型。 */

/** 生物模态。 */
export type BiometryKind = 'fingerprint' | 'face' | 'iris';

/** 认证强度。strong=可用于密钥签名（iOS Face/Touch、Android Class3、鸿蒙 ATL3）；weak=仅基础认证。 */
export type BiometryStrength = 'strong' | 'weak';

/** 位掩码：用于 {@link CapabilitiesResult.mask} 与按位查询能力。 */
export const BIOMETRY_BIT: Record<BiometryKind, number> = {
  fingerprint: 1,
  face: 2,
  iris: 4,
};

/** 单个模态的能力详情。 */
export interface BiometryCapability {
  kind: BiometryKind;
  /** 硬件存在。 */
  hardware: boolean;
  /** 已录入凭据。注意：iOS/Android 无法逐模态精确判定，为聚合 best-effort。 */
  enrolled: boolean;
  /** 现在可立即用于认证（硬件在 + 已录入 + 未锁定）。 */
  available: boolean;
  /** 该模态可达到的强度；'none' 表示不可用。 */
  strength: BiometryStrength | 'none';
  /** 能否定向调用该模态：鸿蒙=true；iOS/Android=false（系统只按强度选模态）。 */
  directable: boolean;
  /** 不可用原因码（available=false 时有意义）。 */
  reason?: string;
}

/** 能力枚举结果：List + 便捷位掩码。 */
export interface CapabilitiesResult {
  /** 各模态能力详情。 */
  capabilities: BiometryCapability[];
  /** available===true 的模态按 {@link BIOMETRY_BIT} 求或；0 表示当前无可用生物识别。 */
  mask: number;
}

/** 认证入参。 */
export interface AuthenticateOptions {
  /** 弹窗主标题（必填）。 */
  title: string;
  /** 副标题（Android/鸿蒙支持）。 */
  subtitle?: string;
  /** 用途说明（iOS 弹窗 reason）。 */
  reason?: string;
  /** 取消按钮文案。 */
  cancelLabel?: string;
  /** 认证强度，默认 'strong'。weak 允许弱生物识别（如安卓摄像头人脸）。 */
  strength?: BiometryStrength;
  /** 生物识别不可用时是否允许回退到设备密码/PIN。 */
  allowDeviceCredential?: boolean;
}

/** 认证失败原因。 */
export type AuthFailReason =
  | 'canceled'
  | 'failed'
  | 'lockout'
  | 'timeout'
  | 'not_enrolled'
  | 'not_supported'
  | 'not_directable'
  | 'busy'
  | 'unknown';

/** 认证结果类：成功带实际使用的模态；失败带结构化原因（不抛异常）。 */
export type AuthResult =
  | { ok: true; usedKind: BiometryKind | 'unknown' }
  | { ok: false; reason: AuthFailReason; code: string; message: string };

export interface KeyPairInfo {
  /** Base64(DER) 编码的 EC P-256 公钥，提交后端注册。 */
  publicKey: string;
}

export interface SignatureResult {
  /** Base64(DER) 编码的 ECDSA 签名。 */
  signatureBase64: string;
}
