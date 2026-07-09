#import "ItcOpenIMSDK.h"
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@interface ItcUploadFileCallbackProxy : NSObject <Open_im_sdk_callbackUploadFileCallback>

- (id)initWithOpid:(NSString *)operationID module:(ItcOpenIMSDK *)module resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter;

@end

NS_ASSUME_NONNULL_END
