import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { currentPlatform } from '@itc/base';
import { CapsTab } from './demo/CapsTab';
import { AuthTab } from './demo/AuthTab';
import { KeyTab } from './demo/KeyTab';
import { StorageTab } from './demo/StorageTab';
import { DbTab } from './demo/DbTab';
import { HotfixTab } from './demo/HotfixTab';
import { describe, shared } from './demo/shared';
import type { RunFn } from './demo/shared';

type TabKey = 'caps' | 'auth' | 'key' | 'storage' | 'db' | 'hotfix';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'caps',    label: '能力'   },
  { key: 'auth',    label: '认证'   },
  { key: 'key',     label: '免密'   },
  { key: 'storage', label: '存储'   },
  { key: 'db',      label: 'DB'     },
  { key: 'hotfix',  label: '热更新' },
];

export function DemoScreen(): React.JSX.Element {
  const [tab, setTab] = useState<TabKey>('caps');
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const append = useCallback((line: string) => {
    setLog((prev) => [line, ...prev].slice(0, 12));
  }, []);

  const run: RunFn = useCallback(
    async (label, fn) => {
      setBusy(true);
      try {
        await fn();
      } catch (e) {
        append(`${label} 失败: ${describe(e)}`);
      } finally {
        setBusy(false);
      }
    },
    [append],
  );

  const tabProps = { run, append, busy };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>OA Demo v2 @172.16.80.101</Text>
      <Text style={styles.platform}>当前平台：{currentPlatform}</Text>

      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tab, tab === t.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'caps'    && <CapsTab    {...tabProps} />}
      {tab === 'auth'    && <AuthTab    {...tabProps} />}
      {tab === 'key'     && <KeyTab     {...tabProps} />}
      {tab === 'storage' && <StorageTab busy={busy}  />}
      {tab === 'db'      && <DbTab      {...tabProps} />}
      {tab === 'hotfix'  && <HotfixTab  {...tabProps} />}

      {busy && <ActivityIndicator style={styles.spinner} />}

      <View style={shared.card}>
        <Text style={shared.cardTitle}>日志</Text>
        {log.length === 0 ? (
          <Text style={shared.mono}>—</Text>
        ) : (
          log.map((l, i) => (
            <Text key={`${i}-${l}`} style={shared.mono}>{l}</Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { padding: 20, gap: 12 },
  h1:            { fontSize: 22, fontWeight: '700', color: '#1f2329' },
  platform:      { fontSize: 13, color: '#646a73' },
  tabBar:        { flexDirection: 'row', backgroundColor: '#eef1f5', borderRadius: 10, padding: 4, flexWrap: 'wrap' },
  tab:           { paddingVertical: 8, paddingHorizontal: 10, alignItems: 'center', borderRadius: 8 },
  tabActive:     { backgroundColor: '#fff' },
  tabText:       { fontSize: 13, color: '#646a73' },
  tabTextActive: { color: '#1456f0', fontWeight: '700' },
  spinner:       { marginVertical: 4 },
});
