#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>

// New Architecture KV 存储 TurboModule（同步），底层 MMKV。
@interface ItcStorage : NSObject <RCTBridgeModule, RCTTurboModule>
@end
