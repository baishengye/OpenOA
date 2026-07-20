/**
 * CodePush 发布脚本
 * 1. 生成 bundle 保存到 files 目录
 * 2. 上传到 CodePush 服务器
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FILES_DIR = path.resolve(__dirname, '../../.codepush-files');
const SERVER_IP = '172.16.80.101';

function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function exec(command, options = {}) {
  console.log(`\n> ${command}`);
  try {
    return execSync(command, {
      stdio: 'inherit',
      ...options,
    });
  } catch (error) {
    console.error(`命令执行失败: ${command}`);
    process.exit(1);
  }
}

function release({ appName, platform, deployment = 'Staging', version = '1.0.0' }) {
  const timestamp = getTimestamp();
  const bundleName = `release-v${version}_${SERVER_IP}_${platform}_${timestamp}`;
  const bundleDir = path.join(FILES_DIR, bundleName);

  // 确保 files 目录存在
  if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
  }

  console.log(`\n========================================`);
  console.log(`开始发布: ${appName} (${platform})`);
  console.log(`部署环境: ${deployment}`);
  console.log(`版本: ${version}`);
  console.log(`输出目录: ${bundleDir}`);
  console.log(`========================================\n`);

  // 创建输出目录
  if (fs.existsSync(bundleDir)) {
    fs.rmSync(bundleDir, { recursive: true });
  }
  fs.mkdirSync(bundleDir, { recursive: true });

  // 生成 bundle
  let bundlePath;
  let assetsDir;

  if (platform === 'android') {
    bundlePath = path.join(bundleDir, 'index.android.bundle');
    assetsDir = path.join(bundleDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
    exec(`react-native bundle --platform android --dev false --entry-file index.js --bundle-output "${bundlePath}" --assets-dest "${assetsDir}"`);
  } else if (platform === 'ios') {
    bundlePath = path.join(bundleDir, 'main.jsbundle');
    assetsDir = path.join(bundleDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
    exec(`react-native bundle --platform ios --dev false --entry-file index.js --bundle-output "${bundlePath}" --assets-dest "${assetsDir}"`);
  } else if (platform === 'harmony') {
    bundlePath = path.join(bundleDir, 'bundle.harmony.js');
    assetsDir = path.join(bundleDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });
    exec(`react-native bundle --platform harmony --dev false --entry-file index.js --bundle-output "${bundlePath}" --assets-dest "${assetsDir}" --config metro.config.harmony.js`);
  }

  // 上传到服务器（传目录路径，code-push 会自动处理）
  console.log(`\n正在上传到 CodePush 服务器...`);
  exec(`code-push release "${appName}" "${bundleDir}" "${version}" -d ${deployment}`);

  console.log(`\n========================================`);
  console.log(`✅ 发布完成!`);
  console.log(`本地存档: ${bundleDir}`);
  console.log(`========================================\n`);
}

// 解析命令行参数
const args = process.argv.slice(2);
const platform = args[0] || 'android';
const deployment = args[1] || 'Staging';
const version = args[2] || '1.0.0';

const platforms = {
  android: { appName: 'OpenOA-android', platform: 'android' },
  ios: { appName: 'OpenOA-ios', platform: 'ios' },
  harmony: { appName: 'OpenOA-harmony', platform: 'harmony' },
};

const config = platforms[platform];
if (!config) {
  console.error(`未知平台: ${platform}`);
  console.log('可用平台: android, ios, harmony');
  process.exit(1);
}

release({ ...config, deployment, version });
