import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { hotfix, type LocalVersion, type SyncStatus } from '@itc/hotfix';
import { useTranslation } from '@itc/i18n';
import { Button, TabProps, shared } from './shared';

interface Props extends TabProps {}

export function HotfixTab({ run, append, busy }: Props) {
  const { t } = useTranslation();
  const [version, setVersion] = useState<LocalVersion | null>(null);
  const [status, setStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    hotfix.getCurrentVersion().then(setVersion).catch(() => {});
  }, []);

  const onCheck = useCallback(
    () =>
      run(t('hotfix.checkUpdate'), async () => {
        const update = await hotfix.checkForUpdate();
        if (!update) {
          append(`${t('common.success')} ${t('hotfix.noUpdate')}`);
        } else {
          append(
            `${t('hotfix.foundUpdate').replace('{{label}}', update.label).replace('{{size}}', (update.packageSize / 1024).toFixed(1)).replace('{{mandatory}}', update.isMandatory ? t('hotfix.mandatory') : '')}`,
          );
        }
      }),
    [run, append, t],
  );

  const onSync = useCallback(
    () =>
      run(t('hotfix.syncUpdate'), async () => {
        const result = await hotfix.sync({ installMode: 'ON_NEXT_RESTART' });
        setStatus(result);
        if (result === 'UPDATE_INSTALLED') {
          append(`${t('common.success')} ${t('hotfix.updateInstalled')}`);
        } else {
          append(`sync ${t('common.result')}: ${result}`);
        }
      }),
    [run, append, t],
  );

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>{t('hotfix.bundleVersion')}</Text>
      <Text style={shared.mono}>
        {version?.label ? `${version.label}（App ${version.appVersion}）` : t('hotfix.noOta')}
      </Text>

      {status && <Text style={shared.mono}>{t(`hotfix.${status.toLowerCase().replace('_', '')}` as never) ?? status}</Text>}

      <Text style={shared.cardTitle}>{t('hotfix.operations')}</Text>
      <Button label={t('hotfix.checkUpdate')} onPress={onCheck} disabled={busy} />
      <Button label={t('hotfix.syncUpdate')} onPress={onSync} disabled={busy} />
      <Text style={shared.hint}>{t('hotfix.syncMode')}{t('hotfix.rn82Note')}</Text>
    </View>
  );
}
