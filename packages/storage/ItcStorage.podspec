require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ItcStorage"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://example.com/opendingding"
  s.license      = "UNLICENSED"
  s.authors      = "ITC"
  s.platforms    = { :ios => "15.1" }
  s.source       = { :git => "", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.dependency "MMKV", "~> 1.3.9"

  install_modules_dependencies(s)
end
