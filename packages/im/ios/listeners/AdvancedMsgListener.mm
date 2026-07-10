//
//  AdvancedMsgListener.mm
//  ItcOpenIM
//
//  高级消息监听器 - 新消息/已读/撤回/删除
//

#import "AdvancedMsgListener.h"
#import "../utils/JSONExtensionsPlus.h"

@implementation AdvancedMsgListener

- (instancetype)initWithDelegate:(id<AdvancedMsgListenerDelegate>)delegate {
    if (self = [super init]) {
        _delegate = delegate;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackOnAdvancedMsgListener

- (void)onRecvNewMessage:(NSString *)message {
    NSDictionary *messageDict = ItcParseJsonStr2DictPlus(message);
    [self pushEvent:@"im:recvNewMessage" data:messageDict];
}

- (void)onRecvOfflineNewMessage:(NSString *)message {
    NSArray *messageListArray = ItcParseJsonStr2ArrayPlus(message);
    [self pushEvent:@"im:recvOfflineNewMessage" data:messageListArray];
}

- (void)onRecvOnlineOnlyMessage:(NSString *)message {
    NSArray *messageListArray = ItcParseJsonStr2ArrayPlus(message);
    [self pushEvent:@"im:recvOnlineOnlyMessage" data:messageListArray];
}

- (void)onMsgDeleted:(NSString *)message {
    NSDictionary *messageDict = ItcParseJsonStr2DictPlus(message);
    [self pushEvent:@"im:msgDeleted" data:messageDict];
}

- (void)onNewRecvMessageRevoked:(NSString *)messageRevoked {
    NSDictionary *messageRevokedDict = ItcParseJsonStr2DictPlus(messageRevoked);
    [self pushEvent:@"im:newRecvMessageRevoked" data:messageRevokedDict];
}

- (void)onRecvC2CReadReceipt:(NSString *)msgReceiptList {
    NSArray *msgReceiptListArray = ItcParseJsonStr2ArrayPlus(msgReceiptList);
    [self pushEvent:@"im:recvC2CReadReceipt" data:msgReceiptListArray];
}

- (void)onRecvMessageRevoked:(NSString *)msgId {
    [self pushEvent:@"im:recvMessageRevoked" data:msgId];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
