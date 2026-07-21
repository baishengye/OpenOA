/**
 * 认证服务
 * 处理后端登录接口调用
 */
import { isIOS, md5 } from '@itc/base';
import { LOGIN_API, API_CONFIG } from '../config';
import type { LoginResponse } from '../types';

/**
 * 生成唯一 operationID
 */
function generateOperationID(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * 登录（后端认证 + 获取 IM 凭证）
 * @param phone 手机号
 * @param password 密码
 * @returns Promise<LoginResponse> 包含 userID 和 token
 */
export async function login(phone: string, password: string): Promise<LoginResponse> {
  console.log('[AuthService] 开始登录请求:', { phone, password, api: LOGIN_API });

  const headers = {
    ...API_CONFIG.headers,
    operationID: generateOperationID(),
  };

  const response = await fetch(LOGIN_API, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      areaCode: '+86',
      phoneNumber: phone,
      password: md5(password),
      platform: isIOS ? 1 : 2, // 1=iOS, 2=Android/Harmony
    }),
  });

  console.log('[AuthService] HTTP 响应状态:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.log('[AuthService] HTTP 请求失败:', { status: response.status, errorText });
    throw new Error(errorText || `登录失败: ${response.status}`);
  }

  const data = await response.json();
  console.log('[AuthService] 响应原始数据:', JSON.stringify(data, null, 2));

  // 验证返回数据 - 支持两种格式:
  // 1. { code: 0, data: { token: "..." } }
  // 2. { errCode: 0, errMsg: "..." }
  // 3. { errCode: 0, data: { imToken: "...", userID: "..." } }
  const errorCode = data.code ?? data.errCode;
  const errorMessage = data.msg || data.errmsg || data.errMsg;

  if (errorCode !== 0) {
    console.log('[AuthService] 业务错误:', { code: errorCode, msg: errorMessage, detail: data.errDlt });
    throw new Error(errorMessage || '登录失败');
  }

  // 获取 token - 尝试多种字段名
  const token = data.data?.token || data.data?.imToken;
  if (token) {
    const result = {
      userID: data.data.userID || phone,
      token: token,
    };
    console.log('[AuthService] 登录成功:', { userID: result.userID, token: result.token?.substring(0, 20) + '...' });
    return result;
  }

  console.log('[AuthService] 数据格式错误: 响应中没有 token', { data: data.data });
  throw new Error('登录响应数据格式错误');
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  // 中国大陆手机号：11位数字，以1开头
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码格式
 * @param password 密码
 * @returns 是否有效
 */
export function isValidPassword(password: string): boolean {
  // 密码至少6位
  return password.length >= 6;
}
