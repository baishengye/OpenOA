# @itc/biometric 模块规范

## 概述

**@itc/biometric** 是 OpenOA 项目的生物识别模块，提供指纹/人脸认证和生物特征绑定的密钥签名（钉钉式免密登录）。支持 Android / iOS / 鸿蒙 NEXT 三端。

**核心功能：**
- 能力探测：枚举设备支持的生物识别模态（指纹/面部/虹膜）
- 认证：基于强度的生物识别认证，支持按模态定向（仅鸿蒙）
- 生物绑定密钥：EC P-256 密钥存储于安全硬件，签名需生物验证

**设计原则：**
- 结果类语义：认证结果统一 `resolve({ success, usedKind, reason })`，失败不 reject
- 密钥安全：生物特征重新录入后密钥自动失效
- 平台差异抽象：iOS/Android 无法定向模态，统一返回 `not_directable`

---

## 2. 模块契约

### 2.1 导出常量

```typescript
/** 按位掩码标志（用于 mask 字段） */
export declare const BIOMETRY_BIT: {
  readonly fingerprint: 1;
  readonly face: 2;
  readonly iris: 4;
};
```

### 2.2 类型定义

```typescript
/** 生物识别模态 */
type BiometryKind = 'fingerprint' | 'face' | 'iris';

/** 生物识别强度 */
type BiometryStrength = 'strong' | 'weak' | 'none';

/** 单个模态的能力项 */
interface CapabilityItem {
  kind: BiometryKind;           // 模态类型
  hardware: boolean;            // 是否有硬件
  enrolled: boolean;            // 是否已录入
  available: boolean;           // 当前是否可用
  strength: BiometryStrength;   // 强度等级
  directable: boolean;          // 是否支持定向认证（iOS/Android=false，鸿蒙=true）
  reason: string;               // 不可用原因（见 AuthFailReason）
}

/** getCapabilities 返回 */
interface CapabilitiesResult {
  mask: number;                 // 按位掩码（fingerprint|face|iris）
  items: CapabilityItem[];      // 各模态能力详情
}

/** 认证失败原因 */
type AuthFailReason =
  | 'failed'                    // 认证失败
  | 'canceled'                  // 用户取消
  | 'lockout'                   // 锁定（多次失败）
  | 'timeout'                   // 超时
  | 'not_enrolled'              // 未录入
  | 'not_supported'             // 不支持/无硬件
  | 'not_directable'            // 不支持定向认证（iOS/Android 使用 authenticate 时）
  | 'busy'                      // 认证服务忙
  | '';                         // 成功时为空

/** 认证结果（结果类语义，失败也 resolve） */
interface AuthResult {
  success: boolean;
  usedKind: BiometryKind | '';  // 实际使用的模态
  reason: AuthFailReason;
}

/** 密钥信息 */
interface KeyPairInfo {
  publicKey: string;            // Base64 编码公钥
}

/** 签名结果 */
interface SignResult {
  signatureBase64: string;      // Base64 编码 ECDSA 签名
}
```

### 2.3 接口定义

```typescript
interface ItcBiometricModule extends ItcModule {
  readonly name: 'biometric';

  /** 探测设备生物识别能力 */
  getCapabilities(): Promise<CapabilitiesResult>;

  /**
   * 按强度认证（系统在该等级下选择可用模态）
   * @param title 认证标题
   * @param subtitle 副标题
   * @param reason 认证原因描述
   * @param cancelLabel 取消按钮文本
   * @param allowDeviceCredential 是否允许设备密码备选
   * @param strength 期望强度：'strong' | 'weak'
   */
  authenticate(
    title: string,
    subtitle?: string,
    reason?: string,
    cancelLabel?: string,
    allowDeviceCredential?: boolean,
    strength?: BiometryStrength
  ): Promise<AuthResult>;

  /**
   * 定向认证到指定模态（仅鸿蒙支持，iOS/Android 返回 not_directable）
   */
  authenticateWith(
    kind: BiometryKind,
    title: string,
    subtitle?: string,
    reason?: string,
    cancelLabel?: string,
    allowDeviceCredential?: boolean
  ): Promise<AuthResult>;

  /** 创建生物绑定密钥（EC P-256） */
  createKey(alias: string): Promise<KeyPairInfo>;

  /** 用生物绑定密钥签名 */
  signWithKey(alias: string, payloadBase64: string, promptTitle: string): Promise<SignResult>;

  /** 删除生物绑定密钥 */
  deleteKey(alias: string): Promise<void>;

  /** 检查密钥是否存在 */
  keyExists(alias: string): Promise<boolean>;
}
```

---

## 3. 统一 API（src/index.ts）

```typescript
class BiometricModule extends BaseModule {
  readonly name = 'biometric';

  async isSupported(): Promise<boolean> {
    try {
      const result = await this.getCapabilities();
      return result.mask > 0;
    } catch {
      return false;
    }
  }

  protected async onInit(): Promise<void> {
    // 无需初始化
  }

  protected async onDestroy(): Promise<void> {
    // 无需清理
  }

  async getCapabilities(): Promise<CapabilitiesResult> {
    return NativeItcBiometric.getCapabilities();
  }

  async authenticate(
    title: string,
    subtitle = '',
    reason = '',
    cancelLabel = '',
    allowDeviceCredential = false,
    strength: BiometryStrength = 'strong'
  ): Promise<AuthResult> {
    try {
      return await NativeItcBiometric.authenticate(
        title, subtitle, reason, cancelLabel, allowDeviceCredential, strength
      );
    } catch (e) {
      throw ItcError.from(e, 'biometric');
    }
  }

  async authenticateWith(
    kind: BiometryKind,
    title: string,
    subtitle = '',
    reason = '',
    cancelLabel = '',
    allowDeviceCredential = false
  ): Promise<AuthResult> {
    try {
      return await NativeItcBiometric.authenticateWith(
        kind, title, subtitle, reason, cancelLabel, allowDeviceCredential
      );
    } catch (e) {
      throw ItcError.from(e, 'biometric');
    }
  }

  async createKey(alias: string): Promise<KeyPairInfo> {
    try {
      return await NativeItcBiometric.createKey(alias);
    } catch (e) {
      throw ItcError.from(e, 'biometric');
    }
  }

  async signWithKey(alias: string, payloadBase64: string, promptTitle: string): Promise<SignResult> {
    try {
      return await NativeItcBiometric.signWithKey(alias, payloadBase64, promptTitle);
    } catch (e) {
      throw ItcError.from(e, 'biometric');
    }
  }

  async deleteKey(alias: string): Promise<void> {
    try {
      await NativeItcBiometric.deleteKey(alias);
    } catch (e) {
      throw ItcError.from(e, 'biometric');
    }
  }

  async keyExists(alias: string): Promise<boolean> {
    try {
      return await NativeItcBiometric.keyExists(alias);
    } catch (e) {
      throw ItcError.from(e, 'biometric');
    }
  }
}

export const biometric = new BiometricModule();
```

---

## 4. TurboModule 规格（src/NativeItcBiometric.ts）

**铁律：入参只用基本类型（string/boolean/number），避免 iOS codegen 生成 C++ 结构体。**

```typescript
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getCapabilities(): Promise<{
    mask: number;
    items: Array<{
      kind: string;
      hardware: boolean;
      enrolled: boolean;
      available: boolean;
      strength: string;
      directable: boolean;
      reason: string;
    }>;
  }>;

  authenticate(
    title: string,
    subtitle: string,
    reason: string,
    cancelLabel: string,
    allowDeviceCredential: boolean,
    strength: string
  ): Promise<{ success: boolean; usedKind: string; reason: string }>;

  authenticateWith(
    kind: string,
    title: string,
    subtitle: string,
    reason: string,
    cancelLabel: string,
    allowDeviceCredential: boolean
  ): Promise<{ success: boolean; usedKind: string; reason: string }>;

  createKey(alias: string): Promise<{ publicKey: string }>;
  signWithKey(alias: string, payloadBase64: string, promptTitle: string): Promise<{ signatureBase64: string }>;
  deleteKey(alias: string): Promise<void>;
  keyExists(alias: string): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ItcBiometric');
```

---

## 5. 原生实现

### 5.1 Android（Kotlin）

**文件：** `packages/biometric/android/src/main/java/com/itc/biometric/ItcBiometricModule.kt`

**实现要点：**
- 继承 `NativeItcBiometricSpec`（codegen 生成）
- 认证：`androidx.biometric.BiometricPrompt`
- 密钥：`android.security.keystore`，EC P-256，`setUserAuthenticationRequired(true)`
- 平台差异：无法定向模态，`authenticateWith` 返回 `not_directable`

**包注册：** `ItcBiometricPackage.kt extends BaseReactPackage`

### 5.2 iOS（ObjC++）

**文件：** `packages/biometric/ios/ItcBiometric.mm`

**实现要点：**
- 实现 `<NativeItcBiometricSpec>` 协议
- 认证：`LocalAuthentication`（Face ID / Touch ID）
- 密钥：`Security.framework`（Secure Enclave），EC P-256
- 平台差异：
  - 一台设备只有一种生物模态
  - `biometryType` 只读，无法枚举多模态
  - 公钥导出为 ANSI X9.63（04||X||Y），与 Android(DER) 不同

**包注册：** `RCT_EXPORT_MODULE(ItcBiometric)`

### 5.3 鸿蒙（ArkTS）

**文件：**
- `packages/biometric/harmony/biometric/src/main/ets/BiometricTurboModule.ets`
- `packages/biometric/harmony/biometric/src/main/ets/BiometricPackage.ets`

**实现要点：**
- 继承 `UITurboModule`（`@rnoh/react-native-openharmony/ts`）
- 认证：`@kit.UserAuthenticationKit`（userAuth）
- 密钥：`@kit.UniversalKeystoreKit`（HUKS），EC P-256
- **平台优势：`directable=true`，`authenticateWith` 真支持定向认证**
- 公钥导出为 ANSI X9.63，与 iOS 一致

**包注册：** `ItcBiometricPackage extends RNOHPackage`，使用 `getUITurboModuleFactoryByNameMap`

### 5.4 C++ 桥接（鸿蒙）

**文件：**
- `packages/biometric/harmony/biometric/src/main/cpp/RNOH/generated/turbo_modules/ItcBiometric.h`
- `packages/biometric/harmony/biometric/src/main/cpp/RNOH/generated/turbo_modules/ItcBiometric.cpp`
- `packages/biometric/harmony/biometric/src/main/cpp/RNOH/generated/BaseItcBiometricPackage.h`

**接入 app：**
- `apps/oa/harmony/entry/src/main/cpp/CMakeLists.txt` 添加 cpp 路径
- `apps/oa/harmony/entry/src/main/cpp/PackageProvider.cpp` 注册 `BaseItcBiometricPackage`
- `apps/oa/harmony/entry/src/main/ets/RNPackagesFactory.ets` 注册 `ItcBiometricPackage`

---

## 6. 错误处理

### 6.1 ItcError 映射

| 原生错误码 | ErrorCode | 场景 |
|-----------|-----------|------|
| `NATIVE_MODULE_UNAVAILABLE` | `NATIVE_MODULE_UNAVAILABLE` | 当前无可用 Activity |
| `INVALID_ARGUMENT` | `INVALID_ARGUMENT` | 参数非法（如 payloadBase64 格式错误） |
| `BIOMETRY_KEY_INVALIDATED` | `BIOMETRY_KEY_INVALIDATED` | 密钥已失效（生物重新录入） |
| `USER_CANCELED` | `USER_CANCELED` | 用户取消签名 |
| 其余 | `UNKNOWN` | 未知错误 |

### 6.2 认证结果语义

```typescript
// 认证结果统一 resolve，失败不 reject
const result = await biometric.authenticate('验证身份');
if (result.success) {
  // 认证成功
} else {
  // 失败：result.reason 指示原因
  switch (result.reason) {
    case 'canceled':    // 用户主动取消
    case 'lockout':     // 锁定，需等待或到系统设置解锁
    case 'not_enrolled':// 未录入生物特征
    case 'not_supported':// 设备不支持
      // ...
  }
}
```

---

## 7. 平台差异汇总

| 特性 | Android | iOS | 鸿蒙 |
|------|---------|-----|------|
| 指纹 | ✅ | ✅ (Touch ID) | ✅ |
| 人脸 | ✅ | ✅ (Face ID) | ✅ |
| 虹膜 | ✅ | ❌ | ❌ |
| 定向认证 | ❌ (not_directable) | ❌ (not_directable) | ✅ |
| 多模态枚举 | ✅ (PackageManager) | ❌ (只读 biometryType) | ✅ |
| 强生物识别 | BIOMETRIC_STRONG | 始终 strong | ATL3 |
| 密钥存储 | Android Keystore | Secure Enclave | HUKS |
| 密钥失效条件 | 重新录入生物 | biometryCurrentSet | 重新录入 |
| 公钥格式 | DER (SPKI) | ANSI X9.63 | ANSI X9.63 |
| 签名算法 | ECDSA SHA256 | ECDSA SHA256 | ECDSA SHA256 |

---

## 8. 依赖关系

**peerDependencies：**
- `@itc/base`：依赖 `BaseModule`、`ItcError`
- `react-native`：>= 0.77.0

**内部依赖：**
- `@itc/base`（workspace）

**原生依赖：**
- Android：`androidx.biometric:biometric:1.1.0`
- iOS：`LocalAuthentication.framework`、`Security.framework`（系统框架）
- 鸿蒙：`@kit.UserAuthenticationKit`、`@kit.UniversalKeystoreKit`、`@kit.CryptoArchitectureKit`

---

## 9. 使用示例

### 9.1 探测生物识别能力

```typescript
import { biometric } from '@itc/biometric';

const caps = await biometric.getCapabilities();
console.log('可用模态:', caps.mask);  // 如 3 = 指纹+人脸

const hasFace = caps.mask & BIOMETRY_BIT.face;
if (!hasFace) {
  console.log('不支持人脸识别');
}
```

### 9.2 生物识别认证

```typescript
import { biometric } from '@itc/biometric';

const result = await biometric.authenticate(
  '验证身份',       // title
  '',               // subtitle
  '用于登录验证',   // reason
  '取消',           // cancelLabel
  false,            // allowDeviceCredential
  'strong'          // strength
);

if (result.success) {
  console.log('认证成功，使用模态:', result.usedKind);
} else {
  console.log('认证失败:', result.reason);
}
```

### 9.3 生物绑定密钥（免密登录）

```typescript
import { biometric } from '@itc/biometric';

const ALIAS = 'user_auth_key';

// 创建密钥
const keyInfo = await biometric.createKey(ALIAS);
console.log('公钥:', keyInfo.publicKey);
// 将公钥发送给服务器绑定

// 签名（需生物验证）
const payload = '登录挑战数据';
const payloadBase64 = btoa(payload);
const sigResult = await biometric.signWithKey(ALIAS, payloadBase64, '签名验证');
console.log('签名:', sigResult.signatureBase64);
```

### 9.4 鸿蒙定向认证（仅鸿蒙）

```typescript
import { biometric } from '@itc/biometric';

// 定向到指纹认证
const result = await biometric.authenticateWith(
  'fingerprint',
  '指纹验证',
  '',
  '用于签名验证',
  '取消',
  false
);

if (result.success) {
  console.log('指纹认证成功');
}
```

---

## 10. 导出清单

```typescript
// 模块实例
export { biometric };

// 常量
export { BIOMETRY_BIT };

// 类型
export type {
  BiometryKind,
  BiometryStrength,
  CapabilityItem,
  CapabilitiesResult,
  AuthFailReason,
  AuthResult,
  KeyPairInfo,
  SignResult,
};
```
