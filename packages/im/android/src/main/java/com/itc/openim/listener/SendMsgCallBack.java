package com.itc.openim.listener;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;

import com.itc.openim.utils.Emitter;

import java.util.HashMap;
import java.util.Map;

/**
 * 发送消息回调
 * 处理消息发送进度、成功、失败等回调
 */
public class SendMsgCallBack extends Emitter implements open_im_sdk_callback.SendMsgCallBack {
  final ReactApplicationContext ctx;
  final private Promise promise;
  final private ReadableMap message;

  public SendMsgCallBack(ReactApplicationContext ctx, Promise promise, JSONObject jsonMessage) {
    this.ctx = ctx;
    this.promise = promise;
    this.message = convertJSONObjectToReadableMap(jsonMessage);
  }

  private static ReadableMap convertJSONObjectToReadableMap(JSONObject jsonObject) {
    if (jsonObject == null) {
      return Arguments.createMap();
    }
    Map<String, Object> map = new HashMap<>(jsonObject);
    return Arguments.makeNativeMap(map);
  }

  @Override
  public void onError(int ErrCode, String ErrString) {
    promise.reject(String.valueOf(ErrCode), ErrString);
  }

  @Override
  public void onProgress(long progress) {
    WritableMap params = Arguments.createMap();
    params.putDouble("progress", progress);
    params.putMap("message", Arguments.makeNativeMap(message.toHashMap()));
    send(ctx, "im:sendMessageProgress", params);
  }

  @Override
  public void onSuccess(String s) {
    JSONObject resultObj = JSON.parseObject(s);
    promise.resolve(convertJsonToMap(resultObj));
  }
}
