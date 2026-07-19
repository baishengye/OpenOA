import { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { eventBus } from '@itc/base';
import { push } from '@itc/push';
import type { PushRegistration, PushMessage } from '@itc/push';
import { Text, Button, Card, YStack, XStack, Spinner } from '@itc/uikit';
import { describe } from './shared';
import type { TabProps } from './shared';
import { useTranslation } from '@itc/i18n';

/** 推送演示 Tab */
export function PushTab({ run, append, busy }: TabProps) {
  const { t } = useTranslation();
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
      append(`${t('common.success')} ${t('push.initSuccess')}`);
    } catch (e) {
      append(`${t('common.error')} ${t('push.initFailed')}: ${describe(e)}`);
    }
  }, [append, t]);

  // 监听推送事件
  useEffect(() => {
    const offToken = eventBus.on('push:token', (r) => {
      setReg(r);
      append(`${t('push.deviceRegSuccess')}: ${r.channel} / ${r.token.substring(0, 20)}…`);
    });

    const offMsg = eventBus.on('push:message', (msg) => {
      setLastMsg(msg);
      append(`${t('push.arrived')}: ${msg.title ?? '(no title)'}`);
    });

    const offOpen = eventBus.on('push:opened', (msg) => {
      setLastOpen(msg);
      append(`${t('push.clicked')}: ${msg.title ?? '(no title)'}`);
    });

    return () => { offToken(); offMsg(); offOpen(); };
  }, [append, t]);

  return (
    <YStack gap={16} padding={16}>
      {/* 初始化 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">{t('push.initPush')}</Text>
          {!ready ? (
            <Button onPress={() => run(t('push.initPush'), doInit)} disabled={busy}>
              {t('push.initJiguang')}
            </Button>
          ) : (
            <Text color="$green9">✅ {t('push.initialized')}</Text>
          )}
        </YStack>
      </Card>

      {/* 设备信息 */}
      <Card padding={16}>
        <YStack gap={8}>
          <Text variant="h3">{t('push.deviceReg')}</Text>
          {reg ? (
            <YStack gap={4}>
              <Text>{t('push.channel')}：{reg.channel}</Text>
              <Text variant="caption" numberOfLines={2}>{t('push.token')}：{reg.token}</Text>
            </YStack>
          ) : (
            <XStack align="center" gap={8}>
              <Spinner size="small" />
              <Text>{t('push.waitingReg')}</Text>
            </XStack>
          )}
        </YStack>
      </Card>

      {/* 别名/标签 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">{t('push.aliasTag')}</Text>
          <XStack gap={8}>
            <Button
              onPress={() => run('setAlias', () => push.setAlias('test_user'))}
              disabled={busy || !ready}
            >
              {t('push.setAlias')}
            </Button>
            <Button
              onPress={() => run('deleteAlias', () => push.deleteAlias())}
              disabled={busy || !ready}
            >
              {t('push.delAlias')}
            </Button>
            <Button
              onPress={() => run('setTags', () => push.setTags(['vip', 'active']))}
              disabled={busy || !ready}
            >
              {t('push.setTag')}
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* 角标 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">{t('push.badge')}</Text>
          <XStack gap={8}>
            <Button onPress={() => run('setBadge 0', () => push.setBadge(0))} disabled={busy || !ready}>
              {t('push.clear')}
            </Button>
            <Button onPress={() => run('setBadge 5', () => push.setBadge(5))} disabled={busy || !ready}>
              {t('push.setBadge').replace('{{count}}', '5')}
            </Button>
            <Button onPress={() => run('setBadge 99', () => push.setBadge(99))} disabled={busy || !ready}>
              {t('push.setBadge').replace('{{count}}', '99')}
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* 停止/恢复 */}
      <Card padding={16}>
        <YStack gap={12}>
          <Text variant="h3">{t('push.stopResume')}</Text>
          <XStack gap={8}>
            <Button
              onPress={() => run('stopPush', () => push.stopPush())}
              disabled={busy || !ready}
            >
              {t('push.stopPush')}
            </Button>
            <Button
              onPress={() => run('resumePush', () => push.resumePush())}
              disabled={busy || !ready}
            >
              {t('push.resumePush')}
            </Button>
          </XStack>
        </YStack>
      </Card>

      {/* 最近消息 */}
      <Card padding={16}>
        <YStack gap={8}>
          <Text variant="h3">{t('push.recentPush')}</Text>
          <Text variant="caption">
            {t('push.testNote')}
          </Text>
          {lastMsg ? (
            <MsgCard label={`📩 ${t('push.arrived')}`} msg={lastMsg} />
          ) : (
            <Text>{t('push.waiting')}</Text>
          )}
          {lastOpen ? (
            <MsgCard label={`👆 ${t('push.clicked')}`} msg={lastOpen} />
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
