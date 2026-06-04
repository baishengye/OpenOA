/**
 * TurboModule 规格（codegen 输入）。
 *
 * ⚠️ 受 React Native Codegen 约束：入参只用基本类型（boolean/number/string），
 * 不用 object 入参（规避 iOS codegen 为对象入参生成的 C++ 结构体）；
 * 返回可用内联 object / object 数组。JS 层（src/index.ts）负责拆/装 options 与收窄枚举。
 *
 * 三端原生均实现名为 `ItcBiometric` 的 TurboModule：
 *  - Android: com.itc.biometric.ItcBiometricModule (Kotlin)
 *  - iOS:     ItcBiometric (Obj-C++)
 *  - 鸿蒙:    ItcBiometricTurboModule (ArkTS, RNOH)
 */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * 枚举平台生物能力（List + 位掩码）。
   * items[].kind: 'fingerprint'|'face'|'iris'；strength: 'strong'|'weak'|'none'。
   * mask: available 模态的位或（fingerprint=1/face=2/iris=4）。
   */
  getCapabilities(): Promise<{
    mask: number;
    items: {
      kind: string;
      hardware: boolean;
      enrolled: boolean;
      available: boolean;
      strength: string;
      directable: boolean;
      reason: string;
    }[];
  }>;

  /**
   * 按强度认证（跨端通用，系统选模态）。strength: 'strong' | 'weak'。
   * 结果类语义：失败不 reject，返回 success=false + reason（reason 为空表示成功）。
   * usedKind: 实际使用的模态名；未知/失败为空串。
   */
  authenticate(
    title: string,
    subtitle: string,
    reason: string,
    cancelLabel: string,
    allowDeviceCredential: boolean,
    strength: string
  ): Promise<{ success: boolean; usedKind: string; reason: string }>;

  /**
   * 定向认证到指定模态。kind: 'fingerprint' | 'face' | 'iris'。
   * 仅鸿蒙真支持；iOS/Android 由 JS 层在调用前拦截（不下发原生）。原生若被调到，
   * 返回 success=false + reason='not_directable'。
   */
  authenticateWith(
    kind: string,
    title: string,
    subtitle: string,
    reason: string,
    cancelLabel: string,
    allowDeviceCredential: boolean
  ): Promise<{ success: boolean; usedKind: string; reason: string }>;

  /**
   * 生成生物绑定密钥（EC P-256），返回 Base64(DER) 公钥。
   * 密钥算法与具体生物模态无关，模态仅作"使用前需认证"的门。alias 已存在则返回其公钥。
   */
  createKey(alias: string): Promise<{ publicKey: string }>;

  /**
   * 强生物认证后用 alias 私钥对 payload（Base64）做 ECDSA 签名，返回 Base64(DER) 签名。
   * 重新录入指纹等会使密钥失效 → reject(BIOMETRY_KEY_INVALIDATED)。
   */
  signWithKey(
    alias: string,
    payloadBase64: string,
    promptTitle: string
  ): Promise<{ signatureBase64: string }>;

  /** 删除密钥。 */
  deleteKey(alias: string): Promise<void>;

  /** 查询密钥是否存在且有效。 */
  keyExists(alias: string): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ItcBiometric');
