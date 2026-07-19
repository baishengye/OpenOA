import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@itc/uikit';
import { useLanguage, useLocale, useTranslation, formatNumber, formatDate, formatCurrency, formatRelativeTime } from '@itc/i18n';
import { shared } from './shared';

// ── I18nTab 组件 ─────────────────────────────────────────────────────────────

interface Props {
  busy: boolean;
}

export function I18nTab({ busy: _busy }: Props) {
  const { t } = useTranslation();
  const { language, direction, changeLanguage, availableLanguages, isChanging } = useLanguage();
  const { locale: localeCode, region, languageName } = useLocale();

  const [info, setInfo] = useState('');

  const refreshInfo = useCallback(() => {
    const now = new Date();
    const num = 1234567.89;
    const currency = 99.99;

    const lines = [
      `${t('i18n.currentLanguage')}: ${language}`,
      `${t('i18n.languageDirection')}: ${direction}`,
      `${t('i18n.languageName')}: ${languageName}`,
      `${t('i18n.locale')}: ${localeCode}${region ? `, ${t('i18n.region')}: ${region}` : ''}`,
      `${t('i18n.availableLanguages')}: ${availableLanguages.join(', ') || t('i18n.none')}`,
      ``,
      `${t('i18n.formatExamples')}:`,
      `  ${t('i18n.number')}: ${formatNumber(num)}`,
      `  ${t('i18n.currency')}: ${formatCurrency(currency, 'CNY')}`,
      `  ${t('i18n.date')}: ${formatDate(now)}`,
      `  ${t('i18n.relativeTime')}: ${formatRelativeTime(new Date(now.getTime() - 3600000))}`,
    ];

    setInfo(lines.join('\n'));
  }, [language, direction, languageName, localeCode, region, availableLanguages, t]);

  useEffect(() => { refreshInfo(); }, [refreshInfo]);

  const handleChangeLanguage = useCallback(async (lng: 'en-US' | 'zh-CN') => {
    await changeLanguage(lng);
    refreshInfo();
  }, [changeLanguage, refreshInfo]);

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>{t('i18n.title')}</Text>
      <Text style={shared.mono}>{info}</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Button
          variant="outline"
          onPress={() => handleChangeLanguage('en-US')}
          disabled={isChanging || language === 'en-US'}
        >
          <Text>English</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() => handleChangeLanguage('zh-CN')}
          disabled={isChanging || language === 'zh-CN'}
        >
          <Text>中文</Text>
        </Button>
        <Button
          variant="ghost"
          onPress={refreshInfo}
          disabled={isChanging}
        >
          <Text>{t('common.refresh')}</Text>
        </Button>
      </View>

      <Text style={shared.mono}>{t('common.translationExample')}: {t('common.hello')} {t('common.world')}</Text>
      <Text style={shared.mono}>{t('common.instance')}: {t('common.loaded')}</Text>
    </View>
  );
}
