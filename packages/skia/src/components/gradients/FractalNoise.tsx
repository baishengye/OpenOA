/**
 * FractalNoise 分形噪声封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { FractalNoise as FractalNoiseBase } from '@shopify/react-native-skia';

export const FractalNoise = (props: React.ComponentProps<typeof FractalNoiseBase>) =>
  React.createElement(FractalNoiseBase, props);
