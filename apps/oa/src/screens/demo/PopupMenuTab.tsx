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

      {/* 完全自定义菜单内容 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>完全自定义 UI</Text>
        <Text style={styles.description}>使用 renderContent 自定义整个菜单</Text>

        <Menu onSelect={handleSelect}>
          <MenuTrigger>
            <Button>自定义菜单</Button>
          </MenuTrigger>
          <MenuOptions
            offsetX={50}
            offsetY={-100}
            renderContent={({ close }) => (
              <View style={styles.customMenuContainer}>
                <View style={styles.customMenuHeader}>
                  <Text style={styles.customMenuTitle}>操作</Text>
                  <Pressable onPress={close}>
                    <Text style={styles.customMenuClose}>✕</Text>
                  </Pressable>
                </View>
                <Pressable
                  style={styles.customMenuItem}
                  onPress={() => { handleSelect('action1'); close(); }}
                >
                  <Text style={styles.customMenuIcon}>🚀</Text>
                  <View>
                    <Text style={styles.customMenuLabel}>发起流程</Text>
                    <Text style={styles.customMenuDesc}>创建新的审批流程</Text>
                  </View>
                </Pressable>
                <Pressable
                  style={styles.customMenuItem}
                  onPress={() => { handleSelect('action2'); close(); }}
                >
                  <Text style={styles.customMenuIcon}>📊</Text>
                  <View>
                    <Text style={styles.customMenuLabel}>数据统计</Text>
                    <Text style={styles.customMenuDesc}>查看业务数据报表</Text>
                  </View>
                </Pressable>
                <Pressable
                  style={[styles.customMenuItem, styles.customMenuItemDisabled]}
                  disabled
                >
                  <Text style={styles.customMenuIcon}>⚙️</Text>
                  <View>
                    <Text style={styles.customMenuLabelDisabled}>系统设置</Text>
                    <Text style={styles.customMenuDesc}>暂无权限</Text>
                  </View>
                </Pressable>
              </View>
            )}
          />
        </Menu>
      </View>

      {/* 自定义单个选项 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>自定义选项样式</Text>
        <Text style={styles.description}>使用 renderOption 自定义单个选项</Text>

        <Menu onSelect={handleSelect}>
          <MenuTrigger>
            <Button>带图标的菜单</Button>
          </MenuTrigger>
          <MenuOptions placement="bottom">
            <MenuOption
              value="profile"
              renderOption={({ disabled, onPress }) => (
                <Pressable
                  style={[styles.iconMenuItem, disabled && styles.iconMenuItemDisabled]}
                  onPress={onPress}
                  disabled={disabled}
                >
                  <Text style={styles.iconMenuIcon}>👤</Text>
                  <Text style={[styles.iconMenuText, disabled && styles.iconMenuTextDisabled]}>
                    个人资料
                  </Text>
                </Pressable>
              )}
            />
            <MenuOption
              value="settings"
              renderOption={({ disabled, onPress }) => (
                <Pressable
                  style={[styles.iconMenuItem, disabled && styles.iconMenuItemDisabled]}
                  onPress={onPress}
                  disabled={disabled}
                >
                  <Text style={styles.iconMenuIcon}>⚙️</Text>
                  <Text style={[styles.iconMenuText, disabled && styles.iconMenuTextDisabled]}>
                    设置
                  </Text>
                </Pressable>
              )}
            />
            <MenuOption
              value="logout"
              renderOption={({ disabled, onPress }) => (
                <Pressable
                  style={[styles.iconMenuItem, styles.iconMenuItemDanger]}
                  onPress={onPress}
                  disabled={disabled}
                >
                  <Text style={styles.iconMenuIcon}>🚪</Text>
                  <Text style={[styles.iconMenuText, styles.iconMenuTextDanger]}>
                    退出登录
                  </Text>
                </Pressable>
              )}
            />
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
  // 完全自定义菜单样式
  customMenuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  customMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  customMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2329',
  },
  customMenuClose: {
    fontSize: 18,
    color: '#999',
    padding: 4,
  },
  customMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  customMenuItemDisabled: {
    opacity: 0.5,
  },
  customMenuIcon: {
    fontSize: 20,
  },
  customMenuLabel: {
    fontSize: 15,
    color: '#1f2329',
    fontWeight: '500',
  },
  customMenuLabelDisabled: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  customMenuDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  // 自定义选项样式
  iconMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  iconMenuItemDisabled: {
    opacity: 0.5,
  },
  iconMenuItemDanger: {
    borderBottomWidth: 0,
  },
  iconMenuIcon: {
    fontSize: 18,
  },
  iconMenuText: {
    fontSize: 15,
    color: '#1f2329',
  },
  iconMenuTextDisabled: {
    color: '#999',
  },
  iconMenuTextDanger: {
    color: '#ff3b30',
  },
});
