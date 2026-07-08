/**
 * @itc/rn-client-sdk-plus —— 即时 IM 模块，封装 OpenIM。
 *
 * 跨端策略：
 *  - Android / iOS：基于 TurboModule 架构，参照 open-im-sdk-reactnative 实现
 *  - 鸿蒙 NEXT：自编译 openim-sdk-core(Go) 为 OHOS arm64 .so + ArkTS NAPI 绑定
 *    （⚠️ 最大技术风险项，需独立 PoC，见 README）
 *
 * 沿用 @itc/biometric 结构：本文件定义统一 API 与 ItcModule 契约；新消息/连接状态
 * 经 @itc/base 的 eventBus 下发。
 */
import { BaseModule, eventBus, ErrorCode, ItcError, logger } from '@itc/base';
import ItcOpenIMSDK, { NativeItcOpenIM } from './ItcOpenIMSDK';
import { NativeEventEmitter } from 'react-native';
import type { IMMessage, ConnectionState, IMInitOptions } from './types';

const TAG = 'im';

// NativeEventEmitter 用于订阅原生事件
let nativeEmitter: NativeEventEmitter | null = null;

function getNativeEmitter(): NativeEventEmitter {
  if (!nativeEmitter) {
    if (!NativeItcOpenIM) {
      logger.warn(TAG, 'NativeEventEmitter 不可用，跳过事件监听');
      // 返回一个 noop emitter
      return {
        addListener: () => ({ remove: () => {} }),
        removeAllListeners: () => {},
        listenerCount: () => 0,
      } as unknown as NativeEventEmitter;
    }
    nativeEmitter = new NativeEventEmitter(NativeItcOpenIM);
  }
  return nativeEmitter;
}

// ============ 事件类型声明 ============
declare module '@itc/base' {
  interface ItcEventMap {
    'im:newMessage': IMMessage;
    'im:connectionChanged': ConnectionState;
    'im:conversationChanged': string;
    'im:messageRevoked': string;
    'im:typingStatus': { userId: string; status: boolean };
    'im:totalUnreadChanged': number;
    'im:kickedOffline': void;
    'im:tokenExpired': void;
  }
}

// ============ IM 模块实现 ============

class IMModule extends BaseModule<IMInitOptions> {
  readonly name = 'im';
  private _listenersSet = false;

  async isSupported(): Promise<boolean> {
    // 检查 TurboModule 是否可用
    try {
      // TurboModule 存在即视为支持
      return typeof ItcOpenIMSDK !== 'undefined';
    } catch {
      return false;
    }
  }

  protected async onInit(_options: IMInitOptions): Promise<void> {
    logger.info(TAG, '初始化 OpenIM SDK...');

    // 设置平台 ID：1=iOS, 2=Android
    const platformId = 2; // 默认 Android，后续根据平台动态设置

    try {
      const config = {
        ..._options,
        platformID: platformId,
      };

      await ItcOpenIMSDK.initSDK(config, generateOperationID());
      this._setupListeners();
      logger.info(TAG, 'OpenIM SDK 初始化成功');
    } catch (e) {
      logger.error(TAG, 'OpenIM SDK 初始化失败', e);
      throw ItcError.from(e, 'im');
    }
  }

  protected async onDestroy(): Promise<void> {
    try {
      await ItcOpenIMSDK.unInitSDK(generateOperationID());
    } catch (e) {
      logger.warn(TAG, 'unInitSDK 失败', e);
    }
    this._removeListeners();
  }

  /** 设置事件监听 */
  private _setupListeners(): void {
    if (this._listenersSet) return;
    this._listenersSet = true;

    const emitter = getNativeEmitter();

    // 连接状态事件
    emitter.addListener('onConnectSuccess', () => {
      eventBus.emit('im:connectionChanged', 'connected');
    });

    emitter.addListener('onConnecting', () => {
      eventBus.emit('im:connectionChanged', 'connecting');
    });

    emitter.addListener('onConnectFailed', ((event: { code: number; msg: string }) => {
      logger.error(TAG, `连接失败: ${event.code} ${event.msg}`);
      eventBus.emit('im:connectionChanged', 'disconnected');
    }) as (event: any) => void);

    emitter.addListener('onKickedOffline', () => {
      eventBus.emit('im:kickedOffline', undefined);
      eventBus.emit('im:connectionChanged', 'kickedOffline');
    });

    emitter.addListener('onUserTokenExpired', () => {
      eventBus.emit('im:tokenExpired', undefined);
    });

    // 消息事件
    emitter.addListener('onRecvNewMessages', ((msgList: string) => {
      try {
        const messages = JSON.parse(msgList) as IMMessage[];
        messages.forEach(msg => eventBus.emit('im:newMessage', msg));
      } catch (e) {
        logger.error(TAG, '解析消息失败', e);
      }
    }) as (event: any) => void);

    // 会话事件
    emitter.addListener('onConversationChanged', ((conversationList: string) => {
      eventBus.emit('im:conversationChanged', conversationList);
    }) as (event: any) => void);

    emitter.addListener('onInputStatusChanged', ((event: { userId: string; status: boolean }) => {
      eventBus.emit('im:typingStatus', { userId: event.userId, status: event.status });
    }) as (event: any) => void);

    emitter.addListener('onTotalUnreadMessageCountChanged', ((count: number) => {
      eventBus.emit('im:totalUnreadChanged', count);
    }) as (event: any) => void);

    // 消息撤回
    emitter.addListener('onNewRecvMessageRevoked', ((msgId: string) => {
      eventBus.emit('im:messageRevoked', msgId);
    }) as (event: any) => void);
  }

  /** 移除事件监听 */
  private _removeListeners(): void {
    if (!this._listenersSet) return;
    this._listenersSet = false;

    // TurboModule 模式下，监听器随模块生命周期管理
    // 实际移除逻辑在 onDestroy 中处理
    eventBus.removeAll('im:newMessage');
    eventBus.removeAll('im:connectionChanged');
    eventBus.removeAll('im:conversationChanged');
    eventBus.removeAll('im:messageRevoked');
    eventBus.removeAll('im:typingStatus');
    eventBus.removeAll('im:totalUnreadChanged');
    eventBus.removeAll('im:kickedOffline');
    eventBus.removeAll('im:tokenExpired');
  }

  /** 登录 OpenIM */
  async login(userId: string, token: string): Promise<void> {
    try {
      await ItcOpenIMSDK.login(userId, token, generateOperationID());
      logger.info(TAG, `登录成功: ${userId}`);
    } catch (e) {
      logger.error(TAG, '登录失败', e);
      throw ItcError.from(e, 'im');
    }
  }

  /** 登出 */
  async logout(): Promise<void> {
    try {
      await ItcOpenIMSDK.logout(generateOperationID());
      logger.info(TAG, '登出成功');
    } catch (e) {
      logger.error(TAG, '登出失败', e);
      throw ItcError.from(e, 'im');
    }
  }

  /** 发送文本消息 */
  async sendText(conversationId: string, text: string): Promise<IMMessage> {
    try {
      const msgStr = await ItcOpenIMSDK.createTextMessage(text, generateOperationID());
      const msgObj = JSON.parse(msgStr);
      const resultStr = await ItcOpenIMSDK.sendMessage(conversationId, msgStr, generateOperationID());
      return JSON.parse(resultStr);
    } catch (e) {
      logger.error(TAG, '发送消息失败', e);
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取登录状态 */
  async getLoginStatus(): Promise<number> {
    try {
      return await ItcOpenIMSDK.getLoginStatus(generateOperationID());
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取登录用户ID */
  async getLoginUserID(): Promise<string> {
    try {
      return await ItcOpenIMSDK.getLoginUserID(generateOperationID());
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取所有会话列表 */
  async getAllConversationList(): Promise<string> {
    try {
      return await ItcOpenIMSDK.getAllConversationList(generateOperationID());
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取未读消息总数 */
  async getTotalUnreadMsgCount(): Promise<number> {
    try {
      return await ItcOpenIMSDK.getTotalUnreadMsgCount(generateOperationID());
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 获取历史消息 */
  async getHistoryMessageList(
    conversationId: string,
    count: number = 20,
    startTime: number = 0
  ): Promise<string> {
    try {
      return await ItcOpenIMSDK.getAdvancedHistoryMessageList(
        conversationId,
        0,
        count,
        startTime,
        generateOperationID()
      );
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }

  /** 标记会话已读 */
  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await ItcOpenIMSDK.markConversationMessageAsRead(conversationId, generateOperationID());
    } catch (e) {
      throw ItcError.from(e, 'im');
    }
  }
}

// ============ 辅助函数 ============

let operationIdCounter = 0;

/** 生成操作ID（用于日志追踪） */
function generateOperationID(): string {
  return `im_${Date.now()}_${++operationIdCounter}`;
}

// ============ 导出 ============

export const im = new IMModule();
export { IMModule };
