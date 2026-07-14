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
import { UikitTab } from './demo/UikitTab';
import { PushTab } from './demo/PushTab';
import { ImTab } from './demo/ImTab';
import { describe, shared } from './demo/shared';
import type { RunFn } from './demo/shared';

type TabKey = 'caps' | 'auth' | 'key' | 'storage' | 'db' | 'hotfix' | 'uikit' | 'push' | 'im';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'caps',    label: '能力'   },
  { key: 'auth',    label: '认证'   },
  { key: 'key',     label: '免密'   },
  { key: 'storage', label: '存储'   },
  { key: 'db',      label: 'DB'     },
  { key: 'hotfix',  label: '热更新' },
  { key: 'uikit',   label: 'UI'     },
  { key: 'push',    label: '推送'   },
  { key: 'im',      label: 'IM'     },
];

export function DemoScreen(): React.JSX.Element {
  const [tab, setTab] = useState<TabKey>('uikit');
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

  const tabBar = (
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
  );

  return (
    <View style={styles.root}>
      {/* 固定头部（标题 + tab 栏），不随内容滚动 */}
      <View style={styles.header}>
        <Text style={styles.h1}>OA Demo v2 @172.16.80.101</Text>
        <Text style={styles.platform}>当前平台：{currentPlatform}</Text>
        {tabBar}
      </View>

      {/* uikit tab 自身是 List 根、全屏滚动（不能再嵌 ScrollView）；其它 tab 用 ScrollView */}
      {tab === 'uikit' ? (
        <View style={styles.uikitArea}>
          <UikitTab />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {tab === 'caps'    && <CapsTab    {...tabProps} />}
          {tab === 'auth'    && <AuthTab    {...tabProps} />}
          {tab === 'key'     && <KeyTab     {...tabProps} />}
          {tab === 'storage' && <StorageTab busy={busy}  />}
          {tab === 'db'      && <DbTab      {...tabProps} />}
          {tab === 'hotfix'  && <HotfixTab  {...tabProps} />}
          {tab === 'push'    && <PushTab    {...tabProps} />}
          {tab === 'im'     && <ImTab     {...tabProps} />}

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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, gap: 12 },
  uikitArea:     { flex: 1 },
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
