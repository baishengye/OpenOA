/**
 * ImageShader 着色器组件 - HarmonyOS 实现
 */
import React from 'react';
import { ImageShader as ImageShaderBase } from '@react-native-ohos/react-native-skia';

export const ImageShaderOHOS = (props: React.ComponentProps<typeof ImageShaderBase>) =>
  React.createElement(ImageShaderBase, props);
