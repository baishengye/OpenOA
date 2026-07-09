//
//  ItcUploadFileCallbackProxy.mm
//  ItcOpenIM
//

#import "ItcUploadFileCallbackProxy.h"
#import "ItcJSONExtensions.h"

@interface ItcUploadFileCallbackProxy()

@property (nonatomic, copy) NSString *opid;
@property (nonatomic, weak) ItcOpenIMSDK *module;

@end

@implementation ItcUploadFileCallbackProxy

- (nonnull id)initWithOpid:(nonnull NSString *)operationID module:(nonnull ItcOpenIMSDK *)module resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter {
    if (self = [super init]) {
        self.opid = operationID;
        self.module = module;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackUpload

- (void)complete:(int64_t)size url:(NSString * _Nullable)url typ:(long)typ {
    // Not used
}

- (void)hashPartComplete:(NSString * _Nullable)partsHash fileHash:(NSString * _Nullable)fileHash {
    // Not used
}

- (void)hashPartProgress:(long)index size:(int64_t)size partHash:(NSString * _Nullable)partHash {
    // Not used
}

- (void)open:(int64_t)size {
    // Not used
}

- (void)partSize:(int64_t)partSize num:(long)num {
    // Not used
}

- (void)uploadComplete:(int64_t)fileSize streamSize:(int64_t)streamSize storageSize:(int64_t)storageSize {
    NSDictionary *data = @{
        @"fileSize": @(fileSize),
        @"streamSize": @(streamSize),
        @"storageSize": @(storageSize),
        @"operationID": self.opid ?: @""
    };

    NSDictionary *params = @{
        @"data": data,
        @"errCode": @(0),
        @"errMsg": @""
    };

    [self.module pushEvent:@"uploadComplete" data:params];
}

- (void)uploadID:(NSString * _Nullable)uploadID {
    // Not used
}

- (void)uploadPartComplete:(long)index partSize:(int64_t)partSize partHash:(NSString * _Nullable)partHash {
    // Not used
}

@end
