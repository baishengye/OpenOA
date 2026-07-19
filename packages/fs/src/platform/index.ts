/**
 * @itc/fs 平台选择
 * 根据运行平台导出对应的 FsProvider 实现
 */

import { Platform } from 'react-native';
import { ItcFS as ItcFSBase } from './ItcFS';
import { ItcFSHarmony } from './ItcFS.harmony';

// 根据平台选择实现
// Platform.OS 在 RN 类型定义中不包含 'harmony'，需要类型断言
const ItcFS =
  (Platform.OS as string) === 'harmony' ? ItcFSHarmony : ItcFSBase;

export { ItcFS };
