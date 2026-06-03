project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(OH_MODULE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${OH_MODULE_DIR}/@rnoh/react-native-openharmony/src/main/cpp")

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# codegen-harmony v1 产物：每个 TurboModule 的 C++ 桥（ArkTSTurboModule 子类，
# 把 JSI 调用按方法名转发到 ArkTS 实现）。必须纳入编译，否则 RNOHGeneratedPackage
# 引用的 ItcStorage 等类缺符号、链接失败。
file(GLOB GENERATED_CPP_FILES "${CMAKE_CURRENT_SOURCE_DIR}/generated/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)

target_link_libraries(rnoh_app PUBLIC rnoh)
