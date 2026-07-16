/**
 * Patch 补丁组件封装
 */
import React from 'react';
import { Patch as PatchImpl } from '../platform';

export const Patch = (props: React.ComponentProps<typeof PatchImpl>) =>
  React.createElement(PatchImpl, props);
