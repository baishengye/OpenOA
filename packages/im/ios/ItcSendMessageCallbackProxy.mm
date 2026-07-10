//
//  ItcSendMessageCallbackProxy.mm
//  ItcOpenIM
//

#import "ItcSendMessageCallbackProxy.h"
#import "ItcJSONExtensions.h"

@interface ItcSendMessageCallbackProxy()

@property (nonatomic, copy) RCTPromiseResolveBlock resolver;
@property (nonatomic, copy) RCTPromiseRejectBlock rejecter;
@property (nonatomic, copy) NSString* msg;
@property (nonatomic, weak) ItcOpenIMSDK* module;

@end

@implementation ItcSendMessageCallbackProxy

- (id)initWithMessage:(NSString *)msg module:(ItcOpenIMSDK *)module resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter {
    if (self = [super init]) {
        self.msg = msg;
        self.module = module;
        self.resolver = resolver;
        self.rejecter = rejecter;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackSendMsgCallBack

/// 发送消息错误回调
/// @param errCode 错误码
/// @param errMsg 错误信息
- (void)onError:(int32_t)errCode errMsg:(NSString * _Nullable)errMsg {
    self.rejecter([NSString stringWithFormat:@"%d", errCode], errMsg, nil);
}

/// 发送消息成功回调
/// @param data 发送成功的消息JSON字符串
- (void)onSuccess:(NSString * _Nullable)data {
    NSDictionary *messageDict = ItcParseJsonStr2Dict(data);
    self.resolver(messageDict);
}

/// 发送消息进度回调
/// @param progress 当前进度（0-100）
- (void)onProgress:(long)progress {
    NSDictionary *messageDict = ItcParseJsonStr2Dict(self.msg);
    NSDictionary *data = @{
        @"progress": @(progress),
        @"message": messageDict ?: @{}
    };
    [self.module pushEvent:@"im:sendMessageProgress" data:data];
}

@end
