//
//  SignalingListener.h
//  ItcOpenIM
//
//  信令监听器 - 音视频通话邀请/接受/拒绝/挂断
//

#import <Foundation/Foundation.h>
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@protocol SignalingListenerDelegate <NSObject>
- (void)pushEvent:(NSString *)eventName data:(id)data;
@end

@interface SignalingListener : NSObject <Open_im_sdk_callbackOnSignalingListener>

@property (nonatomic, weak) id<SignalingListenerDelegate> delegate;

- (instancetype)initWithDelegate:(id<SignalingListenerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
