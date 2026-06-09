project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(OH_MODULE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${OH_MODULE_DIR}/@rnoh/react-native-openharmony/src/main/cpp")
# react-native-mmkv-storage 的鸿蒙移植包从上游 npm 包编译 MMKV Core C++ 源码，
# 其 CMakeLists 依赖这两个变量定位源码（见库 src/main/cpp/CMakeLists.txt）。
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
set(REANIMATED_SRC_DIR "${NODE_MODULES}/react-native-mmkv-storage/MMKV/Core")

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# 第三方库 op-sqlite（@react-native-ohos/op-sqlite，ohpm 从 .har 解出 cpp 到 oh_modules）。
# 它自带 CMake 子工程，产出 rnoh_rn_op_sqlite 供链接。
add_subdirectory("${OH_MODULE_DIR}/@react-native-ohos/op-sqlite/src/main/cpp" ./rn_op_sqlite)

# 第三方库 react-native-mmkv-storage（@react-native-oh-tpl 移植包，storage 后端）。
# 自带 CMake 子工程，产出 rnoh_mmkv_storage 供链接。
add_subdirectory("${OH_MODULE_DIR}/@react-native-oh-tpl/react-native-mmkv-storage/src/main/cpp" ./mmkv_storage)

# codegen-harmony v1 产物（app 级）：biometric 的 C++ 已迁到其库里，此处现为空壳。
file(GLOB GENERATED_CPP_FILES "${CMAKE_CURRENT_SOURCE_DIR}/generated/*.cpp")

# @itc/biometric 库自带的 C++（codegen-lib-harmony 产物：BaseXxxPackage + Xxx 桥）。
set(BIOMETRIC_LIB_CPP "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../../packages/biometric/harmony/biometric/src/main/cpp")
file(GLOB BIOMETRIC_LIB_CPP_FILES "${BIOMETRIC_LIB_CPP}/RNOH/generated/turbo_modules/*.cpp")

# @itc/hotfix 库自带的 C++（RTNCodePush codegen 产物，自包含在 packages/hotfix/harmony）。
# 运行 pnpm codegen:hotfix 可更新这批文件。
set(HOTFIX_LIB_CPP "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../../packages/hotfix/harmony/hotfix/src/main/cpp")
file(GLOB HOTFIX_LIB_CPP_FILES "${HOTFIX_LIB_CPP}/RNOH/generated/turbo_modules/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    ${BIOMETRIC_LIB_CPP_FILES}
    ${HOTFIX_LIB_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)

target_include_directories(rnoh_app PUBLIC "${BIOMETRIC_LIB_CPP}" "${HOTFIX_LIB_CPP}")
target_link_libraries(rnoh_app PUBLIC rnoh rnoh_rn_op_sqlite rnoh_mmkv_storage)
