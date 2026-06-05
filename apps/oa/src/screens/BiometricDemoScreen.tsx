import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ItcError, currentPlatform, storage } from '@itc/base';
import {
  biometric,
  BIOMETRY_BIT,
  type BiometryKind,
  type CapabilitiesResult,
  type AuthResult,
} from '@itc/biometric';
import { installStorage } from '@itc/storage';
import { asciiToBase64 } from '../utils/base64';
import { runDbSmoke } from '../db/smoke';

const KEY_ALIAS = 'oa-login';
const LAUNCH_KEY = 'oa.launchCount';
const KINDS: BiometryKind[] = ['fingerprint', 'face', 'iris'];
const KIND_LABEL: Record<BiometryKind, string> = {
  fingerprint: '指纹',
  face: '人脸',
  iris: '虹膜',
};
type TabKey = 'caps' | 'auth' | 'key' | 'storage' | 'db';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'caps', label: '能力' },
  { key: 'auth', label: '认证' },
  { key: 'key', label: '免密' },
  { key: 'storage', label: '存储' },
  { key: 'db', label: 'DB' },
];

/**
 * 生物识别端到端演示页（Tab 分页）：能力枚举 / 按强度+定向认证 / 免密登录 / 存储持久化。
 * 三端一致；定向认证在 iOS/Android 会返回 not_directable，直观体现平台差异。
 */
export function BiometricDemoScreen(): React.JSX.Element {
  const [tab, setTab] = useState<TabKey>('caps');
  const [caps, setCaps] = useState<CapabilitiesResult | null>(null);
  const [registered, setRegistered] = useState(false);
  const [storageInfo, setStorageInfo] = useState('—');
  const [dbLog, setDbLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const append = useCallback((line: string) => {
    setLog((prev) => [line, ...prev].slice(0, 12));
  }, []);

  const run = useCallback(
    async (label: string, fn: () => Promise<void>) => {
      setBusy(true);
      try {
        await fn();
      } catch (e) {
        append(`${label} 失败: ${describe(e)}`);
      } finally {
        setBusy(false);
      }
    },
    [append]
  );

  const refreshCaps = useCallback(
    () =>
      run('能力枚举', async () => {
        const c = await biometric.getCapabilities();
        setCaps(c);
        setRegistered(await biometric.keyExists(KEY_ALIAS));
        append(`✅ 能力 mask=${maskBits(c.mask)}（${c.capabilities.length} 个模态）`);
      }),
    [run, append]
  );

  const refreshStorage = useCallback(() => {
    try {
      const persistent = installStorage();
      const prev = parseInt(storage.getString(LAUNCH_KEY) ?? '0', 10) || 0;
      const next = prev + 1;
      storage.set(LAUNCH_KEY, String(next));
      const backend = persistent ? '原生持久化' : '内存兜底(原生未构建)';
      setStorageInfo(`启动次数: ${next} · 后端: ${backend}`);
    } catch (e) {
      setStorageInfo(`storage 异常: ${describe(e)}`);
    }
  }, []);

  useEffect(() => {
    void refreshCaps();
    refreshStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 认证 ----
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

  // ---- 免密 ----
  const onRegister = () =>
    run('注册免密', async () => {
      const { publicKey } = await biometric.createKey(KEY_ALIAS);
      append(`✅ 已生成密钥，公钥(前24): ${publicKey.slice(0, 24)}…`);
      setRegistered(true);
    });

  const onLogin = () =>
    run('免密登录', async () => {
      const challenge = asciiToBase64(`login:${currentPlatform}:demo-nonce`);
      const { signatureBase64 } = await biometric.signWithKey(KEY_ALIAS, challenge, '免密登录');
      append(`✅ 验签完成，签名(前24): ${signatureBase64.slice(0, 24)}…`);
    });

  const onDeleteKey = () =>
    run('删除密钥', async () => {
      await biometric.deleteKey(KEY_ALIAS);
      setRegistered(false);
      append('✅ 已删除密钥');
    });

  // ---- DB 冒烟 ----
  const onDbSmoke = () =>
    run('DB 冒烟', async () => {
      const r = await runDbSmoke();
      setDbLog(r.lines);
      append(r.ok ? '✅ op-sqlite 冒烟通过' : '❌ op-sqlite 冒烟失败');
    });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>OA Demo</Text>
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

      {tab === 'caps' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>能力枚举</Text>
          {caps ? (
            <>
              <Text style={styles.mono}>
                mask = {maskBits(caps.mask)}（指纹|人脸|虹膜）
              </Text>
              {caps.capabilities.map((c) => (
                <Text key={c.kind} style={styles.mono}>
                  {KIND_LABEL[c.kind]}: 硬件{yn(c.hardware)} 录入{yn(c.enrolled)}{' '}
                  可用{yn(c.available)} 强度={c.strength} 定向{yn(c.directable)}
                  {c.reason ? ` (${c.reason})` : ''}
                </Text>
              ))}
            </>
          ) : (
            <Text style={styles.mono}>探测中…</Text>
          )}
          <Button label="刷新能力" onPress={refreshCaps} disabled={busy} />
        </View>
      )}

      {tab === 'auth' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>认证（按强度）</Text>
          <Button label="强认证（strong）" onPress={() => onAuth('strong')} disabled={busy} />
          <Button label="弱认证（weak）" onPress={() => onAuth('weak')} disabled={busy} />
          <Text style={styles.cardTitle}>定向认证（仅鸿蒙真支持）</Text>
          {KINDS.map((k) => (
            <Button
              key={k}
              label={`定向：${KIND_LABEL[k]}`}
              onPress={() => onAuthWith(k)}
              disabled={busy}
            />
          ))}
          <Text style={styles.hint}>
            iOS/Android 系统无法定向到指定模态，定向按钮会返回 not_directable；请用「强/弱认证」。
          </Text>
        </View>
      )}

      {tab === 'key' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>免密登录（强生物 → 密钥签名）</Text>
          <Text style={styles.mono}>已注册: {yn(registered)}</Text>
          <Button label="① 注册（生成密钥）" onPress={onRegister} disabled={busy} />
          <Button
            label="② 免密登录（验签）"
            onPress={onLogin}
            disabled={busy || !registered}
          />
          <Button label="删除密钥" onPress={onDeleteKey} disabled={busy || !registered} />
          <Text style={styles.hint}>
            密钥固定 EC P-256（与生物模态无关）；签名前需强生物认证作门。
          </Text>
        </View>
      )}

      {tab === 'storage' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>持久化（@itc/storage）</Text>
          <Text style={styles.mono}>{storageInfo}</Text>
          <Text style={styles.mono}>杀进程重开数字应递增（原生持久化时）。</Text>
          <Button label="刷新" onPress={refreshStorage} disabled={busy} />
        </View>
      )}

      {tab === 'db' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>op-sqlite 冒烟测试</Text>
          <Button label="运行（open/建表/读写/close）" onPress={onDbSmoke} disabled={busy} />
          {dbLog.length === 0 ? (
            <Text style={styles.mono}>点上面按钮运行。未接入原生的平台会报"未接入"。</Text>
          ) : (
            dbLog.map((l, i) => (
              <Text key={`${i}-${l}`} style={styles.mono}>
                {l}
              </Text>
            ))
          )}
        </View>
      )}

      {busy && <ActivityIndicator style={styles.spinner} />}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>日志</Text>
        {log.length === 0 ? (
          <Text style={styles.mono}>—</Text>
        ) : (
          log.map((l, i) => (
            <Text key={`${i}-${l}`} style={styles.mono}>
              {l}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Button(props: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      style={({ pressed }) => [
        styles.button,
        props.disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.buttonText}>{props.label}</Text>
    </Pressable>
  );
}

function yn(b: boolean): string {
  return b ? '✓' : '✗';
}

/** mask → 3 位二进制（虹膜|人脸|指纹），便于肉眼读位。 */
function maskBits(mask: number): string {
  const bits = `${(mask & BIOMETRY_BIT.iris) ? 1 : 0}${(mask & BIOMETRY_BIT.face) ? 1 : 0}${(mask & BIOMETRY_BIT.fingerprint) ? 1 : 0}`;
  return `${mask}(0b${bits})`;
}

function fmtAuth(label: string, r: AuthResult): string {
  return r.ok
    ? `✅ ${label} 成功（usedKind=${r.usedKind}）`
    : `❌ ${label}: ${r.reason} [${r.code}] ${r.message}`;
}

function describe(e: unknown): string {
  if (e instanceof ItcError) return `[${e.code}] ${e.message}`;
  return String(e);
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  h1: { fontSize: 22, fontWeight: '700', color: '#1f2329' },
  platform: { fontSize: 13, color: '#646a73' },
  hint: { fontSize: 11, color: '#8a9099', lineHeight: 16 },
  tabBar: { flexDirection: 'row', backgroundColor: '#eef1f5', borderRadius: 10, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 14, color: '#646a73' },
  tabTextActive: { color: '#1456f0', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1f2329', marginTop: 2 },
  mono: { fontSize: 12, color: '#444', fontFamily: 'Menlo' },
  button: {
    backgroundColor: '#1456f0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { backgroundColor: '#b9c4d4' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  spinner: { marginVertical: 4 },
});
