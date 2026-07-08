#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

/**
 * OpenIM SDK 回调代理（iOS）。
 *
 * 将 OpenIM SDK C 风格的回调转换为 React Native Promise。
 */
@interface RNCallbackProxy : NSObject

@property (nonatomic, copy) RCTPromiseResolveBlock resolve;
@property (nonatomic, copy) RCTPromiseRejectBlock reject;

- (instancetype)initWithResolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject;

@end
