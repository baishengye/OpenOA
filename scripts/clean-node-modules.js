/**
 * 删除所有 node_modules 目录（跨平台，适用于 Windows）
 *
 * 用法：
 *   node scripts/clean-node-modules.js
 *
 * 支持的目录：
 *   - node_modules（根目录）
 *   - apps/oa/node_modules
 *   - packages 目录下各包的 node_modules
 */

const fs = require('fs');
const path = require('path');

/**
 * 递归删除目录
 * @param {string} dirPath 目录路径
 */
function removeDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return;
    }
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ 已删除: ${dirPath}`);
  } catch (err) {
    console.error(`❌ 删除失败: ${dirPath}`);
    console.error(`   错误: ${err.message}`);
  }
}

/**
 * 递归遍历目录查找 node_modules
 * @param {string} startPath 起始目录
 * @returns {string[]} 找到的 node_modules 路径列表
 */
function findNodeModules(startPath) {
  const results = [];

  if (!fs.existsSync(startPath)) {
    return results;
  }

  const items = fs.readdirSync(startPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(startPath, item.name);

    if (item.isDirectory()) {
      if (item.name === 'node_modules') {
        results.push(fullPath);
      } else {
        // 继续递归（排除常见的大目录加速）
        if (!['.git', 'vendor', 'build', 'dist'].includes(item.name)) {
          results.push(...findNodeModules(fullPath));
        }
      }
    }
  }

  return results;
}

// 获取项目根目录
const rootDir = path.resolve(__dirname, '..');

console.log('🗑️  开始清理 node_modules...\n');
console.log(`📁 项目根目录: ${rootDir}\n`);

// 定义需要清理的路径
const targets = [
  // 根目录的 node_modules
  path.join(rootDir, 'node_modules'),
  // apps/oa/node_modules
  path.join(rootDir, 'apps', 'oa', 'node_modules'),
];

// 查找 packages/*/node_modules
const packagesDir = path.join(rootDir, 'packages');
if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true });
  for (const pkg of packages) {
    if (pkg.isDirectory()) {
      targets.push(path.join(packagesDir, pkg.name, 'node_modules'));
    }
  }
}

// 也查找嵌套的 node_modules（更彻底）
console.log('🔍 正在扫描 node_modules 目录...\n');
const foundDirs = findNodeModules(rootDir);
const allTargets = [...new Set([...targets, ...foundDirs])];

console.log(`📊 共发现 ${allTargets.length} 个 node_modules 目录:\n`);
allTargets.forEach((dir, i) => {
  const relativePath = path.relative(rootDir, dir);
  console.log(`   ${i + 1}. ${relativePath}`);
});
console.log('');

// 删除所有
let successCount = 0;
let failCount = 0;

for (const target of allTargets) {
  if (fs.existsSync(target)) {
    removeDir(target);
    successCount++;
  }
}

console.log(`\n📊 清理完成: 成功 ${successCount}, 失败 ${failCount}`);
