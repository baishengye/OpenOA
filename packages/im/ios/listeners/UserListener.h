//
//  UserListener.h
//  ItcOpenIM
//
//  用户监听器 - 连接状态/用户信息变更
//

#import <Foundation/Foundation.h>
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@protocol UserListenerDelegate <NSObject>
- (void)pushEvent:(NSString *)eventName data:(id)data;
@end

@interface UserListener : NSObject <Open_im_sdk_callbackOnConnListener, Open_im_sdk_callbackOnUserListener>

@property (nonatomic, weak) id<UserListenerDelegate> delegate;

- (instancetype)initWithDelegate:(id<UserListenerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
