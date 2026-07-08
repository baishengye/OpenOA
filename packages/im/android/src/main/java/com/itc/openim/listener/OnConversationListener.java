package com.itc.openim.listener;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;

import com.facebook.react.bridge.WritableMap;
import com.itc.openim.utils.Emitter;


public class OnConversationListener extends Emitter implements open_im_sdk_callback.OnConversationListener {
  private final ReactApplicationContext ctx;

  public OnConversationListener(ReactApplicationContext ctx) {
    this.ctx = ctx;
  }


  @Override
  public void onConversationChanged(String s) {
    send(ctx, "im:conversationChanged", jsonStringToArray(s));
  }

  @Override
  public void onConversationUserInputStatusChanged(String s) {
    send(ctx, "onInputStatusChanged", jsonStringToMap(s));
  }

  @Override
  public void onNewConversation(String s) {
    send(ctx, "im:newConversation", jsonStringToArray(s));
  }

  @Override
  public void onSyncServerFailed(boolean b) {
    send(ctx, "im:syncServerFailed", b);
  }

  @Override
  public void onSyncServerFinish(boolean b) {
    send(ctx, "im:syncServerFinish", b);
  }

  @Override
  public void onSyncServerStart(boolean b) {
    send(ctx, "onSyncServerStart", b);
  }

  @Override
  public void onSyncServerProgress(long l) {
    int intValue = (int) l;
    send(ctx, "im:syncServerProgress", intValue);
  }

  @Override
  public void onTotalUnreadMessageCountChanged(int i) {
    send(ctx, "onTotalUnreadMessageCountChanged", i);
  }
}
