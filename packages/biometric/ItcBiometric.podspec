require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ItcBiometric"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://example.com/opendingding"
  s.license      = "UNLICENSED"
  s.authors      = "ITC"
  s.platforms    = { :ios => "13.4" }
  s.source       = { :git => "", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.frameworks   = "LocalAuthentication", "Security"

  # 接入 New Architecture / codegen（install_modules_dependencies 由 react_native_pods 提供）
  install_modules_dependencies(s)
end
