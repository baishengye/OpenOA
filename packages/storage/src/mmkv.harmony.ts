/**
 * MMKV 平台入口（鸿蒙 NEXT / RNOH）。
 * 切到 OpenHarmony-RN 移植包，JS API 与上游 `react-native-mmkv-storage` 一致。
 * 原生接线（.har / CMake / PackageProvider / 权限）见 apps/oa/harmony。
 */
export { MMKVLoader } from '@react-native-oh-tpl/react-native-mmkv-storage';
