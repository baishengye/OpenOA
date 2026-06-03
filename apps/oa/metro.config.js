const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Android / iOS / Metro dev server 用的标准 RN 配置（monorepo 感知）。
// 鸿蒙的打包用单独的 metro.config.harmony.js（bundle-harmony --config 指定），
// 避免把 RNOH 的 harmony polyfill/解析混进标准 RN 包导致运行时崩溃（performance.now undefined）。
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
    // pnpm 依赖在 .pnpm 嵌套 node_modules，必须保留逐级向上查找。
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), monorepoConfig);
