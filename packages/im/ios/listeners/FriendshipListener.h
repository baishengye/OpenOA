//
//  FriendshipListener.h
//  ItcOpenIM
//
//  好友监听器 - 好友申请/黑名单
//

#import <Foundation/Foundation.h>
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@protocol FriendshipListenerDelegate <NSObject>
- (void)pushEvent:(NSString *)eventName data:(id)data;
@end

@interface FriendshipListener : NSObject <Open_im_sdk_callbackOnFriendshipListener>

@property (nonatomic, weak) id<FriendshipListenerDelegate> delegate;

- (instancetype)initWithDelegate:(id<FriendshipListenerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
