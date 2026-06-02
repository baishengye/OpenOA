/**
 * @itc/biometric —— 生物识别模块对外统一 API。
 *
 * 业务无关：只暴露「能力探测 / 认证 / 生物绑定密钥签名」三类原子能力，
 * 钉钉式免密登录由宿主用这些原子能力组合（注册公钥 → 登录时验签）。
 */
import { ItcError, ErrorCode, BaseModule, logger } from '@itc/base';
import NativeItcBiometric from './NativeItcBiometric';
import type {
  BiometryType,
  BiometryAvailability,
  AuthenticateOptions,
  KeyPairInfo,
  SignatureResult,
} from './types';

const MODULE_NAME = 'biometric';
const TAG = 'biometric';

function toBiometryType(raw: string): BiometryType {
  switch (raw) {
    case 'fingerprint':
    case 'face':
    case 'iris':
      return raw;
    default:
      return 'none';
  }
}

/**
 * 生物识别模块。实现 {@link BaseModule} 契约，可被宿主统一编排。
 * 本模块无需显式 init（原生随 autolink 就绪），init/destroy 为契约占位。
 */
class BiometricModule extends BaseModule {
  readonly name = MODULE_NAME;

  protected async onInit(): Promise<void> {
    // 生物识别为按需调用，无常驻资源；保留钩子以统一生命周期。
  }

  protected async onDestroy(): Promise<void> {
    // 无需释放
  }

  /** 当前设备是否支持且可立即使用生物识别。 */
  async isSupported(): Promise<boolean> {
    try {
      const r = await NativeItcBiometric.isAvailable();
      return r.available;
    } catch (e) {
      logger.warn(TAG, 'isSupported 探测失败，按不支持处理', e);
      return false;
    }
  }

  /** 详细可用性（含生物类型与不可用原因）。 */
  async getAvailability(): Promise<BiometryAvailability> {
    try {
      const r = await NativeItcBiometric.isAvailable();
      return {
        available: r.available,
        biometryType: toBiometryType(r.biometryType),
        reason: r.errorCode || undefined,
      };
    } catch (e) {
      throw ItcError.from(e, MODULE_NAME);
    }
  }

  /** 弹出系统生物识别。失败/取消抛 {@link ItcError}。 */
  async authenticate(options: AuthenticateOptions): Promise<void> {
    if (!options.title?.trim()) {
      throw new ItcError(
        ErrorCode.INVALID_ARGUMENT,
        'authenticate 需要非空 title',
        { module: MODULE_NAME }
      );
    }
    try {
      await NativeItcBiometric.authenticate(
        options.title,
        options.subtitle ?? '',
        options.reason ?? options.title,
        options.cancelLabel ?? '取消',
        options.allowDeviceCredential ?? false,
        options.allowWeakBiometric ?? false
      );
    } catch (e) {
      throw ItcError.from(e, MODULE_NAME);
    }
  }

  /** 创建生物绑定密钥，返回公钥（提交后端注册）。 */
  async createKey(alias: string): Promise<KeyPairInfo> {
    try {
      return await NativeItcBiometric.createKey(alias);
    } catch (e) {
      throw ItcError.from(e, MODULE_NAME);
    }
  }

  /** 生物认证后用私钥对 payload 签名（免密登录验签用）。 */
  async signWithKey(
    alias: string,
    payloadBase64: string,
    promptTitle: string
  ): Promise<SignatureResult> {
    try {
      return await NativeItcBiometric.signWithKey(
        alias,
        payloadBase64,
        promptTitle
      );
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
}

/** 单例。宿主直接 `import { biometric } from '@itc/biometric'`。 */
export const biometric = new BiometricModule();

export type {
  BiometryType,
  BiometryAvailability,
  AuthenticateOptions,
  KeyPairInfo,
  SignatureResult,
};
