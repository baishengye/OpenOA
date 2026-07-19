/**
 * @itc/i18n 导出
 */

export {
  ItcI18n,
  i18nInstance,
} from './ItcI18n';

export {
  useI18n,
  useTranslation,
  useLanguage,
  useLocale,
  I18nProvider,
  I18nContext,
  type I18nProviderProps,
  type UseLanguageResult,
  type UseLocaleResult,
} from './hooks';

export {
  createI18nNamespace,
} from './namespace';

export {
  formatNumber,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatCurrency,
  formatPercent,
  formatList,
  formatPlural,
  formatLanguageName,
  formatRegionName,
} from './formatter';

export * from './types';
