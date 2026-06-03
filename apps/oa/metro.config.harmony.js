const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// 仅用于鸿蒙打包（bundle-harmony --config metro.config.harmony.js）。
// createHarmonyMetroConfig 在 platform=harmony 时把 react-native 解析到 RNOH 分支并接入
// harmony polyfill；必须与 getDefaultConfig 一起 merge（否则缺 metro 0.83 的 asyncRequire 等默认项）。
// 不能用于 android/ios（会破坏标准 RN 运行时）。
const {
  createHarmonyMetroConfig,
} = require('@react-native-oh/react-native-harmony/metro.config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const monorepoConfig = {
  projectRoot,
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(
  getDefaultConfig(projectRoot),
  createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
  }),
  monorepoConfig,
);
