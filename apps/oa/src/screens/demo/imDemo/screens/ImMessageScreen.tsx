/**
 * ImMessageScreen - 消息类型测试
 *
 * 测试方法：
 * - createTextMessage - 创建文本消息
 * - createTextAtMessage - 创建@消息
 * - createImageMessageFromFullPath - 创建图片消息
 * - createFileMessageFromFullPath - 创建文件消息
 * - createSoundMessageFromFullPath - 创建语音消息
 * - createVideoMessageFromFullPath - 创建视频消息
 * - createLocationMessage - 创建位置消息
 * - createQuoteMessage - 创建引用消息
 * - createMergerMessage - 创建合并消息
 * - createForwardMessage - 创建转发消息
 * - createCustomMessage - 创建自定义消息
 * - createFaceMessage - 创建表情消息
 * - searchLocalMessages - 搜索本地消息
 * - findMessageList - 查找指定消息
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { itcOpenIM } from '@itc/rn-client-sdk-plus';
import { Card, Button, InputRow, ListItem, useDemo, fmt, fmtResult } from '../shared';

export function ImMessageScreen() {
  const { appendLog } = useDemo();

  // 会话
  const [conversationId, setConversationId] = useState('');
  const [targetId, setTargetId] = useState('');

  // 消息内容
  const [textContent, setTextContent] = useState('这是一条测试消息');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 创建的消息结果
  const [createdMessage, setCreatedMessage] = useState<any>(null);

  // 获取会话ID
  const handleGetConversationId = async () => {
    if (!targetId.trim()) {
      Alert.alert('提示', '请输入目标ID');
      return;
    }
    try {
      const result = await itcOpenIM.getConversationIDBySessionType({
        sourceID: targetId.trim(),
        sessionType: 1,
      });
      const convId = typeof result === 'string' ? result : (result as string);
      setConversationId(convId);
      appendLog(`✅ 会话ID: ${convId}`);
    } catch (e) {
      appendLog(`❌ 获取会话ID失败: ${fmt(e)}`);
    }
  };

  // 创建文本消息
  const handleCreateTextMessage = async () => {
    try {
      appendLog(`创建文本消息: ${textContent}`);
      const result = await itcOpenIM.createTextMessage(textContent);
      const msg = typeof result === 'string' ? JSON.parse(result) : result;
      setCreatedMessage(msg);
      appendLog(`✅ 消息ID: ${msg.clientMsgID}`);
    } catch (e) {
      appendLog(`❌ 创建失败: ${fmt(e)}`);
    }
  };

  // 创建@消息
  const handleCreateAtMessage = async () => {
    if (!targetId.trim()) {
      Alert.alert('提示', '请输入@的用户ID');
      return;
    }
    try {
      appendLog(`创建@消息: @${targetId}`);
      const result = await itcOpenIM.createTextAtMessage({
        text: textContent,
        atUserIDList: [targetId.trim()],
        atUsersInfo: [{ atUserID: targetId.trim(), groupNickname: '' }],
      });
      const msg = typeof result === 'string' ? JSON.parse(result) : result;
      setCreatedMessage(msg);
      appendLog(`✅ @消息已创建`);
    } catch (e) {
      appendLog(`❌ 创建失败: ${fmt(e)}`);
    }
  };

  // 创建位置消息
  const handleCreateLocationMessage = async () => {
    try {
      appendLog('创建位置消息...');
      const result = await itcOpenIM.createLocationMessage({
        latitude: 39.9042,
        longitude: 116.4074,
        description: '北京市',
      });
      const msg = typeof result === 'string' ? JSON.parse(result) : result;
      setCreatedMessage(msg);
      appendLog(`✅ 位置消息已创建`);
    } catch (e) {
      appendLog(`❌ 创建失败: ${fmt(e)}`);
    }
  };

  // 创建表情消息
  const handleCreateFaceMessage = async () => {
    try {
      appendLog('创建表情消息...');
      const result = await itcOpenIM.createFaceMessage({
        index: 1,
        data: '[微笑]',
      });
      const msg = typeof result === 'string' ? JSON.parse(result) : result;
      setCreatedMessage(msg);
      appendLog(`✅ 表情消息已创建`);
    } catch (e) {
      appendLog(`❌ 创建失败: ${fmt(e)}`);
    }
  };

  // 创建自定义消息
  const handleCreateCustomMessage = async () => {
    try {
      appendLog('创建自定义消息...');
      const result = await itcOpenIM.createCustomMessage({
        data: JSON.stringify({ type: 'test', value: 'hello' }),
        description: '测试自定义消息',
        extension: '',
      });
      const msg = typeof result === 'string' ? JSON.parse(result) : result;
      setCreatedMessage(msg);
      appendLog(`✅ 自定义消息已创建`);
    } catch (e) {
      appendLog(`❌ 创建失败: ${fmt(e)}`);
    }
  };

  // 发送已创建的消息
  const handleSendCreatedMessage = async () => {
    if (!conversationId) {
      Alert.alert('提示', '请先获取会话ID');
      return;
    }
    if (!createdMessage) {
      Alert.alert('提示', '请先创建消息');
      return;
    }
    try {
      appendLog(`发送消息到: ${conversationId}`);
      const result = await itcOpenIM.sendMessage({
        message: createdMessage,
        recvID: targetId.trim(),
        groupID: ''
      });
      const msg = typeof result === 'string' ? JSON.parse(result) : result;
      appendLog(`✅ 发送成功: ${msg.clientMsgID}`);
      setCreatedMessage(null);
    } catch (e) {
      appendLog(`❌ 发送失败: ${fmt(e)}`);
    }
  };

  // 搜索本地消息
  const handleSearchMessages = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('提示', '请输入搜索关键词');
      return;
    }
    try {
      appendLog(`搜索消息: ${searchKeyword}`);
      const result = await itcOpenIM.searchLocalMessages({
        conversationID: conversationId || '',
        keywordList: [searchKeyword.trim()],
      });
      appendLog(`搜索结果: ${fmtResult(result)}`);
    } catch (e) {
      appendLog(`❌ 搜索失败: ${fmt(e)}`);
    }
  };

  // 查找指定消息
  const handleFindMessages = async () => {
    if (!createdMessage) {
      Alert.alert('提示', '请先创建一条消息获取ID');
      return;
    }
    try {
      appendLog(`查找消息: ${createdMessage.clientMsgID}`);
      const result = await itcOpenIM.findMessageList([{
        conversationID: conversationId,
        clientMsgIDList: [createdMessage.clientMsgID],
      }]);
      appendLog(`查找结果: ${fmtResult(result)}`);
    } catch (e) {
      appendLog(`❌ 查找失败: ${fmt(e)}`);
    }
  };

  // 清空本地所有消息
  const handleClearAllLocal = async () => {
    Alert.alert('确认', '确定清空本地所有消息？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: async () => {
          try {
            await itcOpenIM.deleteAllMsgFromLocal();
            appendLog('✅ 本地消息已清空');
          } catch (e) {
            appendLog(`❌ 清空失败: ${fmt(e)}`);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 会话选择 */}
      <Card title="🎯 会话选择">
        <InputRow label="目标ID" value={targetId} onChangeText={setTargetId} placeholder="用户ID" />
        <View style={styles.btnRow}>
          <Button label="获取会话" onPress={handleGetConversationId} />
        </View>
        {conversationId && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>会话ID: {conversationId}</Text>
          </View>
        )}
      </Card>

      {/* 创建消息 */}
      <Card title="📝 创建消息">
        <InputRow label="消息内容" value={textContent} onChangeText={setTextContent} placeholder="输入消息内容" />
        <View style={styles.btnRow}>
          <Button label="文本" onPress={handleCreateTextMessage} />
          <Button label="@消息" onPress={handleCreateAtMessage} />
          <Button label="位置" onPress={handleCreateLocationMessage} />
        </View>
        <View style={styles.btnRow}>
          <Button label="表情" onPress={handleCreateFaceMessage} secondary />
          <Button label="自定义" onPress={handleCreateCustomMessage} secondary />
        </View>
      </Card>

      {/* 发送消息 */}
      {createdMessage && (
        <Card title="✉️ 发送消息">
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>消息ID: {createdMessage.clientMsgID}</Text>
            <Text style={styles.infoText}>类型: {createdMessage.contentType}</Text>
          </View>
          <View style={styles.btnRow}>
            <Button label="发送" onPress={handleSendCreatedMessage} />
            <Button label="清空" onPress={() => setCreatedMessage(null)} secondary />
          </View>
        </Card>
      )}

      {/* 搜索消息 */}
      <Card title="🔍 搜索消息">
        <InputRow label="关键词" value={searchKeyword} onChangeText={setSearchKeyword} placeholder="输入搜索关键词" />
        <View style={styles.btnRow}>
          <Button label="搜索" onPress={handleSearchMessages} secondary />
          <Button label="查找指定" onPress={handleFindMessages} secondary />
        </View>
      </Card>

      {/* 消息操作 */}
      <Card title="🗑️ 消息管理">
        <View style={styles.btnRow}>
          <Button label="清空本地消息" onPress={handleClearAllLocal} secondary />
        </View>
      </Card>

      {/* 消息类型说明 */}
      <Card title="📖 消息类型说明">
        <Text style={styles.hint}>
          1. 文本消息 (text) - 普通文本内容{'\n'}
          2. @消息 (at) - 群聊中@指定成员{'\n'}
          3. 图片消息 (image) - 需要图片路径{'\n'}
          4. 语音消息 (sound) - 需要音频路径{'\n'}
          5. 视频消息 (video) - 需要视频路径{'\n'}
          6. 文件消息 (file) - 需要文件路径{'\n'}
          7. 位置消息 (location) - 经纬度+描述{'\n'}
          8. 表情消息 (face) - 表情包索引{'\n'}
          9. 合并消息 (merger) - 多条消息合并{'\n'}
          10. 转发消息 (forward) - 消息转发{'\n'}
          11. 名片消息 (card) - 用户/群组名片{'\n'}
          12. 自定义消息 (custom) - 自定义数据
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  hint: { color: '#666', fontSize: 12, lineHeight: 20 },
  infoBox: { backgroundColor: '#f8f8f8', padding: 10, borderRadius: 6, marginTop: 12 },
  infoText: { fontSize: 12, color: '#333', fontFamily: 'Menlo', marginBottom: 4 },
});
