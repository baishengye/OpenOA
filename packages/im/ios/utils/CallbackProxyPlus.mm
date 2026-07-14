//
//  CallbackProxy.mm
//  ItcOpenIM
//

#import "CallbackProxyPlus.h"
#import "JSONExtensionsPlus.h"

@interface CallbackProxyPlus()

@property (nonatomic, copy) RCTPromiseResolveBlock resolver;
@property (nonatomic, copy) RCTPromiseRejectBlock rejecter;
@property (nonatomic, copy, nullable) RNOIMSuccessCallback _onSuccess;

@end

@implementation CallbackProxyPlus

- (id)initWithCallback:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter {
    return [self initWithCallback:resolver rejecter:rejecter onSuccess:nil];
}

- (id)initWithCallback:(RCTPromiseResolveBlock)resolver rejecter:(RCTPromiseRejectBlock)rejecter onSuccess:(RNOIMSuccessCallback _Nullable)onSuccess {
    if (self = [super init]) {
        self.resolver = resolver;
        self.rejecter = rejecter;
        self._onSuccess = onSuccess;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackBase

- (void)onError:(int32_t)errCode errMsg:(NSString * _Nullable)errMsg {
    self.rejecter([NSString stringWithFormat:@"%d", errCode], errMsg, nil);
}

- (void)onSuccess:(NSString * _Nullable)data {
    if (self._onSuccess) {
        id result = self._onSuccess(data);
        self.resolver(result);
        return;
    }

    if (!data) {
        self.resolver(nil);
        return;
    }

    NSDictionary *dataDict = ItcParseJsonStr2DictPlus(data);
    if (dataDict) {
        self.resolver(dataDict);
    } else {
        NSArray *dataArray = ItcParseJsonStr2ArrayPlus(data);
        if (dataArray) {
            self.resolver(dataArray);
        } else {
            self.resolver(data);
        }
    }
}

@end
