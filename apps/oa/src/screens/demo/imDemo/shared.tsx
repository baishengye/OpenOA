import React, { createContext, useContext, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View, TextInput } from 'react-native';
import { logger } from '@itc/base';

// ── 日志包装器 ────────────────────────────────────────────────────────────────

const TAG = 'Demo';

/** 包装日志函数，同时输出到 logger */
export function loggedAppend(append: (msg: string) => void): (msg: string) => void {
  return (msg: string) => {
    if (msg.startsWith('❌')) {
      logger.error(TAG, msg);
    } else if (msg.startsWith('⚠️')) {
      logger.warn(TAG, msg);
    } else {
      logger.info(TAG, msg);
    }
    append(msg);
  };
}

// ── 共享类型 ──────────────────────────────────────────────────────────────────

export interface DemoContextType {
  logs: string[];
  appendLog: (msg: string) => void;
  clearLogs: () => void;
}

export const DemoContext = createContext<DemoContextType>({
  logs: [],
  appendLog: () => {},
  clearLogs: () => {},
});

export function useDemo() {
  return useContext(DemoContext);
}

// ── 共享样式 ──────────────────────────────────────────────────────────────────

export const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', color: '#1f2329', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  button: { backgroundColor: '#1456f0', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  buttonSecondary: { backgroundColor: '#f0f2f5', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  buttonSecondaryText: { color: '#333', fontSize: 14, fontWeight: '600' },
  logContainer: { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, maxHeight: 200 },
  logText: { color: '#0f0', fontSize: 11, fontFamily: 'Menlo' },
  item: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  itemText: { fontSize: 14, color: '#333' },
  caption: { fontSize: 12, color: '#888' },
  error: { color: '#e74c3c' },
  success: { color: '#27ae60' },
  section: { marginBottom: 16 },
});

// ── 共享组件 ──────────────────────────────────────────────────────────────────

interface CardProps { children: React.ReactNode; title?: string }
export function Card({ children, title }: CardProps) {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

interface ButtonProps { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }
export function Button({ label, onPress, disabled, secondary }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        secondary ? styles.buttonSecondary : styles.button,
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={secondary ? styles.buttonSecondaryText : styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

interface LogViewProps { logs: string[] }
export function LogView({ logs }: LogViewProps) {
  return (
    <ScrollView style={styles.logContainer}>
      {logs.map((log, i) => (
        <Text key={i} style={styles.logText}>{log}</Text>
      ))}
    </ScrollView>
  );
}

interface ListItemProps { label: string; subLabel?: string; onPress?: () => void; right?: React.ReactNode }
export function ListItem({ label, subLabel, onPress, right }: ListItemProps) {
  const content = (
    <View style={styles.item}>
      <View style={styles.row}>
        <Text style={styles.itemText}>{label}</Text>
        {right}
      </View>
      {subLabel && <Text style={styles.caption}>{subLabel}</Text>}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

interface InputRowProps { label: string; value: string; onChangeText: (v: string) => void; placeholder?: string; autoCapitalize?: 'none' | 'sentences' }
export function InputRow({ label, value, onChangeText, placeholder, autoCapitalize }: InputRowProps) {
  return (
    <View style={styles.row}>
      <Text style={{ width: 80, fontSize: 14 }}>{label}</Text>
      <Pressable style={{ flex: 1 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize || 'none'}
        />
      </Pressable>
    </View>
  );
}

// 工具函数
export function fmt(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  if (typeof e === 'object') return JSON.stringify(e, null, 2);
  return String(e);
}

export function fmtResult(data: unknown): string {
  if (!data) return '无数据';
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2);
    } catch {
      return data;
    }
  }
  return JSON.stringify(data, null, 2);
}
