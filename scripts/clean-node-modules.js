/**
 * 删除所有 node_modules 目录（跨平台，适用于 Windows、macOS、Linux）
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
const { execSync } = require('child_process');

const isWindows = process.platform === 'win32';

/**
 * 递归删除目录 - 跨平台实现
 * @param {string} dirPath 目录路径
 * @returns {boolean} 是否成功
 */
function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return true;
  }

  try {
    if (isWindows) {
      // Windows: 使用 rmdir /s /q 或 powershell
      try {
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore', timeout: 120000 });
      } catch {
        // 尝试使用 PowerShell 作为备选
        execSync(`powershell -Command "Remove-Item -Path '${dirPath}' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore', timeout: 120000 });
      }
    } else {
      // macOS/Linux: 使用 rm -rf，添加重试逻辑
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore', timeout: 120000 });
          break;
        } catch (err) {
          attempts++;
          if (attempts >= maxAttempts) {
            // 最后尝试使用 sudo
            try {
              execSync(`sudo rm -rf "${dirPath}"`, { stdio: 'ignore', timeout: 120000 });
              break;
            } catch {
              throw err;
            }
          }
          // 等待一下再重试
          execSync('sleep 1', { stdio: 'ignore' });
        }
      }
    }

    return true;
  } catch (err) {
    console.error(`   错误: ${err.message}`);
    return false;
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

  let items;
  try {
    items = fs.readdirSync(startPath, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const item of items) {
    const fullPath = path.join(startPath, item.name);

    if (item.isDirectory()) {
      if (item.name === 'node_modules') {
        results.push(fullPath);
      } else {
        // 继续递归（排除常见的大目录加速）
        if (!['.git', 'vendor', 'build', 'dist', 'Harmony', 'openharmony'].includes(item.name)) {
          try {
            results.push(...findNodeModules(fullPath));
          } catch {
            // 忽略无法访问的目录
          }
        }
      }
    }
  }

  return results;
}

/**
 * 获取项目根目录
 */
const rootDir = path.resolve(__dirname, '..');

// 输出彩色状态（跨平台）
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

log('🗑️  开始清理 node_modules...\n', 'bright');
log(`📁 项目根目录: ${rootDir}\n`);

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
  try {
    const packages = fs.readdirSync(packagesDir, { withFileTypes: true });
    for (const pkg of packages) {
      if (pkg.isDirectory()) {
        const nodeModulesPath = path.join(packagesDir, pkg.name, 'node_modules');
        if (!targets.includes(nodeModulesPath)) {
          targets.push(nodeModulesPath);
        }
      }
    }
  } catch {
    // 忽略无法访问的目录
  }
}

// 也查找嵌套的 node_modules（更彻底）
log('🔍 正在扫描 node_modules 目录...\n');
const foundDirs = findNodeModules(rootDir);
const allTargets = [...new Set([...targets, ...foundDirs])];

// 按深度排序，先删内层再删外层
allTargets.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);

log(`📊 共发现 ${allTargets.length} 个 node_modules 目录:\n`);
allTargets.forEach((dir, i) => {
  const relativePath = path.relative(rootDir, dir);
  log(`   ${i + 1}. ${relativePath}`);
});
log('');

// 删除所有
let successCount = 0;
let failCount = 0;

for (const target of allTargets) {
  const relativePath = path.relative(rootDir, target);
  log(`   正在删除: ${relativePath}`, 'blue');
  const result = removeDir(target);
  if (result) {
    log(`   ✅ 已删除\n`, 'green');
    successCount++;
  } else {
    log(`   ❌ 删除失败\n`, 'red');
    failCount++;
  }
}

log(`📊 清理完成: 成功 ${successCount}, 失败 ${failCount}`, failCount > 0 ? 'yellow' : 'green');
