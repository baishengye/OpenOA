package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;
import com.itc.openim.utils.Emitter;

import open_im_sdk_callback.OnBatchMsgListener;

/**
 * 批量消息监听器
 * 监听批量消息接收事件，用于一次性处理多条消息
 */
public class BatchMsgListener extends Emitter implements OnBatchMsgListener {
  private final ReactApplicationContext ctx;

  public BatchMsgListener(ReactApplicationContext ctx) {
    this.ctx = ctx;
  }

  /**
   * 收到新消息批量回调
   * 当收到多条新消息时触发（批量形式）
   * @param s 消息列表JSON数组字符串
   */
  @Override
  public void onRecvNewMessages(String s) {
    send(ctx,"im:recvNewMessages",jsonStringToArray(s));
  }

  /**
   * 收到离线新消息批量回调
   * 当收到离线期间积压的多条新消息时触发（批量形式）
   * @param s 离线消息列表JSON数组字符串
   */
  @Override
  public void onRecvOfflineNewMessages(String s) {
    send(ctx,"im:recvOfflineNewMessages",jsonStringToArray(s));
  }
}
