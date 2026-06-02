/**
 * 类型安全的事件总线。
 *
 * 用途：模块间解耦通信（feature 模块不互相 import，只通过事件交流），以及把原生
 * TurboModule 回调（推送到达、IM 新消息、连接状态变化）统一转发给宿主订阅。
 *
 * 事件名以 `<模块>:<事件>` 命名约定，避免跨模块撞名，如 `push:message`、`im:newMessage`。
 */

export type EventHandler<T> = (payload: T) => void;
export type Unsubscribe = () => void;

/** 事件映射表：键为事件名，值为该事件 payload 的类型。各模块用 declaration merging 扩展。 */
export interface ItcEventMap {
  // 占位，模块通过 `declare module '@itc/base' { interface ItcEventMap { ... } }` 扩展
  [event: string]: unknown;
}

export class TypedEventBus<M extends Record<string, unknown> = ItcEventMap> {
  private readonly handlers = new Map<keyof M, Set<EventHandler<unknown>>>();

  /** 订阅事件，返回取消订阅函数。 */
  on<K extends keyof M>(event: K, handler: EventHandler<M[K]>): Unsubscribe {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as EventHandler<unknown>);
    return () => {
      this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
    };
  }

  /** 订阅一次后自动取消。 */
  once<K extends keyof M>(event: K, handler: EventHandler<M[K]>): Unsubscribe {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  /** 派发事件。单个 handler 抛错不影响其余 handler。 */
  emit<K extends keyof M>(event: K, payload: M[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of [...set]) {
      try {
        handler(payload);
      } catch {
        // 单个订阅者异常隔离，避免影响其它订阅者；具体由订阅方自行 try/catch 记录
      }
    }
  }

  /** 移除某事件全部订阅，或清空所有。 */
  removeAll<K extends keyof M>(event?: K): void {
    if (event === undefined) this.handlers.clear();
    else this.handlers.delete(event);
  }
}

/** 全局共享总线实例。模块与宿主默认使用它通信。 */
export const eventBus = new TypedEventBus();
