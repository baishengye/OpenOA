/**
 * DisplacementMap 位移映射滤镜封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { DisplacementMap as DisplacementMapBase } from '@shopify/react-native-skia';

export const DisplacementMap = (props: React.ComponentProps<typeof DisplacementMapBase>) =>
  React.createElement(DisplacementMapBase, props);
