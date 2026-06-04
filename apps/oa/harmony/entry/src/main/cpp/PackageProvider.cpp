#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"
// @itc/* 库自带的 C++ Package（codegen-lib-harmony 产物，提供各自的 TurboModule C++ 桥）。
// 头文件来自各库的 cpp include 根（CMakeLists 已把 STORAGE/BIOMETRIC_LIB_CPP 加入 include 路径）。
#include "RNOH/generated/BaseItcStoragePackage.h"
#include "RNOH/generated/BaseItcBiometricPackage.h"
// 第三方库 op-sqlite 的 C++ Package（头来自其 cpp 子工程，CMake 已 add_subdirectory）。
#include "RNOpSqlitePackage.h"

using namespace rnoh;

// app 级 RNOHGeneratedPackage：当前空壳（storage / biometric 的 C++ 均已自包含到各自库）。
// 库级 BaseItc*Package：ItcStorage / ItcBiometric 的 C++ 桥分别在 @itc/storage、@itc/biometric 库内。
// 每个 Package 都建立 C++→ArkTS 的 TurboModule 工厂委托。
std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
  return {
    std::make_shared<RNOHGeneratedPackage>(ctx),
    std::make_shared<BaseItcStoragePackage>(ctx),
    std::make_shared<BaseItcBiometricPackage>(ctx),
    std::make_shared<RNOpSqlitePackage>(ctx),
  };
}
