/**
 * @itc/i18n 命名空间工具
 * 支持创建和管理多个命名空间
 */

import type { LanguageCode, TranslationResource } from './types';
import { i18nInstance } from './ItcI18n';

/**
 * 创建命名空间配置
 */
export interface I18nNamespaceConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  /** 命名空间名称 */
  name: string;
  /** 默认翻译资源 */
  defaultResources?: TranslationResource;
  /** 翻译键类型 */
  _type?: T;
}

/**
 * 创建命名空间
 * @param config 命名空间配置
 * @returns 命名空间实例
 */
export function createI18nNamespace<T extends Record<string, unknown> = Record<string, unknown>>(
  config: I18nNamespaceConfig<T>
): {
  name: string;
  t: (key: keyof T | string, options?: Parameters<typeof i18nInstance.t>[1]) => string;
  addResources: (resources: Partial<T>) => void;
  getResource: (key: string, language?: LanguageCode) => string | undefined;
} {
  const { name, defaultResources } = config;

  // 如果提供了默认资源，添加它们
  if (defaultResources) {
    i18nInstance.addResources(
      Object.keys(defaultResources)[0] as LanguageCode,
      name,
      defaultResources[Object.keys(defaultResources)[0] as LanguageCode] as Record<string, unknown>
    );
  }

  return {
    name,

    /**
     * 翻译函数
     */
    t: (key, options) => {
      const nsKey = `${name}:${String(key)}`;
      return i18nInstance.t(nsKey, options);
    },

    /**
     * 添加翻译资源
     */
    addResources: (resources) => {
      const currentLng = i18nInstance.getCurrentLanguage();
      i18nInstance.addResources(currentLng, name, resources as Record<string, unknown>);
    },

    /**
     * 获取翻译值
     */
    getResource: (key, language) => {
      const lng = language ?? i18nInstance.getCurrentLanguage();
      const nsKey = `${name}:${key}`;
      const value = i18nInstance.t(nsKey);
      // 如果返回值等于键本身，说明没有找到
      return value === nsKey ? undefined : value;
    },
  };
}

/**
 * 合并多个命名空间的翻译
 */
export function mergeNamespaces(
  ...namespaces: Array<{ name: string; resources: TranslationResource }>
): TranslationResource {
  const result: TranslationResource = {};

  for (const ns of namespaces) {
    Object.assign(result, ns.resources);
  }

  return result;
}

/**
 * 创建命名空间工厂
 */
export function createNamespaceFactory<T extends Record<string, unknown>>(
  defaultLanguage: LanguageCode = 'zh-CN'
) {
  return (
    name: string,
    defaultResources?: TranslationResource
  ) => {
    return createI18nNamespace<T>({
      name,
      defaultResources: defaultResources
        ? { [defaultLanguage]: defaultResources }
        : undefined,
    });
  };
}
