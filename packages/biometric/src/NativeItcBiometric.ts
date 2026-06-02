/**
 * TurboModule 规格（codegen 输入）。
 *
 * ⚠️ 本文件受 React Native Codegen 约束，只能使用 codegen 支持的类型
 * （boolean / number / string / 内联 object / Promise<...> / 可选 ?）。
 * 不要在此 import @itc/base 或任何运行时依赖——codegen 只解析类型。
 *
 * 三端原生分别实现名为 `ItcBiometric` 的 TurboModule：
 *  - Android: com.itc.biometric.ItcBiometricModule (Kotlin)
 *  - iOS:     ItcBiometric (Swift, 经 ObjC++ 暴露)
 *  - 鸿蒙:    ItcBiometricTurboModule (ArkTS, RNOH)
 */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * 当前设备生物识别可用性。
   * @returns available: 是否可立即认证；biometryType: 'fingerprint'|'face'|'iris'|'none'；
   *          errorCode: 不可用时的 ErrorCode 名（如 'BIOMETRY_NOT_ENROLLED'），可用时为空串。
   */
  isAvailable(): Promise<{
    available: boolean;
    biometryType: string;
    errorCode: string;
  }>;

  /**
   * 弹出系统生物识别。成功 resolve，失败/取消 reject（code 为 ErrorCode 名）。
   *
   * 入参刻意全部用基本类型（而非 object），以规避 iOS codegen 为对象入参生成的
   * C++ 结构体类型——保证三端原生方法签名简单、手写不易出错。JS 层 {@link AuthenticateOptions}
   * 负责把 options 对象拆成这些位置参数。
   */
  authenticate(
    title: string,
    subtitle: string,
    reason: string,
    cancelLabel: string,
    /** 允许在生物识别不可用时回退到设备 PIN/图案/密码 */
    allowDeviceCredential: boolean,
    /**
     * 允许弱生物识别（Class 2，如安卓多数机型的摄像头人脸）做基础认证。
     * 仅影响 authenticate()；createKey/signWithKey 的密钥签名始终要求强生物识别。
     * iOS（Face ID 本就是强）忽略此参数。
     */
    allowWeak: boolean
  ): Promise<{ success: boolean }>;

  /**
   * 生成一对生物特征绑定的非对称密钥（EC P-256），私钥存于安全硬件且
   * 要求每次使用前生物认证。返回 Base64(DER) 公钥，供后端注册做免密登录验签。
   * 若 alias 已存在则直接返回其公钥。
   */
  createKey(alias: string): Promise<{ publicKey: string }>;

  /**
   * 触发生物认证后，用 alias 对应私钥对 payload（Base64）做 ECDSA 签名。
   * 返回 Base64(DER) 签名。重新录入指纹等会使密钥失效 → reject(BIOMETRY_KEY_INVALIDATED)。
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
