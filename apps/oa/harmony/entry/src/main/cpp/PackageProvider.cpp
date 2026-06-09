#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"
#include "RNOH/generated/BaseItcBiometricPackage.h"
#include "RNOH/generated/BaseRTNCodePushPackage.h"
#include "RNOpSqlitePackage.h"
#include "MMKVNativePackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
  return {
    std::make_shared<RNOHGeneratedPackage>(ctx),
    std::make_shared<BaseItcBiometricPackage>(ctx),
    std::make_shared<BaseRTNCodePushPackage>(ctx),
    std::make_shared<RNOpSqlitePackage>(ctx),
    std::make_shared<RNOHMMKVStoragePackage>(ctx),
  };
}
