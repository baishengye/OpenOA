/**
 * Canvas 画布组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Canvas as CanvasBase } from '@shopify/react-native-skia';

/**
 * Skia 画布组件
 *
 * @example
 * ```tsx
 * import { Canvas, Circle, Group } from '@itc/skia';
 *
 * function App() {
 *   return (
 *     <Canvas style={{ width: 256, height: 256 }}>
 *       <Group blendMode="multiply">
 *         <Circle cx={64} cy={64} r={64} color="cyan" />
 *         <Circle cx={192} cy={64} r={64} color="magenta" />
 *         <Circle cx={128} cy={192} r={64} color="yellow" />
 *       </Group>
 *     </Canvas>
 *   );
 * }
 * ```
 */
export const Canvas = (props: React.ComponentProps<typeof CanvasBase>) =>
  React.createElement(CanvasBase, props);
