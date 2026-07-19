import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { storage } from '@itc/base';
import { installStorage } from '@itc/storage';
import { useTranslation } from '@itc/i18n';
import { Button, describe, shared } from './shared';

const LAUNCH_KEY = 'oa.launchCount';

interface Props {
  busy: boolean;
}

export function StorageTab({ busy }: Props) {
  const { t } = useTranslation();
  const [info, setInfo] = useState('—');

  const refresh = useCallback(() => {
    try {
      const persistent = installStorage();
      const prev = parseInt(storage.getString(LAUNCH_KEY) ?? '0', 10) || 0;
      const next = prev + 1;
      storage.set(LAUNCH_KEY, String(next));
      setInfo(`${t('storage.launchCount')}: ${next} · ${persistent ? t('storage.nativeBackend') : t('storage.memoryFallback')}`);
    } catch (e) {
      setInfo(`${t('common.error')}: ${describe(e)}`);
    }
  }, [t]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>{t('storage.title')}</Text>
      <Text style={shared.mono}>{info}</Text>
      <Text style={shared.mono}>{t('storage.hint')}</Text>
      <Button label={t('storage.refresh')} onPress={refresh} disabled={busy} />
    </View>
  );
}
