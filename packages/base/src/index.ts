/**
 * @itc/base —— OpenOA 公共基座。
 *
 * 提供所有端能力模块共享、与业务无关的基础设施。依赖方向铁律：
 * feature 模块依赖 base，base 绝不反向依赖任何 feature。
 */

export {
  ErrorCode,
  ItcError,
  ok,
  err,
  toResult,
  type Result,
} from './result';

export {
  type ItcModule,
  type ModuleState,
  BaseModule,
} from './contract';

export {
  type ItcPlatform,
  type PlatformVersion,
  type MajorVersion,
  type MinorVersion,
  type PatchVersion,
  currentPlatform,
  currentVersion,
  isAndroid,
  isIOS,
  isHarmony,
  select,
  iosVersion,
  androidVersion,
  harmonyVersion,
} from './platform';

export {
  type EventHandler,
  type Unsubscribe,
  type ItcEventMap,
  TypedEventBus,
  eventBus,
} from './eventBus';

export {
  type LogLevel,
  type Logger,
  ConsoleLogger,
  setLogger,
  logger,
} from './logger';

export {
  type KVStorage,
  setStorage,
  storage,
} from './storage';

export { md5 } from './md5';
