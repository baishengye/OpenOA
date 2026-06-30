/**
 * 推送初始化 hook。
 *
 * 在 App 启动时调用一次，初始化极光推送并监听推送事件。
 * 事件通过 @itc/base 的 eventBus 下发（'push:message' / 'push:opened' / 'push:token'），
 * 业务层订阅 eventBus 即可响应，无需直接依赖 @itc/push。
 */

import { useEffect, useRef } from 'react';
import { eventBus, logger } from '@itc/base';
import { push } from '@itc/push';
import type { PushRegistration, PushMessage } from '@itc/push';

const TAG = 'push';

/** 极光 AppKey —— 从极光控制台获取后替换 */
const JPUSH_APPKEY = 'your-jpush-appkey';

/**
 * 初始化推送并监听事件。
 *
 * @example
 * // 在 App.tsx 根组件中调用一次
 * usePush();
 *
 * // 业务组件中监听推送事件
 * eventBus.on('push:message', (msg) => { ... });
 */
export function usePush(): void {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // 监听推送事件（日志输出）
    const offToken = eventBus.on('push:token', (reg: PushRegistration) => {
      logger.info(TAG, `设备注册: channel=${reg.channel} token=${reg.token.substring(0, 16)}…`);
    });

    const offMsg = eventBus.on('push:message', (msg: PushMessage) => {
      logger.info(TAG, `收到推送: ${msg.title ?? '(无标题)'}`);
    });

    const offOpen = eventBus.on('push:opened', (msg: PushMessage) => {
      logger.info(TAG, `点击通知打开: ${msg.title ?? '(无标题)'}`);
    });

    // 初始化推送
    push.init({
      appKey: JPUSH_APPKEY,
      production: false,
    }).catch((e: unknown) => {
      logger.warn(TAG, `推送初始化失败（预期内，未配置 AppKey 或原生未接入）: ${String(e)}`);
    });

    return () => {
      offToken();
      offMsg();
      offOpen();
    };
  }, []);
}
