#import <Foundation/Foundation.h>

@class ItcOpenIMSDK;

/**
 * OpenIM SDK 会话监听器（iOS）。
 */
@interface RNConversationListener : NSObject

@property (nonatomic, weak) ItcOpenIMSDK *module;

- (instancetype)initWithModule:(ItcOpenIMSDK *)module;

// 会话回调
- (void)onConversationChanged:(NSString *)conversationList;
- (void)onNewConversation:(NSString *)conversationList;
- (void)onTotalUnreadMessageCountChanged:(NSInteger)totalUnreadCount;
- (void)onSyncServerStart;
- (void)onSyncServerFinish;
- (void)onSyncServerFailed;

@end
