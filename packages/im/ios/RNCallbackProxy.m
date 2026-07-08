#import "RNCallbackProxy.h"

@implementation RNCallbackProxy

@synthesize resolve = _resolve;
@synthesize reject = _reject;

- (instancetype)initWithResolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject {
  self = [super init];
  if (self) {
    _resolve = [resolve copy];
    _reject = [reject copy];
  }
  return self;
}

@end
