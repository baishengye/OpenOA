package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;

import com.itc.openim.utils.Emitter;
import open_im_sdk_callback.OnAdvancedMsgListener;

public class AdvancedMsgListener extends Emitter implements OnAdvancedMsgListener {
    private final ReactApplicationContext ctx;
    public AdvancedMsgListener(ReactApplicationContext ctx){
        this.ctx = ctx;
    }


  @Override
  public void onMsgDeleted(String s) {
    send(ctx,"im:msgDeleted",jsonStringToMap(s));
  }

  @Override
  public void onNewRecvMessageRevoked(String s) {
    send(ctx,"im:newRecvMessageRevoked",jsonStringToMap(s));
  }

  @Override
  public void onRecvC2CReadReceipt(String s) {
    send(ctx,"im:recvC2CReadReceipt",jsonStringToArray(s));
  }

  @Override
  public void onRecvNewMessage(String s) {
    send(ctx,"im:recvNewMessage",jsonStringToMap(s));
  }

  @Override
  public void onRecvOfflineNewMessage(String s) {
    send(ctx,"im:recvOfflineNewMessage",jsonStringToMap(s));
  }

  @Override
  public void onRecvOnlineOnlyMessage(String s) {
    send(ctx,"im:recvOnlineOnlyMessage",jsonStringToMap(s));
  }
}
