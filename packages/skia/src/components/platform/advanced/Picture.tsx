/**
 * Picture 图片组件
 */
import React from 'react';
import { Picture as PictureBase } from '@shopify/react-native-skia';

export const Picture = (props: React.ComponentProps<typeof PictureBase>) =>
  React.createElement(PictureBase, props);
