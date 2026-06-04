#import "ItcBiometric.h"
#import <LocalAuthentication/LocalAuthentication.h>
#import <Security/Security.h>

// codegen 生成的协议头（名称来自 package.json codegenConfig.name = RNItcBiometricSpec）。
// 首次 `pod install` 后可在 Pods 的 generated 目录查看 NativeItcBiometricSpec 协议签名。
#import <RNItcBiometricSpec/RNItcBiometricSpec.h>

@implementation ItcBiometric

RCT_EXPORT_MODULE()

#pragma mark - Helpers

static NSData *TagData(NSString *alias) {
  return [[@"com.itc.biometric." stringByAppendingString:alias]
      dataUsingEncoding:NSUTF8StringEncoding];
}

static SecKeyRef CopyPrivateKey(NSString *alias) {
  NSDictionary *query = @{
    (id)kSecClass : (id)kSecClassKey,
    (id)kSecAttrKeyType : (id)kSecAttrKeyTypeECSECPrimeRandom,
    (id)kSecAttrApplicationTag : TagData(alias),
    (id)kSecReturnRef : @YES,
  };
  SecKeyRef key = NULL;
  OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, (CFTypeRef *)&key);
  return status == errSecSuccess ? key : NULL;
}

#pragma mark - 能力枚举

// iOS 一台设备只有一种生物模态（Face ID 或 Touch ID），无法定向、无法枚举多模态。
- (void)getCapabilities:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject {
  LAContext *context = [LAContext new];
  NSError *error = nil;
  BOOL available =
      [context canEvaluatePolicy:LAPolicyDeviceOwnerAuthenticationWithBiometrics
                           error:&error];

  NSString *kind = nil;
  NSUInteger bit = 0;
  if (context.biometryType == LABiometryTypeFaceID) {
    kind = @"face"; bit = 2;
  } else if (context.biometryType == LABiometryTypeTouchID) {
    kind = @"fingerprint"; bit = 1;
  }

  NSMutableArray *items = [NSMutableArray array];
  NSUInteger mask = 0;
  if (kind != nil) {
    BOOL hardware = YES;
    BOOL enrolled = available;
    NSString *reason = @"";
    if (!available) {
      switch (error.code) {
        case LAErrorBiometryNotEnrolled: enrolled = NO; reason = @"not_enrolled"; break;
        case LAErrorBiometryLockout: enrolled = YES; reason = @"lockout"; break;
        case LAErrorBiometryNotAvailable: hardware = NO; enrolled = NO; reason = @"not_supported"; break;
        default: reason = @"unknown"; break;
      }
    }
    if (available) mask = bit;
    [items addObject:@{
      @"kind" : kind,
      @"hardware" : @(hardware),
      @"enrolled" : @(enrolled),
      @"available" : @(available),
      @"strength" : @"strong",   // iOS 生物识别均为强
      @"directable" : @NO,
      @"reason" : reason,
    }];
  }
  resolve(@{ @"mask" : @(mask), @"items" : items });
}

#pragma mark - 认证

// 按强度认证（iOS 无弱生物，strength 忽略；系统用设备唯一的生物模态）。结果类语义：失败也 resolve。
- (void)authenticate:(NSString *)title
            subtitle:(NSString *)subtitle
              reason:(NSString *)reason
         cancelLabel:(NSString *)cancelLabel
allowDeviceCredential:(BOOL)allowDeviceCredential
            strength:(NSString *)strength
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  (void)subtitle;
  (void)strength;
  LAContext *context = [LAContext new];
  if (cancelLabel.length > 0) {
    context.localizedCancelTitle = cancelLabel;
  }
  LAPolicy policy = allowDeviceCredential
      ? LAPolicyDeviceOwnerAuthentication
      : LAPolicyDeviceOwnerAuthenticationWithBiometrics;
  NSString *localizedReason = reason.length > 0 ? reason : title;
  NSString *usedKind = (context.biometryType == LABiometryTypeFaceID)
      ? @"face"
      : (context.biometryType == LABiometryTypeTouchID ? @"fingerprint" : @"");

  [context evaluatePolicy:policy
          localizedReason:localizedReason
                    reply:^(BOOL success, NSError *_Nullable err) {
    if (success) {
      resolve(@{ @"success" : @YES, @"usedKind" : usedKind, @"reason" : @"" });
      return;
    }
    NSString *r = @"failed";
    switch (err.code) {
      case LAErrorUserCancel:
      case LAErrorAppCancel:
      case LAErrorSystemCancel:
        r = @"canceled";
        break;
      case LAErrorBiometryLockout:
        r = @"lockout";
        break;
      case LAErrorBiometryNotEnrolled:
        r = @"not_enrolled";
        break;
      case LAErrorBiometryNotAvailable:
        r = @"not_supported";
        break;
      default:
        break;
    }
    resolve(@{ @"success" : @NO, @"usedKind" : @"", @"reason" : r });
  }];
}

// iOS 无法定向到指定模态（系统 API 不接受模态参数）。统一返回 not_directable。
- (void)authenticateWith:(NSString *)kind
                   title:(NSString *)title
                subtitle:(NSString *)subtitle
                  reason:(NSString *)reason
             cancelLabel:(NSString *)cancelLabel
   allowDeviceCredential:(BOOL)allowDeviceCredential
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject {
  (void)kind; (void)title; (void)subtitle; (void)reason;
  (void)cancelLabel; (void)allowDeviceCredential;
  resolve(@{ @"success" : @NO, @"usedKind" : @"", @"reason" : @"not_directable" });
}

#pragma mark - 生物绑定密钥（Secure Enclave）

- (void)createKey:(NSString *)alias
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  SecKeyRef existing = CopyPrivateKey(alias);
  if (existing) {
    [self resolvePublicKeyFor:existing resolve:resolve reject:reject];
    CFRelease(existing);
    return;
  }

  CFErrorRef acError = NULL;
  // biometryCurrentSet：重新录入生物特征后密钥失效，与 Android 行为对齐。
  SecAccessControlRef access = SecAccessControlCreateWithFlags(
      kCFAllocatorDefault,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      kSecAccessControlPrivateKeyUsage | kSecAccessControlBiometryCurrentSet,
      &acError);
  if (!access) {
    reject(@"UNKNOWN", @"创建 AccessControl 失败", (__bridge NSError *)acError);
    if (acError) CFRelease(acError);
    return;
  }

  NSDictionary *attributes = @{
    (id)kSecAttrKeyType : (id)kSecAttrKeyTypeECSECPrimeRandom,
    (id)kSecAttrKeySizeInBits : @256,
    (id)kSecAttrTokenID : (id)kSecAttrTokenIDSecureEnclave,
    (id)kSecPrivateKeyAttrs : @{
      (id)kSecAttrIsPermanent : @YES,
      (id)kSecAttrApplicationTag : TagData(alias),
      (id)kSecAttrAccessControl : (__bridge id)access,
    },
  };

  CFErrorRef genError = NULL;
  SecKeyRef privateKey =
      SecKeyCreateRandomKey((__bridge CFDictionaryRef)attributes, &genError);
  CFRelease(access);
  if (!privateKey) {
    reject(@"UNKNOWN", @"生成密钥失败", (__bridge NSError *)genError);
    if (genError) CFRelease(genError);
    return;
  }
  [self resolvePublicKeyFor:privateKey resolve:resolve reject:reject];
  CFRelease(privateKey);
}

- (void)resolvePublicKeyFor:(SecKeyRef)privateKey
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject {
  SecKeyRef publicKey = SecKeyCopyPublicKey(privateKey);
  if (!publicKey) {
    reject(@"UNKNOWN", @"导出公钥失败", nil);
    return;
  }
  CFErrorRef expError = NULL;
  // 注意：iOS 导出为 ANSI X9.63（04||X||Y）原始格式，Android 为 DER(SPKI)。
  // 后端需按平台标识归一化，或在此自行 ASN.1 封装为 SPKI。
  NSData *raw = (__bridge_transfer NSData *)
      SecKeyCopyExternalRepresentation(publicKey, &expError);
  CFRelease(publicKey);
  if (!raw) {
    reject(@"UNKNOWN", @"序列化公钥失败", (__bridge NSError *)expError);
    if (expError) CFRelease(expError);
    return;
  }
  resolve(@{ @"publicKey" : [raw base64EncodedStringWithOptions:0] });
}

- (void)signWithKey:(NSString *)alias
       payloadBase64:(NSString *)payloadBase64
         promptTitle:(NSString *)promptTitle
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject {
  NSData *payload = [[NSData alloc] initWithBase64EncodedString:payloadBase64 options:0];
  if (!payload) {
    reject(@"INVALID_ARGUMENT", @"payloadBase64 非法", nil);
    return;
  }

  LAContext *context = [LAContext new];
  context.localizedReason = promptTitle;

  NSDictionary *query = @{
    (id)kSecClass : (id)kSecClassKey,
    (id)kSecAttrKeyType : (id)kSecAttrKeyTypeECSECPrimeRandom,
    (id)kSecAttrApplicationTag : TagData(alias),
    (id)kSecReturnRef : @YES,
    (id)kSecUseAuthenticationContext : context,
  };
  SecKeyRef privateKey = NULL;
  OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query,
                                        (CFTypeRef *)&privateKey);
  if (status != errSecSuccess || !privateKey) {
    reject(@"INVALID_ARGUMENT", @"密钥不存在或不可用", nil);
    return;
  }

  CFErrorRef signError = NULL;
  NSData *signature = (__bridge_transfer NSData *)SecKeyCreateSignature(
      privateKey,
      kSecKeyAlgorithmECDSASignatureMessageX962SHA256,
      (__bridge CFDataRef)payload,
      &signError);
  CFRelease(privateKey);
  if (!signature) {
    NSError *e = (__bridge NSError *)signError;
    NSString *code = (e.code == errSecUserCanceled) ? @"USER_CANCELED"
                                                     : @"BIOMETRY_KEY_INVALIDATED";
    reject(code, e.localizedDescription ?: @"签名失败", e);
    if (signError) CFRelease(signError);
    return;
  }
  resolve(@{ @"signatureBase64" : [signature base64EncodedStringWithOptions:0] });
}

- (void)deleteKey:(NSString *)alias
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  NSDictionary *query = @{
    (id)kSecClass : (id)kSecClassKey,
    (id)kSecAttrApplicationTag : TagData(alias),
  };
  SecItemDelete((__bridge CFDictionaryRef)query);
  resolve(nil);
}

- (void)keyExists:(NSString *)alias
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject {
  SecKeyRef key = CopyPrivateKey(alias);
  BOOL exists = key != NULL;
  if (key) CFRelease(key);
  resolve(@(exists));
}

#pragma mark - TurboModule

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeItcBiometricSpecJSI>(params);
}

@end
