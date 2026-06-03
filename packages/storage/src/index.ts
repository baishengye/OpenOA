/**
 * @itc/storage —— KV 持久化模块。实现 @itc/base 的 {@link KVStorage} 接口，
 * 由宿主在启动时 `setStorage(storage)` 注入，业务层只依赖 @itc/base 的 storage 代理。
 *
 * Android/iOS：MMKV；鸿蒙：ArkData preferences（以 .har 接入，见 docs/HARMONY.md §8）。
 */
import { setStorage, type KVStorage } from '@itc/base';
import NativeItcStorage from './NativeItcStorage';

/** KVStorage 实现，桥接原生 ItcStorage（MMKV / preferences）。 */
class ItcStorage implements KVStorage {
  getString(key: string): string | null {
    return NativeItcStorage.contains(key) ? NativeItcStorage.getString(key) : null;
  }
  set(key: string, value: string): void {
    NativeItcStorage.setString(key, value);
  }
  getBoolean(key: string): boolean | null {
    return NativeItcStorage.contains(key) ? NativeItcStorage.getBoolean(key) : null;
  }
  setBoolean(key: string, value: boolean): void {
    NativeItcStorage.setBoolean(key, value);
  }
  delete(key: string): void {
    NativeItcStorage.remove(key);
  }
  contains(key: string): boolean {
    return NativeItcStorage.contains(key);
  }
  clearAll(): void {
    NativeItcStorage.clearAll();
  }
}

/** 单例。 */
export const storage: KVStorage = new ItcStorage();

/**
 * 注入到 @itc/base 全局 storage 代理（宿主启动时调用一次）。
 * **探测式**：先试调原生，原生未构建（某端没接入/没重编）则不注入、保留 @itc/base 内存兜底，
 * 避免崩溃。返回是否启用了持久化后端。
 */
export function installStorage(): boolean {
  if (NativeItcStorage == null) return false; // 原生未接入 → 保留 @itc/base 内存兜底
  try {
    NativeItcStorage.contains('__itc_storage_probe__');
    setStorage(storage);
    return true;
  } catch (e) {
    return false;
  }
}
