import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { fs } from '@itc/fs';
import { useTranslation } from '@itc/i18n';
import { Button } from '@itc/uikit';
import { describe, shared } from './shared';

interface Props {
  busy: boolean;
  append?: (line: string) => void;
}

export function FsTab({ busy, append }: Props) {
  const { t } = useTranslation();
  const [testPath] = useState(() => `${fs.DocumentDirectoryPath}/test.txt`);
  const [dirPath] = useState(() => `${fs.DocumentDirectoryPath}/test_dir`);
  const [fsInfo, setFsInfo] = useState('—');

  const log = useCallback((line: string) => {
    append?.(line);
  }, [append]);

  const loadFsInfo = useCallback(async () => {
    try {
      const info = await fs.getFSInfo();
      const usedSpace = info.totalSpace - info.freeSpace;
      setFsInfo(`${t('fs.totalSpace')}: ${formatBytes(info.totalSpace)} | ${t('fs.freeSpace')}: ${formatBytes(info.freeSpace)} | ${t('fs.usedSpace')}: ${formatBytes(usedSpace)}`);
      log(`${t('common.success')} ${t('fs.getFsInfoSuccess')}`);
    } catch (e) {
      setFsInfo(`${t('common.error')}: ${describe(e)}`);
      log(`${t('common.error')} ${t('fs.getFsInfoFailed')}: ${describe(e)}`);
    }
  }, [log, t]);

  useEffect(() => {
    loadFsInfo();
  }, [loadFsInfo]);

  // 基础文件操作
  const handleExists = async () => {
    try {
      const result = await fs.exists(testPath);
      log(`${t('common.success')} exists: ${result}`);
    } catch (e) {
      log(`${t('common.error')} exists ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleWriteFile = async () => {
    try {
      await fs.writeFile(testPath, 'Hello from @itc/fs!\n' + new Date().toISOString());
      log(`${t('common.success')} writeFile ${t('common.success')}`);
    } catch (e) {
      log(`${t('common.error')} writeFile ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleReadFile = async () => {
    try {
      const content = await fs.readFile(testPath);
      log(`${t('common.success')} readFile: ${content.substring(0, 50)}...`);
    } catch (e) {
      log(`${t('common.error')} readFile ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleAppendFile = async () => {
    try {
      await fs.appendFile(testPath, `\nAppended at ${Date.now()}`);
      log(`${t('common.success')} appendFile ${t('common.success')}`);
    } catch (e) {
      log(`${t('common.error')} appendFile ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleStat = async () => {
    try {
      const result = await fs.stat(testPath);
      log(`${t('common.success')} stat: size=${result.size}, isFile=${result.isFile()}`);
    } catch (e) {
      log(`${t('common.error')} stat ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleUnlink = async () => {
    try {
      await fs.unlink(testPath);
      log(`${t('common.success')} unlink ${t('common.success')}`);
    } catch (e) {
      log(`${t('common.error')} unlink ${t('common.failed')}: ${describe(e)}`);
    }
  };

  // 复制/移动
  const handleWriteForCopyMove = async () => {
    try {
      await fs.writeFile(testPath, 'Source content for copy/move test');
      log(`${t('common.success')} ${t('fs.writeSourceSuccess')}`);
    } catch (e) {
      log(`${t('common.error')} ${t('fs.writeSourceFailed')}: ${describe(e)}`);
    }
  };

  const handleCopyFile = async () => {
    try {
      await fs.copyFile(testPath, `${fs.DocumentDirectoryPath}/test_copy.txt`);
      log(`${t('common.success')} copyFile ${t('common.success')}`);
    } catch (e) {
      log(`${t('common.error')} copyFile ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleMoveFile = async () => {
    try {
      await fs.moveFile(testPath, `${fs.DocumentDirectoryPath}/test_move.txt`);
      log(`${t('common.success')} moveFile ${t('common.success')}`);
    } catch (e) {
      log(`${t('common.error')} moveFile ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleCleanup = async () => {
    try {
      await Promise.all([
        fs.unlink(`${fs.DocumentDirectoryPath}/test_copy.txt`),
        fs.unlink(`${fs.DocumentDirectoryPath}/test_move.txt`),
      ]);
      log(`${t('common.success')} ${t('fs.cleanupSuccess')}`);
    } catch (e) {
      log(`${t('common.error')} ${t('fs.cleanupFailed')}: ${describe(e)}`);
    }
  };

  // 目录操作
  const handleMkdir = async () => {
    try {
      await fs.mkdir(dirPath);
      log(`${t('common.success')} mkdir ${t('common.success')}`);
    } catch (e) {
      log(`${t('common.error')} mkdir ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleReaddir = async () => {
    try {
      const items = await fs.readDir(fs.DocumentDirectoryPath);
      log(`${t('common.success')} ${t('fs.readDirCount').replace('{{count}}', String(items.length))}`);
    } catch (e) {
      log(`${t('common.error')} readDir ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleRmdir = async () => {
    try {
      await fs.unlink(dirPath);
      log(`${t('common.success')} rmdir (unlink) ${t('common.success')}`);
    } catch (e) {
      log(`${t('common.error')} rmdir ${t('common.failed')}: ${describe(e)}`);
    }
  };

  // 哈希计算
  const handleHashMd5 = async () => {
    try {
      await fs.writeFile(testPath, 'test content for hash');
      const hash = await fs.hash(testPath, 'md5');
      log(`${t('common.success')} md5: ${hash}`);
    } catch (e) {
      log(`${t('common.error')} hash(md5) ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleHashSha256 = async () => {
    try {
      const hash = await fs.hash(testPath, 'sha256');
      log(`${t('common.success')} sha256: ${hash}`);
    } catch (e) {
      log(`${t('common.error')} hash(sha256) ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleHashSha1 = async () => {
    try {
      const hash = await fs.hash(testPath, 'sha1');
      log(`${t('common.success')} sha1: ${hash}`);
    } catch (e) {
      log(`${t('common.error')} hash(sha1) ${t('common.failed')}: ${describe(e)}`);
    }
  };

  // 随机读写
  const handleWriteAt = async () => {
    try {
      await fs.write(testPath, 'POS=0', 0, 'utf8');
      log(`${t('common.success')} write at position 0 ${t('common.success')}`);
    } catch (e) {
      log(`${t('common.error')} write ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleReadAt = async () => {
    try {
      const content = await fs.read(testPath, 10, 0, 'utf8');
      log(`${t('common.success')} read at position 0: "${content}"`);
    } catch (e) {
      log(`${t('common.error')} read ${t('common.failed')}: ${describe(e)}`);
    }
  };

  const handleTouch = async () => {
    try {
      await fs.touch(testPath);
      log(`${t('common.success')} touch ${t('common.success')}`);
    } catch (e) {
      log(`${t('common.error')} touch ${t('common.failed')}: ${describe(e)}`);
    }
  };

  return (
    <View>
      {/* 文件系统信息 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>{t('fs.title')}</Text>
        <Text style={shared.mono}>{fsInfo}</Text>
        <Button size="sm" variant="outline" onPress={loadFsInfo} disabled={busy}>{t('fs.refresh')}</Button>
      </View>

      {/* 路径常量 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>{t('fs.pathConstants')}</Text>
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
        <Text style={shared.cardTitle}>{t('fs.basicFileOps')}</Text>
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
        <Text style={shared.cardTitle}>{t('fs.copyMove')}</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" variant="outline" onPress={handleWriteForCopyMove} disabled={busy}>write source</Button>
          <Button size="sm" onPress={handleCopyFile} disabled={busy}>copyFile</Button>
          <Button size="sm" onPress={handleMoveFile} disabled={busy}>moveFile</Button>
          <Button size="sm" variant="ghost" onPress={handleCleanup} disabled={busy}>cleanup</Button>
        </View>
      </View>

      {/* 目录操作 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>{t('fs.dirOps')}</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handleMkdir} disabled={busy}>mkdir</Button>
          <Button size="sm" onPress={handleReaddir} disabled={busy}>readDir</Button>
          <Button size="sm" variant="outline" onPress={handleRmdir} disabled={busy}>rmdir</Button>
        </View>
      </View>

      {/* 哈希计算 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>{t('fs.hashCalc')}</Text>
        <Text style={styles.hint}>{t('fs.needTestFileFirst')}</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handleHashMd5} disabled={busy}>writeFile + md5</Button>
          <Button size="sm" variant="outline" onPress={handleHashSha256} disabled={busy}>sha256</Button>
          <Button size="sm" variant="outline" onPress={handleHashSha1} disabled={busy}>sha1</Button>
        </View>
      </View>

      {/* 随机读写 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>{t('fs.randomRw')}</Text>
        <Text style={styles.hint}>{t('fs.readWriteAtPos')}</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handleWriteAt} disabled={busy}>write at pos=0</Button>
          <Button size="sm" variant="outline" onPress={handleReadAt} disabled={busy}>read</Button>
          <Button size="sm" variant="ghost" onPress={handleTouch} disabled={busy}>touch</Button>
        </View>
      </View>

      {/* 说明 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>{t('fs.instructions')}</Text>
        <Text style={shared.mono}>
          {`- ${t('fs.basedOn')}\n`}
          {`- ${t('fs.autoAdapt')}\n`}
          {`- ${t('fs.underlyingTech')}`}
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
