// monorepo 下 autolinking 从 hoisted node_modules 解析 @itc/* 原生模块。
// 多数情况无需手动配置；若 CLI 未自动发现，可在此显式声明 dependencies 路径。
module.exports = {
  project: {
    ios: { sourceDir: './ios' },
    android: { sourceDir: './android' },
  },
  dependencies: {
    // RNOH 专用移植包，无 podspec / gradle 插件，仅鸿蒙使用，排除 iOS/Android autolink。
    '@react-native-oh-tpl/react-native-mmkv-storage': {
      platforms: { ios: null, android: null },
    },
  },
};
