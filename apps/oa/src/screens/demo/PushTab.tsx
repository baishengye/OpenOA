import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { eventBus } from '@itc/base';
import { push } from '@itc/push';
import type { PushRegistration, PushMessage } from '@itc/push';
import { Text, Button, Card, YStack, XStack, Spinner } from '@itc/uikit';
import { describe } from './shared';
import type { TabProps } from './shared';

/** 推送演示 Tab */
export function PushTab({ run, append, busy }: TabProps) {
  const [ready, setReady] = useState(false);
  const [reg, setReg] = useState<PushRegistration | null>(null);
  const [lastMsg, setLastMsg] = useState<PushMessage | null>(null);
  const [lastOpen, setLastOpen] = useState<PushMessage | null>(null);

  // 初始化推送（仅一次）
  const initRef = useRef(false);

  const doInit = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      await push.init({
        appKey: 'your-jpush-appkey', // 替换为极光控制台的 AppKey
        production: false,
      });
      setReady(true);
      append('✅ 极光推送初始化成功');
    } catch (e) {
      append(`❌ 初始化失败: ${describe(e)}`);
    }
  }, [append]);

  // 监听推送事件
  useEffect(() => {
    const offToken = eventBus.on('push:token', (r) => {
      setReg(r);
      append(`📱 设备注册: ${r.channel} / ${r.token.substring(0, 20)}…`);
    });

    const offMsg = eventBus.on('push:message', (msg) => {
      setLastMsg(msg);
      append(`📩 收到推送: ${msg.title ?? '(无标题)'}`);
    });

    const offOpen = eventBus.on('push:opened', (msg) => {
      setLastOpen(msg);
      append(`👆 点击通知: ${msg.title ?? '(无标题)'}`);
    });

    return () => { offToken(); offMsg(); offOpen(); };
  }, [append]);

  return (
    <YStack gap={16} padding={16}>
      {/* 初始化 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">① 初始化推送</Text>
          {!ready ? (
            <Button onPress={() => run('初始化推送', doInit)} disabled={busy}>
              初始化极光 SDK
            </Button>
          ) : (
            <Text color="$green9">✅ 已初始化</Text>
          )}
        </YStack>
      </Card>

      {/* 设备信息 */}
      <Card padding={16}>
        <YStack gap={8}>
          <Text variant="h3">② 设备注册</Text>
          {reg ? (
            <YStack gap={4}>
              <Text>通道：{reg.channel}</Text>
              <Text variant="caption" numberOfLines={2}>Token：{reg.token}</Text>
            </YStack>
          ) : (
            <XStack align="center" gap={8}>
              <Spinner size="small" />
              <Text>等待注册…</Text>
            </XStack>
          )}
        </YStack>
      </Card>

      {/* 别名/标签 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">③ 别名 & 标签</Text>
          <XStack gap={8}>
            <Button
              onPress={() => run('setAlias', () => push.setAlias('test_user'))}
              disabled={busy || !ready}
            >
              设别名 test_user
            </Button>
            <Button
              onPress={() => run('deleteAlias', () => push.deleteAlias())}
              disabled={busy || !ready}
            >
              删别名
            </Button>
            <Button
              onPress={() => run('setTags', () => push.setTags(['vip', 'active']))}
              disabled={busy || !ready}
            >
              设标签
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* 角标 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">④ 角标控制</Text>
          <XStack gap={8}>
            <Button onPress={() => run('setBadge 0', () => push.setBadge(0))} disabled={busy || !ready}>
              清零
            </Button>
            <Button onPress={() => run('setBadge 5', () => push.setBadge(5))} disabled={busy || !ready}>
              设 5
            </Button>
            <Button onPress={() => run('setBadge 99', () => push.setBadge(99))} disabled={busy || !ready}>
              设 99
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* 停止/恢复 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">⑤ 停止 / 恢复</Text>
          <XStack gap={8}>
            <Button
              onPress={() => run('stopPush', () => push.stopPush())}
              disabled={busy || !ready}
            >
              停止推送
            </Button>
            <Button
              onPress={() => run('resumePush', () => push.resumePush())}
              disabled={busy || !ready}
            >
              恢复推送
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* 最近消息 */}
      <Card padding={16}>
        <YStack gap={8}>
          <Text variant="h3">⑥ 最近推送消息</Text>
          <Text variant="caption">
            通过极光控制台 → 推送 → 发送通知 来测试
          </Text>
          {lastMsg ? (
            <MsgCard label="📩 到达" msg={lastMsg} />
          ) : (
            <Text>等待推送…</Text>
          )}
          {lastOpen ? (
            <MsgCard label="👆 点击" msg={lastOpen} />
          ) : null}
        </YStack>
      </Card>
    </YStack>
  );
}

/** 消息卡片（展示推送内容） */
function MsgCard({ label, msg }: { label: string; msg: PushMessage }) {
  return (
    <View style={styles.msgCard}>
      <Text variant="caption" color="$green9">{label}</Text>
      <Text variant="h3" color="$green11">{msg.title}</Text>
      <Text color="$green10">{msg.body}</Text>
      {msg.data && Object.keys(msg.data).length > 0 ? (
        <Text variant="caption" color="$green8">
          extras: {JSON.stringify(msg.data)}
        </Text>
      ) : null}
      <Text variant="caption" color="$green7">ID: {msg.messageId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  msgCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
});
