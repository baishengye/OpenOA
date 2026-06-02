/**
 * @itc/push —— 推送模块（占位骨架）。
 *
 * 统一推送抽象层。底层（待实现）走第三方聚合：
 *  - Android：友盟 / 极光，内置小米/华为/OPPO/VIVO/魅族厂商通道
 *  - iOS：APNs
 *  - 鸿蒙 NEXT：华为 Push Kit
 *
 * 沿用 @itc/biometric 的结构：本文件定义统一 API 与 ItcModule 契约；
 * 后续补 src/NativeItcPush.ts(codegen spec) 与 android/ios/harmony 原生实现。
 * 原生回调（到达/点击/角标）统一经 @itc/base 的 eventBus 下发。
 */
import { BaseModule, eventBus, ErrorCode, ItcError, logger } from '@itc/base';

const MODULE_NAME = 'push';
const TAG = 'push';

export interface PushMessage {
  messageId: string;
  title?: string;
  body?: string;
  /** 业务自定义透传字段 */
  data?: Record<string, string>;
}

export interface PushRegistration {
  /** 聚合平台下发的设备 token / regId */
  token: string;
  /** 实际命中的厂商通道，便于排障：'apns' | 'pushkit' | 'xiaomi' | 'huawei' | ... */
  channel: string;
}

/** 推送事件并入全局事件总线（声明合并扩展 ItcEventMap）。 */
declare module '@itc/base' {
  interface ItcEventMap {
    'push:message': PushMessage;
    'push:opened': PushMessage;
    'push:token': PushRegistration;
  }
}

export interface PushInitOptions {
  /** 聚合平台 appKey（友盟/极光控制台） */
  appKey: string;
  appSecret?: string;
}

class PushModule extends BaseModule<PushInitOptions> {
  readonly name = MODULE_NAME;

  async isSupported(): Promise<boolean> {
    // TODO(native): 探测聚合 SDK 是否就绪。占位返回 false。
    return false;
  }

  protected async onInit(_options: PushInitOptions): Promise<void> {
    // TODO(native): 初始化聚合 SDK，注册回调 → eventBus.emit('push:message' | 'push:opened')
    logger.warn(TAG, '@itc/push 原生尚未实现（占位骨架）');
    throw new ItcError(ErrorCode.NATIVE_MODULE_UNAVAILABLE, 'push 模块原生未实现', {
      module: MODULE_NAME,
    });
  }

  protected async onDestroy(): Promise<void> {
    eventBus.removeAll('push:message');
    eventBus.removeAll('push:opened');
    eventBus.removeAll('push:token');
  }

  /** 获取推送 token（注册成功后）。 */
  async getToken(): Promise<PushRegistration> {
    throw new ItcError(ErrorCode.NATIVE_MODULE_UNAVAILABLE, 'push 模块原生未实现', {
      module: MODULE_NAME,
    });
  }

  /** 设置角标数。 */
  async setBadge(_count: number): Promise<void> {
    throw new ItcError(ErrorCode.NATIVE_MODULE_UNAVAILABLE, 'push 模块原生未实现', {
      module: MODULE_NAME,
    });
  }
}

export const push = new PushModule();
