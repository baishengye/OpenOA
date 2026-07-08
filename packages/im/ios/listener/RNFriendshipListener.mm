#import "RNFriendshipListener.h"
#import "ItcOpenIMSDK.h"

@implementation RNFriendshipListener

- (instancetype)initWithModule:(ItcOpenIMSDK *)module {
  self = [super init];
  if (self) {
    _module = module;
  }
  return self;
}

- (void)onFriendAdded:(NSString *)friendInfo {
  [self.module pushEvent:@"onFriendAdded" data:[self parseJSONObject:friendInfo]];
}

- (void)onFriendDeleted:(NSString *)friendInfo {
  [self.module pushEvent:@"onFriendDeleted" data:[self parseJSONObject:friendInfo]];
}

- (void)onFriendInfoChanged:(NSString *)friendInfo {
  [self.module pushEvent:@"onFriendInfoChanged" data:[self parseJSONObject:friendInfo]];
}

- (void)onFriendApplicationAdded:(NSString *)friendApplication {
  [self.module pushEvent:@"onFriendApplicationAdded" data:[self parseJSONObject:friendApplication]];
}

- (void)onFriendApplicationDeleted:(NSString *)friendApplication {
  [self.module pushEvent:@"onFriendApplicationDeleted" data:[self parseJSONObject:friendApplication]];
}

- (void)onFriendApplicationAccepted:(NSString *)friendApplication {
  [self.module pushEvent:@"onFriendApplicationAccepted" data:[self parseJSONObject:friendApplication]];
}

- (void)onFriendApplicationRejected:(NSString *)friendApplication {
  [self.module pushEvent:@"onFriendApplicationRejected" data:[self parseJSONObject:friendApplication]];
}

- (void)onBlackAdded:(NSString *)blackInfo {
  [self.module pushEvent:@"onBlackAdded" data:[self parseJSONObject:blackInfo]];
}

- (void)onBlackDeleted:(NSString *)blackInfo {
  [self.module pushEvent:@"onBlackDeleted" data:[self parseJSONObject:blackInfo]];
}

#pragma mark - Helpers

- (NSDictionary *)parseJSONObject:(NSString *)json {
  if (!json || json.length == 0) return @{};
  NSData *data = [json dataUsingEncoding:NSUTF8StringEncoding];
  NSError *error;
  NSDictionary *dict = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
  return error ? @{} : dict;
}

@end
