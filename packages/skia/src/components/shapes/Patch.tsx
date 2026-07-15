/**
 * Patch 曲面组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Patch as PatchBase } from '@shopify/react-native-skia';

export const Patch = (props: React.ComponentProps<typeof PatchBase>) =>
  React.createElement(PatchBase, props);
