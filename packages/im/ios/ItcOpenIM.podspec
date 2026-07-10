require "json"

package = JSON.parse(File.read(File.join(__dir__, "..", "package.json")))

Pod::Spec.new do |s|
  s.name         = "ItcOpenIM"
  s.version      = package["version"] || "0.0.1"
  s.summary      = "OpenIM SDK TurboModule for React Native"
  s.description  = <<-DESC
    基于 React Native 0.82 New Architecture 的 OpenIM SDK TurboModule 原生模块。
    提供即时通讯功能（登录、消息、会话、群组、好友等）的原生桥接。
  DESC
  s.homepage     = "https://github.com/openim"
  s.license      = { :type => "MIT", :file => "LICENSE" }
  s.authors      = "OpenIM"
  s.platforms    = { :ios => "15.1" }
  s.source       = { :path => "." }

  s.source_files = "**/*.{h,m,mm}"

  # OpenIM SDK Core iOS
  s.dependency "OpenIMSDK"

  # React-Core dependency for callback proxies that import React headers
  s.dependency "React-Core"

  # Enable modules for @import support in OpenIMCore framework
  s.pod_target_xcconfig = {
    'CLANG_ENABLE_MODULES' => 'YES',
    'CLANG_ENABLE_OBJC_ARC' => 'YES',
    'DEFINES_MODULE' => 'YES'
  }

  # Apply to user targets as well for XCFramework header compilation
  s.user_target_xcconfig = {
    'CLANG_ENABLE_MODULES' => 'YES',
    'DEFINES_MODULE' => 'YES'
  }

  # 使用 react_native_pods 提供的 helper，自动设置 TurboModule 所需的依赖
  install_modules_dependencies(s)
end
