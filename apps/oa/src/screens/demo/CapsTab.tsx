import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { biometric, type BiometryKind, type CapabilitiesResult } from '@itc/biometric';
import { Button, TabProps, maskBits, shared, yn } from './shared';

const KIND_LABEL: Record<BiometryKind, string> = { fingerprint: '指纹', face: '人脸', iris: '虹膜' };

interface Props extends TabProps {}

export function CapsTab({ run, append, busy }: Props) {
  const [caps, setCaps] = useState<CapabilitiesResult | null>(null);

  const refresh = useCallback(
    () =>
      run('能力枚举', async () => {
        const c = await biometric.getCapabilities();
        setCaps(c);
        append(`✅ 能力 mask=${maskBits(c.mask)}（${c.capabilities.length} 个模态）`);
      }),
    [run, append],
  );

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>能力枚举</Text>
      {caps ? (
        <>
          <Text style={shared.mono}>mask = {maskBits(caps.mask)}（指纹|人脸|虹膜）</Text>
          {caps.capabilities.map((c) => (
            <Text key={c.kind} style={shared.mono}>
              {KIND_LABEL[c.kind]}: 硬件{yn(c.hardware)} 录入{yn(c.enrolled)} 可用{yn(c.available)}{' '}
              强度={c.strength} 定向{yn(c.directable)}{c.reason ? ` (${c.reason})` : ''}
            </Text>
          ))}
        </>
      ) : (
        <Text style={shared.mono}>探测中…</Text>
      )}
      <Button label="刷新能力" onPress={refresh} disabled={busy} />
    </View>
  );
}
