/**
 * Morphology 形态学滤镜组件封装
 */
import React from 'react';
import { Morphology as MorphologyImpl } from '../platform';

export const Morphology = (props: React.ComponentProps<typeof MorphologyImpl>) =>
  React.createElement(MorphologyImpl, props);
