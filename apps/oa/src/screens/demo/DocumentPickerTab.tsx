import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { documentPicker, types } from '@itc/document-picker';
import type { DocumentPickerResponse } from '@itc/document-picker';
import { Button } from '@itc/uikit';
import { useTranslation } from '@itc/i18n';
import { describe, shared } from './shared';

interface Props {
  busy: boolean;
  append?: (line: string) => void;
}

export function DocumentPickerTab({ busy, append }: Props) {
  const { t } = useTranslation();
  const [pickedFiles, setPickedFiles] = useState<{ uri: string; name: string }[]>([]);

  const log = useCallback((line: string) => {
    append?.(line);
  }, [append]);

  // pick - 多选文件
  const handlePick = async () => {
    try {
      const results = await documentPicker.pick({
        allowMultiSelection: true,
        type: types.allFiles,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ pick ${t('documentPicker.success')}: ${t('documentPicker.selected')} ${results.length} ${t('documentPicker.files')}`);
      results.forEach((r: DocumentPickerResponse) => {
        log(`   - ${r.name} (${formatSize(r.size)}, ${r.type})`);
      });
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ pick ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pickSingle - 单选文件
  const handlePickSingle = async () => {
    try {
      const result = await documentPicker.pickSingle({
        type: types.allFiles,
      });
      setPickedFiles([{ uri: result.uri, name: result.name }]);
      log(`✅ pickSingle ${t('documentPicker.success')}: ${result.name}`);
      log(`   URI: ${result.uri}`);
      log(`   ${t('documentPicker.type')}: ${result.type}, ${t('documentPicker.size')}: ${formatSize(result.size)}`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ pickSingle ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择图片
  const handlePickImages = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.images,
        allowMultiSelection: true,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.images')} ${t('documentPicker.success')}: ${results.length} 张`);
      results.forEach((r: DocumentPickerResponse) => {
        log(`   - ${r.name}`);
      });
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.images')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择视频
  const handlePickVideos = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.video,
        allowMultiSelection: false,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.video')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.video')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择音频
  const handlePickAudio = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.audio,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.audio')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.audio')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择 PDF
  const handlePickPdf = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.pdf,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.pdf')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.pdf')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择压缩包
  const handlePickZip = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.zip,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.zip')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.zip')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择纯文本
  const handlePickPlainText = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.plainText,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.plainText')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.plainText')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择 Word 文档
  const handlePickDoc = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.doc,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.doc')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.doc')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择 Word 文档 (docx)
  const handlePickDocx = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.docx,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.docx')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.docx')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择 Excel 文档
  const handlePickXls = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.xls,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.xls')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.xls')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择 Excel 文档 (xlsx)
  const handlePickXlsx = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.xlsx,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.xlsx')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.xlsx')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择 PowerPoint 文档
  const handlePickPpt = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.ppt,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.ppt')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.ppt')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择 PowerPoint 文档 (pptx)
  const handlePickPptx = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.pptx,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.pptx')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.pptx')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pick - 选择 CSV 文件
  const handlePickCsv = async () => {
    try {
      const results = await documentPicker.pick({
        type: types.csv,
      });
      setPickedFiles(results.map((r:any) => ({ uri: r.uri, name: r.name })));
      log(`✅ ${t('documentPicker.csv')} ${t('documentPicker.success')}: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ ${t('documentPicker.csv')} ${t('documentPicker.failed')}: ${describe(e)}`);
      }
    }
  };

  // pickDirectory - 选择目录
  const handlePickDirectory = async () => {
    try {
      const result = await documentPicker.pickDirectory();
      setPickedFiles([{ uri: result.uri, name: t('documentPicker.directory') }]);
      log(`✅ pickDirectory ${t('documentPicker.success')}`);
      log(`   URI: ${result.uri}`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log(`ℹ️ ${t('documentPicker.userCancelledInfo')}`);
      } else {
        log(`❌ pickDirectory ${t('documentPicker.pickDirectoryFailed')}: ${describe(e)}`);
      }
    }
  };

  // isCancel - 检查是否为取消错误
  const handleTestIsCancel = () => {
    const cancelError = new Error('User canceled');
    const otherError = new Error('Some other error');

    const isCancel1 = documentPicker.isCancel(cancelError);
    const isCancel2 = documentPicker.isCancel(otherError);
    const isCancel3 = documentPicker.isCancel('not an error');

    log(`isCancel(Error('User canceled')): ${isCancel1}`);
    log(`isCancel(Error('Some other error')): ${isCancel2}`);
    log(`isCancel('not an error'): ${isCancel3}`);
  };

  // isInProgress - 检查是否正在进行
  const handleTestIsInProgress = () => {
    const inProgress = documentPicker.isInProgress();
    log(`isInProgress(): ${inProgress}`);
  };

  // releaseSecureAccess - 释放安全访问权限
  const handleReleaseSecureAccess = async () => {
    try {
      const uris = pickedFiles.map((f) => f.uri);
      if (uris.length === 0) {
        log(`ℹ️ ${t('documentPicker.tryReleaseFirst')}`);
        return;
      }
      await documentPicker.releaseSecureAccess(uris);
      log(`✅ ${t('documentPicker.releaseSuccess')} ${uris.length} ${t('documentPicker.uris')}`);
    } catch (e) {
      log(`❌ releaseSecureAccess ${t('documentPicker.failed')}: ${describe(e)}`);
    }
  };

  // 清除记录
  const handleClear = () => {
    setPickedFiles([]);
    log('🗑️ Cleared selection');
  };

  return (
    <View>
      {/* 文件选择结果 */}
      {pickedFiles.length > 0 && (
        <View style={shared.card}>
          <Text style={shared.cardTitle}>{t('documentPicker.selectedFiles')}</Text>
          {pickedFiles.map((file, index) => (
            <Text key={index} style={shared.mono} numberOfLines={1}>
              {file.name}
            </Text>
          ))}
        </View>
      )}

      {/* 基础选择 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>Basic Selection</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handlePick} disabled={busy}>
            pick (multi)
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickSingle} disabled={busy}>
            pickSingle
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickDirectory} disabled={busy}>
            pickDirectory
          </Button>
        </View>
      </View>

      {/* 按类型选择 - 基础 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>By Type (Basic)</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handlePickImages} disabled={busy}>
            {t('documentPicker.images')}
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickVideos} disabled={busy}>
            {t('documentPicker.video')}
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickPdf} disabled={busy}>
            PDF
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickAudio} disabled={busy}>
            {t('documentPicker.audio')}
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickZip} disabled={busy}>
            {t('documentPicker.zip')}
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickPlainText} disabled={busy}>
            {t('documentPicker.plainText')}
          </Button>
        </View>
      </View>

      {/* 按类型选择 - Office 文档 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>By Type (Office)</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" variant="outline" onPress={handlePickDoc} disabled={busy}>
            Word (.doc)
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickDocx} disabled={busy}>
            Word (.docx)
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickXls} disabled={busy}>
            Excel (.xls)
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickXlsx} disabled={busy}>
            Excel (.xlsx)
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickPpt} disabled={busy}>
            PPT (.ppt)
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickPptx} disabled={busy}>
            PPT (.pptx)
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickCsv} disabled={busy}>
            CSV
          </Button>
        </View>
        <Text style={styles.hint}>
          Office types may not be supported on all platforms
        </Text>
      </View>

      {/* 工具方法 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>Utilities</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" variant="outline" onPress={handleTestIsCancel} disabled={busy}>
            isCancel
          </Button>
          <Button size="sm" variant="outline" onPress={handleTestIsInProgress} disabled={busy}>
            isInProgress
          </Button>
          <Button size="sm" variant="outline" onPress={handleReleaseSecureAccess} disabled={busy}>
            releaseSecureAccess
          </Button>
        </View>
      </View>

      {/* 清理 */}
      <View style={shared.card}>
        <View style={styles.buttonGroup}>
          <Button size="sm" variant="ghost" onPress={handleClear} disabled={busy}>
            {t('documentPicker.clear')}
          </Button>
        </View>
      </View>

      {/* 说明 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>@itc/document-picker</Text>
        <Text style={shared.mono}>
          {`- Unified wrapper for iOS/Android/HarmonyOS document picker API\n`}
          {`- iOS/Android: @react-native-documents/picker v12\n`}
          {`- HarmonyOS: @react-native-ohos/react-native-document-picker`}
        </Text>
      </View>
    </View>
  );
}

// ── 工具函数 ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
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
    marginTop: 8,
  },
});
