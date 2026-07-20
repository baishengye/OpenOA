import React, { useCallback, useState, useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View, StyleSheet } from 'react-native';
import { currentPlatform } from '@itc/base';
import { TabLayout, Tab } from '@itc/uikit';
import { useTranslation, useLanguage } from '@itc/i18n';
import { CapsTab } from './demo/CapsTab';
import { AuthTab } from './demo/AuthTab';
import { KeyTab } from './demo/KeyTab';
import { StorageTab } from './demo/StorageTab';
import { DbTab } from './demo/DbTab';
import { HotfixTab } from './demo/HotfixTab';
import { UikitTab } from './demo/UikitTab';
import { PushTab } from './demo/PushTab';
import { ImTab } from './demo/ImTab';
import { FlashListTab } from './demo/FlashListTab';
import { PermissionTab } from './demo/PermissionTab';
import { FsTab } from './demo/FsTab';
import { DocumentPickerTab } from './demo/DocumentPickerTab';
import { I18nTab } from './demo/I18nTab';
import { describe, shared } from './demo/shared';
import type { RunFn } from './demo/shared';

type TabKey = 'caps' | 'auth' | 'key' | 'storage' | 'db' | 'hotfix' | 'uikit' | 'push' | 'im' | 'flashlist' | 'permission' | 'fs' | 'docpicker' | 'i18n';
const TAB_KEYS: TabKey[] = ['caps', 'auth', 'key', 'storage', 'db', 'hotfix', 'uikit', 'push', 'im', 'flashlist', 'permission', 'fs', 'docpicker', 'i18n'];

export function DemoScreen(): React.JSX.Element {
  const { t } = useTranslation();
  // 订阅语言变化，触发 TAB_LABELS 重新计算
  const { language, direction, isChanging, changeLanguage, availableLanguages } = useLanguage();
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
        append(`${label} ${t('common.error')}: ${describe(e)}`);
      } finally {
        setBusy(false);
      }
    },
    [append, t],
  );

  const tabProps = { run, append, busy };
  const currentIndex = TAB_KEYS.indexOf(tab);

  // 使用 useMemo 确保 TAB_LABELS 响应语言变化
  const TAB_LABELS = useMemo<Record<TabKey, string>>(() => ({
    caps:      t('demo.caps'),
    auth:      t('demo.auth'),
    key:       t('demo.key'),
    storage:   t('demo.storage'),
    db:        t('demo.db'),
    hotfix:    t('demo.hotfix'),
    uikit:     t('demo.uikit'),
    push:      t('demo.push'),
    im:        t('demo.im'),
    flashlist: t('demo.flashlist'),
    permission:t('demo.permission'),
    fs:        t('demo.fs'),
    docpicker: t('demo.docpicker'),
    i18n:      t('demo.i18n'),
  }), [language]);

  const renderTabContent = ({ index }: { index: number }) => {
    const key = TAB_KEYS[index];

    // UikitTab 自身是 List 根，全屏滚动
    if (key === 'uikit') {
      return <UikitTab />;
    }

    // FlashListTab 自身是 List 根，全屏滚动
    if (key === 'flashlist') {
      return <FlashListTab {...tabProps} />;
    }

    // 其他 tab 用 ScrollView 包装
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {key === 'caps'       && <CapsTab       {...tabProps} />}
        {key === 'auth'       && <AuthTab       {...tabProps} />}
        {key === 'key'        && <KeyTab        {...tabProps} />}
        {key === 'storage'    && <StorageTab    busy={busy} />}
        {key === 'db'         && <DbTab         {...tabProps} />}
        {key === 'hotfix'     && <HotfixTab     {...tabProps} />}
        {key === 'push'       && <PushTab       {...tabProps} />}
        {key === 'im'         && <ImTab         {...tabProps} />}
        {key === 'permission' && <PermissionTab busy={busy} append={append} />}
        {key === 'fs'         && <FsTab        busy={busy} append={append} />}
        {key === 'docpicker'  && <DocumentPickerTab busy={busy} append={append} />}
        {key === 'i18n'       && <I18nTab      busy={busy} />}

        {busy && <ActivityIndicator style={styles.spinner} />}

        <View style={shared.card}>
          <Text style={shared.cardTitle}>{t('log.title')}</Text>
          {log.length === 0 ? (
            <Text style={shared.mono} selectable>—</Text>
          ) : (
            <Text style={shared.mono} selectable>
              {log.join('\n')}
            </Text>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.root}>
      {/* 固定头部（标题 + 平台信息） */}
      <View style={styles.header}>
        <Text style={styles.h1}>OA Demo v2 @172.16.80.101</Text>
        <Text style={styles.platform}>当前平台：{currentPlatform}</Text>
      </View>

      {/* TabLayout 标签列表 */}
      <TabLayout
        value={currentIndex}
        onChange={(index) => setTab(TAB_KEYS[index] ?? 'uikit')}
        mode="wrap"
        tabSize={44}
        tabPosition="start"
        renderTabList={({ isActive, label }) => (
          <View
            style={[
              styles.tabItem,
              isActive && styles.tabItemActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.tabTextActive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        )}
        renderTabContent={({ index }) => renderTabContent({ index })}
      >
        {TAB_KEYS.map((key) => (
          <Tab key={key} label={TAB_LABELS[key]} />
        ))}
      </TabLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  h1:            { fontSize: 22, fontWeight: '700', color: '#1f2329' },
  platform:      { fontSize: 13, color: '#646a73', marginBottom: 8 },
  container:     { padding: 20, gap: 12 },
  tabItem:       { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  tabItemActive: { backgroundColor: '#e8f0fe' },
  tabText:       { fontSize: 13, color: '#646a73' },
  tabTextActive: { color: '#1456f0', fontWeight: '600' },
  spinner:       { marginVertical: 4 },
});
