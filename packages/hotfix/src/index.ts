import type { ComponentType } from 'react';
// 默认实现（内部，不对外导出）。日后切换方案时只需替换这一行 + 下方 installHotfix。
import { ItcHotfix } from './ItcHotfix';
import type { HotfixProvider, SyncOptions, WrapOptions } from './types';

export type {
  InstallMode,
  CheckFrequency,
  SyncStatus,
  SyncOptions,
  WrapOptions,
  RemoteUpdate,
  LocalVersion,
  HotfixProvider,
} from './types';

// ── Noop 实现（兜底 / 测试用）────────────────────────────────────────────────

class NoopHotfixProvider implements HotfixProvider {
  checkForUpdate() { return Promise.resolve(null); }
  sync() { return Promise.resolve<import('./types').SyncStatus>('UP_TO_DATE'); }
  getCurrentVersion() { return Promise.resolve(null); }
  notifyAppReady() { return Promise.resolve(); }
  wrapApp<P extends object>(Component: ComponentType<P>) { return Component; }
}

// ── 注册 + 代理 ───────────────────────────────────────────────────────────────

let _provider: HotfixProvider = new NoopHotfixProvider();

/**
 * 覆盖默认 OTA 后端。通常无需调用；供测试或未来切换热修复方案时使用。
 * 必须在 AppRegistry.registerComponent 之前调用。
 */
export function installHotfix(provider: HotfixProvider): void {
  _provider = provider;
}

/** 全局热修复代理，委托给当前已注册的 provider。 */
export const hotfix: HotfixProvider = {
  checkForUpdate: () => _provider.checkForUpdate(),
  sync: (options?: SyncOptions) => _provider.sync(options),
  getCurrentVersion: () => _provider.getCurrentVersion(),
  notifyAppReady: () => _provider.notifyAppReady(),
  wrapApp<P extends object>(Component: ComponentType<P>, options?: WrapOptions) {
    return _provider.wrapApp(Component, options);
  },
};

// ── 自动注入默认实现 ───────────────────────────────────────────────────────────
// 三端统一接入；鸿蒙的原生差异由 metro/HAR 在底层透明处理，对外只见 hotfix。
installHotfix(new ItcHotfix());
