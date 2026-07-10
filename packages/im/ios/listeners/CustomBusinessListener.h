//
//  CustomBusinessListener.h
//  ItcOpenIM
//
//  自定义业务消息监听器 - 接收服务器下发的自定义业务消息
//

#import <Foundation/Foundation.h>
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@protocol CustomBusinessListenerDelegate <NSObject>
- (void)pushEvent:(NSString *)eventName data:(id)data;
@end

@interface CustomBusinessListener : NSObject <Open_im_sdk_callbackOnCustomBusinessListener>

@property (nonatomic, weak) id<CustomBusinessListenerDelegate> delegate;

- (instancetype)initWithDelegate:(id<CustomBusinessListenerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
