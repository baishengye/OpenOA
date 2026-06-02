/**
 * 可注入的日志抽象。模块内部统一用 {@link logger} 打日志，宿主可在启动时
 * `setLogger()` 注入自己的实现（接入埋点 / 远程日志 / 关闭 release 输出）。
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(tag: string, message: string, extra?: unknown): void;
  info(tag: string, message: string, extra?: unknown): void;
  warn(tag: string, message: string, extra?: unknown): void;
  error(tag: string, message: string, extra?: unknown): void;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** 默认控制台实现，受 minLevel 控制（release 可设为 'warn' 以上）。 */
export class ConsoleLogger implements Logger {
  constructor(private minLevel: LogLevel = 'debug') {}

  private log(level: LogLevel, tag: string, message: string, extra?: unknown) {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.minLevel]) return;
    const line = `[itc:${tag}] ${message}`;
    const fn =
      level === 'error'
        ? console.error
        : level === 'warn'
          ? console.warn
          : console.log;
    if (extra !== undefined) fn(line, extra);
    else fn(line);
  }

  debug = (t: string, m: string, e?: unknown) => this.log('debug', t, m, e);
  info = (t: string, m: string, e?: unknown) => this.log('info', t, m, e);
  warn = (t: string, m: string, e?: unknown) => this.log('warn', t, m, e);
  error = (t: string, m: string, e?: unknown) => this.log('error', t, m, e);
}

let active: Logger = new ConsoleLogger();

/** 宿主注入自定义 Logger。 */
export function setLogger(impl: Logger): void {
  active = impl;
}

/** 全局 logger 代理，始终转发到当前注入的实现。 */
export const logger: Logger = {
  debug: (t, m, e) => active.debug(t, m, e),
  info: (t, m, e) => active.info(t, m, e),
  warn: (t, m, e) => active.warn(t, m, e),
  error: (t, m, e) => active.error(t, m, e),
};
