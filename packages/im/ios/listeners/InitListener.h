//
//  InitListener.h
//  ItcOpenIM
//
//  SDK 连接状态监听器 - 对标 Android InitSDKListener
//

#import <Foundation/Foundation.h>
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@protocol InitListenerDelegate <NSObject>
- (void)pushEvent:(NSString *)eventName data:(id)data;
@end

@interface InitListener : NSObject <Open_im_sdk_callbackOnConnListener>

@property (nonatomic, weak) id<InitListenerDelegate> delegate;

- (instancetype)initWithDelegate:(id<InitListenerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
