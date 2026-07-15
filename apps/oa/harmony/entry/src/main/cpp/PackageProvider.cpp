#include "RNOH/PackageProvider.h"
#include "./generated/RNOHGeneratedPackage.h"
#include "RNOH/generated/BaseItcBiometricPackage.h"
#include "RNOH/generated/BaseReactNativeCodePushPackage.h"
#include "RNOH/generated/BaseItcRnClientSdkPlusPackage.h"
#include "RNOpSqlitePackage.h"
#include "MMKVNativePackage.h"
#include "SafeAreaViewPackage.h"
#include "SkiaPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
  return {
    std::make_shared<RNOHGeneratedPackage>(ctx),
    std::make_shared<BaseItcBiometricPackage>(ctx),
    std::make_shared<BaseReactNativeCodePushPackage>(ctx),
    std::make_shared<BaseItcRnClientSdkPlusPackage>(ctx),
    std::make_shared<RNOpSqlitePackage>(ctx),
    std::make_shared<RNOHMMKVStoragePackage>(ctx),
    std::make_shared<SafeAreaViewPackage>(ctx),
    std::make_shared<SkiaPackage>(ctx),
  };
}
