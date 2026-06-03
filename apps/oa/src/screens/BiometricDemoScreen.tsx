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
import { biometric, type BiometryAvailability } from '@itc/biometric';
import { installStorage } from '@itc/storage';
import { asciiToBase64 } from '../utils/base64';

const KEY_ALIAS = 'oa-login';
const LAUNCH_KEY = 'oa.launchCount';

/**
 * 生物识别端到端演示页：能力探测 → 认证 → 免密登录（注册公钥 + 验签）。
 * 用于验证 @itc/biometric 在 Android / iOS / 鸿蒙三端跑通。
 */
export function BiometricDemoScreen(): React.JSX.Element {
  const [availability, setAvailability] = useState<BiometryAvailability | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [registered, setRegistered] = useState(false);
  const [storageInfo, setStorageInfo] = useState('探测中…');

  const append = useCallback((line: string) => {
    setLog((prev) => [`${line}`, ...prev].slice(0, 12));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const a = await biometric.getAvailability();
      setAvailability(a);
      setRegistered(await biometric.keyExists(KEY_ALIAS));
    } catch (e) {
      append(`探测失败: ${describe(e)}`);
    }
    // @itc/storage 持久化演示：注入后做启动计数（跨次启动验证持久化）
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
  }, [append]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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

  const onAuthenticate = () =>
    run('认证', async () => {
      await biometric.authenticate({
        title: '身份验证',
        subtitle: '请验证你的生物特征',
        reason: '解锁 OpenDingDing',
        // 仅强生物识别：与②③免密签名保持一致（安卓上即指纹），避免选了弱人脸后签名失败
        allowWeakBiometric: false,
      });
      append('✅ 认证通过');
    });

  const onAuthFace = () =>
    run('人脸/弱认证', async () => {
      await biometric.authenticate({
        title: '人脸/弱认证',
        subtitle: '允许摄像头人脸（弱生物识别）',
        reason: '解锁 OpenDingDing',
        // 允许弱生物识别：三星会弹「指纹/面容」让你选面容；
        // 若机型不弹（如小米优先指纹），可临时删掉系统里的指纹只留人脸再试。
        allowWeakBiometric: true,
      });
      append('✅ 弱认证通过（可含摄像头人脸）');
    });

  const onRegister = () =>
    run('注册免密登录', async () => {
      const { publicKey } = await biometric.createKey(KEY_ALIAS);
      // 真实场景：把 publicKey 提交后端绑定当前账号
      append(`✅ 已生成密钥，公钥(前24): ${publicKey.slice(0, 24)}…`);
      setRegistered(true);
    });

  const onLogin = () =>
    run('指纹登录', async () => {
      // 真实场景：challenge 由后端下发，这里本地造一个演示
      const challenge = asciiToBase64(`login:${currentPlatform}:demo-nonce`);
      const { signatureBase64 } = await biometric.signWithKey(
        KEY_ALIAS,
        challenge,
        '指纹登录'
      );
      // 真实场景：把 signature 提交后端用注册公钥验签
      append(`✅ 验签完成，签名(前24): ${signatureBase64.slice(0, 24)}…`);
    });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>生物识别 · 三端演示</Text>
      <Text style={styles.platform}>当前平台：{currentPlatform}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>能力</Text>
        {availability ? (
          <Text style={styles.mono}>
            可用: {String(availability.available)} · 类型: {availability.biometryType}
            {availability.reason ? ` · 原因: ${availability.reason}` : ''}
          </Text>
        ) : (
          <Text style={styles.mono}>探测中…</Text>
        )}
        <Text style={styles.mono}>已注册免密: {String(registered)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>持久化（@itc/storage）</Text>
        <Text style={styles.mono}>{storageInfo}</Text>
        <Text style={styles.mono}>每次启动 +1；杀掉重开数字应递增（原生持久化时）</Text>
      </View>

      <Text style={styles.section}>免密登录（强生物识别 / 指纹）</Text>
      <Button label="① 生物识别认证" onPress={onAuthenticate} disabled={busy} />
      <Button label="② 注册免密登录（生成密钥）" onPress={onRegister} disabled={busy} />
      <Button
        label="③ 指纹登录（验签）"
        onPress={onLogin}
        disabled={busy || !registered}
      />

      <Text style={styles.section}>人脸验证（弱生物识别 · 仅基础认证）</Text>
      <Button label="④ 人脸 / 弱认证" onPress={onAuthFace} disabled={busy} />

      <Text style={styles.hint}>
        注：①②③ 用强生物识别（安卓即指纹，iOS 为 Face ID），是完整免密链路。④ 演示弱生物识别（安卓摄像头人脸）——三星会弹「指纹/面容」选面容即可；摄像头人脸属弱、不能用于免密签名，故不参与 ②③。
      </Text>

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

function describe(e: unknown): string {
  if (e instanceof ItcError) return `[${e.code}] ${e.message}`;
  return String(e);
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  h1: { fontSize: 22, fontWeight: '700', color: '#1f2329' },
  platform: { fontSize: 13, color: '#646a73' },
  hint: { fontSize: 11, color: '#8a9099', lineHeight: 16 },
  section: { fontSize: 13, fontWeight: '600', color: '#1f2329', marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1f2329' },
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
