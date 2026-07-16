/**
 * Path 路径组件
 */
import React from 'react';
import { Path as PathBase } from '@shopify/react-native-skia';

export const Path = (props: React.ComponentProps<typeof PathBase>) =>
  React.createElement(PathBase, props);
