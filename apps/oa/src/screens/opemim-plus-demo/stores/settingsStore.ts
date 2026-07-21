/**
 * 设置状态管理 (Zustand)
 * 使用 zustandStorage (MMKV) 作为持久化后端
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { zustandStorage } from '../services/storageAdapter';

// ── 状态接口 ─────────────────────────────────────────────────────────────────

export interface SettingsState {
  // 通知设置
  notifyEnabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  doNotDisturb: boolean;
  allowVoIP: boolean;

  // 操作
  setNotifyEnabled: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  setVibrateEnabled: (value: boolean) => void;
  setDoNotDisturb: (value: boolean) => void;
  setAllowVoIP: (value: boolean) => void;
  resetSettings: () => void;
}

// ── 默认设置 ─────────────────────────────────────────────────────────────────

const defaultSettings = {
  notifyEnabled: true,
  soundEnabled: true,
  vibrateEnabled: true,
  doNotDisturb: false,
  allowVoIP: false,
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 初始状态
      notifyEnabled: defaultSettings.notifyEnabled,
      soundEnabled: defaultSettings.soundEnabled,
      vibrateEnabled: defaultSettings.vibrateEnabled,
      doNotDisturb: defaultSettings.doNotDisturb,
      allowVoIP: defaultSettings.allowVoIP,

      // 操作
      setNotifyEnabled: (value: boolean) => {
        set({ notifyEnabled: value });
      },

      setSoundEnabled: (value: boolean) => {
        set({ soundEnabled: value });
      },

      setVibrateEnabled: (value: boolean) => {
        set({ vibrateEnabled: value });
      },

      setDoNotDisturb: (value: boolean) => {
        set({ doNotDisturb: value });
      },

      setAllowVoIP: (value: boolean) => {
        set({ allowVoIP: value });
      },

      resetSettings: () => {
        set({ ...defaultSettings });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

// ── 便捷 Hooks ───────────────────────────────────────────────────────────────

/** 获取通知是否启用 */
export const useNotifyEnabled = () =>
  useSettingsStore((state) => state.notifyEnabled);
