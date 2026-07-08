#import <Foundation/Foundation.h>

@class ItcOpenIMSDK;

/**
 * OpenIM SDK 连接监听器（iOS）。
 *
 * 实现 OpenIM SDK 的 OnConnListener 回调，将事件转发到 React Native。
 */
@interface RNConnListener : NSObject

@property (nonatomic, weak) ItcOpenIMSDK *module;

- (instancetype)initWithModule:(ItcOpenIMSDK *)module;

// OpenIM SDK 回调
- (void)onConnectSuccess;
- (void)onConnecting;
- (void)onConnectFailed:(int)code err:(NSString *)errMsg;
- (void)onKickedOffline;
- (void)onUserTokenExpired;
- (void)onUserTokenInvalid:(NSString *)reason;

@end
