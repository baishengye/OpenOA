package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;
import com.itc.openim.utils.Emitter;

import open_im_sdk_callback.OnUserListener;

public class UserListener extends Emitter implements OnUserListener {
  private final ReactApplicationContext ctx;

  public UserListener(ReactApplicationContext ctx) {
    this.ctx = ctx;
  }

  @Override
  public void onSelfInfoUpdated(String s) {
    send(ctx, "im:selfInfoUpdated", jsonStringToMap(s));
  }

  @Override
  public void onUserCommandAdd(String s) {

  }

  @Override
  public void onUserCommandDelete(String s) {

  }

  @Override
  public void onUserCommandUpdate(String s) {

  }

  @Override
  public void onUserStatusChanged(String s) {
    send(ctx, "im:userStatusChanged", jsonStringToMap(s));
  }
}
