/**
 * Morphology 形态学滤镜封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Morphology as MorphologyBase } from '@shopify/react-native-skia';

export const Morphology = (props: React.ComponentProps<typeof MorphologyBase>) =>
  React.createElement(MorphologyBase, props);
