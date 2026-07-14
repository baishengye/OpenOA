//
//  CallbackProxy.h
//  ItcOpenIM
//

#import <Foundation/Foundation.h>

#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

typedef _Nullable id (^RNOIMSuccessCallback)(NSString * _Nullable data);

@interface CallbackProxyPlus : NSObject <Open_im_sdk_callbackBase>

- (id)initWithCallback:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter;
- (id)initWithCallback:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter onSuccess:(RNOIMSuccessCallback _Nullable)onSuccess;

@end

NS_ASSUME_NONNULL_END
