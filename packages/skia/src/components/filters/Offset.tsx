/**
 * Offset 偏移滤镜组件封装
 */
import React from 'react';
import { Offset as OffsetImpl } from '../platform';

export const Offset = (props: React.ComponentProps<typeof OffsetImpl>) =>
  React.createElement(OffsetImpl, props);
