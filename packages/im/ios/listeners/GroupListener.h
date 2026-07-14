//
//  GroupListener.h
//  ItcOpenIM
//
//  群组监听器 - 群组事件
//

#import <Foundation/Foundation.h>
#import <OpenIMCore/OpenIMCore.h>

NS_ASSUME_NONNULL_BEGIN

@protocol GroupListenerDelegate <NSObject>
- (void)pushEvent:(NSString *)eventName data:(id)data;
@end

@interface GroupListener : NSObject <Open_im_sdk_callbackOnGroupListener>

@property (nonatomic, weak) id<GroupListenerDelegate> delegate;

- (instancetype)initWithDelegate:(id<GroupListenerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
