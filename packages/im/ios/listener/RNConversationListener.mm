#import "RNConversationListener.h"
#import "ItcOpenIMSDK.h"

@implementation RNConversationListener

- (instancetype)initWithModule:(ItcOpenIMSDK *)module {
  self = [super init];
  if (self) {
    _module = module;
  }
  return self;
}

- (void)onConversationChanged:(NSString *)conversationList {
  [self.module pushEvent:@"onConversationChanged" data:[self parseJSONArray:conversationList]];
}

- (void)onNewConversation:(NSString *)conversationList {
  [self.module pushEvent:@"onNewConversation" data:[self parseJSONArray:conversationList]];
}

- (void)onTotalUnreadMessageCountChanged:(NSInteger)totalUnreadCount {
  [self.module pushEvent:@"onTotalUnreadMessageCountChanged" data:@{@"count": @(totalUnreadCount)}];
}

- (void)onSyncServerStart {
  [self.module pushEvent:@"onSyncServerStart" data:nil];
}

- (void)onSyncServerFinish {
  [self.module pushEvent:@"onSyncServerFinish" data:nil];
}

- (void)onSyncServerFailed {
  [self.module pushEvent:@"onSyncServerFailed" data:nil];
}

#pragma mark - Helpers

- (NSArray *)parseJSONArray:(NSString *)json {
  if (!json || json.length == 0) return @[];
  NSData *data = [json dataUsingEncoding:NSUTF8StringEncoding];
  NSError *error;
  NSArray *arr = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
  return error ? @[] : arr;
}

@end
