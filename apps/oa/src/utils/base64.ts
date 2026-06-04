/** 极简 ASCII → Base64（仅用于演示构造 challenge，避免依赖 btoa polyfill）。 */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function asciiToBase64(input: string): string {
  let out = '';
  let i = 0;
  while (i < input.length) {
    const c1 = input.charCodeAt(i++) & 0xff;
    const c2 = i < input.length ? input.charCodeAt(i++) & 0xff : NaN;
    const c3 = i < input.length ? input.charCodeAt(i++) & 0xff : NaN;

    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (Number.isNaN(c2) ? 0 : c2 >> 4);
    const e3 = Number.isNaN(c2) ? 64 : ((c2 & 15) << 2) | (Number.isNaN(c3) ? 0 : c3 >> 6);
    const e4 = Number.isNaN(c3) ? 64 : c3 & 63;

    // 下标 64 = 填充位，必须输出 '='（CHARS 只有 0–63，charAt(64) 会得空串，
    // 导致缺 '=' 填充、长度非 4 倍数 —— iOS initWithBase64EncodedString 会判为非法）。
    out +=
      CHARS.charAt(e1) +
      CHARS.charAt(e2) +
      (e3 === 64 ? '=' : CHARS.charAt(e3)) +
      (e4 === 64 ? '=' : CHARS.charAt(e4));
  }
  return out;
}
