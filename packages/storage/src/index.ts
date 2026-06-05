/**
 * @itc/storage —— KV 持久化模块。实现 @itc/base 的 {@link KVStorage} 接口，
 * 由宿主在启动时 `installStorage()` 注入，业务层只依赖 @itc/base 的 storage 代理。
 *
 * 三端统一用 MMKV（`react-native-mmkv-storage`）：
 *  - Android / iOS：上游包（见 ./mmkv）
 *  - 鸿蒙 NEXT：RNOH 移植包（见 ./mmkv.harmony，Metro 按 .harmony 扩展名选包）
 */
import { setStorage, type KVStorage } from '@itc/base';
import { MMKVLoader } from './mmkv';

/** MMKV 实例 ID：沿用旧原生实现的 mmapID，保留已有数据。 */
const INSTANCE_ID = 'itc-storage';

let mmkv: ReturnType<MMKVLoader['initialize']> | null = null;

/** 懒初始化 MMKV（首次调用触发原生 JSI 安装；未接入原生会抛错，由 installStorage 兜底）。 */
function kv(): ReturnType<MMKVLoader['initialize']> {
  if (mmkv == null) {
    mmkv = new MMKVLoader().withInstanceID(INSTANCE_ID).initialize();
  }
  return mmkv;
}

/** KVStorage 实现，桥接 MMKV。MMKV 的 get* 在 key 不存在时返回 null/undefined，统一归一为 null。 */
class ItcStorage implements KVStorage {
  getString(key: string): string | null {
    return kv().getString(key) ?? null;
  }
  set(key: string, value: string): void {
    kv().setString(key, value);
  }
  getBoolean(key: string): boolean | null {
    return kv().getBool(key) ?? null;
  }
  setBoolean(key: string, value: boolean): void {
    kv().setBool(key, value);
  }
  delete(key: string): void {
    kv().removeItem(key);
  }
  contains(key: string): boolean {
    return kv().indexer.hasKey(key);
  }
  clearAll(): void {
    kv().clearStore();
  }
}

/** 单例。 */
export const storage: KVStorage = new ItcStorage();

/**
 * 注入到 @itc/base 全局 storage 代理（宿主启动时调用一次）。
 * **探测式**：先试初始化 MMKV，原生未构建（某端没接入/没重编）则不注入、
 * 保留 @itc/base 内存兜底，避免崩溃。返回是否启用了持久化后端。
 */
export function installStorage(): boolean {
  try {
    kv().indexer.hasKey('__itc_storage_probe__');
    setStorage(storage);
    return true;
  } catch (e) {
    mmkv = null; // 回退：下次再探测；保留内存兜底
    return false;
  }
}
