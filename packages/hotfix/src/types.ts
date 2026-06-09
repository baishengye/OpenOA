import type { ComponentType } from 'react';

export type InstallMode = 'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME';
export type CheckFrequency = 'ON_APP_START' | 'ON_APP_RESUME' | 'MANUAL';

export type SyncStatus =
  | 'UP_TO_DATE'
  | 'UPDATE_INSTALLED'
  | 'UPDATE_IGNORED'
  | 'ERROR'
  | 'IN_PROGRESS';

export interface SyncOptions {
  installMode?: InstallMode;
  mandatoryInstallMode?: InstallMode;
  minimumBackgroundDuration?: number;
}

export interface WrapOptions {
  checkFrequency?: CheckFrequency;
  installMode?: InstallMode;
  mandatoryInstallMode?: InstallMode;
}

export interface RemoteUpdate {
  label: string;
  description: string;
  isMandatory: boolean;
  packageSize: number;
}

export interface LocalVersion {
  label: string;
  description: string;
  appVersion: string;
}

export interface HotfixProvider {
  checkForUpdate(): Promise<RemoteUpdate | null>;
  sync(options?: SyncOptions): Promise<SyncStatus>;
  getCurrentVersion(): Promise<LocalVersion | null>;
  notifyAppReady(): Promise<void>;
  wrapApp<P extends object>(
    Component: ComponentType<P>,
    options?: WrapOptions,
  ): ComponentType<P>;
}
