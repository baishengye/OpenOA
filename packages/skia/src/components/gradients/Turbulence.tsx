/**
 * Turbulence 湍流组件封装
 */
import React from 'react';
import { Turbulence as TurbulenceImpl } from '../platform';

export const Turbulence = (props: React.ComponentProps<typeof TurbulenceImpl>) =>
  React.createElement(TurbulenceImpl, props);
