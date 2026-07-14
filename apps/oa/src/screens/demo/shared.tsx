import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ItcError, logger } from '@itc/base';
import { BIOMETRY_BIT, type AuthResult } from '@itc/biometric';

// ── Props 共享类型 ────────────────────────────────────────────────────────────

export type RunFn = (label: string, fn: () => Promise<void>) => Promise<void>;

export interface TabProps {
  run: RunFn;
  append: (line: string) => void;
  busy: boolean;
}

// ── 日志包装器 ────────────────────────────────────────────────────────────────

const TAG = 'Demo';

/** 包装 append 函数，同时输出到 logger */
export function loggedAppend(append: (line: string) => void): (line: string) => void {
  return (line: string) => {
    // 判断日志级别
    if (line.startsWith('❌')) {
      logger.error(TAG, line);
    } else if (line.startsWith('⚠️')) {
      logger.warn(TAG, line);
    } else {
      logger.info(TAG, line);
    }
    append(line);
  };
}

// ── 共享 Button ───────────────────────────────────────────────────────────────

export function Button(props: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      style={({ pressed }) => [
        shared.button,
        props.disabled && shared.buttonDisabled,
        pressed && shared.buttonPressed,
      ]}
    >
      <Text style={shared.buttonText}>{props.label}</Text>
    </Pressable>
  );
}

// ── 工具函数 ──────────────────────────────────────────────────────────────────

export function yn(b: boolean): string {
  return b ? '✓' : '✗';
}

export function maskBits(mask: number): string {
  const bits = `${mask & BIOMETRY_BIT.iris ? 1 : 0}${mask & BIOMETRY_BIT.face ? 1 : 0}${mask & BIOMETRY_BIT.fingerprint ? 1 : 0}`;
  return `${mask}(0b${bits})`;
}

export function fmtAuth(label: string, r: AuthResult): string {
  return r.ok
    ? `✅ ${label} 成功（usedKind=${r.usedKind}）`
    : `❌ ${label}: ${r.reason} [${r.code}] ${r.message}`;
}

export function describe(e: unknown): string {
  if (e instanceof ItcError) return `[${e.code}] ${e.message}`;
  return String(e);
}

// ── 共享样式 ──────────────────────────────────────────────────────────────────

export const shared = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1f2329', marginTop: 2 },
  mono: { fontSize: 12, color: '#444', fontFamily: 'Menlo' },
  hint: { fontSize: 11, color: '#8a9099', lineHeight: 16 },
  button: { backgroundColor: '#1456f0', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { backgroundColor: '#b9c4d4' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
