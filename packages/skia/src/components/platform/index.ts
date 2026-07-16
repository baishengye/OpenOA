export * from './shapes';
export * from './gradients';
export * from './effects';
export * from './filters';
export * from './path-effects';
export * from './shaders';
export * from './advanced';

// Canvas and Group are kept as they are in this directory
import { Platform } from 'react-native';
import { Canvas as CanvasBase } from './Canvas';
import { CanvasOHOS as CanvasOHOS } from './Canvas.ohos';
import { Group as GroupBase } from './Group';
import { GroupOHOS as GroupOHOS } from './Group.ohos';

// 根据平台选择实现
const CanvasImpl = (Platform.OS as string) === 'harmony' ? CanvasOHOS : CanvasBase;
const GroupImpl = (Platform.OS as string) === 'harmony' ? GroupOHOS : GroupBase;

export {
  CanvasImpl as Canvas,
  GroupImpl as Group,
};
