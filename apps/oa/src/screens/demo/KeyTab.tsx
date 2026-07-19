import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { currentPlatform } from '@itc/base';
import { biometric } from '@itc/biometric';
import { asciiToBase64 } from '../../utils/base64';
import { useTranslation } from '@itc/i18n';
import { Button, TabProps, shared, yn } from './shared';

const KEY_ALIAS = 'oa-login';

interface Props extends TabProps {}

export function KeyTab({ run, append, busy }: Props) {
  const { t } = useTranslation();
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    biometric.keyExists(KEY_ALIAS).then(setRegistered).catch(() => {});
  }, []);

  const onRegister = useCallback(
    () =>
      run(t('key.registerDesc'), async () => {
        const { publicKey } = await biometric.createKey(KEY_ALIAS);
        append(`${t('common.success')} ${t('key.register')}, ${t('key.registered')}(${t('key.register')}${publicKey.slice(0, 24)}…)`);
        setRegistered(true);
      }),
    [run, append, t],
  );

  const onLogin = useCallback(
    () =>
      run(t('key.loginDesc'), async () => {
        const challenge = asciiToBase64(`login:${currentPlatform}:demo-nonce`);
        const { signatureBase64 } = await biometric.signWithKey(KEY_ALIAS, challenge, t('key.loginDesc'));
        append(`${t('common.success')} ${t('key.loginDesc')}, ${signatureBase64.slice(0, 24)}…`);
      }),
    [run, append, t],
  );

  const onDeleteKey = useCallback(
    () =>
      run(t('key.deleteDesc'), async () => {
        await biometric.deleteKey(KEY_ALIAS);
        setRegistered(false);
        append(`${t('common.success')} ${t('key.deleteDesc')}`);
      }),
    [run, append, t],
  );

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>{t('key.title')}</Text>
      <Text style={shared.mono}>{t('key.registered')}: {yn(registered)}</Text>
      <Button label={t('key.register')} onPress={onRegister} disabled={busy} />
      <Button label={t('key.login')} onPress={onLogin} disabled={busy || !registered} />
      <Button label={t('key.delete')} onPress={onDeleteKey} disabled={busy || !registered} />
      <Text style={shared.hint}>{t('key.hint')}</Text>
    </View>
  );
}
