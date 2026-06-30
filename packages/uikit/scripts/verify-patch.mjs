#!/usr/bin/env node
/**
 * 验证 react-native-safe-area-context@5.8.0 的补丁是否已应用到 node_modules。
 * 补丁删掉库 buildscript 里硬编码的 `com.android.tools.build:gradle:7.3.1`
 * （被 app 引用时 AGP 由工程根 buildscript 继承，这行多余且会让 AS sync 失败）。
 *
 * 用法：pnpm --filter @itc/uikit patch:verify   （或在本包目录 `pnpm patch:verify`）
 * 退出码 0 = 已打补丁；1 = 未打 / 找不到包。
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

try {
  const pkgRoot = dirname(require.resolve('react-native-safe-area-context/package.json'));
  const target = join(pkgRoot, 'android/build.gradle');
  const src = readFileSync(target, 'utf8');
  const stale = src.includes('com.android.tools.build:gradle:7.3.1');

  if (!stale) {
    console.log('✅ react-native-safe-area-context 补丁已应用（buildscript 无硬编码 AGP 7.3.1）');
    process.exit(0);
  }
  console.error('❌ react-native-safe-area-context 补丁未应用（仍含 gradle:7.3.1）。运行 `pnpm install` 重新套用；若报 Could not apply patch 见 README「重建补丁」。');
  process.exit(1);
} catch (e) {
  console.error('❌ 找不到 react-native-safe-area-context（是否已 pnpm install？）：', e.message);
  process.exit(1);
}
