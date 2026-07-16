/**
 * RuntimeShader 着色器组件 - HarmonyOS 实现
 */
import React from 'react';
import { RuntimeShader as RuntimeShaderBase } from '@react-native-ohos/react-native-skia';

export const RuntimeShaderOHOS = (props: React.ComponentProps<typeof RuntimeShaderBase>) =>
  React.createElement(RuntimeShaderBase, props);
