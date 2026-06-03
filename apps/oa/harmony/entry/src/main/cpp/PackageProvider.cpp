#include "RNOH/PackageProvider.h"

using namespace rnoh;

// 本工程的端能力模块（biometric）是纯 ArkTS TurboModule，经 RNPackagesFactory.ets 注册，
// 无需 C++ Package，这里返回空即可。
std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
  return {};
}
