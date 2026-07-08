#import "RNConnListener.h"
#import "ItcOpenIMSDK.h"

@implementation RNConnListener

- (instancetype)initWithModule:(ItcOpenIMSDK *)module {
  self = [super init];
  if (self) {
    _module = module;
  }
  return self;
}

- (void)onConnectSuccess {
  [self.module pushEvent:@"onConnectSuccess" data:nil];
}

- (void)onConnecting {
  [self.module pushEvent:@"onConnecting" data:nil];
}

- (void)onConnectFailed:(int)code err:(NSString *)errMsg {
  [self.module pushEvent:@"onConnectFailed" data:@{
    @"code": @(code),
    @"errMsg": errMsg ?: @""
  }];
}

- (void)onKickedOffline {
  [self.module pushEvent:@"onKickedOffline" data:nil];
}

- (void)onUserTokenExpired {
  [self.module pushEvent:@"onUserTokenExpired" data:nil];
}

- (void)onUserTokenInvalid:(NSString *)reason {
  [self.module pushEvent:@"onUserTokenInvalid" data:@{
    @"reason": reason ?: @""
  }];
}

@end
