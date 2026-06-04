/**
 * @itc/biometric —— 生物识别模块对外统一 API。
 *
 * 业务无关，暴露原子能力：能力枚举 / 按强度认证 / 定向认证（鸿蒙）/ 生物绑定密钥签名。
 * 钉钉式免密登录由宿主组合（注册公钥 → 登录时验签）。
 */
import { ItcError, ErrorCode, BaseModule, logger, currentPlatform } from '@itc/base';
import NativeItcBiometric from './NativeItcBiometric';
import {
  BIOMETRY_BIT,
  type BiometryKind,
  type BiometryStrength,
  type BiometryCapability,
  type CapabilitiesResult,
  type AuthenticateOptions,
  type AuthResult,
  type AuthFailReason,
  type KeyPairInfo,
  type SignatureResult,
} from './types';

const MODULE_NAME = 'biometric';
const TAG = 'biometric';

function toKind(raw: string): BiometryKind | null {
  return raw === 'fingerprint' || raw === 'face' || raw === 'iris' ? raw : null;
}

function toStrength(raw: string): BiometryStrength | 'none' {
  return raw === 'strong' || raw === 'weak' ? raw : 'none';
}

function toFailReason(raw: string): AuthFailReason {
  switch (raw) {
    case 'canceled':
    case 'failed':
    case 'lockout':
    case 'timeout':
    case 'not_enrolled':
    case 'not_supported':
    case 'not_directable':
    case 'busy':
      return raw;
    default:
      return 'unknown';
  }
}

/** 生物识别模块。实现 {@link BaseModule} 契约，可被宿主统一编排。 */
class BiometricModule extends BaseModule {
  readonly name = MODULE_NAME;

  protected async onInit(): Promise<void> {
    // 按需调用，无常驻资源。
  }
  protected async onDestroy(): Promise<void> {
    // 无需释放。
  }

  /** 枚举平台生物能力（List + 位掩码）。失败按"无能力"处理。 */
  async getCapabilities(): Promise<CapabilitiesResult> {
    try {
      const r = await NativeItcBiometric.getCapabilities();
      const capabilities: BiometryCapability[] = [];
      for (const it of r.items) {
        const kind = toKind(it.kind);
        if (kind === null) continue;
        capabilities.push({
          kind,
          hardware: it.hardware,
          enrolled: it.enrolled,
          available: it.available,
          strength: toStrength(it.strength),
          directable: it.directable,
          reason: it.reason || undefined,
        });
      }
      return { capabilities, mask: r.mask };
    } catch (e) {
      logger.warn(TAG, 'getCapabilities 失败，按无能力处理', e);
      return { capabilities: [], mask: 0 };
    }
  }

  /** 当前是否有任一可用生物识别（getCapabilities().mask !== 0 的便捷封装）。 */
  async isSupported(): Promise<boolean> {
    const { mask } = await this.getCapabilities();
    return mask !== 0;
  }

  /** 按强度认证（跨端通用，系统选模态）。返回结果类，不抛（参数非法除外）。 */
  async authenticate(options: AuthenticateOptions): Promise<AuthResult> {
    this.assertTitle(options.title);
    try {
      const r = await NativeItcBiometric.authenticate(
        options.title,
        options.subtitle ?? '',
        options.reason ?? options.title,
        options.cancelLabel ?? '取消',
        options.allowDeviceCredential ?? false,
        options.strength ?? 'strong'
      );
      return this.toAuthResult(r);
    } catch (e) {
      return { ok: false, reason: 'unknown', code: 'NATIVE_ERROR', message: describe(e) };
    }
  }

  /**
   * 定向认证到指定模态。仅鸿蒙真支持；iOS/Android 直接返回 not_directable（不下发原生）。
   */
  async authenticateWith(
    kind: BiometryKind,
    options: AuthenticateOptions
  ): Promise<AuthResult> {
    this.assertTitle(options.title);
    if (currentPlatform !== 'harmony') {
      return {
        ok: false,
        reason: 'not_directable',
        code: 'NOT_DIRECTABLE',
        message: `${currentPlatform} 不支持定向到指定模态，请改用 authenticate(按强度)`,
      };
    }
    try {
      const r = await NativeItcBiometric.authenticateWith(
        kind,
        options.title,
        options.subtitle ?? '',
        options.reason ?? options.title,
        options.cancelLabel ?? '取消',
        options.allowDeviceCredential ?? false
      );
      return this.toAuthResult(r);
    } catch (e) {
      return { ok: false, reason: 'unknown', code: 'NATIVE_ERROR', message: describe(e) };
    }
  }

  /** 创建生物绑定密钥，返回公钥（提交后端注册）。密钥算法与生物模态无关。 */
  async createKey(alias: string): Promise<KeyPairInfo> {
    try {
      return await NativeItcBiometric.createKey(alias);
    } catch (e) {
      throw ItcError.from(e, MODULE_NAME);
    }
  }

  /** 强生物认证后用私钥对 payload 签名（免密登录验签用）。 */
  async signWithKey(
    alias: string,
    payloadBase64: string,
    promptTitle: string
  ): Promise<SignatureResult> {
    try {
      return await NativeItcBiometric.signWithKey(alias, payloadBase64, promptTitle);
    } catch (e) {
      throw ItcError.from(e, MODULE_NAME);
    }
  }

  async deleteKey(alias: string): Promise<void> {
    try {
      await NativeItcBiometric.deleteKey(alias);
    } catch (e) {
      throw ItcError.from(e, MODULE_NAME);
    }
  }

  async keyExists(alias: string): Promise<boolean> {
    try {
      return await NativeItcBiometric.keyExists(alias);
    } catch (e) {
      throw ItcError.from(e, MODULE_NAME);
    }
  }

  // ---- 内部 ----------------------------------------------------------------

  private assertTitle(title: string): void {
    if (!title?.trim()) {
      throw new ItcError(ErrorCode.INVALID_ARGUMENT, 'authenticate 需要非空 title', {
        module: MODULE_NAME,
      });
    }
  }

  private toAuthResult(r: {
    success: boolean;
    usedKind: string;
    reason: string;
  }): AuthResult {
    if (r.success) {
      return { ok: true, usedKind: toKind(r.usedKind) ?? 'unknown' };
    }
    return {
      ok: false,
      reason: toFailReason(r.reason),
      code: r.reason || 'UNKNOWN',
      message: r.reason || '认证失败',
    };
  }
}

function describe(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** 单例。宿主直接 `import { biometric } from '@itc/biometric'`。 */
export const biometric = new BiometricModule();

export { BIOMETRY_BIT };
export type {
  BiometryKind,
  BiometryStrength,
  BiometryCapability,
  CapabilitiesResult,
  AuthenticateOptions,
  AuthResult,
  AuthFailReason,
  KeyPairInfo,
  SignatureResult,
};
