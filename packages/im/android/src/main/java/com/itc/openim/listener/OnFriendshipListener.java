package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;

import com.itc.openim.utils.Emitter;

/**
 * 好友关系监听器
 * 监听好友申请、好友状态、黑名单等好友关系相关事件
 */
public class OnFriendshipListener extends Emitter implements open_im_sdk_callback.OnFriendshipListener {
    private final ReactApplicationContext ctx;
    public OnFriendshipListener(ReactApplicationContext ctx) {
        this.ctx = ctx;
    }

    /**
     * 好友被加入黑名单回调
     * 当将某个用户添加到黑名单时触发
     * @param s 黑名单用户信息JSON对象
     */
  @Override
  public void onBlackAdded(String s) {
    send(ctx,"im:blackAdded",jsonStringToMap(s));
  }

    /**
     * 好友从黑名单移除回调
     * 当将某个用户从黑名单移除时触发
     * @param s 被移除的用户信息JSON对象
     */
  @Override
  public void onBlackDeleted(String s) {
    send(ctx,"im:blackDeleted",jsonStringToMap(s));
  }

    /**
     * 好友添加成功回调
     * 当好友申请被对方接受并添加成功时触发
     * @param s 好友信息JSON对象
     */
  @Override
  public void onFriendAdded(String s) {
    send(ctx,"im:friendAdded",jsonStringToMap(s));
  }

    /**
     * 好友申请被接受回调
     * 当自己发送的好友申请被对方接受时触发
     * @param s 好友申请信息JSON对象
     */
  @Override
  public void onFriendApplicationAccepted(String s) {
    send(ctx,"im:friendApplicationAccepted",jsonStringToMap(s));
  }

    /**
     * 收到新好友申请回调
     * 当收到新的好友申请时触发
     * @param s 好友申请信息JSON对象
     */
  @Override
  public void onFriendApplicationAdded(String s) {
    send(ctx,"im:friendApplicationAdded",jsonStringToMap(s));
  }

    /**
     * 好友申请被删除回调
     * 当好友申请被删除（拒绝或撤销）时触发
     * @param s 好友申请信息JSON对象
     */
  @Override
  public void onFriendApplicationDeleted(String s) {
    send(ctx,"im:friendApplicationDeleted",jsonStringToMap(s));
  }

    /**
     * 好友申请被拒绝回调
     * 当自己发送的好友申请被对方拒绝时触发
     * @param s 好友申请信息JSON对象
     */
  @Override
  public void onFriendApplicationRejected(String s) {
    send(ctx,"im:friendApplicationRejected",jsonStringToMap(s));
  }

    /**
     * 好友被删除回调
     * 当好友关系被解除时触发
     * @param s 被删除的好友信息JSON对象
     */
  @Override
  public void onFriendDeleted(String s) {
    send(ctx,"im:friendDeleted",jsonStringToMap(s));
  }

    /**
     * 好友信息变化回调
     * 当好友的个人信息发生变化时触发
     * @param s 更新后的好友信息JSON对象
     */
  @Override
  public void onFriendInfoChanged(String s) {
    send(ctx,"im:friendInfoChanged",jsonStringToMap(s));
  }
}
