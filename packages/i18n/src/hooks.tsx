/**
 * @itc/i18n Hooks
 * 提供 React 组件中使用的 hooks
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  I18nProvider as I18nProviderType,
  LanguageCode,
  TOptions,
  UseTranslationResult,
} from './types';
import { i18nInstance, type ItcI18n } from './ItcI18n';
import { formatLanguageName } from './formatter';
import { logger } from '@itc/base';

const TAG = 'i18n-hooks';

// ── 浏览器 API 类型声明 ──────────────────────────────────────────────────────

declare const setInterval: (handler: () => void, timeout?: number) => number;
declare const clearInterval: (id: number) => void;

// ── I18nContext ─────────────────────────────────────────────────────────────

/** I18n 上下文 */
export const I18nContext = createContext<{
  provider: I18nProviderType;
  i18n: ItcI18n;
  ready: boolean;
} | null>(null);

// ── I18nProvider 组件 ───────────────────────────────────────────────────────

export interface I18nProviderProps {
  children: ReactNode;
  /** 初始化选项 */
  options?: Parameters<I18nProviderType['init']>[0];
  /** 延迟加载资源时的加载状态 */
  fallback?: ReactNode;
}

/**
 * I18nProvider 组件
 * 在应用顶层包裹，提供国际化上下文
 */
export function I18nProvider({
  children,
  options = {},
  fallback = null,
}: I18nProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    i18nInstance
      .init(options)
      .then(() => {
        if (mounted) {
          setReady(true);
        }
      })
      .catch((error) => {
        logger.error(TAG, 'Failed to initialize i18n', error);
      });

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue = useMemo(
    () => ({
      provider: i18nInstance,
      i18n: i18nInstance,
      ready,
    }),
    [ready]
  );

  if (!ready) {
    return <>{fallback}</>;
  }

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

// ── useI18n Hook ────────────────────────────────────────────────────────────

/**
 * 获取 i18n 实例
 */
export function useI18n(): ItcI18n {
  const context = useContext(I18nContext);
  if (!context) {
    logger.warn(TAG, 'useI18n called outside I18nProvider, using global instance');
    return i18nInstance;
  }
  return context.i18n;
}

// ── useTranslation Hook ─────────────────────────────────────────────────────

/**
 * useTranslation hook
 * 提供翻译函数，与 react-i18next API 兼容
 */
export function useTranslation(
  _ns?: string | readonly string[]
): UseTranslationResult & { isLoading: boolean } {
  const i18n = useI18n();
  const [ready, setReady] = useState(true);

  useEffect(() => {
    // 监听语言变化事件
    i18nInstance.changeLanguage('').catch(() => {
      // 忽略错误，仅用于初始化
    }).finally(() => {
      setReady(true);
    });

    return () => {
      // 清理
    };
  }, [i18n]);

  const t = useCallback(
    (key: string, options?: TOptions): string => {
      return i18n.t(key, options);
    },
    [i18n]
  );

  return {
    t,
    i18n,
    ready,
    isLoading: !ready,
  };
}

// ── useLanguage Hook ────────────────────────────────────────────────────────

export interface UseLanguageResult {
  /** 当前语言 */
  language: LanguageCode;
  /** 语言方向 */
  direction: 'ltr' | 'rtl';
  /** 是否正在改变语言 */
  isChanging: boolean;
  /** 改变语言 */
  changeLanguage: (lng: LanguageCode) => Promise<void>;
  /** 可用的语言列表 */
  availableLanguages: LanguageCode[];
}

/**
 * useLanguage hook
 * 管理当前语言状态
 */
export function useLanguage(): UseLanguageResult {
  const i18n = useI18n();
  const [language, setLanguage] = useState<LanguageCode>(i18n.getCurrentLanguage());
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(i18n.getDirection());
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // 监听语言变化 - 通过轮询方式检测变化
    const intervalId = setInterval(() => {
      const currentLng = i18n.getCurrentLanguage();
      const currentDir = i18n.getDirection();
      if (currentLng !== language) {
        setLanguage(currentLng);
        setDirection(currentDir);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [i18n, language]);

  const changeLanguage = useCallback(
    async (lng: LanguageCode) => {
      if (isChanging) return;

      setIsChanging(true);
      try {
        await i18n.changeLanguage(lng);
        setLanguage(lng);
        setDirection(i18n.getDirection());
      } finally {
        setIsChanging(false);
      }
    },
    [i18n, isChanging]
  );

  return {
    language,
    direction,
    isChanging,
    changeLanguage,
    availableLanguages: i18n.getLoadedLanguages(),
  };
}

// ── useLocale Hook ──────────────────────────────────────────────────────────

export interface UseLocaleResult {
  /** 语言代码 */
  language: LanguageCode;
  /** 语言区域 (如 zh-CN -> zh) */
  locale: string;
  /** 区域变体 (如 zh-CN -> CN) */
  region?: string;
  /** 语言名称 */
  languageName: string;
}

/**
 * useLocale hook
 * 获取详细的语言区域信息
 */
export function useLocale(): UseLocaleResult {
  const { language } = useLanguage();

  return useMemo(() => {
    const parts = language.split(/[-_]/);
    const locale = parts[0] || 'en';
    const region = parts[1]?.toUpperCase();

    // 使用 formatLanguageName 获取本地化的语言名称
    const languageName = formatLanguageName(language);

    return {
      language,
      locale,
      region,
      languageName,
    };
  }, [language]);
}
