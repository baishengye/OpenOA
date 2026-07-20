/**
 * PopupMenu Demo
 */

import React, { useCallback, useState } from 'react';
import { Text, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { XStack, YStack, Button } from '@itc/uikit';
import {
  MenuProvider,
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from '@itc/uikit';
import { describe, shared } from './shared';
import type { RunFn } from './shared';

interface Props {
  run: RunFn;
  append: (line: string) => void;
  busy: boolean;
}

export function PopupMenuTab({ append }: Props): React.JSX.Element {
  const handleSelect = useCallback(
    (value: string | number | object) => {
      append(`选中: ${String(value)}`);
    },
    [append],
  );

  return (
    <ScrollView style={styles.container}>
      {/* 基本菜单 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>基本菜单</Text>
        <Text style={styles.description}>点击按钮打开菜单</Text>

        <Menu onSelect={handleSelect}>
          <MenuTrigger>
            <Button>打开菜单</Button>
          </MenuTrigger>
          <MenuOptions placement="bottom">
            <MenuOption value="copy">
              <XStack align="center" gap={8}>
                <Text>📋</Text>
                <Text>复制</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="paste">
              <XStack align="center" gap={8}>
                <Text>📝</Text>
                <Text>粘贴</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="cut">
              <XStack align="center" gap={8}>
                <Text>✂️</Text>
                <Text>剪切</Text>
              </XStack>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      {/* 长按触发 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>长按触发</Text>
        <Text style={styles.description}>长按触发器打开菜单</Text>

        <Menu onSelect={handleSelect}>
          <MenuTrigger triggerOnLongPress>
            <View style={styles.longPressBox}>
              <Text>长按我</Text>
            </View>
          </MenuTrigger>
          <MenuOptions placement="bottom">
            <MenuOption value="reply">
              <XStack align="center" gap={8}>
                <Text>↩️</Text>
                <Text>回复</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="forward">
              <XStack align="center" gap={8}>
                <Text>🔗</Text>
                <Text>转发</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="delete">
              <XStack align="center" gap={8}>
                <Text>🗑️</Text>
                <Text>删除</Text>
              </XStack>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      {/* 顶部弹出 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>顶部弹出</Text>
        <Text style={styles.description}>菜单显示在触发器上方</Text>

        <Menu onSelect={handleSelect}>
          <MenuTrigger>
            <Button>顶部菜单</Button>
          </MenuTrigger>
          <MenuOptions placement="top">
            <MenuOption value="pin">
              <XStack align="center" gap={8}>
                <Text>📌</Text>
                <Text>置顶</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="mute">
              <XStack align="center" gap={8}>
                <Text>🔕</Text>
                <Text>免打扰</Text>
              </XStack>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      {/* 带禁用选项 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>禁用选项</Text>
        <Text style={styles.description}>部分选项禁用</Text>

        <Menu onSelect={handleSelect}>
          <MenuTrigger>
            <Button>操作菜单</Button>
          </MenuTrigger>
          <MenuOptions placement="bottom">
            <MenuOption value="edit">
              <XStack align="center" gap={8}>
                <Text>✏️</Text>
                <Text>编辑</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="share">
              <XStack align="center" gap={8}>
                <Text>📤</Text>
                <Text>分享</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="delete" disabled>
              <XStack align="center" gap={8}>
                <Text>🗑️</Text>
                <Text>删除（禁用）</Text>
              </XStack>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      {/* 模拟消息气泡长按 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>模拟 IM 消息长按</Text>
        <Text style={styles.description}>模拟聊天消息的长按菜单</Text>

        <Menu onSelect={handleSelect}>
          <MenuTrigger triggerOnLongPress>
            <View style={styles.messageBubble}>
              <Text style={styles.messageText}>
                这是一条测试消息，长按可以打开操作菜单。
              </Text>
            </View>
          </MenuTrigger>
          <MenuOptions placement="top">
            <MenuOption value="copy">
              <XStack align="center" gap={8}>
                <Text>📋</Text>
                <Text>复制</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="forward">
              <XStack align="center" gap={8}>
                <Text>🔗</Text>
                <Text>转发</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="reply">
              <XStack align="center" gap={8}>
                <Text>↩️</Text>
                <Text>回复</Text>
              </XStack>
            </MenuOption>
            <MenuOption value="delete" disabled>
              <XStack align="center" gap={8}>
                <Text>🗑️</Text>
                <Text>撤回</Text>
              </XStack>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  longPressBox: {
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    alignItems: 'center',
  },
  messageBubble: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
});
