//
//  UploadFileCallbackProxyPlus.mm
//  ItcOpenIM
//
//  文件上传回调代理 - 实现所有上传阶段事件回调
//

#import "UploadFileCallbackProxyPlus.h"
#import "../utils/JSONExtensionsPlus.h"

@interface UploadFileCallbackProxyPlus()

@property (nonatomic, copy) NSString *opid;
@property (nonatomic, weak) ItcOpenIMSDK *module;

@end

@implementation UploadFileCallbackProxyPlus

- (nonnull id)initWithOpid:(nonnull NSString *)operationID module:(nonnull ItcOpenIMSDK *)module resolver:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter {
    if (self = [super init]) {
        self.opid = operationID;
        self.module = module;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackUpload

/// 上传完成回调（基础完成）
/// 获取到上传后的文件URL时触发
/// @param size 文件大小
/// @param url 上传后的文件URL
/// @param typ 文件类型
- (void)complete:(int64_t)size url:(NSString * _Nullable)url typ:(long)typ {
    NSDictionary *data = @{
        @"url": url ?: @"",
        @"operationID": self.opid ?: @""
    };

    NSDictionary *params = @{
        @"data": data,
        @"errCode": @(0),
        @"errMsg": @""
    };

    [self.module pushEvent:@"im:uploadComplete" data:params];
}

/// Hash分片完成回调
/// 所有分片的Hash计算完成时触发
/// @param partsHash 分片Hash列表
/// @param fileHash 整体文件Hash
- (void)hashPartComplete:(NSString * _Nullable)partsHash fileHash:(NSString * _Nullable)fileHash {
    NSDictionary *data = @{
        @"partsHash": partsHash ?: @"",
        @"fileHash": fileHash ?: @"",
        @"operationID": self.opid ?: @""
    };

    NSDictionary *params = @{
        @"data": data,
        @"errCode": @(0),
        @"errMsg": @""
    };

    [self.module pushEvent:@"im:uploadHashPartComplete" data:params];
}

/// Hash分片进度回调
/// 计算每个分片Hash时的进度
/// @param index 当前分片索引
/// @param size 当前分片大小
/// @param partHash 当前分片Hash值
- (void)hashPartProgress:(long)index size:(int64_t)size partHash:(NSString * _Nullable)partHash {
    NSDictionary *data = @{
        @"index": @(index),
        @"size": @(size),
        @"partHash": partHash ?: @"",
        @"operationID": self.opid ?: @""
    };

    [self.module pushEvent:@"im:uploadHashPartProgress" data:data];
}

/// 文件打开回调
/// 开始处理文件时触发，报告待上传文件大小
/// @param size 文件总大小
- (void)open:(int64_t)size {
    NSDictionary *data = @{
        @"size": @(size),
        @"operationID": self.opid ?: @""
    };

    [self.module pushEvent:@"im:uploadOpen" data:data];
}

/// 分片大小计算回调
/// 计算出分片大小和总分片数时触发
/// @param partSize 单个分片大小
/// @param num 分片总数
- (void)partSize:(int64_t)partSize num:(long)num {
    NSDictionary *data = @{
        @"partSize": @(partSize),
        @"num": @(num),
        @"operationID": self.opid ?: @""
    };

    [self.module pushEvent:@"im:uploadPartSize" data:data];
}

/// 上传完成回调（详细）
/// 文件全部上传完成时触发，包含详细的文件大小信息
/// @param fileSize 文件大小
/// @param streamSize 流大小
/// @param storageSize 实际存储大小
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

    [self.module pushEvent:@"im:uploadComplete" data:params];
}

/// 上传ID回调
/// 开始上传时获取到上传任务ID时触发
/// @param uploadID 上传任务ID
- (void)uploadID:(NSString * _Nullable)uploadID {
    NSDictionary *data = @{
        @"uploadID": uploadID ?: @"",
        @"operationID": self.opid ?: @""
    };

    [self.module pushEvent:@"im:uploadID" data:data];
}

/// 分片上传完成回调
/// 某个分片上传完成时触发
/// @param index 分片索引
/// @param partSize 分片大小
/// @param partHash 分片Hash
- (void)uploadPartComplete:(long)index partSize:(int64_t)partSize partHash:(NSString * _Nullable)partHash {
    NSDictionary *data = @{
        @"index": @(index),
        @"partSize": @(partSize),
        @"partHash": partHash ?: @"",
        @"operationID": self.opid ?: @""
    };

    [self.module pushEvent:@"im:uploadPartComplete" data:data];
}

@end
