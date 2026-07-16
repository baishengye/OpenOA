/**
 * FractalNoise 分形噪点组件
 */
import React from 'react';
import { FractalNoise as FractalNoiseBase } from '@shopify/react-native-skia';

export const FractalNoise = (props: React.ComponentProps<typeof FractalNoiseBase>) =>
  React.createElement(FractalNoiseBase, props);
