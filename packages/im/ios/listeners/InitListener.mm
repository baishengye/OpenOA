//
//  InitListener.mm
//  ItcOpenIM
//
//  SDK 连接状态监听器 - 对标 Android InitSDKListener
//  监听 SDK 与服务器的连接状态变化、登录状态变化等核心事件
//

#import "InitListener.h"
#import "../utils/JSONExtensionsPlus.h"

@implementation InitListener

- (instancetype)initWithDelegate:(id<InitListenerDelegate>)delegate {
    if (self = [super init]) {
        _delegate = delegate;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackOnConnListener

/// 连接成功回调
/// 当 SDK 与服务器成功建立连接时触发
- (void)onConnectSuccess {
    NSLog(@"[ItcOpenIM:InitListener] onConnectSuccess");
    [self pushEvent:@"im:connectSuccess" data:nil];
}

/// 连接中回调
/// 当 SDK 正在与服务器建立连接时触发
- (void)onConnecting {
    NSLog(@"[ItcOpenIM:InitListener] onConnecting");
    [self pushEvent:@"im:connecting" data:nil];
}

/// 连接失败回调
/// 当 SDK 与服务器建立连接失败时触发
/// @param errCode 错误码
/// @param errMsg 错误信息
- (void)onConnectFailed:(int32_t)errCode errMsg:(NSString *)errMsg {
    NSLog(@"[ItcOpenIM:InitListener] onConnectFailed: errCode=%d, errMsg=%@", errCode, errMsg);
    [self pushEvent:@"im:connectFailed" data:@{@"errCode": @(errCode), @"errMsg": errMsg ?: @""}];
}

/// 被踢下线回调
/// 当用户账号在另一设备登录导致当前设备被踢下线时触发
- (void)onKickedOffline {
    NSLog(@"[ItcOpenIM:InitListener] onKickedOffline");
    [self pushEvent:@"im:kickedOffline" data:nil];
}

/// 用户 Token 过期回调
/// 当登录 Token 过期需要刷新时触发
- (void)onUserTokenExpired {
    NSLog(@"[ItcOpenIM:InitListener] onUserTokenExpired");
    [self pushEvent:@"im:userTokenExpired" data:nil];
}

/// 用户 Token 无效回调
/// 当登录 Token 无效时触发，需要重新登录
/// @param errMsg 无效的 Token 信息
- (void)onUserTokenInvalid:(NSString *)errMsg {
    NSLog(@"[ItcOpenIM:InitListener] onUserTokenInvalid: %@", errMsg);
    [self pushEvent:@"im:userTokenInvalid" data:nil];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
