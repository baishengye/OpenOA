/**
 * MMKV 平台入口（默认：Android / iOS）。
 * 用 `react-native-mmkv-storage`（ammarahm-ed），新架构由 0.11+ 起支持。
 *
 * 鸿蒙端见 `mmkv.harmony.ts`：Metro 在 harmony 平台优先解析 `.harmony.ts`，
 * 切到 RNOH 移植包 `@react-native-oh-tpl/react-native-mmkv-storage`（API 一致）。
 */
export { MMKVLoader } from 'react-native-mmkv-storage';
