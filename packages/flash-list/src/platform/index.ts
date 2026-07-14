/**
 * 平台选择入口
 * 根据运行平台选择对应的 FlashList 实现
 */

import { Platform } from 'react-native';
import { FlashList as FlashListBase } from './flash-list';
import { FlashList as FlashListOHOS } from './flash-list.ohos';

// 根据平台选择实现
// Platform.OS 在 RN 类型定义中不包含 'harmony'，需要类型断言
const FlashListImpl = (Platform.OS as string) === 'harmony' ? FlashListOHOS : FlashListBase;

export { FlashListImpl as FlashList };
