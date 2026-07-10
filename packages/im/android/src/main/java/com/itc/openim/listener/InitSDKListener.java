package com.itc.openim.listener;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;

import com.facebook.react.bridge.WritableNativeMap;
import com.itc.openim.utils.Emitter;

import open_im_sdk_callback.OnConnListener;

public class InitSDKListener extends Emitter implements OnConnListener {
  private static final String TAG = "[itc:im:InitSDKListener]";
  private final ReactApplicationContext ctx;

  public InitSDKListener(ReactApplicationContext ctx) {
    this.ctx = ctx;
  }

  @Override
  public void onConnectFailed(int errCode, String errMsg) {
    Log.e(TAG, "onConnectFailed: errCode=" + errCode + ", errMsg=" + errMsg);
    WritableMap params = Arguments.createMap();
    params.putInt("errCode", (int) errCode);
    params.putString("errMsg", errMsg);
    send(ctx, "im:connectFailed", params);
  }

  @Override
  public void onConnectSuccess() {
    Log.i(TAG, "onConnectSuccess triggered");
    send(ctx, "im:connectSuccess", null);
  }

  @Override
  public void onConnecting() {
    Log.i(TAG, "onConnecting triggered");
    send(ctx, "im:connecting", null);
  }

  @Override
  public void onKickedOffline() {
    Log.w(TAG, "onKickedOffline triggered");
    send(ctx, "im:kickedOffline", null);
  }

  @Override
  public void onUserTokenExpired() {
    Log.w(TAG, "onUserTokenExpired triggered");
    send(ctx, "im:userTokenExpired", null);
  }

  @Override
  public void onUserTokenInvalid(String s) {
    Log.w(TAG, "onUserTokenInvalid: " + s);
    send(ctx, "im:userTokenInvalid", s);
  }
}
