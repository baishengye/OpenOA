import React from 'react';
import { Text, View } from 'react-native';
import { biometric, type BiometryKind } from '@itc/biometric';
import { Button, TabProps, fmtAuth, shared } from './shared';

const KINDS: BiometryKind[] = ['fingerprint', 'face', 'iris'];
const KIND_LABEL: Record<BiometryKind, string> = { fingerprint: '指纹', face: '人脸', iris: '虹膜' };

interface Props extends TabProps {}

export function AuthTab({ run, append, busy }: Props) {
  const onAuth = (strength: 'strong' | 'weak') =>
    run(`${strength} 认证`, async () => {
      const r = await biometric.authenticate({ title: '身份验证', strength });
      append(fmtAuth(`${strength} 认证`, r));
    });

  const onAuthWith = (kind: BiometryKind) =>
    run(`定向${KIND_LABEL[kind]}`, async () => {
      const r = await biometric.authenticateWith(kind, { title: `${KIND_LABEL[kind]}认证` });
      append(fmtAuth(`定向${KIND_LABEL[kind]}`, r));
    });

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>认证（按强度）</Text>
      <Button label="强认证（strong）" onPress={() => onAuth('strong')} disabled={busy} />
      <Button label="弱认证（weak）" onPress={() => onAuth('weak')} disabled={busy} />

      <Text style={shared.cardTitle}>定向认证（仅鸿蒙真支持）</Text>
      {KINDS.map((k) => (
        <Button key={k} label={`定向：${KIND_LABEL[k]}`} onPress={() => onAuthWith(k)} disabled={busy} />
      ))}
      <Text style={shared.hint}>
        iOS/Android 系统无法定向到指定模态，定向按钮会返回 not_directable；请用「强/弱认证」。
      </Text>
    </View>
  );
}
