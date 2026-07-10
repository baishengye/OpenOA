package com.itc.openim.utils;

import com.alibaba.fastjson.JSON;
import com.facebook.react.bridge.Promise;
import android.util.Log;

import open_im_sdk_callback.Base;

import com.itc.openim.utils.Emitter;

public class BaseImpl implements Base {
  final private Promise promise;
  private Class<?> clazz;
  private String tag;

  private Emitter emitter = new Emitter();

  public BaseImpl(Promise promise) {
    this.promise = promise;
    this.tag = "[itc:im:BaseImpl]";
  }

  public BaseImpl(Promise promise, Class<?> clazz) {
    this.promise = promise;
    this.clazz = clazz;
    this.tag = "[itc:im:BaseImpl]";
  }

  @Override
  public void onError(int ErrorCode, String ErrorMsg) {
    Log.e(tag, "onError: code=" + ErrorCode + ", msg=" + ErrorMsg);
    promise.reject(String.valueOf(ErrorCode), ErrorMsg);
  }

  @Override
  public void onSuccess(String s) {
    Log.i(tag, "onSuccess: " + s);
    if (clazz == Boolean.class || clazz == Number.class || clazz == String.class) {
      promise.resolve(JSON.parseObject(s, clazz));
      return;
    }

    if(s == null) {
      promise.resolve(null);
      return;
    }

    try {
      promise.resolve(emitter.convertJsonToMap(JSON.parseObject(s)));
    } catch (Exception e1) {
      try {
        promise.resolve(emitter.convertJsonToArray(JSON.parseArray(s)));
      } catch (Exception e2) {
        promise.resolve(s);
      }
    }
  }
}
