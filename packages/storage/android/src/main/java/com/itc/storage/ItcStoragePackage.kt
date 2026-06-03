package com.itc.storage

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class ItcStoragePackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == ItcStorageModule.NAME) ItcStorageModule(reactContext) else null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      ItcStorageModule.NAME to ReactModuleInfo(
        ItcStorageModule.NAME, ItcStorageModule.NAME,
        false, false, false, true
      )
    )
  }
}
