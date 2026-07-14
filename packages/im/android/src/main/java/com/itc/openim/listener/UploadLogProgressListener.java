package com.itc.openim.listener;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.itc.openim.utils.Emitter;

import open_im_sdk_callback.UploadLogProgress;

/**
 * 日志上传进度监听器
 * 监听日志文件上传过程中的进度变化
 */
public class UploadLogProgressListener extends Emitter implements UploadLogProgress {
  private final ReactApplicationContext ctx;
  private final String operationID;

  public UploadLogProgressListener(ReactApplicationContext ctx, String operationID) {
    this.ctx = ctx;
    this.operationID = operationID;
  }

  /**
   * 上传进度回调
   * 报告日志上传的当前进度和总大小
   * @param l 当前已上传字节数
   * @param l1 日志文件总大小
   */
  @Override
  public void onProgress(long l, long l1) {
    WritableMap params = Arguments.createMap();
    params.putDouble("current", l);
    params.putDouble("size", l1);
    params.putString("operationID", operationID);
    send(ctx,"im:uploadOnProgress",params);
  }
}
