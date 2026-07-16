/**
 * FractalNoise 分形噪点组件封装
 */
import React from 'react';
import { FractalNoise as FractalNoiseImpl } from '../platform';

export const FractalNoise = (props: React.ComponentProps<typeof FractalNoiseImpl>) =>
  React.createElement(FractalNoiseImpl, props);
