import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { hotfix, type LocalVersion, type SyncStatus } from '@itc/hotfix';
import { Button, TabProps, shared } from './shared';

const STATUS_LABEL: Record<SyncStatus, string> = {
  UP_TO_DATE:       '✅ 已是最新版本',
  UPDATE_INSTALLED: '🎉 更新已安装，彻底重启 app（冷启动）后生效',
  UPDATE_IGNORED:   '⏭ 用户跳过此次更新',
  ERROR:            '❌ 更新失败',
  IN_PROGRESS:      '⏳ 更新中…',
};

interface Props extends TabProps {}

export function HotfixTab({ run, append, busy }: Props) {
  const [version, setVersion] = useState<LocalVersion | null>(null);
  const [status, setStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    hotfix.getCurrentVersion().then(setVersion).catch(() => {});
  }, []);

  const onCheck = useCallback(
    () =>
      run('检查更新', async () => {
        const update = await hotfix.checkForUpdate();
        if (!update) {
          append('✅ 已是最新版本，无可用更新');
        } else {
          append(
            `📦 发现更新 ${update.label}（${(update.packageSize / 1024).toFixed(1)} KB）${update.isMandatory ? ' [强制]' : ''}`,
          );
        }
      }),
    [run, append],
  );

  const onSync = useCallback(
    () =>
      run('同步更新', async () => {
        const result = await hotfix.sync({ installMode: 'ON_NEXT_RESTART' });
        setStatus(result);
        if (result === 'UPDATE_INSTALLED') {
          // 不在此刷新 version：此刻是 pending 包，鸿蒙的 metadata 还不完整
          // （label/appVersion 为 undefined，会渲染成 "undefined（App undefined）"）。
          // 冷启动后包真正运行，下方 useEffect 会重新取到正确版本。
          append('🎉 更新已安装，彻底重启 app（冷启动）后生效');
        } else {
          append(`sync 结果: ${result}`);
        }
      }),
    [run, append],
  );

  return (
    <View style={shared.card}>
      <Text style={shared.cardTitle}>Bundle 版本</Text>
      <Text style={shared.mono}>
        {version?.label ? `${version.label}（App ${version.appVersion}）` : '初始包（无 OTA）'}
      </Text>

      {status && <Text style={shared.mono}>{STATUS_LABEL[status]}</Text>}

      <Text style={shared.cardTitle}>操作</Text>
      <Button label="检查更新（仅查询）" onPress={onCheck} disabled={busy} />
      <Button label="同步更新（下载 + 安装）" onPress={onSync} disabled={busy} />
      <Text style={shared.hint}>
        同步使用 ON_NEXT_RESTART 模式：安装后彻底重启 app（冷启动）生效。
        （RN 0.82 新架构下 ON_NEXT_RESUME 切后台不可靠，故三端统一用冷启动。）
      </Text>
    </View>
  );
}
