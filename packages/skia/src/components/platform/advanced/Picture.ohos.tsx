/**
 * Picture 图片组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Picture as PictureBase } from '@react-native-ohos/react-native-skia';

export const PictureOHOS = (props: React.ComponentProps<typeof PictureBase>) =>
  React.createElement(PictureBase, props);
