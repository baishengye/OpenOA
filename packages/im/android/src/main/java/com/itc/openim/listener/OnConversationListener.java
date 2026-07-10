package com.itc.openim.listener;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;

import com.facebook.react.bridge.WritableMap;
import com.itc.openim.utils.Emitter;

/**
 * 会话监听器
 * 监听会话列表变化、输入状态变化、消息同步状态等事件
 */
public class OnConversationListener extends Emitter implements open_im_sdk_callback.OnConversationListener {
  private final ReactApplicationContext ctx;

  public OnConversationListener(ReactApplicationContext ctx) {
    this.ctx = ctx;
  }

  /**
   * 会话变更回调
   * 当会话列表中的会话信息发生变化时触发（如最新消息更新、未读数变化等）
   * @param s 会话列表JSON数组字符串
   */
  @Override
  public void onConversationChanged(String s) {
    send(ctx, "im:conversationChanged", jsonStringToArray(s));
  }

  /**
   * 用户输入状态变化回调
   * 当用户开始或停止输入消息时触发，用于显示"正在输入"状态
   * @param s 输入状态JSON对象，包含用户ID和输入状态
   */
  @Override
  public void onConversationUserInputStatusChanged(String s) {
    send(ctx, "im:inputStatusChanged", jsonStringToMap(s));
  }

  /**
   * 新会话创建回调
   * 当有新的会话被创建时触发（如首次与某用户/群组发消息）
   * @param s 新会话列表JSON数组字符串
   */
  @Override
  public void onNewConversation(String s) {
    send(ctx, "im:newConversation", jsonStringToArray(s));
  }

  /**
   * 消息同步失败回调
   * 当从服务器同步会话消息列表失败时触发
   * @param b 是否重新安装
   */
  @Override
  public void onSyncServerFailed(boolean b) {
    send(ctx, "im:syncServerFailed", b);
  }

  /**
   * 消息同步完成回调
   * 当从服务器同步会话消息列表完成时触发
   * @param b 是否重新安装
   */
  @Override
  public void onSyncServerFinish(boolean b) {
    send(ctx, "im:syncServerFinish", b);
  }

  /**
   * 消息同步开始回调
   * 当开始从服务器同步会话消息列表时触发
   * @param b 是否重新安装
   */
  @Override
  public void onSyncServerStart(boolean b) {
    send(ctx, "im:syncServerStart", b);
  }

  /**
   * 消息同步进度回调
   * 当从服务器同步会话消息列表的进度更新时触发
   * @param l 当前同步进度
   */
  @Override
  public void onSyncServerProgress(long l) {
    int intValue = (int) l;
    send(ctx, "im:syncServerProgress", intValue);
  }

  /**
   * 未读消息数变化回调
   * 当全局未读消息总数发生变化时触发
   * @param i 当前未读消息总数
   */
  @Override
  public void onTotalUnreadMessageCountChanged(int i) {
    send(ctx, "im:totalUnreadMessageCountChanged", i);
  }
}
