#import "RNGroupListener.h"
#import "ItcOpenIMSDK.h"

@implementation RNGroupListener

- (instancetype)initWithModule:(ItcOpenIMSDK *)module {
  self = [super init];
  if (self) {
    _module = module;
  }
  return self;
}

- (void)onJoinedGroupAdded:(NSString *)groupInfo {
  [self.module pushEvent:@"onJoinedGroupAdded" data:[self parseJSONObject:groupInfo]];
}

- (void)onJoinedGroupDeleted:(NSString *)groupInfo {
  [self.module pushEvent:@"onJoinedGroupDeleted" data:[self parseJSONObject:groupInfo]];
}

- (void)onGroupDismissed:(NSString *)groupID {
  [self.module pushEvent:@"onGroupDismissed" data:@{
    @"groupID": groupID ?: @""
  }];
}

- (void)onGroupInfoChanged:(NSString *)groupID changeInfo:(NSString *)changeInfo {
  [self.module pushEvent:@"onGroupInfoChanged" data:@{
    @"groupID": groupID ?: @"",
    @"changeInfo": [self parseJSONObject:changeInfo]
  }];
}

- (void)onGroupMemberAdded:(NSString *)groupID addedMemberInfo:(NSString *)addedMemberInfo {
  [self.module pushEvent:@"onGroupMemberAdded" data:@{
    @"groupID": groupID ?: @"",
    @"memberInfo": [self parseJSONObject:addedMemberInfo]
  }];
}

- (void)onGroupMemberDeleted:(NSString *)groupID removedMemberInfo:(NSString *)removedMemberInfo {
  [self.module pushEvent:@"onGroupMemberDeleted" data:@{
    @"groupID": groupID ?: @"",
    @"memberInfo": [self parseJSONObject:removedMemberInfo]
  }];
}

- (void)onGroupMemberInfoChanged:(NSString *)groupID memberInfo:(NSString *)memberInfo {
  [self.module pushEvent:@"onGroupMemberInfoChanged" data:@{
    @"groupID": groupID ?: @"",
    @"memberInfo": [self parseJSONObject:memberInfo]
  }];
}

- (void)onGroupApplicationAdded:(NSString *)groupApplication {
  [self.module pushEvent:@"onGroupApplicationAdded" data:[self parseJSONObject:groupApplication]];
}

- (void)onGroupApplicationDeleted:(NSString *)groupApplication {
  [self.module pushEvent:@"onGroupApplicationDeleted" data:[self parseJSONObject:groupApplication]];
}

- (void)onGroupApplicationAccepted:(NSString *)groupApplication {
  [self.module pushEvent:@"onGroupApplicationAccepted" data:[self parseJSONObject:groupApplication]];
}

- (void)onGroupApplicationRejected:(NSString *)groupApplication {
  [self.module pushEvent:@"onGroupApplicationRejected" data:[self parseJSONObject:groupApplication]];
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
