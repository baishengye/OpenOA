import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { storage } from '@itc/base';
import { installStorage } from '@itc/storage';
import { Button, describe, shared } from './shared';

const LAUNCH_KEY = 'oa.launchCount';

interface Props {
  busy: boolean;
}

export function StorageTab({ busy }: Props) {
  const [info, setInfo] = useState('—');

  const refresh = useCallback(() => {
    try {
      const persistent = installStorage();
      const prev = parseInt(storage.getString(LAUNCH_KEY) ?? '0', 10) || 0;
      const next = prev + 1;
      storage.set(LAUNCH_KEY, String(next));
      setInfo(`启动次数: ${next} · 后端: ${persistent ? '原生持久化' : '内存兜底(原生未构建)'}`);
    } catch (e) {
      setInfo(`storage 异常: ${describe(e)}`);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>持久化（@itc/storage）</Text>
      <Text style={shared.mono}>{info}</Text>
      <Text style={shared.mono}>杀进程重开数字应递增（原生持久化时）。</Text>
      <Button label="刷新" onPress={refresh} disabled={busy} />
    </View>
  );
}
