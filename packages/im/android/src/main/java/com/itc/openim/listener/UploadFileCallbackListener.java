package com.itc.openim.listener;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.itc.openim.utils.Emitter;

import open_im_sdk_callback.UploadFileCallback;

/**
 * 文件上传回调监听器
 * 监听文件上传过程中的各种状态和进度事件
 */
public class UploadFileCallbackListener extends Emitter implements UploadFileCallback {
  private final ReactApplicationContext ctx;
  private final String operationID;
  public UploadFileCallbackListener(ReactApplicationContext ctx,String operationID){
    this.ctx = ctx;
    this.operationID = operationID;
  }

  /**
   * 上传完成回调（基础完成）
   * 当文件上传完成并获取到URL时触发
   * @param l 文件大小
   * @param s 上传后的文件URL
   * @param l1 存储大小
   */
  @Override
  public void complete(long l, String s, long l1) {
    WritableMap params = Arguments.createMap();
    params.putInt("errCode", 0);
    params.putString("errMsg", "");
    WritableMap data = new WritableNativeMap();
    data.putString("url", s);
    data.putString("operationID", operationID);
    params.putMap("data", data);
    send(ctx,"im:uploadComplete",params);
  }

  /**
   * Hash分片完成回调
   * 当所有分片的Hash计算完成时触发
   * @param s 分片Hash列表
   * @param s1 整体文件Hash
   */
  @Override
  public void hashPartComplete(String s, String s1) {
    WritableMap params = Arguments.createMap();
    params.putInt("errCode", 0);
    params.putString("errMsg", "");
    WritableMap data = new WritableNativeMap();
    data.putString("partsHash", s);
    data.putString("fileHash", s1);
    data.putString("operationID", operationID);
    params.putMap("data", data);
    send(ctx,"im:uploadHashPartComplete",params);
  }

  /**
   * Hash分片进度回调
   * 计算每个分片Hash时的进度回调
   * @param l 当前分片索引
   * @param l1 当前分片大小
   * @param s 当前分片Hash值
   */
  @Override
  public void hashPartProgress(long l, long l1, String s) {
    WritableMap data = Arguments.createMap();
    data.putDouble("index", l);
    data.putDouble("size", l1);
    data.putString("partHash", s);
    data.putString("operationID", operationID);
    send(ctx,"im:uploadHashPartProgress",data);
  }

  /**
   * 文件打开回调
   * 开始处理文件时触发，报告待上传文件大小
   * @param l 文件总大小
   */
  @Override
  public void open(long l) {
    WritableMap data = Arguments.createMap();
    data.putDouble("size", l);
    data.putString("operationID", operationID);
    send(ctx,"im:uploadOpen",data);
  }

  /**
   * 分片大小计算回调
   * 计算出分片大小和总分片数时触发
   * @param l 单个分片大小
   * @param l1 分片总数
   */
  @Override
  public void partSize(long l, long l1) {
    WritableMap data = Arguments.createMap();
    data.putDouble("partSize", l);
    data.putDouble("num", l1);
    data.putString("operationID", operationID);
    send(ctx,"im:uploadPartSize",data);
  }

  /**
   * 上传完成回调（详细）
   * 当文件全部上传完成时触发，包含详细的文件大小信息
   * @param l 文件大小
   * @param l1 流大小
   * @param l2 实际存储大小
   */
  @Override
  public void uploadComplete(long l, long l1, long l2) {
    WritableMap params = Arguments.createMap();
    params.putInt("errCode", 0);
    params.putString("errMsg", "");
    WritableMap data = new WritableNativeMap();
    data.putDouble("fileSize", l);
    data.putDouble("streamSize", l1);
    data.putDouble("storageSize", l2);
    data.putString("operationID", operationID);
    params.putMap("data", data);
    send(ctx,"im:uploadComplete",params);
  }

  /**
   * 上传ID回调
   * 开始上传时获取到上传任务ID时触发
   * @param s 上传任务ID
   */
  @Override
  public void uploadID(String s) {
    WritableMap data = Arguments.createMap();
    data.putString("uploadID", s);
    data.putString("operationID", operationID);
    send(ctx,"im:uploadID",data);
  }

  /**
   * 分片上传完成回调
   * 当某个分片上传完成时触发
   * @param l 分片索引
   * @param l1 分片大小
   * @param s 分片Hash
   */
  @Override
  public void uploadPartComplete(long l, long l1, String s) {
    WritableMap data = Arguments.createMap();
    data.putDouble("index", l);
    data.putDouble("partSize", l1);
    data.putString("partHash", s);
    data.putString("operationID", operationID);
    send(ctx,"im:uploadPartComplete",data);
  }
}
