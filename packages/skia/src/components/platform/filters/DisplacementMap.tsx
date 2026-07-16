/**
 * DisplacementMap 置换图组件
 */
import React from 'react';
import { DisplacementMap as DisplacementMapBase } from '@shopify/react-native-skia';

export const DisplacementMap = (props: React.ComponentProps<typeof DisplacementMapBase>) =>
  React.createElement(DisplacementMapBase, props);
