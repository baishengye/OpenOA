/**
 * ColorShader 着色器组件 - HarmonyOS 实现
 */
import React from 'react';
import { ColorShader as ColorShaderBase } from '@react-native-ohos/react-native-skia';

export const ColorShaderOHOS = (props: React.ComponentProps<typeof ColorShaderBase>) =>
  React.createElement(ColorShaderBase, props);
