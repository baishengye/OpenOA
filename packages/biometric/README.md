# @itc/biometric

可剥离复用的**生物识别模块**——指纹 / 人脸认证 + 生物特征绑定密钥签名（钉钉式免密登录）。三端：Android / iOS / 鸿蒙 NEXT。

> 本模块是 OpenDingDing 的**首个样板模块**：push / im 沿用完全相同的结构（TS 统一 API + codegen spec + 三端原生 + 实现 `@itc/base` 的 `ItcModule` 契约）。

## API

```ts
import { biometric } from '@itc/biometric';

await biometric.isSupported();            // boolean，三端能力探测/降级入口（ItcModule 契约）
await biometric.getAvailability();         // { available, biometryType, reason? }

await biometric.authenticate({ title: '验证身份', reason: '解锁应用', allowDeviceCredential: true });

// 免密登录闭环
const { publicKey } = await biometric.createKey('login');   // 注册到后端
const { signatureBase64 } = await biometric.signWithKey('login', challengeBase64, '指纹登录');
await biometric.keyExists('login');
await biometric.deleteKey('login');
```

失败统一抛 `@itc/base` 的 `ItcError`（`error.code` 为 `ErrorCode`，如 `USER_CANCELED` / `BIOMETRY_LOCKOUT`）。

## 三端实现

| 端 | 认证 | 密钥/签名 | 文件 |
|---|---|---|---|
| Android | AndroidX BiometricPrompt | Android Keystore EC P-256（`setUserAuthenticationRequired`） | [android/](android/) |
| iOS | LocalAuthentication (LAContext) | Secure Enclave EC P-256（`biometryCurrentSet`） | [ios/](ios/) |
| 鸿蒙 NEXT | UserAuthenticationKit (userAuth) | HUKS EC P-256（生物绑定，challenge→authToken→finish） | [harmony/](harmony/) |

## 接入

- **Android / iOS**：RN autolinking 自动发现（依赖 `codegenConfig` + `android`/`ios` 目录）。iOS 需 `pod install`；`Info.plist` 加 `NSFaceIDUsageDescription`。
- **鸿蒙**：宿主 harmony 工程在 `oh-package.json5` 依赖本模块的 `harmony/biometric`，并在 RNOH `RNPackagesFactory` 注册 `ItcBiometricPackage`。

## 注意
- **公钥格式不一致**：Android 导出 DER(SPKI)，iOS / 鸿蒙导出 X9.63 原始格式（`04||X||Y`）。后端验签需按平台标识归一化。
- 鸿蒙 HUKS 生物绑定签名的 `authToken` 透传需真机验证（不同 ROM API 版本可能微调）。
