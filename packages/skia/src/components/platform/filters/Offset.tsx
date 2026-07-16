/**
 * Offset 偏移滤镜组件
 */
import React from 'react';
import { Offset as OffsetBase } from '@shopify/react-native-skia';

export const Offset = (props: React.ComponentProps<typeof OffsetBase>) =>
  React.createElement(OffsetBase, props);
