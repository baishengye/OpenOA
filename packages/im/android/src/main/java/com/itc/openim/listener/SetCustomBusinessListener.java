package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;
import com.itc.openim.utils.Emitter;

import open_im_sdk_callback.OnCustomBusinessListener;

/**
 * 自定义业务消息监听器
 * 接收由服务器下发的自定义业务消息
 */
public class SetCustomBusinessListener extends Emitter implements OnCustomBusinessListener {
  private final ReactApplicationContext ctx;

  public SetCustomBusinessListener(ReactApplicationContext ctx) {
    this.ctx = ctx;
  }

  /**
   * 接收自定义业务消息回调
   * 当收到服务器下发的自定义业务消息时触发
   * @param s 业务消息JSON字符串
   */
  @Override
  public void onRecvCustomBusinessMessage(String s) {
    send(ctx,"im:recvCustomBusinessMessage",jsonStringToMap(s));
  }
}
