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

- (void)onError:(int32_t)errCode errMsg:(NSString * _Nullable)errMsg {
    self.rejecter([NSString stringWithFormat:@"%d", errCode], errMsg, nil);
}

- (void)onSuccess:(NSString * _Nullable)data {
    NSDictionary *messageDict = ItcParseJsonStr2Dict(data);
    self.resolver(messageDict);
}

- (void)onProgress:(long)progress {
    NSDictionary *messageDict = ItcParseJsonStr2Dict(self.msg);
    NSDictionary *data = @{
        @"progress": @(progress),
        @"message": messageDict ?: @{}
    };
    [self.module pushEvent:@"SendMessageProgress" data:data];
}

@end
