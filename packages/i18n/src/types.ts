/**
 * @itc/i18n 类型定义
 * 基于 react-i18next 封装，提供类型安全的国际化 API
 */

import type { Resource, ResourceLanguage } from 'i18next';

// ── 语言类型 ────────────────────────────────────────────────────────────────

/** 支持的语言代码 */
export type LanguageCode =
  | 'zh-CN' | 'zh-Hans' | 'zh-Hant'
  | 'en' | 'en-US' | 'en-GB'
  | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'pt' | 'ru'
  | string;

/** 语言配置 */
export interface LanguageConfig {
  /** 语言代码 */
  code: LanguageCode;
  /** 语言名称（本地化显示名） */
  name: string;
  /** 文字方向 */
  direction?: 'ltr' | 'rtl';
}

// ── 翻译资源 ────────────────────────────────────────────────────────────────

/** 翻译资源类型 - 支持嵌套和平面结构 */
export type TranslationResource = ResourceLanguage;

/** 翻译资源集 - 键为语言代码 */
export type TranslationResources = Record<string, TranslationResource>;

/** 翻译文件加载器 */
export type TranslationLoader = (language: LanguageCode) => Promise<TranslationResource>;

// ── 初始化配置 ──────────────────────────────────────────────────────────────

/** i18n 初始化选项 */
export interface I18nOptions {
  /** 默认语言 */
  lng?: LanguageCode;
  /** 回退语言 */
  fallbackLng?: LanguageCode | false;
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 插值配置 */
  interpolation?: {
    escapeValue?: boolean;
    prefix?: string;
    suffix?: string;
  };
  /** 命名空间 */
  ns?: string | string[];
  /** 默认命名空间 */
  defaultNS?: string;
  /** 资源 */
  resources?: TranslationResources;
  /** 自定义翻译加载器 */
  loadResource?: TranslationLoader;
  /** 检测语言时排除的语言 */
  whitelist?: LanguageCode[];
  /** 非确定性模式 */
  nonExplicitWhitelist?: boolean;
  /** 缓存失效时间（毫秒） */
  cacheLifetime?: number;
  /** 允许在缺少翻译键时使用键本身作为回退 */
  returnEmptyString?: boolean | string;
  /** 缺少键时返回的值 */
  missingKeyNoValueFallbackToKey?: boolean;
  /** 后备命名空间 */
  fallbackNS?: string | string[] | false;
  /** 回调：语言改变后 */
  onLanguageChanged?: (lng: LanguageCode) => void;
  /** 回调：初始化完成后 */
  onInitialized?: () => void;
}

// ── 翻译函数重载类型 ────────────────────────────────────────────────────────

/** t 函数选项 */
export interface TOptions {
  /** 默认值（键不存在时使用） */
  defaultValue?: string;
  /** 描述（用于翻译人员） */
  description?: string;
  /** 上下文（用于区分同一键的不同用法） */
  context?: string;
  /** 复数形式 */
  count?: number;
  /** 精确复数索引 */
  pluralSeparator?: string;
  /** 上下文分隔符 */
  contextSeparator?: string;
  /** 命名空间覆盖 */
  ns?: string | string[];
  /** 键前缀 */
  keyPrefix?: string;
  /** 绑定值（用于返回对象而非字符串） */
  returnObjects?: boolean;
  /** 跳过插值 */
  skipInterpolation?: boolean;
  /** 替换值 */
  replace?: Record<string, unknown>;
  /** 编号格式选项 */
  format?: Record<string, unknown>;
}

// ── 语言检测配置 ────────────────────────────────────────────────────────────

/** 语言检测顺序 */
export type LanguageDetectorOrder = (
  | 'querystring'
  | 'cookie'
  | 'localStorage'
  | 'navigator'
  | 'htmlTag'
  | 'path'
  | 'subdomain'
)[];

/** 语言检测选项 */
export interface LanguageDetectorOptions {
  /** 检测顺序 */
  order?: LanguageDetectorOrder;
  /** 查询参数名 */
  lookupQuerystring?: string;
  /** Cookie 名称 */
  lookupCookie?: string;
  /** LocalStorage 键名 */
  lookupLocalStorage?: string;
  /** LocalStorage 缓存时间（秒） */
  localStorageExpirationTime?: number;
  /** 是否检查 htmlTag */
  htmlTag?: HTMLElement | null;
  /** 缓存用户语言选择的时间（秒） */
  cacheUserLanguage?: (lng: LanguageCode) => void;
  /** 转换函数 */
  convertDetectedLanguage?: (lng: string) => LanguageCode | false;
}

// ── 格式化器配置 ────────────────────────────────────────────────────────────

/** 格式化器配置 */
export interface FormatterOptions {
  /** 格式化函数映射 */
  formatters?: Record<string, (value: unknown, format?: string, lng?: LanguageCode) => string>;
}

// ── I18nProvider 接口 ───────────────────────────────────────────────────────

/**
 * I18nProvider 接口
 * 抽象国际化能力，方便后续替换底层实现
 */
export interface I18nProvider {
  /** 初始化 i18n */
  init(options: I18nOptions): Promise<void>;

  /** 翻译函数 */
  t(key: string, options?: TOptions): string;

  /** 改变语言 */
  changeLanguage(lng: LanguageCode): Promise<void>;

  /** 获取当前语言 */
  getCurrentLanguage(): LanguageCode;

  /** 获取语言方向 */
  getDirection(): 'ltr' | 'rtl';

  /** 添加资源 */
  addResource(lng: LanguageCode, ns: string, key: string, value: string): void;

  /** 批量添加资源 */
  addResources(lng: LanguageCode, ns: string, resources: Record<string, string>): void;

  /** 加载资源 */
  loadResources(resources?: TranslationResources): Promise<void>;

  /** 语言是否已加载 */
  isLanguageLoaded(lng: LanguageCode): boolean;

  /** 获取已加载的语言列表 */
  getLoadedLanguages(): LanguageCode[];

  /** 注册后置处理器 */
  addPostProcessor(name: string, processor: (value: string, raw: unknown, key: string, options: TOptions, translator: unknown) => string): void;

  /** 销毁实例 */
  destroy(): void;
}

// ── 便捷函数类型 ────────────────────────────────────────────────────────────

/** 数字格式化选项 */
export interface NumberFormatOptions {
  locale?: LanguageCode;
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  currencyDisplay?: 'symbol' | 'code' | 'name';
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  useGrouping?: boolean;
  unit?: string;
  unitDisplay?: 'short' | 'long' | 'narrow';
}

/** 日期格式化选项 */
export interface DateFormatOptions {
  locale?: LanguageCode;
  format?: string;
  localeMatcher?: 'best fit' | 'lookup';
  week?: 'narrow' | 'short' | 'long';
  era?: 'narrow' | 'short' | 'long';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  timeZoneName?: 'short' | 'long';
  timeZone?: string;
  hour12?: boolean;
  timeZoneOffset?: number;
  formatMatcher?: 'basic' | 'best fit';
}

// ── Hooks 类型 ──────────────────────────────────────────────────────────────

/** useTranslation 返回类型 */
export interface UseTranslationResult {
  /** 翻译函数 */
  t: (key: string, options?: TOptions) => string;
  /** i18n 实例 */
  i18n: I18nProvider;
  /** 资源是否已加载完成 */
  ready: boolean;
}

// ── 常量 ────────────────────────────────────────────────────────────────────

/** 默认支持的语言列表 */
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'zh-CN', name: '简体中文', direction: 'ltr' },
  { code: 'zh-Hant', name: '繁體中文', direction: 'ltr' },
  { code: 'en-US', name: 'English (US)', direction: 'ltr' },
  { code: 'en-GB', name: 'English (UK)', direction: 'ltr' },
  { code: 'ja', name: '日本語', direction: 'ltr' },
  { code: 'ko', name: '한국어', direction: 'ltr' },
  { code: 'fr', name: 'Français', direction: 'ltr' },
  { code: 'de', name: 'Deutsch', direction: 'ltr' },
  { code: 'es', name: 'Español', direction: 'ltr' },
  { code: 'pt', name: 'Português', direction: 'ltr' },
  { code: 'ru', name: 'Русский', direction: 'ltr' },
  { code: 'ar', name: 'العربية', direction: 'rtl' },
  { code: 'he', name: 'עברית', direction: 'rtl' },
];

/** 默认语言 */
export const DEFAULT_LANGUAGE: LanguageCode = 'zh-CN';

/** 回退语言 */
export const FALLBACK_LANGUAGE: LanguageCode = 'en-US';

/** 命名空间分隔符 */
export const NS_SEPARATOR = ':';

/** 键路径分隔符 */
export const KEY_SEPARATOR = '.';
