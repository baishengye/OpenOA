//
//  BatchMsgListener.h
//  ItcOpenIM
//
//  批量消息监听器 - 离线消息/在线消息
//

#import <Foundation/Foundation.h>
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@protocol BatchMsgListenerDelegate <NSObject>
- (void)pushEvent:(NSString *)eventName data:(id)data;
@end

@interface BatchMsgListener : NSObject <Open_im_sdk_callbackOnBatchMsgListener>

@property (nonatomic, weak) id<BatchMsgListenerDelegate> delegate;

- (instancetype)initWithDelegate:(id<BatchMsgListenerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
