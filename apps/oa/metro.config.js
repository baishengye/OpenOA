const path = require('path');
const { mergeConfig } = require('@react-native/metro-config');
const { getDefaultConfig } = require('@react-native/metro-config');
// RNOH 提供的 harmony 平台解析包装（让同一个 Metro 同时服务 android/ios/harmony）
const {
  createHarmonyMetroConfig,
} = require('@react-native-oh/react-native-harmony/metro.config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/**
 * Monorepo 配置：监听仓库根（pnpm workspace 下 @itc/* 源码在 packages/ 下），
 * 并把根 node_modules 纳入解析路径。
 */
const monorepoConfig = {
  projectRoot,
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // 注意：pnpm 的依赖在 .pnpm 嵌套 node_modules 中，必须保留逐级向上查找
    // （hierarchical lookup），否则 react-native 的传递依赖（如 invariant）解析失败。
  },
};

module.exports = mergeConfig(
  getDefaultConfig(projectRoot),
  createHarmonyMetroConfig({
    reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
  }),
  monorepoConfig
);
