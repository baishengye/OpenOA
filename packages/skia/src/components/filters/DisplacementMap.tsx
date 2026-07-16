/**
 * DisplacementMap 置换图组件封装
 */
import React from 'react';
import { DisplacementMap as DisplacementMapImpl } from '../platform';

export const DisplacementMap = (props: React.ComponentProps<typeof DisplacementMapImpl>) =>
  React.createElement(DisplacementMapImpl, props);
