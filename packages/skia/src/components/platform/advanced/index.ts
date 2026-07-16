import { Platform } from 'react-native';
import { Atlas as AtlasBase } from './Atlas';
import { AtlasOHOS as AtlasOHOS } from './Atlas.ohos';
import { Picture as PictureBase } from './Picture';
import { PictureOHOS as PictureOHOS } from './Picture.ohos';
import { Vertices as VerticesBase } from './Vertices';
import { VerticesOHOS as VerticesOHOS } from './Vertices.ohos';


// 根据平台选择实现
// Platform.OS 在 RN 类型定义中不包含 'harmony'，需要类型断言
const AtlasImpl = (Platform.OS as string) === 'harmony' ? AtlasOHOS : AtlasBase;
const PictureImpl = (Platform.OS as string) === 'harmony' ? PictureOHOS : PictureBase;
const VerticesImpl = (Platform.OS as string) === 'harmony' ? VerticesOHOS : VerticesBase;

export { AtlasImpl as Atlas , PictureImpl as Picture, VerticesImpl as Vertices };