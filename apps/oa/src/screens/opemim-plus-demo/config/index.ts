/**
 * API 配置文件
 * OpenIM Plus Demo 应用使用
 */

/** IM API 地址 */
export const API_ADDR = 'http://172.16.204.62:10002';

/** IM WebSocket 地址 */
export const WS_ADDR = 'ws://172.16.204.62:10001';

/** 后端登录接口 */
export const LOGIN_API = 'http://172.16.204.62:10008/account/login';

/** 生成唯一 operationID */
function generateOperationID(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/** API 基础配置 */
export const API_CONFIG = {
  baseURL: API_ADDR,
  wsURL: WS_ADDR,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    operationID: generateOperationID(),
  },
};
