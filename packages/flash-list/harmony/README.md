# @itc/flash-list HarmonyOS 配置

本目录为 `@itc/flash-list` 包的 HarmonyOS 适配层。

## 版本信息

- **包版本**: ~2.1.1
- **支持 RN 版本**: 0.82.*
- **编译 API 版本**: API12+
- **Autolink**: 否（需手动配置）

## 依赖配置

由于 v2.1.1 版本不支持 Autolink，需要在 `apps/oa/harmony/entry/oh-package.json5` 中添加依赖：

```json
{
  "dependencies": {
    "@react-native-ohos/flash-list": "file:../../node_modules/@react-native-ohos/flash-list/harmony/flash_list.har"
  }
}
```

## 版本差异说明

| 功能 | v2.1.1 状态 | 说明 |
|------|-------------|------|
| Autolink | ❌ 不支持 | 需手动添加依赖 |
| 原生 C++ 代码 | ❌ 不涉及 | 直接使用 har 包 |
| CMakeLists 配置 | ❌ 不涉及 | 无需配置 |
| PackageProvider | ❌ 不涉及 | 无需注册 |

## 相关文档

- [@react-native-ohos/flash-list GitCode](https://gitcode.com/openharmony-sig/rntpc_flash-list)
- [安装指南](https://gitcode.com/openharmony-sig/ohos_react_native/blob/master/docs/zh-cn/tgz-usage.md)
