//
//  SignalingListener.mm
//  ItcOpenIM
//
//  信令监听器 - 音视频通话邀请/接受/拒绝/挂断
//

#import "SignalingListener.h"
#import "../utils/JSONExtensionsPlus.h"

@implementation SignalingListener

- (instancetype)initWithDelegate:(id<SignalingListenerDelegate>)delegate {
    if (self = [super init]) {
        _delegate = delegate;
    }
    return self;
}

#pragma mark - Open_im_sdk_callbackOnSignalingListener

/// 挂断回调
/// 当通话被挂断时触发
- (void)onHangUp:(NSString *)hangUpInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(hangUpInfo);
    [self pushEvent:@"im:hangUp" data:data];
}

/// 通话邀请被取消回调
/// 当收到的通话邀请被发起方取消时触发
- (void)onInvitationCancelled:(NSString *)cancelInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(cancelInfo);
    [self pushEvent:@"im:invitationCancelled" data:data];
}

/// 通话邀请超时回调
/// 当通话邀请超时无响应时触发
- (void)onInvitationTimeout:(NSString *)timeoutInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(timeoutInfo);
    [self pushEvent:@"im:invitationTimeout" data:data];
}

/// 被邀请者接受回调
/// 当被邀请者接受通话邀请时触发
- (void)onInviteeAccepted:(NSString *)acceptInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(acceptInfo);
    [self pushEvent:@"im:inviteeAccepted" data:data];
}

/// 被邀请者在其他设备接受回调
/// 当被邀请者已在其他设备上接受了同一通话邀请时触发
- (void)onInviteeAcceptedByOtherDevice:(NSString *)acceptInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(acceptInfo);
    [self pushEvent:@"im:inviteeAcceptedByOtherDevice" data:data];
}

/// 被邀请者拒绝回调
/// 当被邀请者拒绝通话邀请时触发
- (void)onInviteeRejected:(NSString *)rejectInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(rejectInfo);
    [self pushEvent:@"im:inviteeRejected" data:data];
}

/// 被邀请者在其他设备拒绝回调
/// 当被邀请者已在其他设备上拒绝了同一通话邀请时触发
- (void)onInviteeRejectedByOtherDevice:(NSString *)rejectInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(rejectInfo);
    [self pushEvent:@"im:inviteeRejectedByOtherDevice" data:data];
}

/// 收到新的通话邀请回调
/// 当收到新的音视频通话邀请时触发
- (void)onReceiveNewInvitation:(NSString *)invitationInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(invitationInfo);
    [self pushEvent:@"im:receiveNewInvitation" data:data];
}

/// 房间参与者连接回调
/// 当有参与者成功连接到通话房间时触发
- (void)onRoomParticipantConnected:(NSString *)participantInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(participantInfo);
    [self pushEvent:@"im:roomParticipantConnected" data:data];
}

/// 房间参与者断开回调
/// 当有参与者断开与通话房间的连接时触发
- (void)onRoomParticipantDisconnected:(NSString *)participantInfo {
    NSDictionary *data = ItcParseJsonStr2DictPlus(participantInfo);
    [self pushEvent:@"im:roomParticipantDisconnected" data:data];
}

#pragma mark - Private

- (void)pushEvent:(NSString *)eventName data:(id)data {
    [self.delegate pushEvent:eventName data:data];
}

@end
