#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"
// @itc/biometric 库自带的 C++ Package（codegen-lib-harmony 产物，提供其 TurboModule C++ 桥）。
// 头文件来自库的 cpp include 根（CMakeLists 已把 BIOMETRIC_LIB_CPP 加入 include 路径）。
#include "RNOH/generated/BaseItcBiometricPackage.h"
// 第三方库 op-sqlite 的 C++ Package（头来自其 cpp 子工程，CMake 已 add_subdirectory）。
#include "RNOpSqlitePackage.h"
// 第三方库 react-native-mmkv-storage 的 C++ Package（storage 后端）。
#include "MMKVNativePackage.h"

using namespace rnoh;

// app 级 RNOHGeneratedPackage：当前空壳（biometric 的 C++ 已自包含到其库）。
// 库级 BaseItcBiometricPackage：ItcBiometric 的 C++ 桥在 @itc/biometric 库内。
// RNOHMMKVStoragePackage：storage 后端（MMKV）的 C++ 桥。
std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
  return {
    std::make_shared<RNOHGeneratedPackage>(ctx),
    std::make_shared<BaseItcBiometricPackage>(ctx),
    std::make_shared<RNOpSqlitePackage>(ctx),
    std::make_shared<RNOHMMKVStoragePackage>(ctx),
  };
}
