/**
 * Picture 图片组件封装
 */
import React from 'react';
import { Picture as PictureImpl } from '../platform';

export const Picture = (props: React.ComponentProps<typeof PictureImpl>) =>
  React.createElement(PictureImpl, props);
