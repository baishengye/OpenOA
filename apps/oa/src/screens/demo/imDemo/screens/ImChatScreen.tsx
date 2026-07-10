/**
 * ImChatScreen - 聊天测试
 *
 * 测试方法：
 * - sendText - 发送文本消息
 * - createTextMessage - 创建文本消息
 * - getAdvancedHistoryMessageList - 获取历史消息
 * - revokeMessage - 撤回消息
 * - deleteMessage - 删除消息
 * - typingStatusUpdate - 发送输入状态
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { eventBus } from '@itc/base';
import { itcOpenIM } from '@itc/rn-client-sdk-plus';
import { Card, Button, InputRow, ListItem, useDemo, fmt } from '../shared';
import type { MessageItem } from '@itc/rn-client-sdk-plus';
import { ViewType } from '@itc/rn-client-sdk-plus';

export function ImChatScreen() {
  const { appendLog } = useDemo();

  // 目标会话
  const [chatType, setChatType] = useState('1'); // 1=单聊, 2=群聊
  const [targetId, setTargetId] = useState('');
  const [conversationId, setConversationId] = useState('');

  // 消息输入
  const [messageText, setMessageText] = useState('');

  // 历史消息
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // 新消息监听
  const [newMsgCount, setNewMsgCount] = useState(0);

  // 设置消息监听
  React.useEffect(() => {
    const off = eventBus.on('im:newMessage', (msg: any) => {
      appendLog(`📩 新消息: ${msg.senderNickname || msg.sendID}: ${msg.textElem?.content || '[非文本]'}`);
      setNewMsgCount(c => c + 1);
      // 如果是当前会话，更新消息列表
      if (msg.conversationID === conversationId) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => off();
  }, [conversationId, appendLog]);

  // 获取会话ID
  const handleGetConversationId = async () => {
    if (!targetId.trim()) {
      Alert.alert('提示', '请输入目标ID');
      return;
    }
    try {
      appendLog(`获取会话ID: targetId=${targetId}, type=${chatType}`);
      const result = await itcOpenIM.getConversationIDBySessionType({
        sourceID: targetId.trim(),
        sessionType: parseInt(chatType),
      });
      const convId = typeof result === 'string' ? result : (result as string);
      setConversationId(convId);
      appendLog(`✅ 会话ID: ${convId}`);
    } catch (e) {
      appendLog(`❌ 获取会话ID失败: ${fmt(e)}`);
    }
  };

  // 获取历史消息
  const handleGetHistory = async () => {
    if (!conversationId) {
      Alert.alert('提示', '请先获取会话ID');
      return;
    }
    try {
      appendLog(`获取历史消息: ${conversationId}`);
      const result = await itcOpenIM.getAdvancedHistoryMessageList({
        conversationID: conversationId,
        count: 20,
        startClientMsgID: '',
        viewType: ViewType.History,
      });
      const data = typeof result === 'string' ? JSON.parse(result) : result;
      const msgList = (Array.isArray(data) ? data : []).map((m: any) => (typeof m === 'string' ? JSON.parse(m) : m));
      setMessages(msgList || []);
      appendLog(`✅ 获取 ${msgList?.length || 0} 条消息`);
    } catch (e) {
      appendLog(`❌ 获取历史消息失败: ${fmt(e)}`);
    }
  };

  // 创建并发送文本消息
  const handleSendMessage = async () => {
    if (!conversationId) {
      Alert.alert('提示', '请先获取会话ID');
      return;
    }
    if (!messageText.trim()) {
      Alert.alert('提示', '请输入消息内容');
      return;
    }
    try {
      appendLog(`发送消息: ${messageText}`);
      // 先创建消息
      const createResult = await itcOpenIM.createTextMessage(messageText);
      const msg = typeof createResult === 'string' ? JSON.parse(createResult) : createResult;
      // 发送消息
      await itcOpenIM.sendMessage({ message: msg, conversationID: conversationId });
      setMessages(prev => [...prev, msg]);
      setMessageText('');
      appendLog(`✅ 发送成功: ${msg.clientMsgID}`);
    } catch (e) {
      appendLog(`❌ 发送失败: ${fmt(e)}`);
    }
  };

  // 发送输入状态
  const handleSendTyping = async () => {
    if (!conversationId) {
      Alert.alert('提示', '请先获取会话ID');
      return;
    }
    try {
      await itcOpenIM.typingStatusUpdate({ recvID: targetId, msgTip: 'typing' });
      appendLog('✅ 正在输入...');
    } catch (e) {
      appendLog(`❌ 发送状态失败: ${fmt(e)}`);
    }
  };

  // 撤回消息
  const handleRevokeMessage = async (msgId: string) => {
    try {
      await itcOpenIM.revokeMessage({ conversationID: conversationId, clientMsgID: msgId });
      appendLog(`✅ 已撤回: ${msgId}`);
      handleGetHistory();
    } catch (e) {
      appendLog(`❌ 撤回失败: ${fmt(e)}`);
    }
  };

  // 删除消息
  const handleDeleteMessage = async (msgId: string) => {
    Alert.alert('确认', '确定删除该消息？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await itcOpenIM.deleteMessage({ conversationID: conversationId, clientMsgID: msgId });
            appendLog(`✅ 已删除: ${msgId}`);
            handleGetHistory();
          } catch (e) {
            appendLog(`❌ 删除失败: ${fmt(e)}`);
          }
        },
      },
    ]);
  };

  // 获取消息类型描述
  const getMsgTypeName = (msg: any) => {
    if (msg.textElem) return '文本';
    if (msg.pictureElem) return '图片';
    if (msg.soundElem) return '语音';
    if (msg.videoElem) return '视频';
    if (msg.fileElem) return '文件';
    if (msg.locationElem) return '位置';
    if (msg.faceElem) return '表情';
    if (msg.mergeElem) return '合并';
    if (msg.cardElem) return '名片';
    if (msg.customElem) return '自定义';
    return '未知';
  };

  return (
    <ScrollView style={styles.container}>
      {/* 会话选择 */}
      <Card title="🎯 选择会话">
        <InputRow label="会话类型" value={chatType} onChangeText={setChatType} placeholder="1=单聊, 2=群聊" />
        <View style={{ height: 8 }} />
        <InputRow label="目标ID" value={targetId} onChangeText={setTargetId} placeholder="用户ID或群组ID" />
        <View style={styles.btnRow}>
          <Button label="获取会话" onPress={handleGetConversationId} />
        </View>
        {conversationId && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>会话ID: {conversationId}</Text>
          </View>
        )}
      </Card>

      {/* 发送消息 */}
      <Card title="✉️ 发送消息">
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="输入消息内容..."
            multiline
          />
        </View>
        <View style={styles.btnRow}>
          <Button label="发送" onPress={handleSendMessage} disabled={!conversationId} />
          <Button label="正在输入" onPress={handleSendTyping} secondary disabled={!conversationId} />
        </View>
      </Card>

      {/* 历史消息 */}
      <Card title={`📜 历史消息 (${messages.length}) ${newMsgCount > 0 ? `+${newMsgCount}新` : ''}`}>
        <View style={styles.btnRow}>
          <Button label="刷新" onPress={handleGetHistory} secondary disabled={!conversationId} />
          <Button label="清空" onPress={() => setMessages([])} secondary />
        </View>
        {messages.length === 0 ? (
          <Text style={styles.hint}>暂无消息</Text>
        ) : (
          messages.map((msg, index) => (
            <ListItem
              key={index}
              label={`${msg.senderNickname || msg.sendID}: ${msg.textElem?.content || `[${getMsgTypeName(msg)}]`}`}
              subLabel={new Date(msg.createTime).toLocaleTimeString()}
              right={
                <View style={styles.rowActions}>
                  <Button label="撤" onPress={() => handleRevokeMessage(msg.clientMsgID)} secondary />
                  <Button label="删" onPress={() => handleDeleteMessage(msg.clientMsgID)} secondary />
                </View>
              }
            />
          ))
        )}
      </Card>

      {/* 快捷操作 */}
      <Card title="⚡ 快捷操作">
        <View style={styles.btnRow}>
          <Button label="标记已读" onPress={async () => {
            if (conversationId) {
              try {
                await itcOpenIM.markConversationMessageAsRead(conversationId);
                appendLog('✅ 已标记已读');
              } catch (e) {
                appendLog(`❌ ${fmt(e)}`);
              }
            }
          }} secondary disabled={!conversationId} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  rowActions: { flexDirection: 'row', gap: 4 },
  hint: { color: '#888', fontSize: 13, marginTop: 8 },
  infoBox: { backgroundColor: '#f8f8f8', padding: 10, borderRadius: 6, marginTop: 12 },
  infoText: { fontSize: 12, color: '#333', fontFamily: 'Menlo' },
  inputContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  messageInput: { padding: 10, minHeight: 60, fontSize: 14, textAlignVertical: 'top' },
});
