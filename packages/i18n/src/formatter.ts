/**
 * @itc/i18n 格式化工具
 * 提供数字、日期、时间等本地化格式化功能
 * 使用 date-fns 实现，完全不依赖 Intl API
 */

import {
  format as dfFormat,
  parseISO,
  isValid,
} from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import type { LanguageCode, NumberFormatOptions, DateFormatOptions } from './types';
import { SUPPORTED_LANGUAGES } from './types';
import i18n from 'i18next';

// ── 类型声明 ────────────────────────────────────────────────────────────────

type DateFnsLocale = typeof enUS;

// ── Locale 映射 ────────────────────────────────────────────────────────────

const localeMap: Record<string, DateFnsLocale> = {
  'zh-CN': zhCN,
  'zh-Hans': zhCN,
  'zh-Hant': zhCN,
  'en-US': enUS,
  'en-GB': enUS,
  'en': enUS,
};

/**
 * 获取 date-fns locale 对象
 */
function getDateFnsLocale(locale?: LanguageCode): DateFnsLocale {
  const lang = locale || i18n.language || 'en';
  const code = lang.replace('_', '-').toLowerCase();
  return localeMap[code] || enUS;
}

/**
 * 从 locale 获取简化的语言标签
 */
function getLanguage(locale?: LanguageCode): string {
  if (!locale) {
    return i18n.language || 'en';
  }
  return locale.replace('_', '-');
}

// ── 语言名称映射 ────────────────────────────────────────────────────────────

/**
 * 获取语言名称（使用预定义映射，不依赖 Intl API）
 */
function getLanguageNameMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const lang of SUPPORTED_LANGUAGES) {
    map[lang.code] = lang.name;
    // 添加简化代码映射
    const codeParts = lang.code.split('-');
    const shortCode = codeParts[0] ?? lang.code;
    if (!map[shortCode]) {
      map[shortCode] = lang.name;
    }
  }
  return map;
}

const LANGUAGE_NAME_MAP = getLanguageNameMap();

// ── 数字格式化 ──────────────────────────────────────────────────────────────

/**
 * 获取语言对应的数字格式配置
 */
function getNumberFormatConfig(locale?: LanguageCode): { decimalSeparator: string; groupSeparator: string } {
  const lang = getLanguage(locale);
  // 中文使用不同的分组格式
  if (lang.startsWith('zh')) {
    return { decimalSeparator: '.', groupSeparator: ',' };
  }
  // 其他语言默认使用英文格式
  return { decimalSeparator: '.', groupSeparator: ',' };
}

/**
 * 格式化数字
 */
export function formatNumber(
  value: number,
  options?: NumberFormatOptions
): string {
  const {
    locale,
    style = 'decimal',
    currency,
    currencyDisplay = 'symbol',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true,
  } = options ?? {};

  const { groupSeparator, decimalSeparator } = getNumberFormatConfig(locale);

  // 处理负数
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // 计算小数位数
  let decimalPlaces = maximumFractionDigits;
  if (minimumFractionDigits > 0) {
    decimalPlaces = minimumFractionDigits;
  }

  // 处理有效数字
  if (options?.minimumSignificantDigits || options?.maximumSignificantDigits) {
    const sig = options.maximumSignificantDigits || options.minimumSignificantDigits || 1;
    const sigResult = absValue.toPrecision(sig);
    // 去掉尾部多余的零
    return (isNegative ? '-' : '') + sigResult;
  }

  // 分离整数和小数部分
  const numStr = absValue.toFixed(decimalPlaces);
  const dotIndex = numStr.indexOf('.');
  let integerPart: string;
  let decimalPart: string;

  if (dotIndex === -1) {
    integerPart = numStr;
    decimalPart = '';
  } else {
    integerPart = numStr.substring(0, dotIndex);
    decimalPart = numStr.substring(dotIndex + 1);
  }

  // 应用分组
  if (useGrouping && integerPart.length > 3) {
    const groups: string[] = [];
    while (integerPart.length > 3) {
      groups.unshift(integerPart.slice(-3));
      integerPart = integerPart.slice(0, -3);
    }
    groups.unshift(integerPart);
    integerPart = groups.join(groupSeparator);
  }

  // 组合结果
  let result: string = integerPart;
  if (decimalPart.length > 0) {
    result += decimalSeparator + decimalPart;
  }

  // 处理样式
  switch (style) {
    case 'currency': {
      const currencySymbol = getCurrencySymbol(currency ?? 'USD', currencyDisplay);
      const formatted = `${currencySymbol}${result}`;
      return isNegative ? `-${formatted}` : formatted;
    }
    case 'percent': {
      return `${result}%`;
    }
    case 'unit': {
      const unit = options?.unit || '';
      const unitDisplay = options?.unitDisplay || 'short';
      if (unitDisplay === 'long') {
        return `${result} ${unit}`;
      }
      return `${result}${unit}`;
    }
    default:
      return isNegative ? `-${result}` : result;
  }
}

/**
 * 获取货币符号
 */
function getCurrencySymbol(currency: string, display: 'symbol' | 'code' | 'name'): string {
  const symbols: Record<string, { symbol: string; name: string }> = {
    CNY: { symbol: '¥', name: '人民币' },
    USD: { symbol: '$', name: '美元' },
    EUR: { symbol: '€', name: '欧元' },
    GBP: { symbol: '£', name: '英镑' },
    JPY: { symbol: '¥', name: '日元' },
    KRW: { symbol: '₩', name: '韩元' },
    RUB: { symbol: '₽', name: '卢布' },
  };

  const info = symbols[currency.toUpperCase()] || { symbol: currency, name: currency };

  switch (display) {
    case 'code':
      return `${currency} `;
    case 'name':
      return `${info.name} `;
    default:
      return info.symbol;
  }
}

/**
 * 格式化货币
 */
export function formatCurrency(
  value: number,
  currency: string,
  options?: Omit<NumberFormatOptions, 'style' | 'currency'>
): string {
  return formatNumber(value, {
    style: 'currency',
    currency,
    ...options,
  });
}

/**
 * 格式化百分比
 */
export function formatPercent(
  value: number,
  options?: Omit<NumberFormatOptions, 'style'>
): string {
  return formatNumber(value, {
    style: 'percent',
    ...options,
  });
}

/**
 * 解析数字字符串
 */
export function parseNumber(
  value: string,
  locale?: LanguageCode
): number {
  const { decimalSeparator, groupSeparator } = getNumberFormatConfig(locale);

  // 替换本地化的分隔符为标准分隔符
  let normalized = value
    .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
    .replace(decimalSeparator, '.');

  return parseFloat(normalized) || 0;
}

// ── 日期格式化 ──────────────────────────────────────────────────────────────

/**
 * 解析日期
 */
function parseDate(value: Date | number | string): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    return new Date(value);
  }
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : new Date(value);
}

/**
 * 格式化日期
 */
export function formatDate(
  value: Date | number | string,
  options?: DateFormatOptions
): string {
  const date = parseDate(value);
  const { locale, format, hour12 } = options ?? {};

  if (!isValid(date)) {
    return String(value);
  }

  const dfLocale = getDateFnsLocale(locale);

  // 如果指定了 format，使用预定义格式
  if (format) {
    return formatDateWithPreset(date, format, dfLocale, hour12);
  }

  // 默认格式
  return dfFormat(date, 'yyyy-MM-dd', { locale: dfLocale });
}

/**
 * 使用预定义格式格式化日期
 */
function formatDateWithPreset(
  date: Date,
  format: string,
  locale: DateFnsLocale,
  _hour12?: boolean
): string {
  const formatMap: Record<string, string> = {
    full: 'EEEE, MMMM d, yyyy',
    long: 'MMMM d, yyyy',
    medium: 'MMM d, yyyy',
    short: 'MM/dd/yyyy',
    time: 'HH:mm',
    datetime: 'MM/dd/yyyy HH:mm',
    'datetime-medium': 'MMM d, yyyy HH:mm',
    'datetime-long': 'MMMM d, yyyy HH:mm',
    'date-full': 'EEEE, MMMM d, yyyy',
    'date-long': 'MMMM d, yyyy',
    'date-medium': 'MMM d, yyyy',
    'date-short': 'MM/dd/yyyy',
    'time-short': 'HH:mm',
    'time-medium': 'HH:mm:ss',
    'time-long': 'HH:mm:ss:ss',
  };

  const dfFormatStr = formatMap[format] || format;
  return dfFormat(date, dfFormatStr, { locale });
}

/**
 * 格式化时间
 */
export function formatTime(
  value: Date | number | string,
  options?: {
    locale?: LanguageCode;
    hour12?: boolean;
    timeZone?: string;
  }
): string {
  const date = parseDate(value);
  const { locale, hour12 = false } = options ?? {};

  if (!isValid(date)) {
    return String(value);
  }

  const dfLocale = getDateFnsLocale(locale);
  const formatStr = hour12 ? 'hh:mm a' : 'HH:mm';

  return dfFormat(date, formatStr, { locale: dfLocale });
}

// ── 相对时间格式化 ──────────────────────────────────────────────────────────

/**
 * 相对时间单位
 */
export type RelativeTimeUnit =
  | 'second' | 'minute' | 'hour' | 'day'
  | 'week' | 'month' | 'quarter' | 'year';

/**
 * 获取相对时间的翻译键
 */
function getRelativeTimeTranslation(
  diffValue: number,
  unit: RelativeTimeUnit,
  locale?: LanguageCode
): { prefix: string; suffix: string } {
  const lang = getLanguage(locale);
  const isFuture = diffValue > 0;
  const absValue = Math.abs(diffValue);

  // 中文相对时间
  if (lang.startsWith('zh')) {
    const unitNames: Record<RelativeTimeUnit, string[]> = {
      second: ['秒', '秒钟'],
      minute: ['分钟', '分钟'],
      hour: ['小时', '小时'],
      day: ['天', '天'],
      week: ['周', '周'],
      month: ['月', '月'],
      quarter: ['季度', '季度'],
      year: ['年', '年'],
    };

    const unitName = unitNames[unit][0];
    if (isFuture) {
      return { prefix: `${absValue}${unitName}后`, suffix: '' };
    } else {
      return { prefix: `${absValue}${unitName}前`, suffix: '' };
    }
  }

  // 英文相对时间
  const unitNames: Record<RelativeTimeUnit, string> = {
    second: absValue === 1 ? 'second' : 'seconds',
    minute: absValue === 1 ? 'minute' : 'minutes',
    hour: absValue === 1 ? 'hour' : 'hours',
    day: absValue === 1 ? 'day' : 'days',
    week: absValue === 1 ? 'week' : 'weeks',
    month: absValue === 1 ? 'month' : 'months',
    quarter: absValue === 1 ? 'quarter' : 'quarters',
    year: absValue === 1 ? 'year' : 'years',
  };

  if (isFuture) {
    return { prefix: 'in ', suffix: ` ${unitNames[unit]}` };
  } else {
    return { prefix: `${absValue} ${unitNames[unit]} ago`, suffix: '' };
  }
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(
  value: Date | number | string,
  reference?: Date | number | string,
  options?: {
    locale?: LanguageCode;
    numeric?: 'auto' | 'always';
    style?: 'long' | 'short' | 'narrow';
  }
): string {
  const date = parseDate(value);
  let ref: Date;

  if (reference === undefined) {
    ref = new Date();
  } else {
    ref = parseDate(reference);
  }

  if (!isValid(date) || !isValid(ref)) {
    return String(value);
  }

  const { locale } = options ?? {};

  const diffMs = date.getTime() - ref.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffQuarter = Math.round(diffMonth / 3);
  const diffYear = Math.round(diffDay / 365);

  // 选择最合适的单位
  let unit: RelativeTimeUnit;
  let valueInUnit: number;

  if (Math.abs(diffSec) < 60) {
    unit = 'second';
    valueInUnit = diffSec;
  } else if (Math.abs(diffMin) < 60) {
    unit = 'minute';
    valueInUnit = diffMin;
  } else if (Math.abs(diffHour) < 24) {
    unit = 'hour';
    valueInUnit = diffHour;
  } else if (Math.abs(diffDay) < 7) {
    unit = 'day';
    valueInUnit = diffDay;
  } else if (Math.abs(diffWeek) < 4) {
    unit = 'week';
    valueInUnit = diffWeek;
  } else if (Math.abs(diffMonth) < 3) {
    unit = 'month';
    valueInUnit = diffMonth;
  } else if (Math.abs(diffQuarter) < 4) {
    unit = 'quarter';
    valueInUnit = diffQuarter;
  } else {
    unit = 'year';
    valueInUnit = diffYear;
  }

  const { prefix, suffix } = getRelativeTimeTranslation(valueInUnit, unit, locale);
  return `${prefix}${suffix}`;
}

// ── 其他格式化 ──────────────────────────────────────────────────────────────

/**
 * 格式化列表
 */
export function formatList(
  values: string[],
  options?: {
    locale?: LanguageCode;
    style?: 'long' | 'short' | 'narrow';
    type?: 'conjunction' | 'disjunction' | 'unit';
  }
): string {
  const { style = 'long', type = 'conjunction' } = options ?? {};
  const lang = getLanguage(options?.locale);

  if (values.length === 0) return '';
  if (values.length === 1) return values[0] ?? '';

  // 中文列表格式
  if (lang.startsWith('zh')) {
    if (type === 'disjunction') {
      return values.join('或');
    }
    return values.join('、');
  }

  // 英文列表格式
  const connector = type === 'conjunction' ? ', ' : type === 'disjunction' ? ' or ' : ' ';
  const lastConnector = type === 'conjunction' ? ' and ' : type === 'disjunction' ? ' or ' : ' ';

  if (style === 'short' || style === 'narrow') {
    return values.join(connector);
  }

  const last = values[values.length - 1] ?? '';
  const rest = values.slice(0, -1);
  return rest.join(connector) + lastConnector + last;
}

/**
 * 格式化复数
 */
export function formatPlural(
  value: number,
  options?: {
    locale?: LanguageCode;
    style?: 'cardinal' | 'ordinal';
  }
): string {
  const { locale, style = 'cardinal' } = options ?? {};
  const lang = getLanguage(locale);

  if (style === 'ordinal') {
    // 序数词
    if (lang.startsWith('zh')) {
      const suffix = value === 1 ? '第一' : value === 2 ? '第二' : '第';
      return `${suffix}${value}`;
    }
    // 英文序数词
    const n = value % 100;
    const suffix = n >= 11 && n <= 13 ? 'th'
      : n % 10 === 1 ? 'st'
      : n % 10 === 2 ? 'nd'
      : n % 10 === 3 ? 'rd'
      : 'th';
    return `${value}${suffix}`;
  }

  // 基数词复数
  if (lang.startsWith('zh')) {
    return value === 1 ? '单数' : '复数';
  }

  return value === 1 ? 'one' : 'other';
}

/**
 * 格式化语言名称
 */
export function formatLanguageName(
  languageCode: LanguageCode,
  _options?: {
    displayLocale?: LanguageCode;
  }
): string {
  // 首先尝试从预定义映射中获取
  const name = LANGUAGE_NAME_MAP[languageCode];
  if (name) {
    return name;
  }

  // 尝试简化代码
  const codeParts = languageCode.split('-');
  const shortCode = codeParts[0] ?? languageCode;
  const shortName = LANGUAGE_NAME_MAP[shortCode];
  if (shortName) {
    return shortName;
  }

  // 返回原始代码
  return languageCode;
}

/**
 * 格式化区域名称
 */
export function formatRegionName(
  regionCode: string,
  options?: {
    displayLocale?: LanguageCode;
  }
): string {
  const regions: Record<string, Record<string, string>> = {
    'zh-CN': { CN: '中国', US: '美国', GB: '英国', JP: '日本', KR: '韩国' },
    'en-US': { CN: 'China', US: 'United States', GB: 'United Kingdom', JP: 'Japan', KR: 'Korea' },
  };

  const lang = getLanguage(options?.displayLocale);
  const langRegions = regions[lang] ?? regions['en-US'] ?? {};
  return langRegions[regionCode.toUpperCase()] ?? regionCode;
}
