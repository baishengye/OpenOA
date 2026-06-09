import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { runDbSmoke } from '../../db/smoke';
import { Button, TabProps, shared } from './shared';

interface Props extends TabProps {}

export function DbTab({ run, append, busy }: Props) {
  const [lines, setLines] = useState<string[]>([]);

  const onSmoke = useCallback(
    () =>
      run('DB 冒烟', async () => {
        const r = await runDbSmoke();
        setLines(r.lines);
        append(r.ok ? '✅ op-sqlite 冒烟通过' : '❌ op-sqlite 冒烟失败');
      }),
    [run, append],
  );

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>op-sqlite 冒烟测试</Text>
      <Button label="运行（open / 建表 / 读写 / close）" onPress={onSmoke} disabled={busy} />
      {lines.length === 0 ? (
        <Text style={shared.mono}>点上面按钮运行。未接入原生的平台会报"未接入"。</Text>
      ) : (
        lines.map((l, i) => (
          <Text key={`${i}-${l}`} style={shared.mono}>{l}</Text>
        ))
      )}
    </View>
  );
}
