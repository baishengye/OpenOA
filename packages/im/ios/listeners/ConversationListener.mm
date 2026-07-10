//
//  ConversationListener.mm
//  ItcOpenIM
//
//  会话监听器 - 会话变更/输入状态/同步
//

#import "ConversationListener.h"
#import "../utils/JSONExtensionsPlus.h"

@implementation ConversationListener

- (instancetype)initWithDelegate:(id<ConversationListenerDelegate>)delegate {
    if (self = [super init]) {
        _delegate = delegate;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackOnConversationListener

- (void)onConversationChanged:(NSString *)conversationList {
    NSArray *conversationListArray = ItcParseJsonStr2ArrayPlus(conversationList);
    [self pushEvent:@"im:conversationChanged" data:conversationListArray];
}

- (void)onConversationUserInputStatusChanged:(NSString *)details {
    NSDictionary *detailsDict = ItcParseJsonStr2DictPlus(details);
    [self pushEvent:@"im:inputStatusChanged" data:detailsDict];
}

- (void)onNewConversation:(NSString *)conversationList {
    NSArray *conversationListArray = ItcParseJsonStr2ArrayPlus(conversationList);
    [self pushEvent:@"im:newConversation" data:conversationListArray];
}

- (void)onSyncServerFailed:(BOOL)reinstalled {
    [self pushEvent:@"im:syncServerFailed" data:@(reinstalled)];
}

- (void)onSyncServerFinish:(BOOL)reinstalled {
    [self pushEvent:@"im:syncServerFinish" data:@(reinstalled)];
}

- (void)onSyncServerStart:(BOOL)reinstalled {
    [self pushEvent:@"im:syncServerStart" data:@(reinstalled)];
}

- (void)onSyncServerProgress:(long)progress {
    [self pushEvent:@"im:syncServerProgress" data:@(progress)];
}

- (void)onTotalUnreadMessageCountChanged:(int32_t)totalUnreadCount {
    [self pushEvent:@"im:totalUnreadMessageCountChanged" data:@(totalUnreadCount)];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
