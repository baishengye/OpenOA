#import <Foundation/Foundation.h>

@class ItcOpenIMSDK;

/**
 * OpenIM SDK 消息监听器（iOS）。
 */
@interface RNAdvancedMsgListener : NSObject

@property (nonatomic, weak) ItcOpenIMSDK *module;

- (instancetype)initWithModule:(ItcOpenIMSDK *)module;

// 消息回调
- (void)onRecvNewMessage:(NSString *)msg clientMsgID:(NSString *)clientMsgID serverMsgID:(NSString *)serverMsgID;
- (void)onRecvOfflineNewMessage:(NSString *)msg clientMsgID:(NSString *)clientMsgID serverMsgID:(NSString *)serverMsgID;
- (void)onMsgDeleted:(NSString *)msg;
- (void)onRecvC2CReadReceipt:(NSString *)recvID msgIDList:(NSString *)msgIDList;
- (void)onNewRecvMessageRevoked:(NSString *)revokedMsg;
- (void)onRecvMessageExtensionsChanged:(NSString *)msgID extensions:(NSString *)extensions;

@end
