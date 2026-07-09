//
//  ItcUploadLogCallbackProxy.mm
//  ItcOpenIM
//

#import "ItcUploadLogCallbackProxy.h"
#import "ItcJSONExtensions.h"

@interface ItcUploadLogCallbackProxy()

@property (nonatomic, copy) NSString *opid;
@property (nonatomic, weak) ItcOpenIMSDK *module;

@end

@implementation ItcUploadLogCallbackProxy

- (nonnull id)initWithOpid:(nonnull NSString *)operationID module:(nonnull ItcOpenIMSDK *)module resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter {
    if (self = [super init]) {
        self.opid = operationID;
        self.module = module;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackUploadLog

- (void)onProgress:(int64_t)current size:(int64_t)size {
    NSDictionary *params = @{
        @"current": @(current),
        @"size": @(size),
        @"operationID": self.opid ?: @"",
        @"errCode": @(0),
        @"errMsg": @""
    };
    [self.module pushEvent:@"uploadOnProgress" data:params];
}

@end
