/**
 * Box 3D 组件
 */
import React from 'react';
import { Box as BoxBase } from '@shopify/react-native-skia';

export const Box = (props: React.ComponentProps<typeof BoxBase>) =>
  React.createElement(BoxBase, props);
