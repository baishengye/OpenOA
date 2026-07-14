import { EmitterSubscription } from 'react-native';
import { OpenIMEvent, OpenIMEventName } from './constants/OpenIMEvents';
import { NativeItcOpenIM } from './ItcOpenIMSDK';
import { ArgsOfEvent, EventCallbackArgsMap } from './types/eventArgs';

interface EmitterInterface {
  on<E extends keyof EventCallbackArgsMap>(eventName: E, callback: (...args: ArgsOfEvent<E>) => void): void;
  off<E extends keyof EventCallbackArgsMap>(eventName: E, callback: (...args: ArgsOfEvent<E>) => void): void;
}

type NativeSubscriptionAndCallbackPair = {
  subscription: EmitterSubscription;
  callback: (...args: unknown[]) => unknown;
};

class Emitter implements EmitterInterface {
  private pairsMap: Map<keyof EventCallbackArgsMap, NativeSubscriptionAndCallbackPair[]>;

  constructor() {
    this.pairsMap = new Map();
  }

  on<E extends keyof EventCallbackArgsMap>(eventName: E, callback: (...args: ArgsOfEvent<E>) => void): void {
    if (!NativeItcOpenIM) {
      console.warn('[IM Emitter] NativeItcOpenIM not available');
      return;
    }

    const subscription = (NativeItcOpenIM as unknown as { addListener: (event: string, handler: (...args: unknown[]) => void) => EmitterSubscription }).addListener(eventName, (...data) => {
      callback(...(data as ArgsOfEvent<E>));
    });

    const pair: NativeSubscriptionAndCallbackPair = { subscription, callback: callback as (...args: unknown[]) => unknown };
    const existing = this.pairsMap.get(eventName) || [];
    existing.push(pair);
    this.pairsMap.set(eventName, existing);
  }

  off<E extends keyof EventCallbackArgsMap>(eventName: E, callback: (...args: ArgsOfEvent<E>) => void): void {
    const pairs = this.pairsMap.get(eventName);
    if (!pairs) return;

    const pair = pairs.find((candidate) => (candidate.callback as (...args: unknown[]) => unknown) === callback);
    if (pair) {
      /**
       * NOTE: When removing listeners in a useEffect cleanup, calling
       * NativeOpenIMEmitter.removeSubscription(subscription) can throw a
       * "method not found" error. Prefer subscription.remove(), which works
       * reliably. This appears to be a React Native bug.
       */
      pair.subscription.remove();
      pairs.splice(pairs.indexOf(pair), 1);
      this.pairsMap.set(eventName, pairs);
    }
  }

  removeAllListeners<E extends keyof EventCallbackArgsMap>(eventName?: E): void {
    if (eventName) {
      const pairs = this.pairsMap.get(eventName);
      if (pairs) {
        pairs.forEach((p) => p.subscription.remove());
        this.pairsMap.delete(eventName);
      }
    } else {
      this.pairsMap.forEach((pairs) => {
        pairs.forEach((p) => p.subscription.remove());
      });
      this.pairsMap.clear();
    }
  }
}

export { OpenIMEvent } from './constants/OpenIMEvents';
export type { OpenIMEventName } from './constants/OpenIMEvents';
export default Emitter;
