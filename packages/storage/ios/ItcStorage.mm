#import "ItcStorage.h"
#import <MMKV/MMKV.h>

// codegen 协议头（package.json codegenConfig.name = RNItcStorageSpec）。
#import <RNItcStorageSpec/RNItcStorageSpec.h>

@implementation ItcStorage {
  MMKV *_kv;
}

RCT_EXPORT_MODULE()

- (MMKV *)kv {
  if (_kv == nil) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      [MMKV initializeMMKV:nil];
    });
    _kv = [MMKV mmkvWithID:@"itc-storage"];
  }
  return _kv;
}

// 同步方法：codegen 协议声明为直接返回值。

- (void)setString:(NSString *)key value:(NSString *)value {
  [[self kv] setString:value forKey:key];
}

- (NSString *)getString:(NSString *)key {
  NSString *v = [[self kv] getStringForKey:key];
  return v != nil ? v : @"";
}

- (void)setBoolean:(NSString *)key value:(BOOL)value {
  [[self kv] setBool:value forKey:key];
}

- (NSNumber *)getBoolean:(NSString *)key {
  return @([[self kv] getBoolForKey:key defaultValue:NO]);
}

- (NSNumber *)contains:(NSString *)key {
  return @([[self kv] containsKey:key]);
}

- (void)remove:(NSString *)key {
  [[self kv] removeValueForKey:key];
}

- (void)clearAll {
  [[self kv] clearAll];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeItcStorageSpecJSI>(params);
}

@end
