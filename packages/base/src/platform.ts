/**
 * 平台抽象。在 RN `Platform` 之上扩展鸿蒙判定，给上层提供统一的三端分支入口。
 *
 * RNOH 运行时会把 `Platform.OS` 报告为 `'harmony'`，因此鸿蒙判定无需原生代码。
 */
import { Platform } from 'react-native';

export type ItcPlatform = 'android' | 'ios' | 'harmony';

/** 当前运行平台。非三端（web/windows 等）一律回退到 android 分支语义并打日志由上层处理。 */
export const currentPlatform: ItcPlatform = ((): ItcPlatform => {
  switch (Platform.OS) {
    case 'ios':
      return 'ios';
    case 'harmony' as string:
      return 'harmony';
    default:
      return 'android';
  }
})();

export const isAndroid = currentPlatform === 'android';
export const isIOS = currentPlatform === 'ios';
export const isHarmony = currentPlatform === 'harmony';

/**
 * 三端分支选择器：按当前平台取值，缺省回退顺序 harmony→android。
 *
 * @example
 *   const channel = select({ android: 'umeng', ios: 'apns', harmony: 'pushkit' });
 */
export function select<T>(branches: {
  android: T;
  ios: T;
  harmony: T;
}): T {
  return branches[currentPlatform];
}

// ── 版本号类型别名（语义化）────────────────────────────────────────────────────

/** 主版本号，如 17、18 */
export type MajorVersion = number;
/** 次版本号，如 5 */
export type MinorVersion = number;
/** 补丁版本号，如 0 */
export type PatchVersion = number;

/** 平台版本信息 */
export interface PlatformVersion {
  /** 版本号数字，如 170500（iOS 17.5.0）、3300（Android 13.0.0） */
  readonly code: number;
  /** 主版本号，如 17、13 */
  readonly major: MajorVersion;
  /** 次版本号，如 5、0 */
  readonly minor: MinorVersion;
  /** 补丁版本号，如 0 */
  readonly patch: PatchVersion;
  /** 版本字符串，如 "17.5.0"、"13.0.0"、"4.2.0" */
  readonly string: string;
  /** 是否为指定版本（精确匹配） */
  is(version: string | number): boolean;
  /** 是否大于等于指定版本 */
  gte(version: string | number): boolean;
  /** 是否大于指定版本 */
  gt(version: string | number): boolean;
  /** 是否小于等于指定版本 */
  lte(version: string | number): boolean;
  /** 是否小于指定版本 */
  lt(version: string | number): boolean;
}

// ── 版本比较内部实现────────────────────────────────────────────────────────────

function parseVersion(version: string | number): {
  major: number;
  minor: number;
  patch: number;
} {
  if (typeof version === 'number') {
    // 数字格式：iOS 是 17.5 → 17500 或 170500，Android 是 33 → 3300
    // 根据大小判断：如果 >= 1000 认为 Android 格式（major*100 + minor）
    if (version >= 1000) {
      const major = Math.floor(version / 100);
      const minor = version % 100;
      return { major, minor, patch: 0 };
    }
    // 否则假设传入的是直接的版本数字
    return { major: version, minor: 0, patch: 0 };
  }

  const parts = version.split('.').map(Number);
  return {
    major: parts[0] ?? 0,
    minor: parts[1] ?? 0,
    patch: parts[2] ?? 0,
  };
}

function compareVersions(v1: string | number, v2: string | number): number {
  const a = parseVersion(v1);
  const b = parseVersion(v2);

  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

function createVersion(
  platform: ItcPlatform,
  code: number,
): PlatformVersion & { readonly platform: ItcPlatform } {
  const parse = parseVersion(code);
  const major = parse.major;
  const minor = parse.minor;
  const patch = parse.patch;
  const string = `${major}.${minor}${patch ? `.${patch}` : ''}`;

  return {
    platform,
    code,
    major,
    minor,
    patch,
    string,
    is(version) {
      return compareVersions(code, version) === 0;
    },
    gte(version) {
      return compareVersions(code, version) >= 0;
    },
    gt(version) {
      return compareVersions(code, version) > 0;
    },
    lte(version) {
      return compareVersions(code, version) <= 0;
    },
    lt(version) {
      return compareVersions(code, version) < 0;
    },
  };
}

// ── iOS 版本 ───────────────────────────────────────────────────────────────────

/** iOS 版本信息 */
export const iosVersion = createVersion('ios', Platform.Version as number);

// ── Android 版本 ───────────────────────────────────────────────────────────────

/** Android 版本信息 */
export const androidVersion = createVersion('android', Platform.Version as number);

// ── HarmonyOS 版本 ─────────────────────────────────────────────────────────────

/**
 * HarmonyOS 版本信息。
 *
 * 注意：RNOH 的 `Platform.Version` 通常返回 0 或不准确，
 * 实际版本号可能需要通过原生模块或 DeviceInfo 获取。
 * 当前实现返回 Platform.Version 值，如果为 0 则回退到默认值。
 *
 * 如需精确获取 HarmonyOS 版本，建议集成 react-native-device-info 或原生模块。
 */
export const harmonyVersion = (() => {
  const rawVersion = Platform.Version as number;
  // RNOH 可能返回 0，使用默认版本
  const safeVersion = rawVersion > 0 ? rawVersion : 0;
  return createVersion('harmony', safeVersion);
})();

// ── 当前平台版本（语法糖）──────────────────────────────────────────────────────

/** 当前平台的版本信息 */
export const currentVersion =
  currentPlatform === 'ios'
    ? iosVersion
    : currentPlatform === 'android'
      ? androidVersion
      : harmonyVersion;
