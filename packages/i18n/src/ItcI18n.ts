/**
 * @itc/i18n 核心实现
 * 基于 react-i18next 封装
 */

import i18n, {
  type Resource,
  type InitOptions,
  type PostProcessorModule,
} from 'i18next';
import { initReactI18next } from 'react-i18next';
import type {
  I18nProvider,
  I18nOptions,
  TOptions,
  LanguageCode,
  TranslationResources,
  TranslationLoader,
} from './types';
import { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE } from './types';
import { logger } from '@itc/base';

const TAG = 'i18n';

// ── ItcI18n 实现 ────────────────────────────────────────────────────────────

export class ItcI18n implements I18nProvider {
  private initialized = false;
  private loadedLanguages: Set<LanguageCode> = new Set();
  private customLoader?: TranslationLoader;

  /**
   * 初始化 i18n
   */
  async init(options: I18nOptions = {}): Promise<void> {
    if (this.initialized) {
      logger.warn(TAG, 'i18n already initialized, skipping...');
      return;
    }

    const {
      lng = DEFAULT_LANGUAGE,
      fallbackLng = FALLBACK_LANGUAGE,
      debug = false,
      interpolation,
      ns,
      defaultNS,
      resources,
      onLanguageChanged,
      onInitialized,
    } = options;

    this.customLoader = options.loadResource;

    // 构建初始化配置
    const initOptions: InitOptions = {
      lng,
      fallbackLng,
      debug,
      ns: ns ?? defaultNS ?? 'translation',
      defaultNS: defaultNS ?? 'translation',
      initImmediate: false,
      interpolation: {
        escapeValue: false, // React Native 已处理 XSS
        ...interpolation,
      },
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
      },
      resources: this.buildResources(resources),
    };

    // 使用 i18next 的 init 方法
    await new Promise<void>((resolve, reject) => {
      i18n
        .use(initReactI18next)
        .init(initOptions, (err) => {
          if (err) {
            reject(err);
          } else {
            this.initialized = true;
            // 标记初始语言已加载
            this.loadedLanguages.add(lng as LanguageCode);
            resolve();
          }
        });
    });

    // 注册语言变化回调
    if (onLanguageChanged) {
      i18n.on('languageChanged', () => onLanguageChanged(lng as LanguageCode));
    }

    // 初始化完成回调
    if (onInitialized) {
      onInitialized();
    }

    logger.info(TAG, `Initialized with language: ${lng}`);
  }

  /**
   * 构建资源格式
   */
  private buildResources(resources?: TranslationResources): Resource {
    if (!resources) return {};

    const result: Resource = {};
    for (const [lngKey, nsMap] of Object.entries(resources)) {
      result[lngKey] = nsMap;
    }
    return result;
  }

  /**
   * 翻译函数
   */
  t(key: string, options?: TOptions): string {
    if (!this.initialized) {
      logger.warn(TAG, 'i18n not initialized, call init() first');
      return key;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = i18n.t(key, options as any);
    return typeof result === 'string' ? result : key;
  }

  /**
   * 改变语言
   */
  async changeLanguage(lng: LanguageCode): Promise<void> {
    if (!this.initialized) {
      throw new Error('i18n not initialized, call init() first');
    }

    // 如果语言未加载，先尝试加载
    if (!this.loadedLanguages.has(lng) && this.customLoader) {
      try {
        const resources = await this.customLoader(lng);
        this.addResources(lng, 'translation', resources);
        this.loadedLanguages.add(lng);
      } catch (error) {
        logger.warn(TAG, `Failed to load resources for ${lng}, using existing resources`);
      }
    }

    await i18n.changeLanguage(lng);
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): LanguageCode {
    return (i18n.language || DEFAULT_LANGUAGE) as LanguageCode;
  }

  /**
   * 获取语言方向
   */
  getDirection(): 'ltr' | 'rtl' {
    const lng = this.getCurrentLanguage();
    // 简单判断 RTL 语言
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.some((l) => lng.startsWith(l)) ? 'rtl' : 'ltr';
  }

  /**
   * 添加单个翻译资源
   */
  addResource(lng: LanguageCode, ns: string, key: string, value: string): void {
    if (!this.initialized) {
      logger.warn(TAG, 'i18n not initialized');
      return;
    }
    i18n.addResource(lng, ns, key, value);
  }

  /**
   * 批量添加翻译资源
   */
  addResources(lng: LanguageCode, ns: string, resources: Record<string, unknown>): void {
    if (!this.initialized) {
      logger.warn(TAG, 'i18n not initialized');
      return;
    }

    const addResourceRecursive = (obj: Record<string, unknown>, prefix: string): void => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string') {
          i18n.addResource(lng, ns, fullKey, value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          addResourceRecursive(value as Record<string, unknown>, fullKey);
        }
      }
    };

    addResourceRecursive(resources, '');
    this.loadedLanguages.add(lng);
  }

  /**
   * 加载资源
   */
  async loadResources(resources?: TranslationResources): Promise<void> {
    if (resources) {
      // 使用 i18n.init 的 resources 选项批量加载
      for (const [lngKey, nsMap] of Object.entries(resources)) {
        for (const [ns, translations] of Object.entries(nsMap)) {
          this.addResources(lngKey as LanguageCode, ns, translations as Record<string, unknown>);
        }
      }
    } else if (this.customLoader) {
      // 使用自定义加载器
      const lng = this.getCurrentLanguage();
      try {
        const resources = await this.customLoader(lng);
        this.addResources(lng, 'translation', resources);
      } catch (error) {
        logger.error(TAG, 'Failed to load resources with custom loader', error);
      }
    }
  }

  /**
   * 检查语言是否已加载
   */
  isLanguageLoaded(lng: LanguageCode): boolean {
    return this.loadedLanguages.has(lng);
  }

  /**
   * 获取已加载的语言列表
   */
  getLoadedLanguages(): LanguageCode[] {
    return Array.from(this.loadedLanguages);
  }

  /**
   * 注册后置处理器
   */
  addPostProcessor(
    name: string,
    processor: (value: string, raw: unknown, key: string, options: TOptions, translator: unknown) => string
  ): void {
    const postProcessor: PostProcessorModule = {
      type: 'postProcessor',
      name,
      process: (value: string) => value,
    };
    i18n.use(postProcessor);
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    i18n.off('languageChanged');
    i18n.off('loaded');
    i18n.off('initialized');
    this.initialized = false;
    this.loadedLanguages.clear();
    logger.info(TAG, 'i18n destroyed');
  }
}

// ── 导出单例 ────────────────────────────────────────────────────────────────

/** 全局 i18n 实例 */
export const i18nInstance = new ItcI18n();
