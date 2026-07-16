/**
 * Line 直线组件
 */
import React from 'react';
import { Line as LineBase } from '@shopify/react-native-skia';

export const Line = (props: React.ComponentProps<typeof LineBase>) =>
  React.createElement(LineBase, props);
