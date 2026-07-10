/**
 * ImGroupScreen - 群组管理测试
 *
 * 测试方法：
 * - createGroup - 创建群组
 * - joinGroup - 申请加入群组
 * - getJoinedGroupList - 获取已加入群组
 * - getGroupMemberList - 获取群组成员
 * - inviteUserToGroup - 邀请加入群组
 * - kickGroupMember - 踢出群成员
 * - setGroupInfo - 修改群信息
 * - dismissGroup - 解散群组
 * - quitGroup - 退出群组
 * - searchGroups - 搜索群组
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { itcOpenIM } from '@itc/rn-client-sdk-plus';
import { Card, Button, InputRow, ListItem, useDemo, fmt, fmtResult } from '../shared';

export function ImGroupScreen() {
  const { appendLog } = useDemo();

  // 群组列表
  const [groupList, setGroupList] = useState<any[]>([]);

  // 创建群组
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');

  // 群组成员
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [memberList, setMemberList] = useState<any[]>([]);

  // 申请加入
  const [joinGroupId, setJoinGroupId] = useState('');
  const [joinReqMsg, setJoinReqMsg] = useState('你好，我想加入本群');

  // 初始化
  useEffect(() => {
    handleGetGroupList();
  }, []);

  // 获取群组列表
  const handleGetGroupList = async () => {
    try {
      appendLog('获取群组列表...');
      const result = await itcOpenIM.getJoinedGroupList();
      const list = typeof result === 'string' ? JSON.parse(result) : result;
      setGroupList(list || []);
      appendLog(`✅ 群组数: ${list?.length || 0}`);
    } catch (e) {
      appendLog(`❌ 获取群组列表失败: ${fmt(e)}`);
    }
  };

  // 创建群组
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('提示', '请输入群组名称');
      return;
    }
    try {
      appendLog(`创建群组: ${groupName}`);
      const memberList = groupMembers
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const result = await itcOpenIM.createGroup({
        memberUserIDs: memberList,
        groupInfo: {
          groupName: groupName.trim(),
          introduction: `测试群组: ${groupName}`,
          notification: '',
        },
      });
      const data = typeof result === 'string' ? JSON.parse(result) : result;
      appendLog(`✅ 群组创建成功: ${data.groupID}`);
      setGroupName('');
      setGroupMembers('');
      handleGetGroupList();
    } catch (e) {
      appendLog(`❌ 创建失败: ${fmt(e)}`);
    }
  };

  // 获取群组成员
  const handleGetGroupMembers = async (groupId: string) => {
    try {
      appendLog(`获取成员列表: ${groupId}`);
      const result = await itcOpenIM.getGroupMemberList({ groupID: groupId, filter: 0, offset: 0, count: 100 });
      const list = typeof result === 'string' ? JSON.parse(result) : result;
      setMemberList(list || []);
      setSelectedGroupId(groupId);
      appendLog(`✅ 成员数: ${list?.length || 0}`);
    } catch (e) {
      appendLog(`❌ 获取成员失败: ${fmt(e)}`);
    }
  };

  // 邀请加入群组
  const handleInviteToGroup = async (groupId: string, userId: string) => {
    try {
      appendLog(`邀请 ${userId} 加入群组 ${groupId}`);
      await itcOpenIM.inviteUserToGroup({
        groupID: groupId,
        userIDList: [userId],
        reason: '邀请加入',
      });
      appendLog('✅ 邀请成功');
      handleGetGroupMembers(groupId);
    } catch (e) {
      appendLog(`❌ 邀请失败: ${fmt(e)}`);
    }
  };

  // 踢出群成员
  const handleKickMember = async (groupId: string, userId: string) => {
    Alert.alert('确认', `确定将 ${userId} 移出群组？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '移出',
        style: 'destructive',
        onPress: async () => {
          try {
            await itcOpenIM.kickGroupMember({
              groupID: groupId,
              userIDList: [userId],
              reason: '测试移除',
            });
            appendLog(`✅ 已移出: ${userId}`);
            handleGetGroupMembers(groupId);
          } catch (e) {
            appendLog(`❌ 移出失败: ${fmt(e)}`);
          }
        },
      },
    ]);
  };

  // 申请加入群组
  const handleJoinGroup = async () => {
    if (!joinGroupId.trim()) {
      Alert.alert('提示', '请输入群组ID');
      return;
    }
    try {
      appendLog(`申请加入群组: ${joinGroupId}`);
      await itcOpenIM.joinGroup({
        groupID: joinGroupId.trim(),
        reqMsg: joinReqMsg || '你好，我想加入本群',
        joinSource: 2,
      });
      appendLog('✅ 申请已发送');
    } catch (e) {
      appendLog(`❌ 申请失败: ${fmt(e)}`);
    }
  };

  // 退出群组
  const handleQuitGroup = async (groupId: string) => {
    Alert.alert('确认', '确定退出该群组？', [
      { text: '取消', style: 'cancel' },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          try {
            await itcOpenIM.quitGroup(groupId);
            appendLog(`✅ 已退出群组: ${groupId}`);
            handleGetGroupList();
          } catch (e) {
            appendLog(`❌ 退出失败: ${fmt(e)}`);
          }
        },
      },
    ]);
  };

  // 解散群组
  const handleDismissGroup = async (groupId: string) => {
    Alert.alert('⚠️ 警告', '确定解散该群组？此操作不可恢复！', [
      { text: '取消', style: 'cancel' },
      {
        text: '解散',
        style: 'destructive',
        onPress: async () => {
          try {
            await itcOpenIM.dismissGroup(groupId);
            appendLog(`✅ 已解散群组: ${groupId}`);
            handleGetGroupList();
          } catch (e) {
            appendLog(`❌ 解散失败: ${fmt(e)}`);
          }
        },
      },
    ]);
  };

  // 搜索群组
  const handleSearchGroups = async (keyword: string) => {
    if (!keyword.trim()) {
      Alert.alert('提示', '请输入搜索关键词');
      return;
    }
    try {
      appendLog(`搜索群组: ${keyword}`);
      const result = await itcOpenIM.searchGroups({
        keywordList: [keyword],
        isSearchGroupID: true,
        isSearchGroupName: true,
      });
      appendLog(`搜索结果: ${fmtResult(result)}`);
    } catch (e) {
      appendLog(`❌ 搜索失败: ${fmt(e)}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 创建群组 */}
      <Card title="➕ 创建群组">
        <InputRow label="群组名称" value={groupName} onChangeText={setGroupName} placeholder="输入群组名称" />
        <View style={{ height: 8 }} />
        <InputRow label="初始成员" value={groupMembers} onChangeText={setGroupMembers} placeholder="用户ID，多个用逗号分隔" />
        <View style={styles.btnRow}>
          <Button label="创建" onPress={handleCreateGroup} />
        </View>
      </Card>

      {/* 申请加入群组 */}
      <Card title="🚪 申请加入群组">
        <InputRow label="群组ID" value={joinGroupId} onChangeText={setJoinGroupId} placeholder="输入群组ID" />
        <View style={{ height: 8 }} />
        <InputRow label="申请消息" value={joinReqMsg} onChangeText={setJoinReqMsg} placeholder="输入申请消息" />
        <View style={styles.btnRow}>
          <Button label="发送申请" onPress={handleJoinGroup} />
        </View>
      </Card>

      {/* 群组列表 */}
      <Card title={`👥 我的群组 (${groupList.length})`}>
        <View style={styles.btnRow}>
          <Button label="刷新" onPress={handleGetGroupList} secondary />
          <Button label="搜索" onPress={() => handleSearchGroups(groupName)} secondary />
        </View>
        {groupList.length === 0 ? (
          <Text style={styles.hint}>暂无群组</Text>
        ) : (
          groupList.map((group: any, index: number) => (
            <ListItem
              key={index}
              label={group.groupName || group.groupID}
              subLabel={`ID: ${group.groupID}`}
              onPress={() => handleGetGroupMembers(group.groupID)}
              right={
                <View style={styles.rowActions}>
                  <Button label="成员" onPress={() => handleGetGroupMembers(group.groupID)} secondary />
                  <Button label="退" onPress={() => handleQuitGroup(group.groupID)} secondary />
                </View>
              }
            />
          ))
        )}
      </Card>

      {/* 群组成员 */}
      {selectedGroupId && (
        <Card title={`👤 群成员 (${memberList.length}) - ${selectedGroupId.slice(0, 8)}...`}>
          <View style={styles.btnRow}>
            <Button label="刷新" onPress={() => handleGetGroupMembers(selectedGroupId)} secondary />
          </View>
          {memberList.length === 0 ? (
            <Text style={styles.hint}>暂无成员</Text>
          ) : (
            memberList.map((member: any, index: number) => (
              <ListItem
                key={index}
                label={member.nickname || member.userID}
                subLabel={`${member.userID} - ${member.role === 1 ? '群主' : member.role === 2 ? '管理员' : '普通成员'}`}
                right={
                  member.role !== 1 ? (
                    <View style={styles.rowActions}>
                      <Button label="邀请" onPress={() => handleInviteToGroup(selectedGroupId, member.userID)} secondary />
                      <Button label="踢" onPress={() => handleKickMember(selectedGroupId, member.userID)} secondary />
                    </View>
                  ) : undefined
                }
              />
            ))
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  rowActions: { flexDirection: 'row', gap: 4 },
  hint: { color: '#888', fontSize: 13, marginTop: 8 },
});
