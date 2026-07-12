/**
 * harmony-codegen.config.js - Harmony Codegen 配置
 */
module.exports = {
  /**
   * 库级 codegen 包的列表
   */
  libraryCodegenPackages: [
    '@itc/rn-client-sdk-plus',
    '@itc/biometric',
  ],

  /**
   * 额外排除的模块名（精确匹配）
   */
  excludeModules: [],

  /**
   * 排除的 app 列表
   */
  excludeApps: [],
};
