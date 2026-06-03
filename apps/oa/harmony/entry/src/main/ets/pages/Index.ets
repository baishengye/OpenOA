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
import { createRNPackages } from '../RNPackagesFactory';

// 自定义 Fabric 组件构建器（本演示无自定义原生组件，留空）
@Builder
function buildCustomRNComponent(_ctx: ComponentBuilderContext) {}

const wrappedCustomRNComponentBuilder: WrappedBuilder<[ComponentBuilderContext]> =
  wrapBuilder(buildCustomRNComponent);

@Entry
@Component
struct Index {
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined;
  @State shouldShow: boolean = false;
  private logBoxDialogController: CustomDialogController | undefined = undefined;

  aboutToAppear() {
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
            arkTsComponentNames: [],
          },
          // 必须与 JS 端 AppRegistry.registerComponent 的名字一致（app.json: OpenDingDing）
          appKey: 'OpenDingDing',
          wrappedCustomRNComponentBuilder: wrappedCustomRNComponentBuilder,
          onSetUp: (_rnInstance) => {},
          jsBundleProvider: new TraceJSBundleProviderDecorator(
            new AnyJSBundleProvider([
              // 优先连 Metro（开发态），失败则用打进 rawfile 的离线 bundle
              new MetroJSBundleProvider(),
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
