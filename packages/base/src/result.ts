/**
 * 跨模块统一的结果 / 错误模型。
 *
 * 所有 @itc/* 模块对外抛出的错误都应是 {@link ItcError}，错误码取自
 * {@link ErrorCode}（模块各自可在 `MODULE_xxx` 段扩展私有码，但公共语义码统一在此）。
 */

/** 统一错误码。区间约定：1xxx 通用，2xxx 生物识别，3xxx 推送，4xxx IM。 */
export enum ErrorCode {
  // 通用 1xxx
  UNKNOWN = 1000,
  /** 当前平台 / 设备不支持该能力 */
  UNSUPPORTED = 1001,
  /** 缺少必要权限 */
  PERMISSION_DENIED = 1002,
  /** 用户主动取消 */
  USER_CANCELED = 1003,
  /** 参数非法 */
  INVALID_ARGUMENT = 1004,
  /** 原生模块未链接 / 未初始化 */
  NATIVE_MODULE_UNAVAILABLE = 1005,
  /** 操作超时 */
  TIMEOUT = 1006,

  // 生物识别 2xxx
  /** 设备无生物识别硬件 */
  BIOMETRY_NO_HARDWARE = 2000,
  /** 未录入任何生物特征 */
  BIOMETRY_NOT_ENROLLED = 2001,
  /** 生物识别被锁定（多次失败） */
  BIOMETRY_LOCKOUT = 2002,
  /** 认证失败（特征不匹配） */
  BIOMETRY_AUTH_FAILED = 2003,
  /** 密钥不存在 / 已失效（如重新录入指纹导致失效） */
  BIOMETRY_KEY_INVALIDATED = 2004,
}

/** 统一异常类型。所有 @itc/* 原生桥接的失败都规整为它。 */
export class ItcError extends Error {
  readonly code: ErrorCode;
  /** 触发错误的模块名，便于日志定位 */
  readonly module?: string;
  /** 原始底层错误（原生错误码 / message）。覆盖 ES2022 Error.cause。 */
  override readonly cause?: unknown;

  constructor(
    code: ErrorCode,
    message: string,
    options?: { module?: string; cause?: unknown }
  ) {
    super(message);
    this.name = 'ItcError';
    this.code = code;
    this.module = options?.module;
    this.cause = options?.cause;
  }

  /**
   * 把原生桥接抛出的对象 / 字符串规整为 ItcError。
   * 原生侧约定以 `code` 字段（字符串）回传错误码名，找不到则归为 UNKNOWN。
   */
  static from(raw: unknown, module?: string): ItcError {
    if (raw instanceof ItcError) return raw;
    if (raw instanceof Error) {
      // RN 原生 reject 的错误：{ code, message, userInfo }
      const code = (raw as { code?: string }).code;
      const mapped =
        code && code in ErrorCode
          ? ErrorCode[code as keyof typeof ErrorCode]
          : ErrorCode.UNKNOWN;
      return new ItcError(mapped, raw.message, { module, cause: raw });
    }
    return new ItcError(ErrorCode.UNKNOWN, String(raw), { module, cause: raw });
  }
}

/** 可判别联合的轻量结果包装，适合不想 try/catch 的调用点。 */
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ItcError };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<T = never>(error: ItcError): Result<T> {
  return { ok: false, error };
}

/** 把一个可能抛 ItcError 的 Promise 包成 Result，避免调用方写 try/catch。 */
export async function toResult<T>(
  promise: Promise<T>,
  module?: string
): Promise<Result<T>> {
  try {
    return ok(await promise);
  } catch (e) {
    return err(ItcError.from(e, module));
  }
}
