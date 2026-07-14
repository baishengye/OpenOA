package com.itc.openim.listener;

import com.facebook.react.bridge.ReactApplicationContext;
import com.itc.openim.utils.Emitter;

/**
 * 群组监听器
 * 监听群组申请、群组成员变化、群组信息变更等群组相关事件
 */
public class OnGroupListener extends Emitter implements open_im_sdk_callback.OnGroupListener {

    private final ReactApplicationContext ctx;

    public OnGroupListener(ReactApplicationContext ctx){
        this.ctx = ctx;
    }

    /**
     * 群申请被接受回调
     * 当自己申请的群组被群主/管理员接受时触发
     * @param s 群申请信息JSON对象
     */
  @Override
  public void onGroupApplicationAccepted(String s) {
    send(ctx,"im:groupApplicationAccepted",jsonStringToMap(s));
  }

    /**
     * 收到新群申请回调
     * 当群主/管理员收到新的入群申请时触发
     * @param s 群申请信息JSON对象
     */
  @Override
  public void onGroupApplicationAdded(String s) {
    send(ctx,"im:groupApplicationAdded",jsonStringToMap(s));
  }

    /**
     * 群申请被删除回调
     * 当群申请被删除（拒绝或撤销）时触发
     * @param s 群申请信息JSON对象
     */
  @Override
  public void onGroupApplicationDeleted(String s) {
    send(ctx,"im:groupApplicationDeleted",jsonStringToMap(s));
  }

    /**
     * 群申请被拒绝回调
     * 当自己的入群申请被群主/管理员拒绝时触发
     * @param s 群申请信息JSON对象
     */
  @Override
  public void onGroupApplicationRejected(String s) {
    send(ctx,"im:groupApplicationRejected",jsonStringToMap(s));
  }

    /**
     * 群组被解散回调
     * 当群组被群主解散时触发，群内所有成员都会收到
     * @param s 被解散的群组信息JSON对象
     */
  @Override
  public void onGroupDismissed(String s) {
    send(ctx,"im:groupDismissed",jsonStringToMap(s));
  }

    /**
     * 群组信息变化回调
     * 当群组的基本信息（群名、群头像等）发生变化时触发
     * @param s 更新后的群组信息JSON对象
     */
  @Override
  public void onGroupInfoChanged(String s) {
    send(ctx,"im:groupInfoChanged",jsonStringToMap(s));
  }

    /**
     * 群成员被添加回调
     * 当有新成员被邀请加入群组时触发（其他群成员视角）
     * @param s 被添加的成员信息JSON对象
     */
  @Override
  public void onGroupMemberAdded(String s) {
    send(ctx,"im:groupMemberAdded",jsonStringToMap(s));
  }

    /**
     * 群成员被移除回调
     * 当有成员被移出群组时触发（其他群成员视角）
     * @param s 被移除的成员信息JSON对象
     */
  @Override
  public void onGroupMemberDeleted(String s) {
    send(ctx,"im:groupMemberDeleted",jsonStringToMap(s));
  }

    /**
     * 群成员信息变化回调
     * 当群组成员的个人信息（昵称、角色等）发生变化时触发
     * @param s 更新后的成员信息JSON对象
     */
  @Override
  public void onGroupMemberInfoChanged(String s) {
    send(ctx,"im:groupMemberInfoChanged",jsonStringToMap(s));
  }

    /**
     * 加入群组回调
     * 当自己成功加入某个群组时触发（被邀请或主动加入）
     * @param s 加入的群组信息JSON对象
     */
  @Override
  public void onJoinedGroupAdded(String s) {
    send(ctx,"im:joinedGroupAdded",jsonStringToMap(s));
  }

    /**
     * 退出群组回调
     * 当自己主动退出某个群组时触发
     * @param s 退出的群组信息JSON对象
     */
  @Override
  public void onJoinedGroupDeleted(String s) {
    send(ctx,"im:joinedGroupDeleted",jsonStringToMap(s));
  }
}
