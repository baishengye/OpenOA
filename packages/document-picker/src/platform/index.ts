/**
 * @itc/document-picker 平台选择
 * 根据运行平台导出对应的 DocumentPickerProvider 实现
 */

import { Platform } from 'react-native';
import { ItcDocumentPicker } from './ItcDocumentPicker';
import { ItcDocumentPickerHarmony } from './ItcDocumentPicker.harmony';

// 根据平台选择实现
// Platform.OS 在 RN 类型定义中不包含 'harmony'，需要类型断言
const DocumentPicker =
  (Platform.OS as string) === 'harmony' ? ItcDocumentPickerHarmony : ItcDocumentPicker;

export { DocumentPicker };
