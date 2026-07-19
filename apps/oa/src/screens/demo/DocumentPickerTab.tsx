import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { documentPicker, types } from '@itc/document-picker';
import type { DocumentPickerResponse } from '@itc/document-picker';
import { Button } from '@itc/uikit';
import { describe, shared } from './shared';

interface Props {
  busy: boolean;
  append?: (line: string) => void;
}

export function DocumentPickerTab({ busy, append }: Props) {
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
      log(`✅ pick 成功: 选中 ${results.length} 个文件`);
      results.forEach((r: DocumentPickerResponse) => {
        log(`   - ${r.name} (${formatSize(r.size)}, ${r.type})`);
      });
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ pick 失败: ${describe(e)}`);
      }
    }
  };

  // pickSingle - 单选文件
  const handlePickSingle = async () => {
    try {
      const result = await documentPicker.pickSingle({
        type: types.allFiles, // 使用跨平台支持的 PDF 类型
      });
      setPickedFiles([{ uri: result.uri, name: result.name }]);
      log(`✅ pickSingle 成功: ${result.name}`);
      log(`   URI: ${result.uri}`);
      log(`   类型: ${result.type}, 大小: ${formatSize(result.size)}`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ pickSingle 失败: ${describe(e)}`);
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
      log(`✅ 选择图片成功: ${results.length} 张`);
      results.forEach((r: DocumentPickerResponse) => {
        log(`   - ${r.name}`);
      });
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择图片失败: ${describe(e)}`);
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
      log(`✅ 选择视频成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择视频失败: ${describe(e)}`);
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
      log(`✅ 选择音频成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择音频失败: ${describe(e)}`);
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
      log(`✅ 选择 PDF 成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择 PDF 失败: ${describe(e)}`);
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
      log(`✅ 选择压缩包成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择压缩包失败: ${describe(e)}`);
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
      log(`✅ 选择纯文本成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择纯文本失败: ${describe(e)}`);
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
      log(`✅ 选择 Word (.doc) 成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择 Word (.doc) 失败: ${describe(e)}`);
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
      log(`✅ 选择 Word (.docx) 成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择 Word (.docx) 失败: ${describe(e)}`);
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
      log(`✅ 选择 Excel (.xls) 成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择 Excel (.xls) 失败: ${describe(e)}`);
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
      log(`✅ 选择 Excel (.xlsx) 成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择 Excel (.xlsx) 失败: ${describe(e)}`);
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
      log(`✅ 选择 PPT (.ppt) 成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择 PPT (.ppt) 失败: ${describe(e)}`);
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
      log(`✅ 选择 PPT (.pptx) 成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择 PPT (.pptx) 失败: ${describe(e)}`);
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
      log(`✅ 选择 CSV 成功: ${results.length} 个`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ 选择 CSV 失败: ${describe(e)}`);
      }
    }
  };

  // pickDirectory - 选择目录
  const handlePickDirectory = async () => {
    try {
      const result = await documentPicker.pickDirectory();
      setPickedFiles([{ uri: result.uri, name: '(目录)' }]);
      log(`✅ pickDirectory 成功`);
      log(`   URI: ${result.uri}`);
    } catch (e) {
      if (documentPicker.isCancel(e)) {
        log('ℹ️ 用户取消选择');
      } else {
        log(`❌ pickDirectory 失败: ${describe(e)}`);
      }
    }
  };

  // isCancel - 检查是否为取消错误
  const handleTestIsCancel = () => {
    // 模拟取消错误
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
        log('ℹ️ 请先选择文件再测试 releaseSecureAccess');
        return;
      }
      await documentPicker.releaseSecureAccess(uris);
      log(`✅ releaseSecureAccess 成功，释放了 ${uris.length} 个 URI`);
    } catch (e) {
      log(`❌ releaseSecureAccess 失败: ${describe(e)}`);
    }
  };

  // 清除记录
  const handleClear = () => {
    setPickedFiles([]);
    log('🗑️ 已清除选择记录');
  };

  return (
    <View>
      {/* 文件选择结果 */}
      {pickedFiles.length > 0 && (
        <View style={shared.card}>
          <Text style={shared.cardTitle}>已选择的文件</Text>
          {pickedFiles.map((file, index) => (
            <Text key={index} style={shared.mono} numberOfLines={1}>
              {file.name}
            </Text>
          ))}
        </View>
      )}

      {/* 基础选择 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>基础选择</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handlePick} disabled={busy}>
            pick (多选)
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
        <Text style={shared.cardTitle}>按类型选择（基础）</Text>
        <View style={styles.buttonGroup}>
          <Button size="sm" onPress={handlePickImages} disabled={busy}>
            图片
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickVideos} disabled={busy}>
            视频
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickPdf} disabled={busy}>
            PDF
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickAudio} disabled={busy}>
            音频
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickZip} disabled={busy}>
            压缩包
          </Button>
          <Button size="sm" variant="outline" onPress={handlePickPlainText} disabled={busy}>
            纯文本
          </Button>
        </View>
      </View>

      {/* 按类型选择 - Office 文档 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>按类型选择（Office 文档）</Text>
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
          Office 文档类型在部分平台可能不被支持
        </Text>
      </View>

      {/* 工具方法 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>工具方法</Text>
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
            清除记录
          </Button>
        </View>
      </View>

      {/* 说明 */}
      <View style={shared.card}>
        <Text style={shared.cardTitle}>@itc/document-picker</Text>
        <Text style={shared.mono}>
          {`- 统一封装 iOS/Android/HarmonyOS 文档选择 API\n`}
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
