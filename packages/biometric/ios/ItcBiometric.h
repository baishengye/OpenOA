#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>

// New Architecture TurboModule。实现细节见 ItcBiometric.mm，方法签名对应
// codegen 协议 NativeItcBiometricSpec（package.json codegenConfig.name = RNItcBiometricSpec）。
@interface ItcBiometric : NSObject <RCTBridgeModule, RCTTurboModule>
@end
