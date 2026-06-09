/**
 * Harmony stub for RNOH 0.82.30's ReactDevToolsSettingsManager（只有 .android.js/.ios.js）。
 * 仅在 Metro dev server（__DEV__=true）下被 setUpReactDevTools 引用，用于持久化 DevTools hook 设置。
 * harmony 上无对应 native module；返回 null 让 DevTools 走默认设置即可，setGlobalHookSettings 设为 no-op。
 */
export function setGlobalHookSettings(_settings) {}
export function getGlobalHookSettings() {
  return null;
}
