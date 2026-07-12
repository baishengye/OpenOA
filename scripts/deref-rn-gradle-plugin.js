/**
 * deref-rn-gradle-plugin.js - 解除 React Native gradle-plugin 符号链接
 *
 * 将 apps/oa/node_modules/@react-native/gradle-plugin 从 pnpm 的 symlink
 * 换成真实目录拷贝，解决 Android Studio 复合构建导入时的路径问题。
 *
 * 兼容平台: macOS, Windows, Linux
 * 依赖: Node.js >= 16.7.0 (fs.cpSync)
 *
 * pnpm install 每次会把它还原成 symlink，故挂在 root postinstall 上自动修复。
 * 幂等：已是真实目录则跳过。
 */

const fs = require('fs');
const path = require('path');

/**
 * 检查路径是否是符号链接
 */
function isSymlink(targetPath) {
  try {
    const stats = fs.lstatSync(targetPath);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * 解析符号链接的真实路径
 */
function resolveSymlink(targetPath) {
  return fs.realpathSync(targetPath);
}

/**
 * 安全删除文件或目录
 */
function removePath(targetPath) {
  const stats = fs.lstatSync(targetPath);
  if (stats.isDirectory()) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(targetPath);
  }
}

/**
 * 拷贝目录（保留权限和时间戳）
 */
function copyDirectory(src, dest) {
  // 使用 fs.cpSync（Node.js 16.7+）进行递归拷贝
  // recursive: true 递归拷贝子目录
  // preserveTimestamps: true 保留时间戳
  // dereference: true 解引用符号链接，将链接指向的内容拷贝进去
  fs.cpSync(src, dest, {
    recursive: true,
    preserveTimestamps: true,
    dereference: true,
  });
}

/**
 * 主函数
 */
function main() {
  const root = path.resolve(__dirname, '..');
  const linkPath = path.join(root, 'apps/oa/node_modules/@react-native/gradle-plugin');

  // 检查路径是否存在
  if (!fs.existsSync(linkPath)) {
    console.log('[deref-rn-gradle-plugin] 跳过：路径不存在（尚未安装依赖？）');
    return;
  }

  // 检查是否是符号链接
  if (!isSymlink(linkPath)) {
    console.log('[deref-rn-gradle-plugin] 跳过：已是真实目录');
    return;
  }

  // 解析符号链接目标
  const targetPath = resolveSymlink(linkPath);
  console.log('[deref-rn-gradle-plugin] 解除 symlink → 真实拷贝');
  console.log(`  link:   ${linkPath}`);
  console.log(`  target: ${targetPath}`);

  // 删除符号链接
  removePath(linkPath);

  // 拷贝真实目录内容
  copyDirectory(targetPath, linkPath);

  console.log('[deref-rn-gradle-plugin] 完成');
}

// 直接运行
main();
