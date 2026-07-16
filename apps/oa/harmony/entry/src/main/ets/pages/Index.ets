import {
  AnyJSBundleProvider,
  ComponentBuilderContext,
  FileJSBundleProvider,
  MetroJSBundleProvider,
  ResourceJSBundleProvider,
  RNApp,
  RNOHErrorDialog,
  RNOHLogger,
  TraceJSBundleProviderDecorator,
  RNOHCoreContext,
} from '@rnoh/react-native-openharmony';
import common from '@ohos.app.ability.common';
import { comparingVersion } from '@react-native-ohos/react-native-code-push';
import { createRNPackages } from '../RNPackagesFactory';
import { RNCSkiaDomView, SKIA_DOM_VIEW_TYPE } from '@react-native-ohos/react-native-skia';


const arkTsComponentNames: Array<string> = [
  SKIA_DOM_VIEW_TYPE
];

// 自定义 Fabric 组件构建器（本演示无自定义原生组件，留空）
@Builder
export function buildCustomRNComponent(ctx: ComponentBuilderContext) {
  if (ctx.componentName === SKIA_DOM_VIEW_TYPE) {
    RNCSkiaDomView({
      ctx: ctx.rnComponentContext,
      tag: ctx.tag
      })
  }
}

const wrappedCustomRNComponentBuilder: WrappedBuilder<[ComponentBuilderContext]> =
  wrapBuilder(buildCustomRNComponent);

@Entry
@Component
struct Index {
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined;
  @State shouldShow: boolean = false;
  private logBoxDialogController: CustomDialogController | undefined = undefined;

  aboutToAppear() {
    // 比对沙箱中已下载的 CodePush bundle 版本，覆盖安装时清除历史资源。
    const ctx = getContext(this) as common.UIAbilityContext;
    comparingVersion(ctx);
    this.shouldShow = true;
  }

  onBackPress(): boolean {
    // 交给 RN 处理返回键
    this.rnohCoreContext?.dispatchBackPress();
    return true;
  }

  build() {
    Column() {
      if (this.rnohCoreContext && this.shouldShow) {
        RNApp({
          rnInstanceConfig: {
            createRNPackages,
            enableNDKTextMeasuring: true,
            enableBackgroundExecutor: false,
            enableCAPIArchitecture: true,
            arkTsComponentNames: arkTsComponentNames,
          },
          // 必须与 JS 端 AppRegistry.registerComponent 的名字一致（app.json: OpenOA）
          appKey: 'OpenOA',
          wrappedCustomRNComponentBuilder: wrappedCustomRNComponentBuilder,
          onSetUp: (_rnInstance) => {},
          jsBundleProvider: new TraceJSBundleProviderDecorator(
            new AnyJSBundleProvider([
              // 1. 开发态：直连 Metro
              new MetroJSBundleProvider(),
              // 2. CodePush OTA：已下载的热更新 bundle（沙箱路径）
              new FileJSBundleProvider(
                (getContext(this) as common.UIAbilityContext).filesDir + '/Bundles/bundle.harmony.js',
              ),
              // 3. 离线兜底：打进 rawfile 的 bundle
              new ResourceJSBundleProvider(
                this.rnohCoreContext.uiAbilityContext.resourceManager,
                'bundle.harmony.js',
              ),
            ]),
            this.rnohCoreContext.logger,
          ),
        })
      }
    }
    .height('100%')
    .width('100%')
  }
}
