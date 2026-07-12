/**
 * harmony-postinstall.js - 鸿蒙项目后处理脚本
 *
 * 为 @rnoh/react-native-openharmony 生成 types 导出文件
 * 供第三方 TurboModule 包使用 autolink 后的 codegen
 *
 * 兼容平台: macOS, Windows, Linux
 */

const fs = require('fs');
const path = require('path');

/**
 * 创建 TM 命名空间存根
 * 第三方包 codegen 依赖此命名空间
 */
function createTMNamespaceStub() {
  const rootDir = path.resolve(__dirname, '..');
  const harmonyRoot = path.join(rootDir, 'apps/oa/harmony');

  // TM 命名空间存根内容
  const tmNamespaceContent = `/**
 * TM namespace stub for TurboModule type compatibility
 *
 * This file provides the TM namespace that third-party TurboModules
 * import from @rnoh/react-native-openharmony/generated/ts
 */

export namespace TM {
  // Third-party TurboModule types will be added here by codegen
}
`;

  const ohModulesDir = path.join(harmonyRoot, 'oh_modules');

  // 处理顶层 @rnoh 目录
  const topLevelRNOH = path.join(ohModulesDir, '@rnoh/react-native-openharmony');
  if (fs.existsSync(topLevelRNOH)) {
    writeGeneratedTs(topLevelRNOH, tmNamespaceContent);
  }

  // 处理 .ohpm 目录中的所有 @rnoh/react-native-openharmony 副本
  const ohpmDir = path.join(ohModulesDir, '.ohpm');
  if (fs.existsSync(ohpmDir)) {
    try {
      const entries = fs.readdirSync(ohpmDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('@rnoh+react-native-openharmony@')) {
          const packageOhModules = path.join(ohpmDir, entry.name, 'oh_modules/@rnoh/react-native-openharmony');
          if (fs.existsSync(packageOhModules)) {
            writeGeneratedTs(packageOhModules, tmNamespaceContent);
          }
        }
      }
    } catch (e) {
      // .ohpm 目录可能不存在或为空，忽略
    }
  }
}

/**
 * 写入 generated/ts.ts 文件
 */
function writeGeneratedTs(baseDir, content) {
  const generatedDir = path.join(baseDir, 'generated');
  const tsPath = path.join(generatedDir, 'ts.ts');

  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  fs.writeFileSync(tsPath, content, 'utf8');
  console.log(`[harmony-postinstall] Created ${tsPath}`);
}

/**
 * 主函数
 */
function main() {
  const rootDir = path.resolve(__dirname, '..');
  const harmonyRoot = path.join(rootDir, 'apps/oa/harmony');

  const packageJsonPath = path.join(harmonyRoot, 'oh-package.json5');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('[harmony-postinstall] Harmony project not found, skipping');
    return;
  }

  console.log('[harmony-postinstall] Running Harmony postinstall...');

  // 创建 TM 命名空间存根
  createTMNamespaceStub();

  console.log('[harmony-postinstall] Done');
}

main();
