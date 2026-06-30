/**
 * @itc/push 类型定义。
 * 业务层只依赖本文件与 index 导出的 push 代理，绝不 import ItcJpush / JPush API。
 */

/** 推送到达消息 */
export interface PushMessage {
  messageId: string;
  title?: string;
  body?: string;
  /** 业务自定义透传字段（极光 extras / APNs custom payload） */
  data?: Record<string, string>;
}

/** 设备注册信息 */
export interface PushRegistration {
  /** 推送平台下发的设备 token / registrationId */
  token: string;
  /** 实际命中的通道：'apns' | 'fcm' | 'xiaomi' | 'huawei' | 'pushkit' | … */
  channel: string;
}

/** 初始化配置。键名与具体推送平台无关，由内部实现映射到各 SDK 参数。 */
export interface PushInitOptions {
  /** 推送平台 appKey（极光控制台获取） */
  appKey: string;
  /** 推送平台 masterSecret 或 appSecret（服务端校验用，客户端可不传） */
  secret?: string;
  /** 生产环境（true）还是开发环境（false）。默认 true */
  production?: boolean;
}

/**
 * 推送能力抽象接口。
 *
 * 任何推送后端（极光/友盟/个推/自建）只需实现此接口，通过 `installPush()` 注入，
 * 业务层即可无感切换。
 */
export interface PushProvider {
  /** 初始化推送 SDK。幂等，可重复调用。 */
  init(options: PushInitOptions): Promise<void>;

  /** 获取设备推送标识（registrationId / token）。 */
  getToken(): Promise<PushRegistration>;

  /** 设置应用角标数。 */
  setBadge(count: number): Promise<void>;

  /** 设置别名（用户标识，用于定向推送）。 */
  setAlias(alias: string): Promise<void>;

  /** 删除别名。 */
  deleteAlias(): Promise<void>;

  /** 设置标签（分组推送）。 */
  setTags(tags: string[]): Promise<void>;

  /** 停止推送（注销）。 */
  stopPush(): Promise<void>;

  /** 恢复推送。 */
  resumePush(): Promise<void>;

  /** 释放原生资源 / 取消监听。登出时调用。 */
  destroy(): void;
}

/** 事件映射表。通过 declaration merging 扩展 @itc/base 的 ItcEventMap。 */
declare module '@itc/base' {
  interface ItcEventMap {
    'push:message': PushMessage;
    'push:opened': PushMessage;
    'push:token': PushRegistration;
  }
}
