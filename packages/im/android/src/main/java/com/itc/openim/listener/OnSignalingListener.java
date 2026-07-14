package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;
import com.itc.openim.utils.Emitter;

/**
 * 信令监听器
 * 监听音视频通话邀请、接受、拒绝、挂断等信令相关事件
 */
public class OnSignalingListener extends Emitter implements open_im_sdk_callback.OnSignalingListener {
    private final ReactApplicationContext ctx;

    public OnSignalingListener(ReactApplicationContext ctx){
        this.ctx = ctx;
    }

    /**
     * 挂断回调
     * 当通话被挂断时触发
     * @param s 挂断信息JSON对象
     */
    @Override
    public void onHangUp(String s) {
        send(ctx,"im:hangUp",jsonStringToMap(s));
    }

    /**
     * 通话邀请被取消回调
     * 当收到的通话邀请被发起方取消时触发
     * @param s 取消信息JSON对象
     */
    @Override
    public void onInvitationCancelled(String s) {
        send(ctx,"im:invitationCancelled",jsonStringToMap(s));
    }

    /**
     * 通话邀请超时回调
     * 当通话邀请超时无响应时触发
     * @param s 超时信息JSON对象
     */
    @Override
    public void onInvitationTimeout(String s) {
        send(ctx,"im:invitationTimeout",jsonStringToMap(s));
    }

    /**
     * 被邀请者接受回调
     * 当被邀请者接受通话邀请时触发
     * @param s 接受信息JSON对象
     */
    @Override
    public void onInviteeAccepted(String s) {
        send(ctx,"im:inviteeAccepted",jsonStringToMap(s));
    }

    /**
     * 被邀请者在其他设备接受回调
     * 当被邀请者已在其他设备上接受了同一通话邀请时触发
     * @param s 其他设备接受信息JSON对象
     */
    @Override
    public void onInviteeAcceptedByOtherDevice(String s) {
        send(ctx,"im:inviteeAcceptedByOtherDevice",jsonStringToMap(s));
    }

    /**
     * 被邀请者拒绝回调
     * 当被邀请者拒绝通话邀请时触发
     * @param s 拒绝信息JSON对象
     */
    @Override
    public void onInviteeRejected(String s) {
        send(ctx,"im:inviteeRejected",jsonStringToMap(s));
    }

    /**
     * 被邀请者在其他设备拒绝回调
     * 当被邀请者已在其他设备上拒绝了同一通话邀请时触发
     * @param s 其他设备拒绝信息JSON对象
     */
    @Override
    public void onInviteeRejectedByOtherDevice(String s) {
        send(ctx,"im:inviteeRejectedByOtherDevice",jsonStringToMap(s));
    }

    /**
     * 收到新的通话邀请回调
     * 当收到新的音视频通话邀请时触发
     * @param s 通话邀请信息JSON对象
     */
    @Override
    public void onReceiveNewInvitation(String s) {
        send(ctx,"im:receiveNewInvitation",jsonStringToMap(s));
    }

    /**
     * 房间参与者连接回调
     * 当有参与者成功连接到通话房间时触发
     * @param s 参与者信息JSON对象
     */
    @Override
    public void onRoomParticipantConnected(String s) {
        send(ctx,"im:roomParticipantConnected",jsonStringToMap(s));
    }

    /**
     * 房间参与者断开回调
     * 当有参与者断开与通话房间的连接时触发
     * @param s 参与者信息JSON对象
     */
    @Override
    public void onRoomParticipantDisconnected(String s) {
        send(ctx,"im:roomParticipantDisconnected",jsonStringToMap(s));
    }
}
