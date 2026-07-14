//
//  FriendshipListener.mm
//  ItcOpenIM
//
//  好友监听器 - 好友申请/黑名单
//

#import "FriendshipListener.h"
#import "../utils/JSONExtensionsPlus.h"

@implementation FriendshipListener

- (instancetype)initWithDelegate:(id<FriendshipListenerDelegate>)delegate {
    if (self = [super init]) {
        _delegate = delegate;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackOnFriendshipListener

- (void)onBlackAdded:(NSString *)blackInfo {
    NSDictionary *blackInfoDict = ItcParseJsonStr2DictPlus(blackInfo);
    [self pushEvent:@"im:blackAdded" data:blackInfoDict];
}

- (void)onBlackDeleted:(NSString *)blackInfo {
    NSDictionary *blackInfoDict = ItcParseJsonStr2DictPlus(blackInfo);
    [self pushEvent:@"im:blackDeleted" data:blackInfoDict];
}

- (void)onFriendApplicationAccepted:(NSString *)friendApplication {
    NSDictionary *friendApplicationDict = ItcParseJsonStr2DictPlus(friendApplication);
    [self pushEvent:@"im:friendApplicationAccepted" data:friendApplicationDict];
}

- (void)onFriendApplicationAdded:(NSString *)friendApplication {
    NSDictionary *friendApplicationDict = ItcParseJsonStr2DictPlus(friendApplication);
    [self pushEvent:@"im:friendApplicationAdded" data:friendApplicationDict];
}

- (void)onFriendApplicationDeleted:(NSString *)friendApplication {
    NSDictionary *friendApplicationDict = ItcParseJsonStr2DictPlus(friendApplication);
    [self pushEvent:@"im:friendApplicationDeleted" data:friendApplicationDict];
}

- (void)onFriendApplicationRejected:(NSString *)friendApplication {
    NSDictionary *friendApplicationDict = ItcParseJsonStr2DictPlus(friendApplication);
    [self pushEvent:@"im:friendApplicationRejected" data:friendApplicationDict];
}

- (void)onFriendInfoChanged:(NSString *)friendInfo {
    NSDictionary *friendInfoDict = ItcParseJsonStr2DictPlus(friendInfo);
    [self pushEvent:@"im:friendInfoChanged" data:friendInfoDict];
}

- (void)onFriendAdded:(NSString *)friendInfo {
    NSDictionary *friendInfoDict = ItcParseJsonStr2DictPlus(friendInfo);
    [self pushEvent:@"im:friendAdded" data:friendInfoDict];
}

- (void)onFriendDeleted:(NSString *)friendInfo {
    NSDictionary *friendInfoDict = ItcParseJsonStr2DictPlus(friendInfo);
    [self pushEvent:@"im:friendDeleted" data:friendInfoDict];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
