package com.itc.openim.listener;

import com.alibaba.fastjson.JSONObject;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Map;

import com.itc.openim.utils.Emitter;

public class OnGroupListener extends Emitter implements open_im_sdk_callback.OnGroupListener {

    private final ReactApplicationContext ctx;

    public OnGroupListener(ReactApplicationContext ctx){
        this.ctx = ctx;
    }


  @Override
  public void onGroupApplicationAccepted(String s) {
    send(ctx,"im:groupApplicationAccepted",jsonStringToMap(s));
  }

  @Override
  public void onGroupApplicationAdded(String s) {
    send(ctx,"im:groupApplicationAdded",jsonStringToMap(s));
  }

  @Override
  public void onGroupApplicationDeleted(String s) {
    send(ctx,"im:groupApplicationDeleted",jsonStringToMap(s));
  }

  @Override
  public void onGroupApplicationRejected(String s) {
    send(ctx,"im:groupApplicationRejected",jsonStringToMap(s));
  }

  @Override
  public void onGroupDismissed(String s) {
    send(ctx,"im:groupDismissed",jsonStringToMap(s));
  }

  @Override
  public void onGroupInfoChanged(String s) {
    send(ctx,"im:groupInfoChanged",jsonStringToMap(s));
  }

  @Override
  public void onGroupMemberAdded(String s) {
    send(ctx,"im:groupMemberAdded",jsonStringToMap(s));
  }

  @Override
  public void onGroupMemberDeleted(String s) {
    send(ctx,"im:groupMemberDeleted",jsonStringToMap(s));
  }

  @Override
  public void onGroupMemberInfoChanged(String s) {
    send(ctx,"im:groupMemberInfoChanged",jsonStringToMap(s));
  }

  @Override
  public void onJoinedGroupAdded(String s) {
    send(ctx,"im:joinedGroupAdded",jsonStringToMap(s));
  }

  @Override
  public void onJoinedGroupDeleted(String s) {
    send(ctx,"im:joinedGroupDeleted",jsonStringToMap(s));
  }
}
