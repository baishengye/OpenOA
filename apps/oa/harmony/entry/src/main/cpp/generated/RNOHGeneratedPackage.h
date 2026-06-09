/**
 * App-level generated package shell.
 * All TurboModule bridges are now self-contained in their respective packages:
 *   - RTNCodePush  → packages/hotfix/harmony (BaseRTNCodePushPackage)
 *   - ItcBiometric → packages/biometric/harmony (BaseItcBiometricPackage)
 */

#pragma once

#include "RNOH/Package.h"
#include "RNOH/ArkTSTurboModule.h"

namespace rnoh {

class RNOHGeneratedPackageTurboModuleFactoryDelegate : public TurboModuleFactoryDelegate {
  public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
        return nullptr;
    };
};

class GeneratedEventEmitRequestHandler : public EventEmitRequestHandler {
  public:
    void handleEvent(Context const &ctx) override {}
};

class RNOHGeneratedPackage : public Package {
  public:
    RNOHGeneratedPackage(Package::Context ctx) : Package(ctx){};

    std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override {
        return std::make_unique<RNOHGeneratedPackageTurboModuleFactoryDelegate>();
    }

    std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders() override {
        return {};
    }

    ComponentJSIBinderByString createComponentJSIBinderByName() override {
        return {};
    };

    EventEmitRequestHandlers createEventEmitRequestHandlers() override {
        return { std::make_shared<GeneratedEventEmitRequestHandler>() };
    }
};

} // namespace rnoh
