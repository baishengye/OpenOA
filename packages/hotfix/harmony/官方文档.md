
> 模板版本：v0.2.2

<p align="center">
  <h1 align="center"> <code>react-native-code-push</code> </h1>
</p>
<p align="center">
    <a href="https://github.com/microsoft/react-native-code-push">
        <img src="https://img.shields.io/badge/platforms-android%20|%20ios%20|%20windows%20|%20harmony%20-lightgrey.svg" alt="Supported platforms" />
    </a>
    <a href="https://github.com/microsoft/react-native-code-push/blob/master/LICENSE.md">
        <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
        <!-- <img src="https://img.shields.io/badge/license-Apache-blue.svg" alt="License" /> -->
    </a>
</p>

> [!TIP] [Github 地址](https://github.com/react-native-oh-library/react-native-code-push)

该第三方库的仓库已迁移至 Gitcode，且支持直接从 npm 下载，新的包名为：`@react-native-ohos/react-native-code-push`，具体版本所属关系如下：

| Version                        | Package Name       | Repository          |  Release            |Supported RN Version  |
| ------------------------------ | ----------------   | ------------------- | ------------------- | -------------------- |
| <= 8.2.2-0.0.10@deprecated  |@react-native-oh-tpl/react-native-code-push|[Github](https://github.com/react-native-oh-library/react-native-code-push/releases) | [Github Releases](https://github.com/react-native-oh-library/react-native-code-push/releases) | 0.72       |
| 8.2.3             | @react-native-ohos/react-native-code-push|[GitCode](https://gitcode.com/openharmony-sig/rntpc_react-native-code-push) | [GitCode Releases](https://gitcode.com/openharmony-sig/rntpc_react-native-code-push/releases)   | 0.72       |
| 9.0.2             | @react-native-ohos/react-native-code-push|[GitCode](https://gitcode.com/openharmony-sig/rntpc_react-native-code-push) | [GitCode Releases](https://gitcode.com/openharmony-sig/rntpc_react-native-code-push/releases)   | 0.77       |

## 前期准备

### code-push-cli

1. 克隆 [code-push-cli](https://github.com/react-native-oh-library/code-push-cli) 到本地
2. 在 code-push-cli 目录下执行 `npm install`
3. 在 code-push-cli 目录下执行 `npm run start`，用于生成 `bin` 目录
4. npm install -g <code-push-cli文件夹目录>
5. 重开一个终端，执行 `code-push -v`，如正常输出版本号即安装成功

code-push-cli常用命令：

```
code-push -v
code-push login <服务器地址>
code-push app list //列出账号下面的所有app
code-push app add <apppname> harmony react-native //创建应用
code-push release <AppName> <bundle.harmony.js> "<版本号>" --description "<v1.0.0 测试更新>" -m //发包命令，加-m是强制更新, * 代表所有版本，例如：code-push release CodePush_Local ./bundle.harmony.js "*" --description "v1.0.0 测试更新"
```
```
在工程目录下执行如下

code-push login <服务器地址> //前提为先启动服务器（公网）
会拉起网页 输入账户和密码 账户默认为admin 密码123456
点击获取token
复制token到命令行窗口
提示登录成功

# 确保 bundle 文件有微小修改
echo "// Force update for 1.0.0 pending fix - $(date)" >> ./bundles/bundle.harmony.js

"// Force update for 1.0.0 pending fix - $(date)"修改这里的字符即可

# 发布针对 1.0.0 的强制更新
code-push release MyApp-Harmony ./bundles/bundle.harmony.js 1.0.0 -d Staging --description "强制解决问题" --mandatory

# 发布针对 1.0.0 的非强制更新
code-push release MyApp-Harmony ./bundles/bundle.harmony.js 1.0.0 -d Staging --description "非强制解决问题"

```

### code-push-server

#### 推荐在服务器搭建

1. 克隆 [code-push-server](https://github.com/react-native-oh-library/code-push-server) 到本地
2. 在 code-push-server 目录下执行 `npm install`
4. 安装 mysql、redis
5. 修改 `code-push-server/src/core/config.ts` 配置文件
3. 在 code-push-server 目录下执行 `npm run dev`，用于生成 `bin` 目录
6. 在 code-push-server 目录下执行 `npm run start` 启动服务

```
安装mysql
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
# 启动服务
sudo systemctl start mysql
sudo mysql_secure_installation
# 按照提示设置：
# 1. 设置 root 密码
# 2. 移除匿名用户
# 3. 禁止远程 root 登录
# 4. 移除测试数据库
# 5. 重新加载权限表
先全部输入y/yes

# 先登录MySQL（不需要密码）
sudo mysql
# 在MySQL命令行中执行：
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '你的强密码';
FLUSH PRIVILEGES;
EXIT;

# 现在需要用密码登录
mysql -u root -p
输入密码
EXIT;

# 编辑配置文件
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# 找到 bind-address 并修改
# bind-address = 0.0.0.0  
# 允许所有IP访问
# Ctrl+S 保存并自动退出
# 重启 MySQL

sudo systemctl restart mysql

安装redis
sudo apt update
sudo apt install redis-server -y

# 启动并启用服务
sudo systemctl start redis-server
# 测试
redis-cli ping 
回复PONG
# 编辑Redis配置文件
sudo nano /etc/redis/redis.conf

# 找到并修改以下行：
# bind 0.0.0.0  # 如果需要远程访问
# protected-mode no  # 如果设置bind 0.0.0.0，需要关闭保护模式
# Ctrl+S 保存并自动退出
# 重启Redis
sudo systemctl restart redis-server
```

```
修改文档部分
code-push-server目录 code-push-server/src/core/config.ts  <127.0.0.1>  改为服务器地址

code-push-server/src/db.ts 例如 .example(
        '$0 init --dbname codepush --dbhost localhost（替换为服务器地址） --dbuser root --dbpassword <password>（替换为数据库密码） --dbport 3306 --force',
        '初始化code-push-server数据库',
    )
在该文件中出现 localhost 字符 统一修改为服务器地址

创建bin目录（可能会提示数据库codepush未创建）
npm run dev （提示没有数据库codepush）Ctrl+C 强制退出
执行
npm run init  成功返回 success 创建数据库codepush
执行
npm run dev
```

## 安装与使用

对于未发布到npm的旧版本，请参考[安装指南](/zh-cn/tgz-usage.md)安装tgz包。

进入到工程目录并输入以下命令：

<!-- tabs:start -->

#### **npm**

```bash
npm install @react-native-ohos/react-native-code-push
```

#### **yarn**

```bash
yarn add @react-native-ohos/react-native-code-push
```

<!-- tabs:end -->

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

```js

import React, {Component} from 'react'
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import CodePush from 'react-native-code-push';
class App extends Component<any,any>{
    constructor(props:any) {
        super(props);
        this.state={
            syncMessage:'',
            progress:{}
        }
    }
    componentDidMount() {
        console.log('开始检查更新')
        this.syncImmediate(); //开始检查更新
    }
    syncImmediate() {
        CodePush.sync(
            {
                updateDialog: {
                    appendReleaseDescription: true, //是否显示更新description，默认为false
                    descriptionPrefix: '更新内容：', //更新说明的前缀。 默认是” Description:
                    mandatoryContinueButtonLabel: '立即更新', //强制更新的按钮文字，默认为continue
                    mandatoryUpdateMessage: '', //- 强制更新时，更新通知. Defaults to “An update is available that must be installed.”.
                    optionalIgnoreButtonLabel: '稍后', //非强制更新时，取消按钮文字,默认是ignore
                    optionalInstallButtonLabel: '后台更新', //非强制更新时，确认文字. Defaults to “Install”
                    optionalUpdateMessage: '有新版本了，是否更新？', //非强制更新时，更新通知. Defaults to “An update is available. Would you like to install it?”.
                    title: '更新提示', //要显示的更新通知的标题. Defaults to “Update available”.
                },
            },
            this.codePushStatusDidChange.bind(this),
            this.codePushDownloadDidProgress.bind(this),
        );
    }

    codePushStatusDidChange(syncStatus:string|number) {
        switch (syncStatus) {
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                this.setState({syncMessage: 'Checking for update.'});
                break;
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                this.setState({syncMessage: 'Downloading package.',progressModalVisible:true});
                break;
            case CodePush.SyncStatus.AWAITING_USER_ACTION:
                this.setState({syncMessage: 'Awaiting user action.'});
                break;
            case CodePush.SyncStatus.INSTALLING_UPDATE:
                this.setState({syncMessage: 'Installing update.',progressModalVisible:true});
                break;
            case CodePush.SyncStatus.UP_TO_DATE:
                this.setState({syncMessage: 'App up to date.', progress: false});
                break;
            case CodePush.SyncStatus.UPDATE_IGNORED:
                this.setState({syncMessage: 'Update cancelled by user.', progress: false,});
                break;
            case CodePush.SyncStatus.UPDATE_INSTALLED:
                this.setState({syncMessage: 'Update installed and will be applied on restart.', progress: false,});
                break;
            case CodePush.SyncStatus.UNKNOWN_ERROR:
                this.setState({syncMessage: 'An unknown error occurred.', progress: false,});
                break;
        }
    }

    codePushDownloadDidProgress(progress:any) {
        this.setState({progress});
    }

    render(){
        return(
            <View style={styles.container}>
                <Text style={styles.welcome}>欢迎使用热更新--test!</Text>
                <Text>SyncStatus: { this.state.syncMessage}</Text>
                <Text>{this.state.progressModalVisible.toString()}</Text>
                <TouchableOpacity onPress={this.syncImmediate.bind(this)}>
                    <Text style={styles.syncButton}>Press for dialog-driven sync</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        paddingTop: 10,
    },
    welcome:{
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    syncButton: {
        color: 'green',
        fontSize: 17,
    },
})

let codePushOptions = {checkFrequency: CodePush.CheckFrequency.MANUAL};


export default CodePush(codePushOptions)(App);

```

## 使用 Codegen

本库已经适配了 `Codegen` ，在使用前需要主动执行生成三方库桥接代码，详细请参考[ Codegen 使用文档](/zh-cn/codegen.md)。

## Link

|                                      | 是否支持autolink | RN框架版本 |
|--------------------------------------|-----------------|------------|
| ~9.0.2                              |  No              |  0.77     |
| ~8.2.3                              |  Yes             |  0.72     |
| <= 8.2.2-0.0.10@deprecated            |  No              |  0.72     |

使用AutoLink的工程需要根据该文档配置，Autolink框架指导文档：https://gitcode.com/openharmony-sig/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

如您使用的版本支持 Autolink，并且工程已接入 Autolink，可跳过ManualLink配置。
<details>
  <summary>ManualLink: 此步骤为手动配置原生依赖项的指导</summary>

首先需要使用 DevEco Studio 打开项目里的 HarmonyOS 工程 `harmony`

### 1.在工程根目录的 `oh-package.json5` 添加 overrides 字段

```json
{
  ...
  "overrides": {
    "@rnoh/react-native-openharmony" : "./react_native_openharmony"
  }
}
```

### 2.引入原生端代码

目前有两种方法：

1. 通过 har 包引入（在 IDE 完善相关功能后该方法会被遗弃，目前首选此方法）；
2. 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开 `entry/oh-package.json5`，添加以下依赖

```json
"dependencies": {
    "@rnoh/react-native-openharmony": "file:../react_native_openharmony",
    "@react-native-ohos/react-native-code-push": "file:../../node_modules/@react-native-ohos/react-native-code-push/harmony/codePush.har"
  }
```

点击右上角的 `sync` 按钮

或者在终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](/zh-cn/link-source-code.md)

### 3.在 ArkTs 侧引入 CodePushPackage

打开 `entry/src/main/ets/RNPackagesFactory.ts`，添加：

```diff
  ...
+ import { CodePushPackage } from "@react-native-ohos/react-native-code-push/ts";

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new SamplePackage(ctx),
+   new CodePushPackage(ctx)
  ];
}
```
### 4.配置 CMakeLists 和引入 CodePushPackage

> 若使用的是 <= 8.2.2-0.0.10 版本，请跳过本章。

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(CMAKE_CXX_FLAGS "-fstack-protector-strong -Wl,-z,relro,-z,now,-z,noexecstack -s -fPIE -pie")
set(WITH_HITRACE_SYSTRACE 1) # for other CMakeLists.txt files to use
add_compile_definitions(WITH_HITRACE_SYSTRACE)

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: manual_package_linking_1
add_subdirectory("../../../../sample_package/src/main/cpp" ./sample-package)
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-code-push/src/main/cpp" ./codePush)

# RNOH_END: manual_package_linking_1

file(GLOB GENERATED_CPP_FILES "./generated/*.cpp")

add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: manual_package_linking_2
target_link_libraries(rnoh_app PUBLIC rnoh_sample_package)
+ target_link_libraries(rnoh_app PUBLIC rnoh_code_push)
# RNOH_END: manual_package_linking_2
```
打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"
#include "SamplePackage.h"
+ #include "CodePushPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
      std::make_shared<RNOHGeneratedPackage>(ctx),
      std::make_shared<SamplePackage>(ctx),
+     std::make_shared<CodePushPackage>(ctx)
    };
}
```
### 5.在 ArkTs 侧引入 comparingVersion 方法

打开 `entry/src/main/ets/pages/index.ets`，调用 comparingVersion 方法比对code-push版本号，用于覆盖安装时清除沙箱历史资源

```diff
+ import { comparingVersion } from "@react-native-ohos/react-native-code-push";

@Entry
@Component
struct Index {
  
  aboutToAppear() {
+     comparingVersion(context);
  }
}
```
</details>

## 运行

点击右上角的 `sync` 按钮

或者在终端执行：

```bash
cd entry
ohpm install
```

修改`entry\src\main\ets\pages\Index.ets`文件

```diff
...
+ import common from '@ohos.app.ability.common';
+ import BuildProfile from 'BuildProfile';
+ let context = getContext(this) as common.UIAbilityContext;
+ interface CodePushConfig{
+  Staging:String;
+  Production:String;
+  ServerUrl:String;
+  PublicKey:String;
+ }
struct Index {
  @StorageLink('RNOHCoreContext') private rnohCoreContext: RNOHCoreContext | undefined = undefined
  @State shouldShow: boolean = false
  private logger!: RNOHLogger
+ bundlePath:string = 'bundle.harmony.js'
aboutToAppear() {
     ...
+   this.setCodeConfig()
    this.shouldShow = true
    stopTracing()
  }
+ setCodeConfig(){
+    const CodePushConfig: CodePushConfig = {
+      Staging:BuildProfile.Staging,
+      Production:BuildProfile.Production,
+      ServerUrl:BuildProfile.ServerUrl,
+      PublicKey:BuildProfile.PublicKey
+    }
+    AppStorage.SetOrCreate('CodePushConfig',CodePushConfig)
+  }
build() {
   Column() {
    ...
    RNApp({
    jsBundleProvider:new TraceJSBundleProviderDecorator(
            new AnyJSBundleProvider([
              new MetroJSBundleProvider(),
              // NOTE: to load the bundle from file, place it in
              // `/data/app/el2/100/base/com.rnoh.tester/files/bundle.harmony.js`
              // on your device. The path mismatch is due to app sandboxing on HarmonyOS
+              new FileJSBundleProvider(context.filesDir + '/Bundles/' + this.bundlePath),
              new FileJSBundleProvider('/data/storage/el2/base/files/bundle.harmony.js'),
              new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'hermes_bundle.hbc'),
              new ResourceJSBundleProvider(this.rnohCoreContext.uiAbilityContext.resourceManager, 'bundle.harmony.js')
            ]),
            this.rnohCoreContext.logger),
    })

   }

}
```

打开`entry/build-profile.json5`，添加配置

```diff
{
  "apiType": 'stageMode',
  "buildOption": {
    "externalNativeOptions": {
      "path": "./src/main/cpp/CMakeLists.txt",
      "arguments": "",
      "cppFlags": "-s",
    },
+    "arkOptions": {
+      "buildProfileFields": {
+        "Staging": "", //测试环境Key
+        "Production": "",//生产环境Key
+        "ServerUrl": "",//服务端地址
+        "PublicKey": "PublicKey"
      }
    }
  },
  "targets": [
    {
      "name": "default",
      "runtimeOS": "HarmonyOS"
    },
    {
      "name": "ohosTest",
    }
  ]
}
```

然后编译、运行即可。

## 约束与限制

### 兼容性

要使用此库，需要使用正确的 React-Native 和 RNOH 版本。另外，还需要使用配套的 DevEco Studio 和 手机 ROM。

在以下版本验证通过：

1. RNOH: 0.72.96; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;
2. RNOH: 0.72.33; SDK: HarmonyOS NEXT B1; IDE: DevEco Studio: 5.0.3.900; ROM: Next.0.0.71;
3. RNOH: 0.77.18; SDK: HarmonyOS 6.0.0 Release SDK; IDE: DevEco Studio 6.0.0.858; ROM: 6.0.0.112;

## API

| Name              | Description                                                                                                                  | Type     | Required | Platform                                | HarmonyOS Support |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | --------------------------------------- | ----------------- |
| sync              | sync方法，自动模式更新                                                                                                                | function | yes      | Android IOS | yes               |
| getUpdateMetadata | 获取当前已安装更新的元数据(RemotePackage),当使用sync方法时，不需要调用本方法，因为sync会自动调用                                                                 | function | no       | Android iOS                             | yes               |
| restartApp        | 重启App，当使用sync方法时，不需要调用本方法，因为sync会自动调用                                                                                        | function | no       | Android iOS                             | yes               |
| getCurrentPackage | 获取应用版本信息，当使用sync方法时，不需要调用本方法，因为sync会自动调用                                                                                     | function | no       | Android iOS                             | yes               |
| getConfiguration  | 获取应用配置信息，appVersion（版本号），deploymentKey（deploymentKey），serverUrl（服务器地址），clientUniqueId（唯一标识码）,当使用sync方法时，不需要调用本方法，因为sync会自动调用 | function | no       | Android iOS                             | yes               |

**updateDialog**

当使用**CodePush.updateDialog**方法时，updateDialog以下参数都是可选的，代表更新的对话框，默认是null, 

| Name                         | Description                                                                      | Type    | Required | Platform    | HarmonyOS Support |
| ---------------------------- | -------------------------------------------------------------------------------- | ------- | -------- | ----------- | ----------------- |
| appendReleaseDescription     | 是否显示更新description，默认为false                                                       | boolean | no       | Android iOS | yes               |
| descriptionPrefix            | 更新说明的前缀。 默认是” Description:                                                       | string  | no       | Android iOS | yes               |
| mandatoryContinueButtonLabel | 强制更新的按钮文字，默认为continue                                                            | string  | no       | Android iOS | yes               |
| mandatoryUpdateMessage       | 强制更新时，更新通知. Defaults to “An update is available that must be installed.”         | string  | no       | Android iOS | yes               |
| optionalIgnoreButtonLabel    | updateDialog非强制更新时，取消按钮文字,默认是ignore                                              | string  | no       | Android iOS | yes               |
| optionalInstallButtonLabel   | 非强制更新时，确认文字. Defaults to “Install”                                               | string  | no       | Android iOS | yes               |
| optionalUpdateMessage        | 非强制更新时，更新通知. Defaults to “An update is available. Would you like to install it?” | string  | no       | Android iOS | yes               |
| title                        | 要显示的更新通知的标题. Defaults to “Update available”.                                     | string  | no       | Android iOS | yes               |

**SyncStatus**

当使用**CodePush.SyncStatus**时，codePushStatusDidChange回调函数中获取应用状态

| Name                 | Description                                                         | Type   | Required | Platform    | HarmonyOS Support |
| -------------------- | ------------------------------------------------------------------- | ------ | -------- | ----------- | ----------------- |
| UP_TO_DATE           | 值为0，代表应用程序已完全更新到配置的部署,                                              | number | no       | Android iOS | yes               |
| UPDATE_INSTALLED     | 值为1，已安装可用更新，并将在syncStatusChangedCallback函数返回后立即运行或在下次应用程序恢复/重新启动时运行 | number | no       | Android iOS | yes               |
| UNKNOWN_ERROR        | 值为3，同步操作发现未知错误                                                      | number | no       | Android iOS | yes               |
| CHECKING_FOR_UPDATE  | 值为5，正在查询 CodePush 服务器是否有更新                                          | number | no       | Android iOS | yes               |
| AWAITING_USER_ACTION | 值为6，有更新可用，并向最终用户显示确认对话框。（仅在updateDialog使用时适用）                       | number | no       | Android iOS | yes               |
| DOWNLOADING_PACKAGE  | 值为7，在从 CodePush 服务器下载可用更新                                           | number | no       | Android iOS | yes               |
| INSTALLING_UPDATE    | 值为8，已下载可用更新并将安装                                                     | number | no       | Android iOS | yes               |

**installMode**

当使用**CodePush.InstallMode**时，installMode 以下参数都是可选的

| Name            | Description        | Type   | Required | Platform    | HarmonyOS Support |
| --------------- | ------------------ | ------ | -------- | ----------- | ----------------- |
| IMMEDIATE       | 直接更新           | number | no       | Android iOS | yes               |
| ON_NEXT_RESTART | 下次启动更新       | number | no       | Android iOS | yes               |
| ON_NEXT_RESUME  | 切换到前台启动更新 | number | no       | Android iOS | yes               |
| ON_NEXT_SUSPEND | 切换到后台启动更新 | number | no       | Android iOS | yes               |

**checkFrequency**

当使用**CodePush.CheckFrequency**时，checkFrequency 以下参数都是可选的

| Name          | Description | Type   | Required | Platform    | HarmonyOS Support |
| ------------- | ----------- | ------ | -------- | ----------- | ----------------- |
| ON_APP_START  | 自动更新    | number | no       | Android iOS | yes               |
| ON_APP_RESUME | 自动更新    | number | no       | Android iOS | yes               |
| MANUAL        | 手动更新    | number | no       | Android iOS | yes               |

## 遗留问题

## 其他

## 开源协议

本项目基于 [The MIT License (MIT)](https://github.com/microsoft/react-native-code-push/blob/master/LICENSE.md) ，请自由地享受和参与开源。
