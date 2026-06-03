import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { preferences } from '@kit.ArkData';

/**
 * KV 存储 TurboModule（鸿蒙 NEXT / RNOH）。底层 ArkData preferences（同步）。
 * 方法签名对应 src/NativeItcStorage.ts 的 Spec（全部同步）。
 *
 * ArkTS 严格模式：无内联对象类型 / 无对象 spread（见 docs/HARMONY.md §4）。
 */
export class ItcStorageTurboModule extends TurboModule {
  static readonly NAME: string = 'ItcStorage';

  private store: preferences.Preferences | null = null;

  private pref(): preferences.Preferences {
    if (this.store === null) {
      const options: preferences.Options = { name: 'itc-storage' };
      this.store = preferences.getPreferencesSync(this.ctx.uiAbilityContext, options);
    }
    return this.store;
  }

  setString(key: string, value: string): void {
    const p = this.pref();
    p.putSync(key, value);
    p.flush();
  }

  getString(key: string): string {
    const v = this.pref().getSync(key, '') as string;
    return v;
  }

  setBoolean(key: string, value: boolean): void {
    const p = this.pref();
    p.putSync(key, value);
    p.flush();
  }

  getBoolean(key: string): boolean {
    const v = this.pref().getSync(key, false) as boolean;
    return v;
  }

  contains(key: string): boolean {
    return this.pref().hasSync(key);
  }

  remove(key: string): void {
    const p = this.pref();
    p.deleteSync(key);
    p.flush();
  }

  clearAll(): void {
    const p = this.pref();
    p.clearSync();
    p.flush();
  }
}
