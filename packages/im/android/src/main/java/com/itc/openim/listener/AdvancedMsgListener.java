package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;

import com.itc.openim.utils.Emitter;
import open_im_sdk_callback.OnAdvancedMsgListener;

/**
 * 高级消息监听器
 * 监听消息接收、消息撤回、已读回执等消息相关事件
 */
public class AdvancedMsgListener extends Emitter implements OnAdvancedMsgListener {
    private final ReactApplicationContext ctx;
    public AdvancedMsgListener(ReactApplicationContext ctx){
        this.ctx = ctx;
    }

    /**
     * 消息删除回调
     * 当消息被删除时触发
     * @param s 被删除的消息JSON对象
     */
  @Override
  public void onMsgDeleted(String s) {
    send(ctx,"im:msgDeleted",jsonStringToMap(s));
  }

    /**
     * 消息撤回回调
     * 当收到已撤回消息的通知时触发
     * @param s 被撤回的消息JSON对象
     */
  @Override
  public void onNewRecvMessageRevoked(String s) {
    send(ctx,"im:newRecvMessageRevoked",jsonStringToMap(s));
  }

    /**
     * C2C消息已读回执回调
     * 当对方已读自己发送的C2C消息时触发
     * @param s 已读回执列表JSON数组
     */
  @Override
  public void onRecvC2CReadReceipt(String s) {
    send(ctx,"im:recvC2CReadReceipt",jsonStringToArray(s));
  }

    /**
     * 收到新消息回调
     * 当收到新的点对点或群组消息时触发
     * @param s 新消息JSON对象
     */
  @Override
  public void onRecvNewMessage(String s) {
    send(ctx,"im:recvNewMessage",jsonStringToMap(s));
  }

    /**
     * 收到离线新消息回调
     * 当收到离线期间积压的新消息时触发
     * @param s 离线消息JSON数组
     */
  @Override
  public void onRecvOfflineNewMessage(String s) {
    send(ctx,"im:recvOfflineNewMessage",jsonStringToMap(s));
  }

    /**
     * 收到仅在线消息回调
     * 当收到仅在线设备才能接收的消息时触发（不会同步到离线消息）
     * @param s 在线消息JSON数组
     */
  @Override
  public void onRecvOnlineOnlyMessage(String s) {
    send(ctx,"im:recvOnlineOnlyMessage",jsonStringToMap(s));
  }
}
