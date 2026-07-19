/**
 * @itc/push 极光内部实现。
 *
 * 封装 jpush-react-native + jcore-react-native（三端统一，无需鸿蒙移植包）。
 * RN 0.82 上极光已适配鸿蒙（"HarmonyOSReleases" 列为 "-"），源码直接可用。
 *
 * 本文件**绝不导出**——业务层只通过 src/index.ts 的 push 代理使用推送能力。
 * 日后切换推送后端（如友盟/个推），只需新建一个 ItcUmeng.ts 实现 PushProvider，
 * 然后改 installPush() 一行即可。
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any;

import { eventBus, logger, currentPlatform } from '@itc/base';
import type {
  PushProvider,
  PushInitOptions,
  PushRegistration,
} from './types';

// 极光 SDK —— 内部 import，不暴露给业务层。
// 三端统一：Android/iOS/鸿蒙均使用同一 npm 包，鸿蒙侧由 RNOH 框架透明适配。
const JPush = require('jpush-react-native');
const JCore = require('jcore-react-native');

const TAG = 'push';

/** 极光 SDK 内部实现，实现 PushProvider 接口。 */
class ItcJpush implements PushProvider {
  private _initialized = false;

  async init(options: PushInitOptions): Promise<void> {
    if (this._initialized) {
      logger.info(TAG, '极光已初始化，跳过');
      return;
    }

    const { appKey, secret, production = true } = options;

    // 1. 初始化极光核心（必须最先）
    JCore.init();
    logger.info(TAG, `极光 core 初始化完成 (platform=${currentPlatform})`);

    // 2. 初始化极光推送
    JPush.init();

    // 3. 设置调试模式（开发环境）
    if (!production) {
      JPush.setLoggerEnable(true);
      JPush.setDebugMode(true);
    }

    // 4. 监听 registrationId（设备标识）
    JPush.addConnectListener((result: { registerID?: string }) => {
      const token = result.registerID ?? '';
      const channel = this.detectChannel();
      logger.info(TAG, `registrationId: ${token}, channel: ${channel}`);
      const reg: PushRegistration = { token, channel };
      eventBus.emit('push:token', reg);
    });

    // 5. 监听通知到达（前台收到通知）
    JPush.addNotificationListener((msg: Record<string, unknown>) => {
      const message = this.normalizeMessage(msg);
      logger.info(TAG, `通知到达: ${message.messageId}`);
      eventBus.emit('push:message', message);
    });

    // 6. 监听通知点击（从通知栏打开 App）
    JPush.addLocalNotificationListener((msg: Record<string, unknown>) => {
      const message = this.normalizeMessage(msg);
      logger.info(TAG, `通知点击: ${message.messageId}`);
      eventBus.emit('push:opened', message);
    });

    // 7. 获取 launchApp 时带入的通知（冷启动点击通知打开）
    JPush.getLaunchAppNotification((msg: Record<string, unknown>) => {
      if (msg && Object.keys(msg).length > 0) {
        const message = this.normalizeMessage(msg);
        logger.info(TAG, `冷启动打开通知: ${message.messageId}`);
        eventBus.emit('push:opened', message);
      }
    });

    this._initialized = true;
    logger.info(TAG, `极光初始化完成 (appKey=${appKey.substring(0, 8)}…)`);
  }

  async getToken(): Promise<PushRegistration> {
    return new Promise((resolve) => {
      JPush.getRegistrationID((id: string) => {
        resolve({ token: id, channel: this.detectChannel() });
      });
    });
  }

  async setBadge(count: number): Promise<void> {
    JPush.setBadge(count);
  }

  async setAlias(alias: string): Promise<void> {
    return new Promise((resolve, reject) => {
      JPush.setAlias({ sequence: Date.now(), alias }, (res: { errorCode: number }) => {
        if (res.errorCode === 0) resolve();
        else reject(new Error(`极光 setAlias 失败: errorCode=${res.errorCode}`));
      });
    });
  }

  async deleteAlias(): Promise<void> {
    return new Promise((resolve, reject) => {
      JPush.deleteAlias({ sequence: Date.now() }, (res: { errorCode: number }) => {
        if (res.errorCode === 0) resolve();
        else reject(new Error(`极光 deleteAlias 失败: errorCode=${res.errorCode}`));
      });
    });
  }

  async setTags(tags: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      JPush.setTags({ sequence: Date.now(), tags: tags.join(',') }, (res: { errorCode: number }) => {
        if (res.errorCode === 0) resolve();
        else reject(new Error(`极光 setTags 失败: errorCode=${res.errorCode}`));
      });
    });
  }

  async stopPush(): Promise<void> {
    JPush.stopPush();
  }

  async resumePush(): Promise<void> {
    JPush.resumePush();
  }

  destroy(): void {
    eventBus.removeAll('push:message');
    eventBus.removeAll('push:opened');
    eventBus.removeAll('push:token');
    this._initialized = false;
  }

  /** 检测当前设备实际使用的推送通道 */
  private detectChannel(): string {
    if (currentPlatform === 'ios') return 'apns';
    if (currentPlatform === 'harmony') return 'pushkit';
    return 'fcm'; // Android 默认 FCM，极光自动适配厂商通道
  }

  /** 将极光原始消息归一化为 PushMessage 格式 */
  private normalizeMessage(raw: Record<string, unknown>): import('./types').PushMessage {
    return {
      messageId: String(raw.messageID ?? raw._j_msgid ?? ''),
      title: String(raw.title ?? ''),
      body: String(raw.alertContent ?? raw.content ?? ''),
      data: (raw.extras as Record<string, string>) ?? {},
    };
  }
}

/** 单例。不导出——只由 index.ts 的 installPush() 注入。 */
export const jpushProvider = new ItcJpush();
