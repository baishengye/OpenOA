/**
 * Turbulence 湍流封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Turbulence as TurbulenceBase } from '@shopify/react-native-skia';

export const Turbulence = (props: React.ComponentProps<typeof TurbulenceBase>) =>
  React.createElement(TurbulenceBase, props);
