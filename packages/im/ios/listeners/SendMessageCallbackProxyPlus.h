#import "ItcOpenIMSDK.h"

NS_ASSUME_NONNULL_BEGIN

@interface SendMessageCallbackProxyPlus : NSObject <Open_im_sdk_callbackSendMsgCallBack>

- (id)initWithMessage:(NSString *)msg module:(ItcOpenIMSDK *)module resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter;

@end

NS_ASSUME_NONNULL_END
