/**
 * Turbulence 湍流组件
 */
import React from 'react';
import { Turbulence as TurbulenceBase } from '@shopify/react-native-skia';

export const Turbulence = (props: React.ComponentProps<typeof TurbulenceBase>) =>
  React.createElement(TurbulenceBase, props);
