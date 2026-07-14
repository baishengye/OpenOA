/**
 * ImConversationScreen - 会话列表测试
 *
 * 测试方法：
 * - getAllConversationList - 获取所有会话
 * - getConversationListSplit - 分页获取会话
 * - getOneConversation - 获取单个会话
 * - getMultipleConversation - 获取多个会话
 * - markConversationMessageAsRead - 标记会话已读
 * - pinConversation - 置顶会话
 * - hideConversation - 隐藏会话
 * - setConversationDraft - 设置会话草稿
 * - deleteConversationAndDeleteAllMsg - 删除会话及消息
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { itcOpenIM } from '@itc/rn-client-sdk-plus';
import { Card, Button, InputRow, ListItem, useDemo, fmt } from '../shared';

export function ImConversationScreen() {
  const { appendLog } = useDemo();

  // 会话列表
  const [conversationList, setConversationList] = useState<any[]>([]);

  // 单个会话
  const [selectedConvId, setSelectedConvId] = useState('');
  const [selectedConv, setSelectedConv] = useState<any>(null);

  // 查询
  const [queryConvId, setQueryConvId] = useState('');
  const [querySourceId, setQuerySourceId] = useState('');
  const [querySessionType, setQuerySessionType] = useState('1');

  // 初始化
  useEffect(() => {
    handleGetAllConversations();
  }, []);

  // 获取所有会话
  const handleGetAllConversations = async () => {
    try {
      appendLog('获取所有会话...');
      const result = await itcOpenIM.getAllConversationList();
      const list = typeof result === 'string' ? JSON.parse(result) : result;
      setConversationList(list || []);
      appendLog(`✅ 会话数: ${list?.length || 0}`);
    } catch (e) {
      appendLog(`❌ 获取会话失败: ${fmt(e)}`);
    }
  };

  // 分页获取会话
  const handleGetConversationsSplit = async () => {
    try {
      appendLog('分页获取会话...');
      const result = await itcOpenIM.getConversationListSplit({ offset: 0, count: 20 });
      const list = typeof result === 'string' ? JSON.parse(result) : result;
      appendLog(`✅ 获取 ${list?.length || 0} 条`);
    } catch (e) {
      appendLog(`❌ 分页获取失败: ${fmt(e)}`);
    }
  };

  // 获取单个会话
  const handleGetOneConversation = async () => {
    if (!querySourceId.trim()) {
      Alert.alert('提示', '请输入源ID（用户ID或群组ID）');
      return;
    }
    try {
      appendLog(`查询会话: sourceId=${querySourceId}, type=${querySessionType}`);
      const result = await itcOpenIM.getOneConversation({
        sourceID: querySourceId.trim(),
        sessionType: parseInt(querySessionType),
      });
      const conv = typeof result === 'string' ? JSON.parse(result) : result;
      setSelectedConv(conv);
      setSelectedConvId(conv.conversationID || '');
      appendLog(`✅ 会话ID: ${conv.conversationID}`);
    } catch (e) {
      appendLog(`❌ 查询失败: ${fmt(e)}`);
    }
  };

  // 标记已读
  const handleMarkAsRead = async (convId: string) => {
    try {
      await itcOpenIM.markConversationMessageAsRead(convId);
      appendLog(`✅ 已标记已读: ${convId}`);
      handleGetAllConversations();
    } catch (e) {
      appendLog(`❌ 标记失败: ${fmt(e)}`);
    }
  };

  // 置顶/取消置顶
  const handlePinConversation = async (convId: string, isPinned: boolean) => {
    try {
      await itcOpenIM.pinConversation({ conversationID: convId, isPinned: !isPinned });
      appendLog(`✅ ${!isPinned ? '已置顶' : '已取消置顶'}: ${convId}`);
      handleGetAllConversations();
    } catch (e) {
      appendLog(`❌ 操作失败: ${fmt(e)}`);
    }
  };

  // 隐藏会话
  const handleHideConversation = async (convId: string) => {
    try {
      await itcOpenIM.hideConversation(convId);
      appendLog(`✅ 已隐藏: ${convId}`);
      handleGetAllConversations();
    } catch (e) {
      appendLog(`❌ 隐藏失败: ${fmt(e)}`);
    }
  };

  // 删除会话
  const handleDeleteConversation = async (convId: string) => {
    Alert.alert('确认', '确定删除该会话？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await itcOpenIM.deleteConversationAndDeleteAllMsg(convId);
            appendLog(`✅ 已删除: ${convId}`);
            handleGetAllConversations();
          } catch (e) {
            appendLog(`❌ 删除失败: ${fmt(e)}`);
          }
        },
      },
    ]);
  };

  // 设置草稿
  const handleSetDraft = async (convId: string) => {
    Alert.prompt(
      '设置草稿',
      '输入草稿内容',
      async (text) => {
        if (text !== null) {
          try {
            await itcOpenIM.setConversationDraft({ conversationID: convId, draftText: text });
            appendLog(`✅ 草稿已设置: ${text || '(空)'}`);
          } catch (e) {
            appendLog(`❌ 设置草稿失败: ${fmt(e)}`);
          }
        }
      },
      'plain-text'
    );
  };

  // 获取会话ID
  const handleGetConversationId = async () => {
    if (!querySourceId.trim()) {
      Alert.alert('提示', '请输入源ID');
      return;
    }
    try {
      appendLog(`获取会话ID: sourceId=${querySourceId}, type=${querySessionType}`);
      const result = await itcOpenIM.getConversationIDBySessionType({
        sourceID: querySourceId.trim(),
        sessionType: parseInt(querySessionType),
      });
      const convId = typeof result === 'string' ? result : (result as string);
      appendLog(`✅ 会话ID: ${convId}`);
      setSelectedConvId(convId);
    } catch (e) {
      appendLog(`❌ 获取会话ID失败: ${fmt(e)}`);
    }
  };

  // 获取会话类型描述
  const getSessionTypeName = (type: number) => {
    switch (type) {
      case 1: return '单聊';
      case 2: return '群聊';
      case 3: return '通知';
      default: return `未知(${type})`;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 查询会话 */}
      <Card title="🔍 查询会话">
        <InputRow label="源ID" value={querySourceId} onChangeText={setQuerySourceId} placeholder="用户ID或群组ID" />
        <View style={{ height: 8 }} />
        <InputRow label="会话类型" value={querySessionType} onChangeText={setQuerySessionType} placeholder="1=单聊, 2=群聊" />
        <View style={styles.btnRow}>
          <Button label="查询" onPress={handleGetOneConversation} />
          <Button label="获取ID" onPress={handleGetConversationId} secondary />
        </View>
      </Card>

      {/* 会话列表 */}
      <Card title={`💬 会话列表 (${conversationList.length})`}>
        <View style={styles.btnRow}>
          <Button label="刷新" onPress={handleGetAllConversations} secondary />
          <Button label="分页" onPress={handleGetConversationsSplit} secondary />
        </View>
        {conversationList.length === 0 ? (
          <Text style={styles.hint}>暂无会话</Text>
        ) : (
          conversationList.map((conv: any, index: number) => (
            <ListItem
              key={index}
              label={conv.showName || conv.conversationID}
              subLabel={`${getSessionTypeName(conv.conversationType)} | ${conv.latestMsgDate ? new Date(conv.latestMsgDate).toLocaleString() : ''}`}
              onPress={() => {
                setSelectedConvId(conv.conversationID);
                setSelectedConv(conv);
              }}
              right={
                <View style={styles.rowActions}>
                  {conv.isPinned ? (
                    <Text style={{ color: '#888', fontSize: 10 }}>置顶</Text>
                  ) : null}
                  <Button label="已读" onPress={() => handleMarkAsRead(conv.conversationID)} secondary />
                </View>
              }
            />
          ))
        )}
      </Card>

      {/* 选中会话详情 */}
      {selectedConv && (
        <Card title={`📋 会话详情 - ${selectedConvId.slice(0, 12)}...`}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>会话ID: {selectedConv.conversationID}</Text>
            <Text style={styles.infoText}>类型: {getSessionTypeName(selectedConv.conversationType)}</Text>
            <Text style={styles.infoText}>名称: {selectedConv.showName}</Text>
            <Text style={styles.infoText}>未读数: {selectedConv.unreadCount}</Text>
            <Text style={styles.infoText}>置顶: {selectedConv.isPinned ? '是' : '否'}</Text>
            <Text style={styles.infoText}>草稿: {selectedConv.draftText || '(无)'}</Text>
          </View>
          <View style={styles.btnRow}>
            <Button label="置顶" onPress={() => handlePinConversation(selectedConv.conversationID, selectedConv.isPinned)} secondary />
            <Button label="草稿" onPress={() => handleSetDraft(selectedConv.conversationID)} secondary />
            <Button label="隐藏" onPress={() => handleHideConversation(selectedConv.conversationID)} secondary />
            <Button label="删除" onPress={() => handleDeleteConversation(selectedConv.conversationID)} secondary />
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  rowActions: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  hint: { color: '#888', fontSize: 13, marginTop: 8 },
  infoBox: { backgroundColor: '#f8f8f8', padding: 10, borderRadius: 6 },
  infoText: { fontSize: 12, color: '#333', marginBottom: 4, fontFamily: 'Menlo' },
});
