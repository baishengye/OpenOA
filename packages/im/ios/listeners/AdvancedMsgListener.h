//
//  AdvancedMsgListener.h
//  ItcOpenIM
//
//  高级消息监听器 - 新消息/已读/撤回/删除
//

#import <Foundation/Foundation.h>
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@protocol AdvancedMsgListenerDelegate <NSObject>
- (void)pushEvent:(NSString *)eventName data:(id)data;
@end

@interface AdvancedMsgListener : NSObject <Open_im_sdk_callbackOnAdvancedMsgListener>

@property (nonatomic, weak) id<AdvancedMsgListenerDelegate> delegate;

- (instancetype)initWithDelegate:(id<AdvancedMsgListenerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
