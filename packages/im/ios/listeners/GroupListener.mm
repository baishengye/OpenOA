//
//  GroupListener.mm
//  ItcOpenIM
//
//  群组监听器 - 群组事件
//

#import "GroupListener.h"
#import "../utils/JSONExtensionsPlus.h"

@implementation GroupListener

- (instancetype)initWithDelegate:(id<GroupListenerDelegate>)delegate {
    if (self = [super init]) {
        _delegate = delegate;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackOnGroupListener

- (void)onGroupApplicationAccepted:(NSString *)groupApplication {
    NSDictionary *groupApplicationDict = ItcParseJsonStr2DictPlus(groupApplication);
    [self pushEvent:@"im:groupApplicationAccepted" data:groupApplicationDict];
}

- (void)onGroupApplicationAdded:(NSString *)groupApplication {
    NSDictionary *groupApplicationDict = ItcParseJsonStr2DictPlus(groupApplication);
    [self pushEvent:@"im:groupApplicationAdded" data:groupApplicationDict];
}

- (void)onGroupApplicationDeleted:(NSString *)groupApplication {
    NSDictionary *groupApplicationDict = ItcParseJsonStr2DictPlus(groupApplication);
    [self pushEvent:@"im:groupApplicationDeleted" data:groupApplicationDict];
}

- (void)onGroupApplicationRejected:(NSString *)groupApplication {
    NSDictionary *groupApplicationDict = ItcParseJsonStr2DictPlus(groupApplication);
    [self pushEvent:@"im:groupApplicationRejected" data:groupApplicationDict];
}

- (void)onGroupDismissed:(NSString *)groupInfo {
    NSDictionary *groupInfoDict = ItcParseJsonStr2DictPlus(groupInfo);
    [self pushEvent:@"im:groupDismissed" data:groupInfoDict];
}

- (void)onGroupInfoChanged:(NSString *)groupInfo {
    NSDictionary *groupInfoDict = ItcParseJsonStr2DictPlus(groupInfo);
    [self pushEvent:@"im:groupInfoChanged" data:groupInfoDict];
}

- (void)onGroupMemberAdded:(NSString *)groupMemberInfo {
    NSDictionary *groupMemberInfoDict = ItcParseJsonStr2DictPlus(groupMemberInfo);
    [self pushEvent:@"im:groupMemberAdded" data:groupMemberInfoDict];
}

- (void)onGroupMemberDeleted:(NSString *)groupMemberInfo {
    NSDictionary *groupMemberInfoDict = ItcParseJsonStr2DictPlus(groupMemberInfo);
    [self pushEvent:@"im:groupMemberDeleted" data:groupMemberInfoDict];
}

- (void)onGroupMemberInfoChanged:(NSString *)groupMemberInfo {
    NSDictionary *groupMemberInfoDict = ItcParseJsonStr2DictPlus(groupMemberInfo);
    [self pushEvent:@"im:groupMemberInfoChanged" data:groupMemberInfoDict];
}

- (void)onJoinedGroupAdded:(NSString *)groupInfo {
    NSDictionary *groupInfoDict = ItcParseJsonStr2DictPlus(groupInfo);
    [self pushEvent:@"im:joinedGroupAdded" data:groupInfoDict];
}

- (void)onJoinedGroupDeleted:(NSString *)groupInfo {
    NSDictionary *groupInfoDict = ItcParseJsonStr2DictPlus(groupInfo);
    [self pushEvent:@"im:joinedGroupDeleted" data:groupInfoDict];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
