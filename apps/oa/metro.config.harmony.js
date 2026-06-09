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

// RNOH 0.82.30 的 ReactDevToolsSettingsManager 只有 .android.js / .ios.js，缺 harmony 变体。
// 它被 setUpReactDevTools.js 在 `if (__DEV__)` 块里 require，所以：
//   - 离线 release 包（__DEV__=false，DevEco 跑的 bundle.harmony.js）死代码消除会删掉整块，无碍；
//   - Metro dev server（__DEV__=true）会真正解析它 → harmony 平台找不到文件 → 白屏。
// 仅对 harmony 平台、精确尾路径匹配，重定向到本地 stub（避免误伤 specs/Native…SettingsManager）。
const HARMONY_STUBS = {
  'devsupport/rndevtools/ReactDevToolsSettingsManager': path.resolve(
    projectRoot,
    'src/stubs/ReactDevToolsSettingsManager.js',
  ),
};

// createHarmonyMetroConfig 自身在 resolver.resolveRequest 里把 `react-native` 等重定向到
// @react-native-oh/react-native-harmony（提供 Platform/AppState 等 harmony 实现）。
// 我们要扩展解析逻辑，但**绝不能覆盖**它，否则 Platform 等会解析到标准 RN → `Platform.select`
// of undefined 崩溃。做法：拿到它的原始 resolveRequest，自定义逻辑处理完后**委托回它**。
const harmonyConfig = createHarmonyMetroConfig({
  reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
});
const harmonyResolveRequest = harmonyConfig.resolver && harmonyConfig.resolver.resolveRequest;
// fallback：若某版本的 RNOH 未提供 resolveRequest，则退回 metro 默认解析。
const delegateResolve = (context, moduleName, platform) =>
  harmonyResolveRequest
    ? harmonyResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);

const monorepoConfig = {
  projectRoot,
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    resolveRequest: (context, moduleName, platform) => {
      if (platform === 'harmony') {
        // 补 RNOH dev-only 缺失文件 stub（本地文件，直接返回，无需 harmony 解析）。
        // 注意：react-native-code-push / mmkv-storage / op-sqlite → oh-tpl 移植包的重定向，
        // 以及 react-native → harmony 版（Platform/AppState 等），都由 RNOH 的 resolveRequest
        // 自动完成（见 bundle-harmony 日志 "Redirected imports..."），此处只补它不管的 stub。
        const stubKey = Object.keys(HARMONY_STUBS).find(k => moduleName.endsWith(k));
        if (stubKey) {
          return { type: 'sourceFile', filePath: HARMONY_STUBS[stubKey] };
        }
      }
      // 其余一律委托回 RNOH 原始 resolveRequest，保留其全部 harmony 重定向。
      return delegateResolve(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), harmonyConfig, monorepoConfig);
