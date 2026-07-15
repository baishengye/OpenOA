/**
 * Offset 偏移滤镜封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Offset as OffsetBase } from '@shopify/react-native-skia';

export const Offset = (props: React.ComponentProps<typeof OffsetBase>) =>
  React.createElement(OffsetBase, props);
