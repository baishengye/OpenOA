/**
 * 模块契约。所有可剥离复用的 @itc/* 端能力模块都实现 {@link ItcModule}，
 * 从而获得统一的「能力探测 / 初始化 / 销毁」生命周期，便于宿主统一编排与降级。
 */

/** 模块当前状态机。 */
export type ModuleState = 'uninitialized' | 'initializing' | 'ready' | 'error';

/**
 * 端能力模块统一契约。
 *
 * - `isSupported()` 是三端能力探测与降级的统一入口：返回 false 时上层应走降级路径
 *   （如生物识别不可用回退账密登录、推送不可用回退轮询）。
 * - `init()` / `destroy()` 让宿主能集中管理模块生命周期（登录后 init、登出时 destroy）。
 */
export interface ItcModule<InitOptions = void> {
  /** 模块唯一名，与 npm 包名对应，如 'biometric' / 'push' / 'im'。 */
  readonly name: string;

  /** 当前平台 + 设备是否支持该能力。必须不抛异常，内部吞掉错误返回 false。 */
  isSupported(): Promise<boolean>;

  /** 初始化（幂等）。重复调用应直接返回已就绪状态。 */
  init(options: InitOptions): Promise<void>;

  /** 释放原生资源 / 取消监听。登出或切换租户时调用。 */
  destroy(): Promise<void>;

  /** 当前状态，供宿主查询与调试。 */
  readonly state: ModuleState;
}

/**
 * 模块基类，处理 state 流转与 init 幂等的样板逻辑。
 * 子类只需实现 `onInit` / `onDestroy` / `isSupported`。
 */
export abstract class BaseModule<InitOptions = void>
  implements ItcModule<InitOptions>
{
  abstract readonly name: string;
  private _state: ModuleState = 'uninitialized';
  private _initPromise: Promise<void> | null = null;

  get state(): ModuleState {
    return this._state;
  }

  abstract isSupported(): Promise<boolean>;
  protected abstract onInit(options: InitOptions): Promise<void>;
  protected abstract onDestroy(): Promise<void>;

  async init(options: InitOptions): Promise<void> {
    if (this._state === 'ready') return;
    if (this._initPromise) return this._initPromise;
    this._state = 'initializing';
    this._initPromise = (async () => {
      try {
        await this.onInit(options);
        this._state = 'ready';
      } catch (e) {
        this._state = 'error';
        throw e;
      } finally {
        this._initPromise = null;
      }
    })();
    return this._initPromise;
  }

  async destroy(): Promise<void> {
    if (this._state === 'uninitialized') return;
    await this.onDestroy();
    this._state = 'uninitialized';
  }
}
