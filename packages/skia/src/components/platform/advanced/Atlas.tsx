/**
 * Atlas 图集组件封装
 */

import React from 'react';
import { Atlas as AtlasBase } from '@shopify/react-native-skia';

export const Atlas = (props: React.ComponentProps<typeof AtlasBase>) =>
  React.createElement(AtlasBase, props);
