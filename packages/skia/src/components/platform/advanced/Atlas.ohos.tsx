/**
 * Atlas 图集组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Atlas as AtlasBase } from '@react-native-ohos/react-native-skia';

export const AtlasOHOS = (props: React.ComponentProps<typeof AtlasBase>) =>
  React.createElement(AtlasBase, props);
