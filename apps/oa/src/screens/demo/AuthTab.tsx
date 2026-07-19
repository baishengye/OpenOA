import React from 'react';
import { Text, View } from 'react-native';
import { biometric, type BiometryKind } from '@itc/biometric';
import { useTranslation } from '@itc/i18n';
import { Button, TabProps, fmtAuth, shared } from './shared';

const KINDS: BiometryKind[] = ['fingerprint', 'face', 'iris'];

interface Props extends TabProps {}

export function AuthTab({ run, append, busy }: Props) {
  const { t } = useTranslation();

  const KIND_LABEL: Record<BiometryKind, string> = {
    fingerprint: t('auth.fingerprint'),
    face: t('auth.face'),
    iris: t('auth.iris'),
  };

  const onAuth = (strength: 'strong' | 'weak') =>
    run(`${strength} ${t('auth.authentication')}`, async () => {
      const r = await biometric.authenticate({ title: t('auth.authentication'), strength });
      append(fmtAuth(`${strength} ${t('auth.authentication')}`, r));
    });

  const onAuthWith = (kind: BiometryKind) =>
    run(`${t('auth.directionable')}${KIND_LABEL[kind]}`, async () => {
      const r = await biometric.authenticateWith(kind, { title: `${KIND_LABEL[kind]}${t('auth.authentication')}` });
      append(fmtAuth(`${t('auth.directionable')}${KIND_LABEL[kind]}`, r));
    });

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>{t('auth.title')}</Text>
      <Button label={t('auth.strongAuth')} onPress={() => onAuth('strong')} disabled={busy} />
      <Button label={t('auth.weakAuth')} onPress={() => onAuth('weak')} disabled={busy} />

      <Text style={shared.cardTitle}>{t('auth.titleByKind')}</Text>
      {KINDS.map((k) => (
        <Button key={k} label={`${t('auth.directionAuth')}：${KIND_LABEL[k]}`} onPress={() => onAuthWith(k)} disabled={busy} />
      ))}
      <Text style={shared.hint}>{t('auth.iosAndroidNote')}</Text>
    </View>
  );
}
