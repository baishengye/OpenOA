import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { runDbSmoke } from '../../db/smoke';
import { useTranslation } from '@itc/i18n';
import { Button, TabProps, shared } from './shared';

interface Props extends TabProps {}

export function DbTab({ run, append, busy }: Props) {
  const { t } = useTranslation();
  const [lines, setLines] = useState<string[]>([]);

  const onSmoke = useCallback(
    () =>
      run('DB Smoke', async () => {
        const r = await runDbSmoke();
        setLines(r.lines);
        append(r.ok ? `✅ op-sqlite ${t('common.success')}` : `❌ op-sqlite ${t('common.error')}`);
      }),
    [run, append, t],
  );

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>{t('db.title')}</Text>
      <Button label={t('db.run')} onPress={onSmoke} disabled={busy} />
      {lines.length === 0 ? (
        <Text style={shared.mono}>{t('db.note')}</Text>
      ) : (
        lines.map((l, i) => (
          <Text key={`${i}-${l}`} style={shared.mono}>{l}</Text>
        ))
      )}
    </View>
  );
}
