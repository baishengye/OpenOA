#import <Foundation/Foundation.h>

@class ItcOpenIMSDK;

/**
 * OpenIM SDK 好友监听器（iOS）。
 */
@interface RNFriendshipListener : NSObject

@property (nonatomic, weak) ItcOpenIMSDK *module;

- (instancetype)initWithModule:(ItcOpenIMSDK *)module;

// 好友回调
- (void)onFriendAdded:(NSString *)friendInfo;
- (void)onFriendDeleted:(NSString *)friendInfo;
- (void)onFriendInfoChanged:(NSString *)friendInfo;
- (void)onFriendApplicationAdded:(NSString *)friendApplication;
- (void)onFriendApplicationDeleted:(NSString *)friendApplication;
- (void)onFriendApplicationAccepted:(NSString *)friendApplication;
- (void)onFriendApplicationRejected:(NSString *)friendApplication;
- (void)onBlackAdded:(NSString *)blackInfo;
- (void)onBlackDeleted:(NSString *)blackInfo;

@end
