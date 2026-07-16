import { Platform } from 'react-native';
import { ColorShader as ColorShaderBase } from './ColorShader';
import { ColorShaderOHOS as ColorShaderOHOS } from './ColorShader.ohos';
import { ImageShader as ImageShaderBase } from './ImageShader';
import { ImageShaderOHOS as ImageShaderOHOS } from './ImageShader.ohos';
import { Shader as ShaderBase } from './Shader';
import { ShaderOHOS as ShaderOHOS } from './Shader.ohos';
import { RuntimeShader as RuntimeShaderBase } from './RuntimeShader';
import { RuntimeShaderOHOS as RuntimeShaderOHOS } from './RuntimeShader.ohos';

// 根据平台选择实现
const ColorShaderImpl = (Platform.OS as string) === 'harmony' ? ColorShaderOHOS : ColorShaderBase;
const ImageShaderImpl = (Platform.OS as string) === 'harmony' ? ImageShaderOHOS : ImageShaderBase;
const ShaderImpl = (Platform.OS as string) === 'harmony' ? ShaderOHOS : ShaderBase;
const RuntimeShaderImpl = (Platform.OS as string) === 'harmony' ? RuntimeShaderOHOS : RuntimeShaderBase;

export {
  ColorShaderImpl as ColorShader,
  ImageShaderImpl as ImageShader,
  ShaderImpl as Shader,
  RuntimeShaderImpl as RuntimeShader,
};
