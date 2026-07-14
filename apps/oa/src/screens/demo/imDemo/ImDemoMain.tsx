/**
 * IM Demo 主入口 - 完整功能测试页面
 *
 * 包含以下测试模块：
 * 1. 用户信息 - getSelfUserInfo, setSelfInfo, getUsersInfo
 * 2. 好友管理 - addFriend, getFriendList, searchFriends, 好友申请等
 * 3. 群组管理 - createGroup, joinGroup, getJoinedGroupList, 群组成员操作
 * 4. 会话列表 - getAllConversationList, getConversationListSplit
 * 5. 聊天测试 - sendText, getHistoryMessageList, 消息操作
 */

import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';
import { DemoContext, Card, styles as sharedStyles, loggedAppend } from './shared';
import { ImUserScreen } from './screens/ImUserScreen';
import { ImFriendScreen } from './screens/ImFriendScreen';
import { ImGroupScreen } from './screens/ImGroupScreen';
import { ImConversationScreen } from './screens/ImConversationScreen';
import { ImChatScreen } from './screens/ImChatScreen';
import { ImMessageScreen } from './screens/ImMessageScreen';

// 导航项配置
const NAV_ITEMS = [
  { key: 'user', label: '👤 用户', screen: ImUserScreen, desc: '用户信息、在线状态' },
  { key: 'friend', label: '💬 好友', screen: ImFriendScreen, desc: '好友列表、添加、申请' },
  { key: 'group', label: '👥 群组', screen: ImGroupScreen, desc: '创建、加入、成员管理' },
  { key: 'conversation', label: '📋 会话', screen: ImConversationScreen, desc: '会话列表、置顶、隐藏' },
  { key: 'chat', label: '💭 聊天', screen: ImChatScreen, desc: '私聊、群聊消息' },
  { key: 'message', label: '📤 消息', screen: ImMessageScreen, desc: '消息类型、搜索、删除' },
] as const;

type ScreenKey = typeof NAV_ITEMS[number]['key'];

interface ImDemoMainProps {
  onBack?: () => void;
  onLog?: (msg: string) => void;
}

export function ImDemoMain({ onBack, onLog }: ImDemoMainProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('user');

  // 内部日志函数（带 logger）
  const internalAppend = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMsg = `[${timestamp}] ${msg}`;
    setLogs(prev => [...prev.slice(-100), logMsg]);
    // 同时输出到父组件
    onLog?.(logMsg);
  }, [onLog]);

  // 包装后的日志函数，同时输出到 logger
  const appendLog = loggedAppend(internalAppend);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const context = { logs, appendLog, clearLogs };

  const ActiveScreen = NAV_ITEMS.find(n => n.key === activeScreen)?.screen || ImUserScreen;

  return (
    <DemoContext.Provider value={context}>
      <SafeAreaView style={styles.container}>
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← 返回</Text>
          </Pressable>
          <Text style={styles.headerTitle}>IM 功能测试</Text>
        </View>

        {/* 顶部 Tab 导航 */}
        <View style={styles.tabBar}>
          {NAV_ITEMS.map(item => (
            <Pressable
              key={item.key}
              style={[styles.tab, activeScreen === item.key && styles.tabActive]}
              onPress={() => setActiveScreen(item.key)}
            >
              <Text style={[styles.tabText, activeScreen === item.key && styles.tabTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 内容区域 */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <ActiveScreen />
        </ScrollView>

        {/* 日志区域 */}
        <View style={styles.logSection}>
          <View style={styles.logHeader}>
            <Text style={styles.logTitle}>📜 日志</Text>
            <Pressable onPress={clearLogs}>
              <Text style={styles.clearBtn}>清空</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.logContainer}>
            {logs.map((log, i) => (
              <Text key={i} style={styles.logText}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </DemoContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  backBtn: { paddingRight: 12 },
  backText: { fontSize: 15, color: '#1456f0' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    flexWrap: 'wrap',
  },
  tab: { paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1456f0' },
  tabText: { fontSize: 13, color: '#666' },
  tabTextActive: { color: '#1456f0', fontWeight: '600' },
  content: { flex: 1 },
  contentContainer: { padding: 12 },
  logSection: {
    backgroundColor: '#1a1a2e',
    maxHeight: 150,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 },
  logTitle: { color: '#fff', fontSize: 12, fontWeight: '600' },
  clearBtn: { color: '#4a9eff', fontSize: 12 },
  logContainer: { paddingHorizontal: 8, paddingBottom: 8 },
  logText: { color: '#0f0', fontSize: 10, fontFamily: 'Menlo', lineHeight: 14 },
});
