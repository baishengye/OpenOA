/**
 * ImUserScreen - 用户信息测试
 *
 * 测试方法：
 * - getSelfUserInfo - 获取自身信息
 * - setSelfInfo - 修改自身信息
 * - getUsersInfo - 获取指定用户信息
 * - subscribeUsersStatus - 订阅用户状态
 * - getSubscribeUsersStatus - 获取订阅状态
 * - setAppBackgroundStatus - 设置后台状态
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { itcOpenIM } from '@itc/rn-client-sdk-plus';
import { Card, Button, InputRow, ListItem, useDemo, fmt } from '../shared';

export function ImUserScreen() {
  const { appendLog } = useDemo();

  // 用户信息
  const [selfInfo, setSelfInfo] = useState<any>(null);
  const [editNickname, setEditNickname] = useState('');
  const [editFaceUrl, setEditFaceUrl] = useState('');
  const [queryUserId, setQueryUserId] = useState('');
  const [queryResult, setQueryResult] = useState<any[]>([]);

  // 获取自身信息
  const handleGetSelfInfo = async () => {
    try {
      appendLog('获取自身信息...');
      const result = await itcOpenIM.getSelfUserInfo();
      const info = typeof result === 'string' ? JSON.parse(result) : result;
      setSelfInfo(info);
      setEditNickname(info.nickname || '');
      setEditFaceUrl(info.faceURL || '');
      appendLog(`✅ 用户ID: ${info.userID}`);
    } catch (e) {
      appendLog(`❌ 获取失败: ${fmt(e)}`);
    }
  };

  // 修改自身信息
  const handleSetSelfInfo = async () => {
    try {
      const params: any = {};
      if (editNickname.trim()) params.nickname = editNickname.trim();
      if (editFaceUrl.trim()) params.faceURL = editFaceUrl.trim();

      if (Object.keys(params).length === 0) {
        appendLog('⚠️ 请输入要修改的信息');
        return;
      }

      appendLog(`修改信息: ${JSON.stringify(params)}`);
      await itcOpenIM.setSelfInfo(params);
      appendLog('✅ 修改成功');
      handleGetSelfInfo();
    } catch (e) {
      appendLog(`❌ 修改失败: ${fmt(e)}`);
    }
  };

  // 获取指定用户信息
  const handleGetUsersInfo = async () => {
    if (!queryUserId.trim()) {
      Alert.alert('提示', '请输入用户ID，多个用逗号分隔');
      return;
    }
    try {
      const ids = queryUserId.split(',').map(s => s.trim()).filter(Boolean);
      appendLog(`获取用户信息: ${ids.join(', ')}`);
      const result = await itcOpenIM.getUsersInfo(ids);
      const data = typeof result === 'string' ? JSON.parse(result) : result;
      setQueryResult(Array.isArray(data) ? data : []);
      appendLog(`✅ 获取 ${queryResult.length} 个用户信息`);
    } catch (e) {
      appendLog(`❌ 获取失败: ${fmt(e)}`);
    }
  };

  // 订阅用户状态
  const handleSubscribeStatus = async () => {
    if (!queryUserId.trim()) {
      Alert.alert('提示', '请输入要订阅的用户ID');
      return;
    }
    try {
      const ids = queryUserId.split(',').map(s => s.trim()).filter(Boolean);
      appendLog(`订阅状态: ${ids.join(', ')}`);
      await itcOpenIM.subscribeUsersStatus(ids);
      appendLog('✅ 订阅成功');
    } catch (e) {
      appendLog(`❌ 订阅失败: ${fmt(e)}`);
    }
  };

  // 获取订阅状态
  const handleGetSubscribeStatus = async () => {
    try {
      appendLog('获取订阅状态...');
      const result = await itcOpenIM.getSubscribeUsersStatus();
      appendLog(`订阅状态: ${fmt(result)}`);
    } catch (e) {
      appendLog(`❌ 获取失败: ${fmt(e)}`);
    }
  };

  // 设置后台状态
  const handleSetBackground = async (isBackground: boolean) => {
    try {
      await itcOpenIM.setAppBackgroundStatus(isBackground);
      appendLog(`✅ 已设置后台状态: ${isBackground}`);
    } catch (e) {
      appendLog(`❌ 设置失败: ${fmt(e)}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 自身信息 */}
      <Card title="👤 自身信息">
        {selfInfo ? (
          <>
            <ListItem label="用户ID" subLabel={selfInfo.userID} />
            <ListItem label="昵称" subLabel={selfInfo.nickname || '-'} />
            <ListItem label="头像" subLabel={selfInfo.faceURL || '-'} />
            <ListItem label="邮箱" subLabel={selfInfo.email || '-'} />
            <ListItem label="手机" subLabel={selfInfo.phoneNumber || '-'} />
          </>
        ) : (
          <Text style={styles.hint}>点击刷新获取</Text>
        )}
        <View style={styles.btnRow}>
          <Button label="刷新" onPress={handleGetSelfInfo} />
        </View>
      </Card>

      {/* 修改自身信息 */}
      <Card title="✏️ 修改自身信息">
        <InputRow label="昵称" value={editNickname} onChangeText={setEditNickname} placeholder="输入昵称" />
        <View style={{ height: 8 }} />
        <InputRow label="头像URL" value={editFaceUrl} onChangeText={setEditFaceUrl} placeholder="输入头像URL" />
        <View style={styles.btnRow}>
          <Button label="保存" onPress={handleSetSelfInfo} />
        </View>
      </Card>

      {/* 获取指定用户信息 */}
      <Card title="🔍 查询用户">
        <InputRow label="用户ID" value={queryUserId} onChangeText={setQueryUserId} placeholder="多个用逗号分隔" />
        <View style={styles.btnRow}>
          <Button label="查询" onPress={handleGetUsersInfo} />
          <Button label="订阅" onPress={handleSubscribeStatus} secondary />
        </View>
        {queryResult.length > 0 && (
          <View style={styles.resultBox}>
            {queryResult.map((user, index) => (
              <Text key={index} style={styles.resultText}>
                {user.userID}: {user.nickname || '(无昵称)'}
              </Text>
            ))}
          </View>
        )}
      </Card>

      {/* 状态订阅 */}
      <Card title="📡 状态订阅">
        <View style={styles.btnRow}>
          <Button label="获取订阅状态" onPress={handleGetSubscribeStatus} secondary />
        </View>
      </Card>

      {/* 后台状态 */}
      <Card title="📱 后台状态">
        <View style={styles.btnRow}>
          <Button label="进入后台" onPress={() => handleSetBackground(true)} secondary />
          <Button label="回到前台" onPress={() => handleSetBackground(false)} secondary />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  hint: { color: '#888', fontSize: 13 },
  resultBox: { backgroundColor: '#f8f8f8', padding: 10, borderRadius: 6, marginTop: 12 },
  resultText: { fontSize: 11, fontFamily: 'Menlo', color: '#333', marginBottom: 4 },
});
