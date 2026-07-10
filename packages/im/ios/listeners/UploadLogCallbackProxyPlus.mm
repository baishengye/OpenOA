//
//  UploadLogCallbackProxy.mm
//  ItcOpenIM
//

#import "UploadLogCallbackProxyPlus.h"
#import "../utils/JSONExtensionsPlus.h"

@interface UploadLogCallbackProxyPlus()

@property (nonatomic, copy) NSString *opid;
@property (nonatomic, weak) ItcOpenIMSDK *module;

@end

@implementation UploadLogCallbackProxyPlus

- (nonnull id)initWithOpid:(nonnull NSString *)operationID module:(nonnull ItcOpenIMSDK *)module resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter {
    if (self = [super init]) {
        self.opid = operationID;
        self.module = module;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackUploadLog

/// 日志上传进度回调
/// 报告日志上传的当前进度和总大小
/// @param current 当前已上传字节数
/// @param size 日志文件总大小
- (void)onProgress:(int64_t)current size:(int64_t)size {
    NSDictionary *params = @{
        @"current": @(current),
        @"size": @(size),
        @"operationID": self.opid ?: @"",
        @"errCode": @(0),
        @"errMsg": @""
    };
    [self.module pushEvent:@"im:uploadOnProgress" data:params];
}

@end
