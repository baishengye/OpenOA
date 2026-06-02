/**
 * KV 存储抽象。模块（及宿主）只依赖 {@link KVStorage} 接口，不直接绑定具体实现，
 * 从而：Android/iOS 用 MMKV，鸿蒙端用 preferences / relationalStore 适配同一接口。
 *
 * base 不内置任何原生存储依赖（保持极薄），宿主在启动时通过 {@link setStorage} 注入。
 * 未注入时默认提供一个内存实现，保证逻辑可跑（重启即失）。
 */

export interface KVStorage {
  getString(key: string): string | null;
  set(key: string, value: string): void;
  getBoolean(key: string): boolean | null;
  setBoolean(key: string, value: boolean): void;
  delete(key: string): void;
  contains(key: string): boolean;
  clearAll(): void;
}

class MemoryStorage implements KVStorage {
  private readonly map = new Map<string, string>();
  getString(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  set(key: string, value: string) {
    this.map.set(key, value);
  }
  getBoolean(key: string) {
    const v = this.getString(key);
    return v === null ? null : v === 'true';
  }
  setBoolean(key: string, value: boolean) {
    this.set(key, value ? 'true' : 'false');
  }
  delete(key: string) {
    this.map.delete(key);
  }
  contains(key: string) {
    return this.map.has(key);
  }
  clearAll() {
    this.map.clear();
  }
}

let active: KVStorage = new MemoryStorage();

/** 宿主注入真实存储实现（如基于 MMKV / 鸿蒙 preferences 的适配器）。 */
export function setStorage(impl: KVStorage): void {
  active = impl;
}

/** 全局存储代理。 */
export const storage: KVStorage = {
  getString: (k) => active.getString(k),
  set: (k, v) => active.set(k, v),
  getBoolean: (k) => active.getBoolean(k),
  setBoolean: (k, v) => active.setBoolean(k, v),
  delete: (k) => active.delete(k),
  contains: (k) => active.contains(k),
  clearAll: () => active.clearAll(),
};
