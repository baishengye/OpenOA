import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { currentPlatform } from '@itc/base';
import { biometric } from '@itc/biometric';
import { asciiToBase64 } from '../../utils/base64';
import { Button, TabProps, shared, yn } from './shared';

const KEY_ALIAS = 'oa-login';

interface Props extends TabProps {}

export function KeyTab({ run, append, busy }: Props) {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    biometric.keyExists(KEY_ALIAS).then(setRegistered).catch(() => {});
  }, []);

  const onRegister = useCallback(
    () =>
      run('注册免密', async () => {
        const { publicKey } = await biometric.createKey(KEY_ALIAS);
        append(`✅ 已生成密钥，公钥(前24): ${publicKey.slice(0, 24)}…`);
        setRegistered(true);
      }),
    [run, append],
  );

  const onLogin = useCallback(
    () =>
      run('免密登录', async () => {
        const challenge = asciiToBase64(`login:${currentPlatform}:demo-nonce`);
        const { signatureBase64 } = await biometric.signWithKey(KEY_ALIAS, challenge, '免密登录');
        append(`✅ 验签完成，签名(前24): ${signatureBase64.slice(0, 24)}…`);
      }),
    [run, append],
  );

  const onDeleteKey = useCallback(
    () =>
      run('删除密钥', async () => {
        await biometric.deleteKey(KEY_ALIAS);
        setRegistered(false);
        append('✅ 已删除密钥');
      }),
    [run, append],
  );

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>免密登录（强生物 → 密钥签名）</Text>
      <Text style={shared.mono}>已注册: {yn(registered)}</Text>
      <Button label="① 注册（生成密钥）" onPress={onRegister} disabled={busy} />
      <Button label="② 免密登录（验签）" onPress={onLogin} disabled={busy || !registered} />
      <Button label="删除密钥" onPress={onDeleteKey} disabled={busy || !registered} />
      <Text style={shared.hint}>
        密钥固定 EC P-256（与生物模态无关）；签名前需强生物认证作门。
      </Text>
    </View>
  );
}
