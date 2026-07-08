#import "RNAdvancedMsgListener.h"
#import "ItcOpenIMSDK.h"

@implementation RNAdvancedMsgListener

- (instancetype)initWithModule:(ItcOpenIMSDK *)module {
  self = [super init];
  if (self) {
    _module = module;
  }
  return self;
}

- (void)onRecvNewMessage:(NSString *)msg clientMsgID:(NSString *)clientMsgID serverMsgID:(NSString *)serverMsgID {
  [self.module pushEvent:@"onRecvNewMessage" data:[self parseMessageJSON:msg clientMsgID:clientMsgID serverMsgID:serverMsgID]];
}

- (void)onRecvOfflineNewMessage:(NSString *)msg clientMsgID:(NSString *)clientMsgID serverMsgID:(NSString *)serverMsgID {
  [self.module pushEvent:@"onRecvOfflineNewMessage" data:[self parseMessageJSON:msg clientMsgID:clientMsgID serverMsgID:serverMsgID]];
}

- (void)onMsgDeleted:(NSString *)msg {
  [self.module pushEvent:@"onMsgDeleted" data:[self parseMessageJSON:msg clientMsgID:nil serverMsgID:nil]];
}

- (void)onRecvC2CReadReceipt:(NSString *)recvID msgIDList:(NSString *)msgIDList {
  [self.module pushEvent:@"onRecvC2CReadReceipt" data:@{
    @"recvID": recvID ?: @"",
    @"msgIDList": [self parseJSONArray:msgIDList]
  }];
}

- (void)onNewRecvMessageRevoked:(NSString *)revokedMsg {
  [self.module pushEvent:@"onNewRecvMessageRevoked" data:[self parseMessageJSON:revokedMsg clientMsgID:nil serverMsgID:nil]];
}

- (void)onRecvMessageExtensionsChanged:(NSString *)msgID extensions:(NSString *)extensions {
  [self.module pushEvent:@"onRecvMessageExtensionsChanged" data:@{
    @"msgID": msgID ?: @"",
    @"extensions": [self parseJSONObject:extensions]
  }];
}

#pragma mark - Helpers

- (NSDictionary *)parseMessageJSON:(NSString *)json clientMsgID:(NSString *)clientMsgID serverMsgID:(NSString *)serverMsgID {
  NSMutableDictionary *dict = [self parseJSONObject:json];
  if (clientMsgID) dict[@"clientMsgID"] = clientMsgID;
  if (serverMsgID) dict[@"serverMsgID"] = serverMsgID;
  return dict;
}

- (NSDictionary *)parseJSONObject:(NSString *)json {
  if (!json || json.length == 0) return @{};
  NSData *data = [json dataUsingEncoding:NSUTF8StringEncoding];
  NSError *error;
  NSDictionary *dict = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
  return error ? @{} : dict;
}

- (NSArray *)parseJSONArray:(NSString *)json {
  if (!json || json.length == 0) return @[];
  NSData *data = [json dataUsingEncoding:NSUTF8StringEncoding];
  NSError *error;
  NSArray *arr = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
  return error ? @[] : arr;
}

@end
