# @itc/biometric

可剥离复用的**生物识别模块**——指纹 / 人脸认证 + 生物特征绑定密钥签名（钉钉式免密登录）。三端：Android / iOS / 鸿蒙 NEXT。

> 本模块是 OpenOA 的**首个样板模块**：push / im 沿用完全相同的结构（TS 统一 API + codegen spec + 三端原生 + 实现 `@itc/base` 的 `ItcModule` 契约）。

## 在其他 app 中引入

**1. 加依赖**
```jsonc
// app/package.json
{
  "dependencies": {
    "@itc/base": "workspace:*",        // 错误模型 / ItcModule 契约依赖
    "@itc/biometric": "workspace:*"    // monorepo 外发布后用版本号
  }
}
```
```bash
pnpm install
```

**2. 原生接入**（本模块含 android/ios/harmony 原生 + codegen spec）
- **Android**：RN autolinking 自动发现，无需手动。
- **iOS**：`cd ios && pod install`；`Info.plist` 加 `NSFaceIDUsageDescription`（Face ID 用途说明，缺了会崩）。
- **鸿蒙**：宿主 harmony 工程在 `oh-package.json5` 依赖本模块的 `harmony/biometric`，并在 RNOH `RNPackagesFactory` 注册 `ItcBiometricPackage`；改 `oh-package.json5` 后先 `ohpm install`（或 DevEco Sync）再 build。

**3. 用法**：见下方 [API](#api)。失败统一 `try/catch` 兜 `@itc/base` 的 `ItcError`。

## API

```ts
import { biometric } from '@itc/biometric';

await biometric.isSupported();            // boolean，三端能力探测/降级入口（ItcModule 契约）
await biometric.getAvailability();         // { available, biometryType, reason? }

await biometric.authenticate({ title: '验证身份', reason: '解锁应用', allowDeviceCredential: true });

// 免密登录闭环
const { publicKey } = await biometric.createKey('login');   // 注册到后端；若旧密钥已失效会自动重建
const { signatureBase64 } = await biometric.signWithKey('login', challengeBase64, '指纹登录');
await biometric.keyExists('login');
await biometric.deleteKey('login');
```

失败统一抛 `@itc/base` 的 `ItcError`（`error.code` 为 `ErrorCode`，如 `USER_CANCELED` / `BIOMETRY_LOCKOUT`）。

### 认证强度（`allowWeakBiometric`）

`authenticate({ allowWeakBiometric })` 控制基础认证可接受的生物识别强度：

- `false`（默认）：仅强生物识别（Class 3，指纹 / 3D 结构光人脸）。
- `true`：额外允许弱生物识别（Class 2，安卓多数机型的摄像头人脸）。

⚠️ 平台约束：**Android 不允许 App 指定用指纹还是人脸**，只能请求安全等级，由系统决定弹哪种（有强的就不会用弱）。**免密签名 `createKey`/`signWithKey` 始终要求强生物识别**——安卓摄像头人脸是弱的，用不了密钥签名。iOS Face ID 本即强，忽略此参数。

### 密钥失效保护

密钥绑定 `setInvalidatedByBiometricEnrollment` / `biometryCurrentSet`：**系统增删指纹/人脸后旧密钥永久失效**（抛 `BIOMETRY_KEY_INVALIDATED` / 2004）。`createKey` 会检测失效密钥并**自动删除重建**，上层重新拿到新公钥注册即可。

## 三端实现

| 端 | 认证 | 密钥/签名 | 文件 |
|---|---|---|---|
| Android | AndroidX BiometricPrompt | Android Keystore EC P-256（`setUserAuthenticationRequired`） | [android/](android/) |
| iOS | LocalAuthentication (LAContext) | Secure Enclave EC P-256（`biometryCurrentSet`） | [ios/](ios/) |
| 鸿蒙 NEXT | UserAuthenticationKit (userAuth) | HUKS EC P-256（生物绑定，challenge→authToken→finish） | [harmony/](harmony/) |

## 注意
- **公钥格式不一致**：Android 导出 DER(SPKI)，iOS / 鸿蒙导出 X9.63 原始格式（`04||X||Y`）。后端验签需按平台标识归一化。
- 鸿蒙 HUKS 生物绑定签名的 `authToken` 透传需真机验证（不同 ROM API 版本可能微调）。
