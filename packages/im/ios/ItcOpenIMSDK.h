#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

/**
 * OpenIM SDK TurboModule 原生模块。
 *
 * 遵循 RN 0.82 New Architecture TurboModule 架构。
 * 使用 OpenIM SDK Core iOS C API 实现即时通讯功能。
 */
@interface ItcOpenIMSDK : RCTEventEmitter <RCTBridgeModule>

/**
 * 向 JS 侧推送事件的内部方法，供 listener 调用。
 */
- (void)pushEvent:(NSString *)eventName data:(id)data;

@end
