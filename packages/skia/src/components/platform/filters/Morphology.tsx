/**
 * Morphology 形态学滤镜组件
 */
import React from 'react';
import { Morphology as MorphologyBase } from '@shopify/react-native-skia';

export const Morphology = (props: React.ComponentProps<typeof MorphologyBase>) =>
  React.createElement(MorphologyBase, props);
