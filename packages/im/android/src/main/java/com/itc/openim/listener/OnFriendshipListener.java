package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;

import com.itc.openim.utils.Emitter;

public class OnFriendshipListener extends Emitter implements open_im_sdk_callback.OnFriendshipListener {
    private final ReactApplicationContext ctx;
    public OnFriendshipListener(ReactApplicationContext ctx) {
        this.ctx = ctx;
    }


  @Override
  public void onBlackAdded(String s) {
    send(ctx,"onBlackAdded",jsonStringToMap(s));
  }

  @Override
  public void onBlackDeleted(String s) {
    send(ctx,"onBlackDeleted",jsonStringToMap(s));
  }

  @Override
  public void onFriendAdded(String s) {
    send(ctx,"im:friendAdded",jsonStringToMap(s));
  }

  @Override
  public void onFriendApplicationAccepted(String s) {
    send(ctx,"onFriendApplicationAccepted",jsonStringToMap(s));
  }

  @Override
  public void onFriendApplicationAdded(String s) {
    send(ctx,"im:friendApplicationAdded",jsonStringToMap(s));
  }

  @Override
  public void onFriendApplicationDeleted(String s) {
    send(ctx,"im:friendApplicationDeleted",jsonStringToMap(s));
  }

  @Override
  public void onFriendApplicationRejected(String s) {
    send(ctx,"onFriendApplicationRejected",jsonStringToMap(s));
  }

  @Override
  public void onFriendDeleted(String s) {
    send(ctx,"im:friendDeleted",jsonStringToMap(s));
  }

  @Override
  public void onFriendInfoChanged(String s) {
    send(ctx,"im:friendInfoChanged",jsonStringToMap(s));
  }
}
