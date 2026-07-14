package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;
import com.itc.openim.utils.Emitter;

import open_im_sdk_callback.OnUserListener;

/**
 * 用户信息变化监听器
 * 监听用户自身信息变化、用户状态变化、用户指令变化等事件
 */
public class UserListener extends Emitter implements OnUserListener {
  private final ReactApplicationContext ctx;

  public UserListener(ReactApplicationContext ctx) {
    this.ctx = ctx;
  }

  /**
   * 自身信息更新回调
   * 当用户个人信息（如昵称、头像等）发生变化时触发
   * @param s 用户信息JSON字符串
   */
  @Override
  public void onSelfInfoUpdated(String s) {
    send(ctx, "im:selfInfoUpdated", jsonStringToMap(s));
  }

  /**
   * 用户指令添加回调
   * 当有新的用户指令被添加时触发
   * @param s 用户指令JSON字符串
   */
  @Override
  public void onUserCommandAdd(String s) {
    send(ctx, "im:userCommandAdd", jsonStringToMap(s));
  }

  /**
   * 用户指令删除回调
   * 当用户指令被删除时触发
   * @param s 用户指令JSON字符串
   */
  @Override
  public void onUserCommandDelete(String s) {
    send(ctx, "im:userCommandDelete", jsonStringToMap(s));
  }

  /**
   * 用户指令更新回调
   * 当用户指令被修改时触发
   * @param s 用户指令JSON字符串
   */
  @Override
  public void onUserCommandUpdate(String s) {
    send(ctx, "im:userCommandUpdate", jsonStringToMap(s));
  }

  /**
   * 用户在线状态变化回调
   * 当用户的上线/下线状态发生变化时触发
   * @param s 用户状态JSON字符串
   */
  @Override
  public void onUserStatusChanged(String s) {
    send(ctx, "im:userStatusChanged", jsonStringToMap(s));
  }
}
