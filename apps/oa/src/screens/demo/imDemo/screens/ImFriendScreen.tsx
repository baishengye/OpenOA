/**
 * ImFriendScreen - 好友管理测试
 *
 * 测试方法：
 * - addFriend - 添加好友
 * - getFriendList - 获取好友列表
 * - getFriendListPage - 分页获取好友列表
 * - searchFriends - 搜索好友
 * - deleteFriend - 删除好友
 * - setFriendRemark - 设置好友备注
 * - getBlackList - 获取黑名单
 * - addBlack - 添加黑名单
 * - removeBlack - 移除黑名单
 * - getFriendApplicationListAsApplicant - 获取发出的好友申请
 * - getFriendApplicationListAsRecipient - 获取收到的好友申请
 * - acceptFriendApplication - 同意好友申请
 * - refuseFriendApplication - 拒绝好友申请
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { itcOpenIM } from '@itc/rn-client-sdk-plus';
import { Card, Button, InputRow, ListItem, useDemo, fmt } from '../shared';

export function ImFriendScreen() {
  const { appendLog } = useDemo();

  // 好友列表
  const [friendList, setFriendList] = useState<any[]>([]);

  // 添加好友
  const [addFriendId, setAddFriendId] = useState('');
  const [addFriendReqMsg, setAddFriendReqMsg] = useState('你好，我是xxx');

  // 好友申请
  const [receivedApplications, setReceivedApplications] = useState<any[]>([]);
  const [sentApplications, setSentApplications] = useState<any[]>([]);

  // 黑名单
  const [blackList, setBlackList] = useState<any[]>([]);

  // 初始化
  useEffect(() => {
    handleGetFriendList();
  }, []);

  // 获取好友列表
  const handleGetFriendList = async () => {
    try {
      appendLog('获取好友列表...');
      const result = await itcOpenIM.getFriendList(true);
      const list = typeof result === 'string' ? JSON.parse(result) : result;
      setFriendList(list || []);
      appendLog(`✅ 好友数: ${list?.length || 0}`);
    } catch (e) {
      appendLog(`❌ 获取好友列表失败: ${fmt(e)}`);
    }
  };

  // 添加好友
  const handleAddFriend = async () => {
    if (!addFriendId.trim()) {
      Alert.alert('提示', '请输入好友ID');
      return;
    }
    try {
      appendLog(`添加好友: ${addFriendId}`);
      await itcOpenIM.addFriend({
        toUserID: addFriendId.trim(),
        reqMsg: addFriendReqMsg || '你好',
      });
      appendLog('✅ 发送好友申请成功');
      setAddFriendId('');
    } catch (e) {
      appendLog(`❌ 添加失败: ${fmt(e)}`);
    }
  };

  // 删除好友
  const handleDeleteFriend = async (friendId: string) => {
    Alert.alert('确认', `确定删除好友 ${friendId}？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await itcOpenIM.deleteFriend(friendId);
            appendLog(`✅ 已删除好友: ${friendId}`);
            handleGetFriendList();
          } catch (e) {
            appendLog(`❌ 删除失败: ${fmt(e)}`);
          }
        },
      },
    ]);
  };

  // 搜索好友
  const handleSearchFriend = async (searchText: string) => {
    if (!searchText.trim()) {
      Alert.alert('提示', '请输入搜索内容');
      return;
    }
    try {
      appendLog(`搜索好友: ${searchText}`);
      const result = await itcOpenIM.searchFriends({
        keywordList: [searchText],
        isSearchUserID: true,
        isSearchNickname: true,
        isSearchRemark: true,
      });
      appendLog(`搜索结果: ${fmt(result)}`);
    } catch (e) {
      appendLog(`❌ 搜索失败: ${fmt(e)}`);
    }
  };

  // 获取好友申请列表
  const handleGetApplications = async () => {
    try {
      appendLog('获取好友申请列表...');
      // 收到的申请
      const received = await itcOpenIM.getFriendApplicationListAsRecipient();
      const receivedList = typeof received === 'string' ? JSON.parse(received) : received;
      setReceivedApplications(receivedList?.applicantList || []);

      // 发出的申请
      const sent = await itcOpenIM.getFriendApplicationListAsApplicant();
      const sentList = typeof sent === 'string' ? JSON.parse(sent) : sent;
      setSentApplications(sentList?.applicantList || []);

      appendLog(`✅ 收到: ${receivedList?.applicantList?.length || 0}, 发出: ${sentList?.applicantList?.length || 0}`);
    } catch (e) {
      appendLog(`❌ 获取申请列表失败: ${fmt(e)}`);
    }
  };

  // 同意好友申请
  const handleAcceptApplication = async (userId: string) => {
    try {
      await itcOpenIM.acceptFriendApplication({ toUserID: userId, handleMsg: '同意' });
      appendLog(`✅ 已同意: ${userId}`);
      handleGetApplications();
      handleGetFriendList();
    } catch (e) {
      appendLog(`❌ 同意失败: ${fmt(e)}`);
    }
  };

  // 拒绝好友申请
  const handleRefuseApplication = async (userId: string) => {
    try {
      await itcOpenIM.refuseFriendApplication({ toUserID: userId, handleMsg: '拒绝' });
      appendLog(`✅ 已拒绝: ${userId}`);
      handleGetApplications();
    } catch (e) {
      appendLog(`❌ 拒绝失败: ${fmt(e)}`);
    }
  };

  // 获取黑名单
  const handleGetBlackList = async () => {
    try {
      appendLog('获取黑名单...');
      const result = await itcOpenIM.getBlackList();
      const list = typeof result === 'string' ? JSON.parse(result) : result;
      setBlackList(list || []);
      appendLog(`✅ 黑名单数: ${list?.length || 0}`);
    } catch (e) {
      appendLog(`❌ 获取黑名单失败: ${fmt(e)}`);
    }
  };

  // 添加黑名单
  const handleAddBlack = async (userId: string) => {
    try {
      await itcOpenIM.addBlack({ toUserID: userId });
      appendLog(`✅ 已加入黑名单: ${userId}`);
      handleGetBlackList();
    } catch (e) {
      appendLog(`❌ 加入黑名单失败: ${fmt(e)}`);
    }
  };

  // 移出黑名单
  const handleRemoveBlack = async (userId: string) => {
    try {
      await itcOpenIM.removeBlack(userId);
      appendLog(`✅ 已移出黑名单: ${userId}`);
      handleGetBlackList();
    } catch (e) {
      appendLog(`❌ 移出失败: ${fmt(e)}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 添加好友 */}
      <Card title="➕ 添加好友">
        <InputRow label="用户ID" value={addFriendId} onChangeText={setAddFriendId} placeholder="输入用户ID" />
        <View style={{ height: 8 }} />
        <InputRow label="申请消息" value={addFriendReqMsg} onChangeText={setAddFriendReqMsg} placeholder="输入申请消息" />
        <View style={styles.btnRow}>
          <Button label="发送申请" onPress={handleAddFriend} />
        </View>
      </Card>

      {/* 好友列表 */}
      <Card title={`👥 好友列表 (${friendList.length})`}>
        <View style={styles.btnRow}>
          <Button label="刷新" onPress={handleGetFriendList} secondary />
          <Button label="搜索" onPress={() => handleSearchFriend(addFriendId)} secondary />
        </View>
        {friendList.length === 0 ? (
          <Text style={styles.hint}>暂无好友</Text>
        ) : (
          friendList.slice(0, 10).map((friend: any, index: number) => (
            <ListItem
              key={index}
              label={friend.nickname || friend.userID}
              subLabel={friend.userID}
              right={
                <View style={styles.rowActions}>
                  <Button label="删除" onPress={() => handleDeleteFriend(friend.userID)} secondary />
                </View>
              }
            />
          ))
        )}
        {friendList.length > 10 && (
          <Text style={styles.hint}>还有 {friendList.length - 10} 个好友...</Text>
        )}
      </Card>

      {/* 好友申请 */}
      <Card title="📨 好友申请">
        <View style={styles.btnRow}>
          <Button label="刷新" onPress={handleGetApplications} secondary />
        </View>

        <Text style={styles.sectionTitle}>收到的申请 ({receivedApplications.length})</Text>
        {receivedApplications.length === 0 ? (
          <Text style={styles.hint}>暂无收到的申请</Text>
        ) : (
          receivedApplications.map((app: any, index: number) => (
            <ListItem
              key={index}
              label={app.nickname || app.userID}
              subLabel={`${app.userID} - ${app.reqMsg || '无留言'}`}
              right={
                <View style={styles.rowActions}>
                  <Button label="同意" onPress={() => handleAcceptApplication(app.userID)} secondary />
                  <Button label="拒绝" onPress={() => handleRefuseApplication(app.userID)} secondary />
                </View>
              }
            />
          ))
        )}

        <Text style={styles.sectionTitle}>发出的申请 ({sentApplications.length})</Text>
        {sentApplications.length === 0 ? (
          <Text style={styles.hint}>暂无发出的申请</Text>
        ) : (
          sentApplications.slice(0, 5).map((app: any, index: number) => (
            <ListItem
              key={index}
              label={app.nickname || app.userID}
              subLabel={`${app.userID} - ${app.flag === 1 ? '已同意' : app.flag === 2 ? '已拒绝' : '待处理'}`}
            />
          ))
        )}
      </Card>

      {/* 黑名单 */}
      <Card title="🚫 黑名单">
        <View style={styles.btnRow}>
          <Button label="刷新" onPress={handleGetBlackList} secondary />
        </View>
        {blackList.length === 0 ? (
          <Text style={styles.hint}>黑名单为空</Text>
        ) : (
          blackList.map((user: any, index: number) => (
            <ListItem
              key={index}
              label={user.nickname || user.userID}
              subLabel={user.userID}
              right={
                <Button label="移出" onPress={() => handleRemoveBlack(user.userID)} secondary />
              }
            />
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  rowActions: { flexDirection: 'row', gap: 4 },
  hint: { color: '#888', fontSize: 13, marginTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 4 },
});
