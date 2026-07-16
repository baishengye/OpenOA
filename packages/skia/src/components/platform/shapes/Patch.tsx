/**
 * Patch 贝塞尔曲面组件
 */
import React from 'react';
import { Patch as PatchBase } from '@shopify/react-native-skia';

export const Patch = (props: React.ComponentProps<typeof PatchBase>) =>
  React.createElement(PatchBase, props);
