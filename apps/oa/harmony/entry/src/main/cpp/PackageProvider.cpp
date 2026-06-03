#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"

using namespace rnoh;

// 返回 codegen 生成的 RNOHGeneratedPackage：建立 C++ 侧 TurboModule 工厂委托，
// 启用对纯 ArkTS TurboModule（RNPackagesFactory 注册的 ItcBiometric/ItcStorage）的回退查找。
std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
  return {
    std::make_shared<RNOHGeneratedPackage>(ctx),
  };
}
