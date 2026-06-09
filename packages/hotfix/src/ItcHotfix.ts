import codePush, { type SyncOptions as CPSyncOptions } from 'react-native-code-push';
import type { ComponentType } from 'react';
import type {
  HotfixProvider,
  SyncOptions,
  SyncStatus,
  WrapOptions,
  RemoteUpdate,
  LocalVersion,
} from './types';

const INSTALL_MODE: Record<NonNullable<SyncOptions['installMode']>, number> = {
  IMMEDIATE: codePush.InstallMode.IMMEDIATE,
  ON_NEXT_RESTART: codePush.InstallMode.ON_NEXT_RESTART,
  ON_NEXT_RESUME: codePush.InstallMode.ON_NEXT_RESUME,
};

const CHECK_FREQUENCY: Record<NonNullable<WrapOptions['checkFrequency']>, number> = {
  ON_APP_START: codePush.CheckFrequency.ON_APP_START,
  ON_APP_RESUME: codePush.CheckFrequency.ON_APP_RESUME,
  MANUAL: codePush.CheckFrequency.MANUAL,
};

const SYNC_STATUS: Record<number, SyncStatus> = {
  [codePush.SyncStatus.UP_TO_DATE]: 'UP_TO_DATE',
  [codePush.SyncStatus.UPDATE_INSTALLED]: 'UPDATE_INSTALLED',
  [codePush.SyncStatus.UPDATE_IGNORED]: 'UPDATE_IGNORED',
  [codePush.SyncStatus.UNKNOWN_ERROR]: 'ERROR',
  [codePush.SyncStatus.SYNC_IN_PROGRESS]: 'IN_PROGRESS',
};

/**
 * 热修复的具体实现（内部，不对外导出）。对等 @itc/storage 的 `ItcStorage`：
 * 对外只见 `hotfix.*`，底层引擎是 react-native-code-push（鸿蒙走 oh-tpl 移植包，由 metro 透明重定向）。
 */
export class ItcHotfix implements HotfixProvider {
  async checkForUpdate(): Promise<RemoteUpdate | null> {
    const update = await codePush.checkForUpdate();
    if (!update) return null;
    return {
      label: update.label,
      description: update.description,
      isMandatory: update.isMandatory,
      packageSize: update.packageSize,
    };
  }

  async sync(options?: SyncOptions): Promise<SyncStatus> {
    const cpOpts: CPSyncOptions = {};
    if (options?.installMode) {
      cpOpts.installMode = INSTALL_MODE[options.installMode];
    }
    if (options?.mandatoryInstallMode) {
      cpOpts.mandatoryInstallMode = INSTALL_MODE[options.mandatoryInstallMode];
    }
    if (options?.minimumBackgroundDuration !== undefined) {
      cpOpts.minimumBackgroundDuration = options.minimumBackgroundDuration;
    }
    const status = await codePush.sync(cpOpts);
    return SYNC_STATUS[status] ?? 'ERROR';
  }

  async getCurrentVersion(): Promise<LocalVersion | null> {
    const pkg = await codePush.getUpdateMetadata();
    if (!pkg) return null;
    return {
      label: pkg.label,
      description: pkg.description,
      appVersion: pkg.appVersion,
    };
  }

  async notifyAppReady(): Promise<void> {
    await codePush.notifyAppReady();
  }

  wrapApp<P extends object>(Component: ComponentType<P>, options?: WrapOptions): ComponentType<P> {
    return codePush({
      checkFrequency: options?.checkFrequency
        ? CHECK_FREQUENCY[options.checkFrequency]
        : codePush.CheckFrequency.ON_APP_RESUME,
      installMode: options?.installMode
        ? INSTALL_MODE[options.installMode]
        : codePush.InstallMode.ON_NEXT_RESUME,
      mandatoryInstallMode: options?.mandatoryInstallMode
        ? INSTALL_MODE[options.mandatoryInstallMode]
        : codePush.InstallMode.IMMEDIATE,
    })(Component);
  }
}
