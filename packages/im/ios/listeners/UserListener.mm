//
//  UserListener.mm
//  ItcOpenIM
//
//  用户监听器 - 用户信息变更/用户命令
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

#pragma mark - Open_im_sdk_callbackOnUserListener

/// 自身信息更新回调
/// 当用户自己的信息发生变更时触发
/// @param userInfo 用户信息JSON字符串
- (void)onSelfInfoUpdated:(NSString *)userInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(userInfo);
    [self pushEvent:@"im:selfInfoUpdated" data:data];
}

/// 用户在线状态变更回调
/// 当用户的在线状态发生变更时触发
/// @param statusMap 状态Map的JSON字符串
- (void)onUserStatusChanged:(NSString *)statusMap {
    NSDictionary *data = ItcParseJsonStr2DictPlus(statusMap);
    [self pushEvent:@"im:userStatusChanged" data:data];
}

#pragma mark - UserCommand

/// 用户命令添加回调
/// 当收到新的用户命令时触发
/// @param userCommand 用户命令JSON字符串
- (void)onUserCommandAdd:(NSString *)userCommand {
    NSDictionary *data = ItcParseJsonStr2DictPlus(userCommand);
    [self pushEvent:@"im:userCommandAdd" data:data];
}

/// 用户命令删除回调
/// 当用户命令被删除时触发
/// @param userCommand 用户命令JSON字符串
- (void)onUserCommandDelete:(NSString *)userCommand {
    NSDictionary *data = ItcParseJsonStr2DictPlus(userCommand);
    [self pushEvent:@"im:userCommandDelete" data:data];
}

/// 用户命令更新回调
/// 当用户命令发生变更时触发
/// @param userCommand 用户命令JSON字符串
- (void)onUserCommandUpdate:(NSString *)userCommand {
    NSDictionary *data = ItcParseJsonStr2DictPlus(userCommand);
    [self pushEvent:@"im:userCommandUpdate" data:data];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
