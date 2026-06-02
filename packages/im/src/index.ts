/**
 * @itc/im —— 即时 IM 模块（占位骨架），封装 OpenIM。
 *
 * 跨端策略：
 *  - Android / iOS：官方 open-im-sdk-rn（gomobile 编译的 openim-sdk-core）
 *  - 鸿蒙 NEXT：自编译 openim-sdk-core(Go) 为 OHOS arm64 .so + ArkTS NAPI 绑定
 *    （⚠️ 最大技术风险项，需独立 PoC，见 README）
 *
 * 沿用 @itc/biometric 结构：本文件定义统一 API 与 ItcModule 契约；新消息/连接状态
 * 经 @itc/base 的 eventBus 下发。
 */
import { BaseModule, eventBus, ErrorCode, ItcError, logger } from '@itc/base';

const MODULE_NAME = 'im';
const TAG = 'im';

export type ConversationType = 'single' | 'group';

export interface IMMessage {
  clientMsgId: string;
  conversationId: string;
  senderId: string;
  contentType: number;
  content: string;
  createTime: number;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'kickedOffline';

declare module '@itc/base' {
  interface ItcEventMap {
    'im:newMessage': IMMessage;
    'im:connectionChanged': ConnectionState;
  }
}

export interface IMInitOptions {
  /** OpenIM 服务地址 */
  apiUrl: string;
  wsUrl: string;
  /** 平台 ID：1=iOS 2=Android（鸿蒙待 OpenIM 分配/自定义） */
  platformId?: number;
}

class IMModule extends BaseModule<IMInitOptions> {
  readonly name = MODULE_NAME;

  async isSupported(): Promise<boolean> {
    // TODO(native): A/iOS 检查 open-im-sdk-rn；鸿蒙检查 .so 绑定。占位返回 false。
    return false;
  }

  protected async onInit(_options: IMInitOptions): Promise<void> {
    logger.warn(TAG, '@itc/im 原生尚未实现（占位骨架）');
    throw new ItcError(ErrorCode.NATIVE_MODULE_UNAVAILABLE, 'im 模块原生未实现', {
      module: MODULE_NAME,
    });
  }

  protected async onDestroy(): Promise<void> {
    eventBus.removeAll('im:newMessage');
    eventBus.removeAll('im:connectionChanged');
  }

  /** 登录 OpenIM。 */
  async login(_userId: string, _token: string): Promise<void> {
    throw new ItcError(ErrorCode.NATIVE_MODULE_UNAVAILABLE, 'im 模块原生未实现', {
      module: MODULE_NAME,
    });
  }

  /** 发送文本消息。 */
  async sendText(_conversationId: string, _text: string): Promise<IMMessage> {
    throw new ItcError(ErrorCode.NATIVE_MODULE_UNAVAILABLE, 'im 模块原生未实现', {
      module: MODULE_NAME,
    });
  }
}

export const im = new IMModule();
