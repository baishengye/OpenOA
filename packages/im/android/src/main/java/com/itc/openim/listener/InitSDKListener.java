package com.itc.openim.listener;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;

import com.facebook.react.bridge.WritableNativeMap;
import com.itc.openim.utils.Emitter;

import open_im_sdk_callback.OnConnListener;

/**
 * SDK连接状态监听器
 * 监听SDK与服务器的连接状态变化、登录状态变化等核心事件
 */
public class InitSDKListener extends Emitter implements OnConnListener {
  private static final String TAG = "[itc:im:InitSDKListener]";
  private final ReactApplicationContext ctx;

  public InitSDKListener(ReactApplicationContext ctx) {
    this.ctx = ctx;
  }

  /**
   * 连接失败回调
   * 当SDK与服务器建立连接失败时触发
   * @param errCode 错误码
   * @param errMsg 错误信息
   */
  @Override
  public void onConnectFailed(int errCode, String errMsg) {
    Log.e(TAG, "onConnectFailed: errCode=" + errCode + ", errMsg=" + errMsg);
    WritableMap params = Arguments.createMap();
    params.putInt("errCode", (int) errCode);
    params.putString("errMsg", errMsg);
    send(ctx, "im:connectFailed", params);
  }

  /**
   * 连接成功回调
   * 当SDK与服务器成功建立连接时触发
   */
  @Override
  public void onConnectSuccess() {
    Log.i(TAG, "onConnectSuccess triggered");
    send(ctx, "im:connectSuccess", null);
  }

  /**
   * 连接中回调
   * 当SDK正在与服务器建立连接时触发
   */
  @Override
  public void onConnecting() {
    Log.i(TAG, "onConnecting triggered");
    send(ctx, "im:connecting", null);
  }

  /**
   * 被踢下线回调
   * 当用户账号在另一设备登录导致当前设备被踢下线时触发
   */
  @Override
  public void onKickedOffline() {
    Log.w(TAG, "onKickedOffline triggered");
    send(ctx, "im:kickedOffline", null);
  }

  /**
   * 用户Token过期回调
   * 当登录Token过期需要刷新时触发
   */
  @Override
  public void onUserTokenExpired() {
    Log.w(TAG, "onUserTokenExpired triggered");
    send(ctx, "im:userTokenExpired", null);
  }

  /**
   * 用户Token无效回调
   * 当登录Token无效时触发，需要重新登录
   * @param s 无效的Token信息
   */
  @Override
  public void onUserTokenInvalid(String s) {
    Log.w(TAG, "onUserTokenInvalid: " + s);
    send(ctx, "im:userTokenInvalid", s);
  }
}
