/**
 * BlurMask 模糊蒙版封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { BlurMask as BlurMaskBase } from '@shopify/react-native-skia';

export const BlurMask = (props: React.ComponentProps<typeof BlurMaskBase>) =>
  React.createElement(BlurMaskBase, props);
