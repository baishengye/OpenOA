#import <Foundation/Foundation.h>

@class ItcOpenIMSDK;

/**
 * OpenIM SDK 群组监听器（iOS）。
 */
@interface RNGroupListener : NSObject

@property (nonatomic, weak) ItcOpenIMSDK *module;

- (instancetype)initWithModule:(ItcOpenIMSDK *)module;

// 群组回调
- (void)onJoinedGroupAdded:(NSString *)groupInfo;
- (void)onJoinedGroupDeleted:(NSString *)groupInfo;
- (void)onGroupDismissed:(NSString *)groupID;
- (void)onGroupInfoChanged:(NSString *)groupID changeInfo:(NSString *)changeInfo;
- (void)onGroupMemberAdded:(NSString *)groupID addedMemberInfo:(NSString *)addedMemberInfo;
- (void)onGroupMemberDeleted:(NSString *)groupID removedMemberInfo:(NSString *)removedMemberInfo;
- (void)onGroupMemberInfoChanged:(NSString *)groupID memberInfo:(NSString *)memberInfo;
- (void)onGroupApplicationAdded:(NSString *)groupApplication;
- (void)onGroupApplicationDeleted:(NSString *)groupApplication;
- (void)onGroupApplicationAccepted:(NSString *)groupApplication;
- (void)onGroupApplicationRejected:(NSString *)groupApplication;

@end
