//
//  BatchMsgListener.mm
//  ItcOpenIM
//
//  批量消息监听器 - 离线消息/在线消息
//

#import "BatchMsgListener.h"
#import "../utils/JSONExtensionsPlus.h"

@implementation BatchMsgListener

- (instancetype)initWithDelegate:(id<BatchMsgListenerDelegate>)delegate {
    if (self = [super init]) {
        _delegate = delegate;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackOnBatchMsgListener

- (void)onRecvNewMessages:(NSString *)messageList {
    [self pushEvent:@"im:recvNewMessages" data:messageList];
}

- (void)onRecvOfflineNewMessages:(NSString *)messageList {
    [self pushEvent:@"im:recvOfflineNewMessages" data:messageList];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
