import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { biometric, type BiometryKind, type CapabilitiesResult } from '@itc/biometric';
import { useTranslation } from '@itc/i18n';
import { Button, TabProps, maskBits, shared, yn } from './shared';

const KINDS: BiometryKind[] = ['fingerprint', 'face', 'iris'];

interface Props extends TabProps {}

export function CapsTab({ run, append, busy }: Props) {
  const { t } = useTranslation();
  const [caps, setCaps] = useState<CapabilitiesResult | null>(null);

  const KIND_LABEL: Record<BiometryKind, string> = {
    fingerprint: t('auth.fingerprint'),
    face: t('auth.face'),
    iris: t('auth.iris'),
  };

  const refresh = useCallback(
    () =>
      run(t('caps.title'), async () => {
        const c = await biometric.getCapabilities();
        setCaps(c);
        append(`✅ ${t('caps.capabilities')} mask=${maskBits(c.mask)}（${c.capabilities.length} ${t('caps.modalCount')}）`);
      }),
    [run, append, t],
  );

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>{t('caps.title')}</Text>
      {caps ? (
        <>
          <Text style={shared.mono}>mask = {maskBits(caps.mask)}（${KIND_LABEL.fingerprint}|${KIND_LABEL.face}|${KIND_LABEL.iris}）</Text>
          {caps.capabilities.map((c) => (
            <Text key={c.kind} style={shared.mono}>
              {KIND_LABEL[c.kind]}: {t('auth.hardware')}{yn(c.hardware)} {t('auth.enrolled')}{yn(c.enrolled)} {t('auth.available')}{yn(c.available)}{' '}
              {t('auth.strength')}{c.strength} {t('auth.directionable')}{yn(c.directable)}{c.reason ? ` (${c.reason})` : ''}
            </Text>
          ))}
        </>
      ) : (
        <Text style={shared.mono}>{t('common.detecting')}</Text>
      )}
      <Button label={t('caps.refreshCapabilities')} onPress={refresh} disabled={busy} />
    </View>
  );
}
