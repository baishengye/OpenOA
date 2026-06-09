/**
 * 热修复鸿蒙侧初始化。对外只暴露 initHotfix + HotfixConfig，封装底层 OTA 后端细节。
 *
 * 背景：底层 OTA 后端（CodePush 移植包）在 turbo module 构造时会读全局存储里的部署配置，
 * key 名由该 HAR 内部写死（CodePushBuilder.ts: `AppStorage.Get("CodePushConfig")[...]`），
 * 缺失会在构造时 `undefined[...]` 崩。此处封装该约束，调用方（EntryAbility）只需 initHotfix()。
 */

/** 热修复部署配置（中性命名，与具体 OTA 后端解耦）。值留空 = 待接入自建热修复服务端。 */
export interface HotfixConfig {
  staging?: string;
  production?: string;
  serverUrl?: string;
  publicKey?: string;
}

/** 底层 OTA 后端实际读取的全局存储结构（key 名由 HAR 锁定，不可改）。 */
interface OtaDeploymentConfig {
  Staging: string;
  Production: string;
  ServerUrl: string;
  PublicKey: string;
}

/**
 * 初始化热修复。**必须在 RN 实例化前调用**（EntryAbility.onCreate 内、super.onCreate 之前）。
 * @param config 部署配置；不传则全部留空（OTA 不工作但不崩，待配置自建服务端）。
 */
export function initHotfix(config?: HotfixConfig): void {
  AppStorage.setOrCreate<OtaDeploymentConfig>('CodePushConfig', {
    Staging: config?.staging ?? '',
    Production: config?.production ?? '',
    ServerUrl: config?.serverUrl ?? '',
    PublicKey: config?.publicKey ?? '',
  });
}
