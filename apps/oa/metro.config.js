const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Android / iOS / Metro dev server 用的标准 RN 配置（monorepo 感知）。
// 鸿蒙的打包用单独的 metro.config.harmony.js（bundle-harmony --config 指定），
// 避免把 RNOH 的 harmony polyfill/解析混进标准 RN 包导致运行时崩溃（performance.now undefined）。
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// pnpm 会为 react-native 生成多个 peer 变体实例（.pnpm/react-native@…_<hash>），
// 不同 workspace 包 import 的 `react-native` 被 Metro 解析到不同实例，导致 bundle 里
// 出现多份 RN 核心模块（ReactNativeViewConfigRegistry / NativeComponentRegistry 等）。
// 后果：codegenNativeComponent 把静态 viewConfig 注册进实例 A 的注册表，渲染器却从
// 实例 B 的注册表 lookup → 第三方 Fabric 组件（如 RNCSafeAreaProvider）view config
// 取到 undefined → 新架构(bridgeless)下红屏。
// 解决：强制所有 `react-native` 及其子路径都解析到 app 自己的那一份实例。
const reactNativeRoot = path.dirname(
  require.resolve('react-native/package.json', { paths: [projectRoot] }),
);
const reactNativeOrigin = path.join(reactNativeRoot, 'index.js');

const monorepoConfig = {
  projectRoot,
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    // pnpm 依赖在 .pnpm 嵌套 node_modules，必须保留逐级向上查找。
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react-native' || moduleName.startsWith('react-native/')) {
        // 把解析起点钉到唯一的 RN 实例目录，保留 Metro 的平台扩展(.ios/.android)解析。
        return context.resolveRequest(
          { ...context, originModulePath: reactNativeOrigin },
          moduleName,
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), monorepoConfig);
