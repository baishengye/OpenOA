package com.itc.storage

import com.facebook.react.bridge.ReactApplicationContext
import com.tencent.mmkv.MMKV

/**
 * KV 存储 TurboModule（New Architecture）。底层 MMKV，全部同步。
 * 继承 codegen 生成的抽象类 NativeItcStorageSpec。
 */
class ItcStorageModule(reactContext: ReactApplicationContext) :
  NativeItcStorageSpec(reactContext) {

  private val kv: MMKV by lazy {
    MMKV.initialize(reactContext.applicationContext)
    MMKV.mmkvWithID("itc-storage")
  }

  override fun getName(): String = NAME

  override fun setString(key: String, value: String) {
    kv.encode(key, value)
  }

  override fun getString(key: String): String {
    return kv.decodeString(key, "") ?: ""
  }

  override fun setBoolean(key: String, value: Boolean) {
    kv.encode(key, value)
  }

  override fun getBoolean(key: String): Boolean {
    return kv.decodeBool(key, false)
  }

  override fun contains(key: String): Boolean {
    return kv.containsKey(key)
  }

  override fun remove(key: String) {
    kv.removeValueForKey(key)
  }

  override fun clearAll() {
    kv.clearAll()
  }

  companion object {
    const val NAME = "ItcStorage"
  }
}
