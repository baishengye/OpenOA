/**
 * 生成唯一 ID
 * 使用 React Native 内置的随机数生成
 */

export default function id(): string {
  // 使用时间戳 + 随机数生成唯一 ID
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${randomPart2}`;
}

/**
 * 生成操作 ID（用于日志追踪）
 */
export function generateOperationID(): string {
  return `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
