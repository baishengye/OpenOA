import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fs } from '@itc/fs';
import { Button } from '@itc/uikit';
import { describe, shared } from './shared';

interface Props {
  busy: boolean;
  append?: (line: string) => void;
}

export function FsTab({ busy, append }: Props) {
  const [testPath] = useState(() => `${fs.DocumentDirectoryPath}/test.txt`);
  const [dirPath] = useState(() => `${fs.DocumentDirectoryPath}/test_dir`);
  const [fsInfo, setFsInfo] = useState<string>('—');

  const log = useCallback((line: string) => {
    append?.(line);
  }, [append]);

  const loadFsInfo = useCallback(async () => {
    try {
      const info = await fs.getFSInfo();
      const usedSpace = info.totalSpace - info.freeSpace;
      setFsInfo(`总空间: ${formatBytes(info.totalSpace)} | 空闲: ${formatBytes(info.freeSpace)} | 已用: ${formatBytes(usedSpace)}`);
      log(`✅ getFSInfo 成功`);
    } catch (e) {
      setFsInfo(`获取失败: ${describe(e)}`);
      log(`❌ getFSInfo 失败: ${describe(e)}`);
    }
  }, [log]);

  useEffect(() => {
    loadFsInfo();
  }, [loadFsInfo]);

  // 基础文件操作
  const handleExists = async () => {
    try {
      const result = await fs.exists(testPath);
      log(`✅ exists: ${result}`);
    } catch (e) {
      log(`❌ exists 失败: ${describe(e)}`);
    }
  };

  const handleWriteFile = async () => {
    try {
      await fs.writeFile(testPath, 'Hello from @itc/fs!\n' + new Date().toISOString());
      log(`✅ writeFile 成功`);
    } catch (e) {
      log(`❌ writeFile 失败: ${describe(e)}`);
    }
  };

  const handleReadFile = async () => {
    try {
      const content = await fs.readFile(testPath);
      log(`✅ readFile: ${content.substring(0, 50)}...`);
    } catch (e) {
      log(`❌ readFile 失败: ${describe(e)}`);
    }
  };

  const handleAppendFile = async () => {
    try {
      await fs.appendFile(testPath, `\nAppended at ${Date.now()}`);
      log(`✅ appendFile 成功`);
    } catch (e) {
      log(`❌ appendFile 失败: ${describe(e)}`);
    }
  };

  const handleStat = async () => {
    try {
      const result = await fs.stat(testPath);
      log(`✅ stat: size=${result.size}, isFile=${result.isFile()}`);
    } catch (e) {
      log(`❌ stat 失败: ${describe(e)}`);
    }
  };

  const handleUnlink = async () => {
    try {
      await fs.unlink(testPath);
      log(`✅ unlink 成功`);
    } catch (e) {
      log(`❌ unlink 失败: ${describe(e)}`);
    }
  };

  // 复制/移动
  const handleWriteForCopyMove = async () => {
    try {
      await fs.writeFile(testPath, 'Source content for copy/move test');
      log(`✅ 写入源文件成功`);
    } catch (e) {
      log(`❌ 写入源文件失败: ${describe(e)}`);
    }
  };

  const handleCopyFile = async () => {
    try {
      await fs.copyFile(testPath, `${fs.DocumentDirectoryPath}/test_copy.txt`);
      log(`✅ copyFile 成功`);
    } catch (e) {
      log(`❌ copyFile 失败: ${describe(e)}`);
    }
  };

  const handleMoveFile = async () => {
    try {
      await fs.moveFile(testPath, `${fs.DocumentDirectoryPath}/test_move.txt`);
      log(`✅ moveFile 成功`);
    } catch (e) {
      log(`❌ moveFile 失败: ${describe(e)}`);
    }
  };

  const handleCleanup = async () => {
    try {
      await Promise.all([
        fs.unlink(`${fs.DocumentDirectoryPath}/test_copy.txt`),
        fs.unlink(`${fs.DocumentDirectoryPath}/test_move.txt`),
      ]);
      log(`✅ 清理测试文件成功`);
    } catch (e) {
      log(`❌ 清理测试文件失败: ${describe(e)}`);
    }
  };

  // 目录操作
  const handleMkdir = async () => {
    try {
      await fs.mkdir(dirPath);
      log(`✅ mkdir 成功`);
    } catch (e) {
      log(`❌ mkdir 失败: ${describe(e)}`);
    }
  };

  const handleReaddir = async () => {
    try {
      const items = await fs.readDir(fs.DocumentDirectoryPath);
      log(`✅ readDir: 共 ${items.length} 个条目`);
    } catch (e) {
      log(`❌ readDir 失败: ${describe(e)}`);
    }
  };

  const handleRmdir = async () => {
    try {
      await fs.unlink(dirPath);
      log(`✅ rmdir (unlink) 成功`);
    } catch (e) {
      log(`❌ rmdir 失败: ${describe(e)}`);
    }
  };

  // 哈希计算
  const handleHashMd5 = async () => {
    try {
      await fs.writeFile(testPath, 'test content for hash');
      const hash = await fs.hash(testPath, 'md5');
      log(`✅ md5: ${hash}`);
    } catch (e) {
      log(`❌ hash(md5) 失败: ${describe(e)}`);
    }
  };

  const handleHashSha256 = async () => {
    try {
      const hash = await fs.hash(testPath, 'sha256');
      log(`✅ sha256: ${hash}`);
    } catch (e) {
      log(`❌ hash(sha256) 失败: ${describe(e)}`);
    }
  };

  const handleHashSha1 = async () => {
    try {
      const hash = await fs.hash(testPath, 'sha1');
      log(`✅ sha1: ${hash}`);
    } catch (e) {
      log(`❌ hash(sha1) 失败: ${describe(e)}`);
    }
  };

  // 随机读写
  const handleWriteAt = async () => {
    try {
      await fs.write(testPath, 'POS=0', 0, 'utf8');
      log(`✅ write at position 0 成功`);
    } catch (e) {
      log(`❌ write 失败: ${describe(e)}`);
    }
  };

  const handleReadAt = async () => {
    try {
      const content = await fs.read(testPath, 10, 0, 'utf8');
      log(`✅ read at position 0: "${content}"`);
    } catch (e) {
      log(`❌ read 失败: ${describe(e)}`);
    }
  };

  const handleTouch = async () => {
    try {
      await fs.touch(testPath);
      log(`✅ touch 成功`);
    } catch (e) {
      log(`❌ touch 失败: ${describe(e)}`);
    }
  };

  return (
    <View>
      {/* 文件系统信息 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>文件系统信息（@itc/fs）</Text>
        <Text style={shared.mono}>{fsInfo}</Text>
        <Button size="sm" variant="outline" onPress={loadFsInfo} disabled={busy}>刷新</Button>
      </View>

      {/* 路径常量 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>路径常量</Text>
        <Text style={shared.mono} selectable>
          {`DocumentDirectoryPath: ${fs.DocumentDirectoryPath}\n`}
          {`CachesDirectoryPath: ${fs.CachesDirectoryPath}\n`}
          {`TemporaryDirectoryPath: ${fs.TemporaryDirectoryPath}\n`}
          {`LibraryDirectoryPath: ${fs.LibraryDirectoryPath}\n`}
          {`MainBundlePath: ${fs.MainBundlePath}`}
        </Text>
      </View>

      {/* 基础文件操作 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>基础文件操作</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handleExists} disabled={busy}>exists</Button>
          <Button size="sm" onPress={handleWriteFile} disabled={busy}>writeFile</Button>
          <Button size="sm" onPress={handleReadFile} disabled={busy}>readFile</Button>
          <Button size="sm" onPress={handleAppendFile} disabled={busy}>appendFile</Button>
          <Button size="sm" onPress={handleStat} disabled={busy}>stat</Button>
          <Button size="sm" onPress={handleUnlink} disabled={busy}>unlink</Button>
        </View>
      </View>

      {/* 复制/移动文件 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>复制 / 移动文件</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" variant="outline" onPress={handleWriteForCopyMove} disabled={busy}>写入源文件</Button>
          <Button size="sm" onPress={handleCopyFile} disabled={busy}>copyFile</Button>
          <Button size="sm" onPress={handleMoveFile} disabled={busy}>moveFile</Button>
          <Button size="sm" variant="ghost" onPress={handleCleanup} disabled={busy}>清理</Button>
        </View>
      </View>

      {/* 目录操作 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>目录操作</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handleMkdir} disabled={busy}>mkdir</Button>
          <Button size="sm" onPress={handleReaddir} disabled={busy}>readDir</Button>
          <Button size="sm" variant="outline" onPress={handleRmdir} disabled={busy}>rmdir</Button>
        </View>
      </View>

      {/* 哈希计算 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>哈希计算</Text>
        <Text style={styles.hint}>需要先创建测试文件</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handleHashMd5} disabled={busy}>writeFile + md5</Button>
          <Button size="sm" variant="outline" onPress={handleHashSha256} disabled={busy}>sha256</Button>
          <Button size="sm" variant="outline" onPress={handleHashSha1} disabled={busy}>sha1</Button>
        </View>
      </View>

      {/* 随机读写 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>随机读写</Text>
        <Text style={styles.hint}>在指定位置读写文件内容</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handleWriteAt} disabled={busy}>write at pos=0</Button>
          <Button size="sm" variant="outline" onPress={handleReadAt} disabled={busy}>read</Button>
          <Button size="sm" variant="ghost" onPress={handleTouch} disabled={busy}>touch</Button>
        </View>
      </View>

      {/* 说明 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>操作说明</Text>
        <Text style={shared.mono}>
          {`- 基于 @itc/fs 统一接口\n`}
          {`- 自动适配 iOS / Android / HarmonyOS\n`}
          {`- 底层使用 react-native-fs-turbo (iOS/Android) / @react-native-ohos/react-native-fs (HarmonyOS)`}
        </Text>
      </View>
    </View>
  );
}

// ── 工具函数 ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ── 样式 ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
});
