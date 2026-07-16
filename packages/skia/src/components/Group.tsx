/**
 * Group 分组组件封装
 * 直接转发所有属性到基础组件
 */
import React from 'react';
import { Group as GroupImpl } from './platform';

export const Group = (props: React.ComponentProps<typeof GroupImpl>) =>
  React.createElement(GroupImpl, props);
