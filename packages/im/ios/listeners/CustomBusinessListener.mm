//
//  CustomBusinessListener.mm
//  ItcOpenIM
//
//  自定义业务消息监听器 - 接收服务器下发的自定义业务消息
//

#import "CustomBusinessListener.h"
#import "../utils/JSONExtensionsPlus.h"

@implementation CustomBusinessListener

- (instancetype)initWithDelegate:(id<CustomBusinessListenerDelegate>)delegate {
    if (self = [super init]) {
        _delegate = delegate;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackOnCustomBusinessListener

/// 接收自定义业务消息回调
/// 当收到服务器下发的自定义业务消息时触发
/// @param businessMessage 业务消息JSON字符串
- (void)onRecvCustomBusinessMessage:(NSString *)businessMessage {
    NSDictionary *data = ItcParseJsonStr2DictPlus(businessMessage);
    [self pushEvent:@"im:recvCustomBusinessMessage" data:data];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
