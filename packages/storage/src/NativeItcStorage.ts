/**
 * KV 存储 TurboModule 规格（codegen 输入）。
 *
 * 全部为**同步**方法（KV 读写需同步语义，匹配 @itc/base 的 KVStorage 接口）。
 * 三端原生实现名为 `ItcStorage`：
 *  - Android: MMKV（com.tencent:mmkv）
 *  - iOS:     MMKV（pod）
 *  - 鸿蒙:    ArkData preferences（getSync/putSync）
 *
 * 约定：getString/getBoolean 在 key 不存在时分别返回 '' / false；存在性用 contains 判定。
 * JS 层 src/index.ts 据此映射为 KVStorage 的 `string | null` / `boolean | null`。
 */
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  setString(key: string, value: string): void;
  getString(key: string): string;
  setBoolean(key: string, value: boolean): void;
  getBoolean(key: string): boolean;
  contains(key: string): boolean;
  remove(key: string): void;
  clearAll(): void;
}

// 用 get（找不到返回 null）而非 getEnforcing（找不到会在 import 时抛 TypeError），
// 以便某端未接入原生时 import 本模块也不崩；可用性由 index.ts 的 installStorage 探测。
export default TurboModuleRegistry.get<Spec>('ItcStorage');
