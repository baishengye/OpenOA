//
//  UserListener.mm
//  ItcOpenIM
//
//  用户监听器 - 连接状态/用户信息变更
//

#import "UserListener.h"
#import "../utils/JSONExtensionsPlus.h"

@implementation UserListener

- (instancetype)initWithDelegate:(id<UserListenerDelegate>)delegate {
    if (self = [super init]) {
        _delegate = delegate;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackOnConnListener

- (void)onConnectSuccess {
    [self pushEvent:@"im:connectSuccess" data:nil];
}

- (void)onConnecting {
    [self pushEvent:@"im:connecting" data:nil];
}

- (void)onConnectFailed:(int32_t)errCode errMsg:(NSString *)errMsg {
    [self pushEvent:@"im:connectFailed" data:@{@"errCode": @(errCode), @"errMsg": errMsg ?: @""}];
}

- (void)onKickedOffline {
    [self pushEvent:@"im:kickedOffline" data:nil];
}

- (void)onUserTokenExpired {
    [self pushEvent:@"im:userTokenExpired" data:nil];
}

- (void)onUserTokenInvalid:(NSString *)errMsg {
    [self pushEvent:@"im:userTokenInvalid" data:nil];
}

#pragma mark - Open_im_sdk_callbackOnUserListener

- (void)onSelfInfoUpdated:(NSString *)userInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(userInfo);
    [self pushEvent:@"im:selfInfoUpdated" data:data];
}

- (void)onUserStatusChanged:(NSString *)statusMap {
    NSDictionary *data = ItcParseJsonStr2DictPlus(statusMap);
    [self pushEvent:@"im:userStatusChanged" data:data];
}

#pragma mark - UserCommand

- (void)onUserCommandAdd:(NSString *)userCommand {
    NSDictionary *data = ItcParseJsonStr2DictPlus(userCommand);
    [self pushEvent:@"im:userCommandAdd" data:data];
}

- (void)onUserCommandDelete:(NSString *)userCommand {
    NSDictionary *data = ItcParseJsonStr2DictPlus(userCommand);
    [self pushEvent:@"im:userCommandDelete" data:data];
}

- (void)onUserCommandUpdate:(NSString *)userCommand {
    NSDictionary *data = ItcParseJsonStr2DictPlus(userCommand);
    [self pushEvent:@"im:userCommandUpdate" data:data];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
