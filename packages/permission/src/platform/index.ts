/**
 * 平台选择入口
 * 根据运行平台选择对应的 ItcPermission 实现
 */

import { Platform } from 'react-native';
import { ItcPermission as ItcPermissionBase } from './ItcPermission';
import { ItcPermission as ItcPermissionHarmony } from './ItcPermission.harmony';

// 根据平台选择实现
// Platform.OS 在 RN 类型定义中不包含 'harmony'，需要类型断言
const ItcPermissionImpl =
  (Platform.OS as string) === 'harmony' ? ItcPermissionHarmony : ItcPermissionBase;

export { ItcPermissionImpl as ItcPermission };
