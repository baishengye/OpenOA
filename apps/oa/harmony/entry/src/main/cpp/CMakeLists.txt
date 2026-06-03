project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(OH_MODULE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${OH_MODULE_DIR}/@rnoh/react-native-openharmony/src/main/cpp")

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# codegen-harmony v1 产物（app 级）：storage / biometric 的 C++ 均已迁到各自库里，此处现为空壳。
file(GLOB GENERATED_CPP_FILES "${CMAKE_CURRENT_SOURCE_DIR}/generated/*.cpp")

# @itc/* 库自带的 C++（codegen-lib-harmony 产物：BaseXxxPackage + Xxx 桥）。
# 把各库的 cpp 目录作为 include 根并参与编译，模块的 C++ 完全由依赖模块提供，app 不再生成。
# 路径：从本 cpp 目录上溯 7 级到仓库根，再进 packages/<mod>/...。各模块均为纯 TurboModule，
# 只编 turbo_modules 桥（react/renderer/components 脚手架是空壳，不编以免无谓风险）。
set(STORAGE_LIB_CPP "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../../packages/storage/harmony/storage/src/main/cpp")
set(BIOMETRIC_LIB_CPP "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../../packages/biometric/harmony/biometric/src/main/cpp")
file(GLOB STORAGE_LIB_CPP_FILES "${STORAGE_LIB_CPP}/RNOH/generated/turbo_modules/*.cpp")
file(GLOB BIOMETRIC_LIB_CPP_FILES "${BIOMETRIC_LIB_CPP}/RNOH/generated/turbo_modules/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    ${STORAGE_LIB_CPP_FILES}
    ${BIOMETRIC_LIB_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)

target_include_directories(rnoh_app PUBLIC "${STORAGE_LIB_CPP}" "${BIOMETRIC_LIB_CPP}")
target_link_libraries(rnoh_app PUBLIC rnoh)
