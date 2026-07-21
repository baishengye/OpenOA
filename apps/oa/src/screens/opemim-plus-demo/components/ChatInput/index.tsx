/**
 * 聊天输入框组件
 * 支持文本输入、表情、附加功能、发送
 */
import React, { memo, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Keyboard,
} from 'react-native';
import { XStack, YStack, Text } from '@itc/uikit';

export interface ChatInputProps {
  /** 是否禁用输入 */
  disabled?: boolean;
  /** 发送文本消息 */
  onSendText?: (text: string) => void;
  /** 点击表情按钮 */
  onPressEmoji?: () => void;
  /** 点击附加功能按钮 */
  onPressMore?: () => void;
  /** 点击语音按钮 */
  onPressVoice?: () => void;
  /** 输入框 placeholder */
  placeholder?: string;
}

/**
 * 聊天输入框组件
 */
export const ChatInput: React.FC<ChatInputProps> = memo((props) => {
  const {
    disabled = false,
    onSendText,
    onPressEmoji,
    onPressMore,
    onPressVoice,
    placeholder = '输入消息...',
  } = props;

  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  // 处理发送
  const handleSend = useCallback(() => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    onSendText?.(trimmedText);
    setText('');
    Keyboard.dismiss();
  }, [text, onSendText]);

  // 处理输入
  const handleChangeText = useCallback((value: string) => {
    setText(value);
  }, []);

  // 判断是否有内容可以发送
  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      {/* 功能按钮区域 */}
      <XStack align="center" gap={8} padding={8}>
          {/* 表情按钮 */}
          <Pressable
            onPress={onPressEmoji}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            disabled={disabled}
          >
            <Text variant="body">😊</Text>
          </Pressable>

          {/* 输入框 */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={text}
              onChangeText={handleChangeText}
              placeholder={placeholder}
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={2000}
              editable={!disabled}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>

          {/* 语音按钮 */}
          <Pressable
            onPress={onPressVoice}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            disabled={disabled}
          >
            <Text variant="body">🎤</Text>
          </Pressable>

          {/* 附加功能按钮 */}
          <Pressable
            onPress={onPressMore}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            disabled={disabled}
          >
            <Text variant="body">➕</Text>
          </Pressable>

          {/* 发送按钮 */}
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendButton,
              canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
            disabled={!canSend}
          >
            <Text
              variant="body"
              color={canSend ? '#fff' : '#8E8E93'}
              fontWeight="600"
            >
              发送
            </Text>
          </Pressable>
        </XStack>
      </View>
  );
});

ChatInput.displayName = 'ChatInput';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F2F7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    paddingVertical: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    backgroundColor: '#E5E5EA',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    minHeight: 36,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
});
