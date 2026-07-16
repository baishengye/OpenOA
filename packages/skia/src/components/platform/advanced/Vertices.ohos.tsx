/**
 * Vertices 顶点组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Vertices as VerticesBase } from '@react-native-ohos/react-native-skia';

export const VerticesOHOS = (props: React.ComponentProps<typeof VerticesBase>) =>
  React.createElement(VerticesBase, props);
