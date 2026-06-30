#!/usr/bin/env node
/**
 * 验证 react-native-code-push@8.3.1 的补丁是否已应用到 node_modules。
 * 补丁把 RN 0.74+ 已移除的 `ChoreographerCompat` 换成 `android.view.Choreographer`。
 *
 * 用法：pnpm --filter @itc/hotfix patch:verify   （或在本包目录 `pnpm patch:verify`）
 * 退出码 0 = 已打补丁；1 = 未打 / 找不到包。
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

try {
  const pkgRoot = dirname(require.resolve('react-native-code-push/package.json'));
  const target = join(
    pkgRoot,
    'android/app/src/main/java/com/microsoft/codepush/react/CodePushNativeModule.java',
  );
  const src = readFileSync(target, 'utf8');
  const patched = src.includes('android.view.Choreographer');
  const stale = src.includes('modules.core.ChoreographerCompat');

  if (patched && !stale) {
    console.log('✅ react-native-code-push 补丁已应用（ChoreographerCompat → android.view.Choreographer）');
    process.exit(0);
  }
  console.error('❌ react-native-code-push 补丁未应用。运行 `pnpm install` 重新套用；若报 Could not apply patch 见 README「重建补丁」。');
  process.exit(1);
} catch (e) {
  console.error('❌ 找不到 react-native-code-push（是否已 pnpm install？）：', e.message);
  process.exit(1);
}
