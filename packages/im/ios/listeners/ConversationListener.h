//
//  ConversationListener.h
//  ItcOpenIM
//
//  会话监听器 - 会话变更/输入状态/同步
//

#import <Foundation/Foundation.h>
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@protocol ConversationListenerDelegate <NSObject>
- (void)pushEvent:(NSString *)eventName data:(id)data;
@end

@interface ConversationListener : NSObject <Open_im_sdk_callbackOnConversationListener>

@property (nonatomic, weak) id<ConversationListenerDelegate> delegate;

- (instancetype)initWithDelegate:(id<ConversationListenerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
