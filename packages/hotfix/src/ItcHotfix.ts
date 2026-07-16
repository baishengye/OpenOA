import codePush, { type SyncOptions as CPSyncOptions } from 'react-native-code-push';
import type { ComponentType } from 'react';
import { Platform } from 'react-native';
import type {
  HotfixProvider,
  SyncOptions,
  SyncStatus,
  WrapOptions,
  RemoteUpdate,
  LocalVersion,
} from './types';

// HarmonyOS 平台检测
const isHarmony = Platform.OS === 'harmony';

// CodePush 在 HarmonyOS 上可能不可用，添加兼容处理
const hasCodePush = typeof codePush !== 'undefined' && codePush !== null;

// 安装模式映射
const INSTALL_MODE: Record<NonNullable<SyncOptions['installMode']>, number> = {
  IMMEDIATE: hasCodePush ? codePush.InstallMode.IMMEDIATE : 0,
  ON_NEXT_RESTART: hasCodePush ? codePush.InstallMode.ON_NEXT_RESTART : 1,
  ON_NEXT_RESUME: hasCodePush ? codePush.InstallMode.ON_NEXT_RESUME : 2,
};

// 检查频率映射
const CHECK_FREQUENCY: Record<NonNullable<WrapOptions['checkFrequency']>, number> = {
  ON_APP_START: hasCodePush ? codePush.CheckFrequency.ON_APP_START : 0,
  ON_APP_RESUME: hasCodePush ? codePush.CheckFrequency.ON_APP_RESUME : 1,
  MANUAL: hasCodePush ? codePush.CheckFrequency.MANUAL : 2,
};

// 同步状态映射
const SYNC_STATUS: Record<number, SyncStatus> = {
  0: 'UP_TO_DATE',
  1: 'UPDATE_INSTALLED',
  2: 'UPDATE_IGNORED',
  3: 'ERROR',
  4: 'IN_PROGRESS',
};
if (hasCodePush) {
  SYNC_STATUS[codePush.SyncStatus.UP_TO_DATE] = 'UP_TO_DATE';
  SYNC_STATUS[codePush.SyncStatus.UPDATE_INSTALLED] = 'UPDATE_INSTALLED';
  SYNC_STATUS[codePush.SyncStatus.UPDATE_IGNORED] = 'UPDATE_IGNORED';
  SYNC_STATUS[codePush.SyncStatus.UNKNOWN_ERROR] = 'ERROR';
  SYNC_STATUS[codePush.SyncStatus.SYNC_IN_PROGRESS] = 'IN_PROGRESS';
}

/**
 * 热修复的具体实现（内部，不对外导出）。对等 @itc/storage 的 `ItcStorage`：
 * 对外只见 `hotfix.*`，底层引擎是 react-native-code-push（鸿蒙走 oh-tpl 移植包，由 metro 透明重定向）。
 */
export class ItcHotfix implements HotfixProvider {
  async checkForUpdate(): Promise<RemoteUpdate | null> {
    if (!hasCodePush) {
      return null;
    }
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
    if (!hasCodePush) {
      return 'UP_TO_DATE';
    }
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
    if (!hasCodePush) {
      return null;
    }
    const pkg = await codePush.getUpdateMetadata();
    if (!pkg) return null;
    return {
      label: pkg.label,
      description: pkg.description,
      appVersion: pkg.appVersion,
    };
  }

  async notifyAppReady(): Promise<void> {
    if (hasCodePush) {
      await codePush.notifyAppReady();
    }
  }

  wrapApp<P extends object>(Component: ComponentType<P>, options?: WrapOptions): ComponentType<P> {
    if (!hasCodePush) {
      // CodePush 不可用时，返回原组件
      return Component;
    }
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
