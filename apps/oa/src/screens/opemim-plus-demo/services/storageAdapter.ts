/**
 * Zustand StateStorage 适配器
 * 将 @itc/storage (KVStorage) 适配为 Zustand 所需的 StateStorage 接口
 */
import type { StateStorage } from 'zustand/middleware';
import { storage } from '@itc/storage';

/** 将 KVStorage 适配为 Zustand StateStorage */
export const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return storage.getString(name);
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};
