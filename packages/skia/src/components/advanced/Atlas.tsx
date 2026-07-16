/**
 * Atlas 图集组件封装
 * 直接转发所有属性到基础组件
 */

import React from 'react';
import { Atlas as AtlasImpl } from '../platform';

export const Atlas = (props: React.ComponentProps<typeof AtlasImpl>) =>
  React.createElement(AtlasImpl, props);
