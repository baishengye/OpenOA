/**
 * Shader 着色器组件 - HarmonyOS 实现
 */
import React from 'react';
import { Shader as ShaderBase } from '@react-native-ohos/react-native-skia';

export const ShaderOHOS = (props: React.ComponentProps<typeof ShaderBase>) =>
  React.createElement(ShaderBase, props);
