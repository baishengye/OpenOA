package com.itc.biometric

import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyInfo
import android.security.keystore.KeyProperties
import android.util.Base64
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.Signature
import java.util.concurrent.Executor

/**
 * 生物识别 TurboModule（New Architecture）。
 * 继承 codegen 生成的抽象类 NativeItcBiometricSpec（由 src/NativeItcBiometric.ts 生成）。
 *
 * - 认证：AndroidX BiometricPrompt
 * - 密钥：Android Keystore，EC P-256，setUserAuthenticationRequired(true) 绑定生物识别
 */
class ItcBiometricModule(reactContext: ReactApplicationContext) :
  NativeItcBiometricSpec(reactContext) {

  private val ctx = reactContext

  override fun getName(): String = NAME

  companion object {
    const val NAME = "ItcBiometric"
    private const val KEYSTORE = "AndroidKeyStore"
    private val AUTHENTICATORS = BiometricManager.Authenticators.BIOMETRIC_STRONG
  }

  private fun mainExecutor(): Executor =
    androidx.core.content.ContextCompat.getMainExecutor(ctx)

  private fun requireActivity(promise: Promise): FragmentActivity? {
    val activity = currentActivity as? FragmentActivity
    if (activity == null) {
      promise.reject("NATIVE_MODULE_UNAVAILABLE", "当前无可用的 FragmentActivity")
    }
    return activity
  }

  // ---- 能力枚举 ----------------------------------------------------------

  /**
   * Android 限制：可逐模态查"硬件是否存在"（PackageManager.FEATURE_*），但
   * BiometricManager 只能给"强/弱聚合"的可用性，无法逐模态判定"是否已录入/可用"，
   * 也无法定向到指定模态。因此 available/enrolled/strength 为聚合 best-effort，directable=false。
   */
  override fun getCapabilities(promise: Promise) {
    val mgr = BiometricManager.from(ctx)
    val strongStatus = mgr.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)
    val weakStatus = mgr.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
    val strongOk = strongStatus == BiometricManager.BIOMETRIC_SUCCESS
    val weakOk = weakStatus == BiometricManager.BIOMETRIC_SUCCESS
    val available = strongOk || weakOk
    val strength = if (strongOk) "strong" else if (weakOk) "weak" else "none"
    val noneEnrolled =
      strongStatus == BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ||
        weakStatus == BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED
    val aggReason = if (available) "" else if (noneEnrolled) "not_enrolled" else "not_supported"

    val pm = ctx.packageManager
    val items = Arguments.createArray()
    var mask = 0

    fun addModality(kind: String, hasHardware: Boolean, bit: Int) {
      val item = Arguments.createMap()
      item.putString("kind", kind)
      item.putBoolean("hardware", hasHardware)
      item.putBoolean("directable", false)
      if (hasHardware) {
        item.putBoolean("enrolled", available)
        item.putBoolean("available", available)
        item.putString("strength", strength)
        item.putString("reason", aggReason)
        if (available) mask = mask or bit
      } else {
        item.putBoolean("enrolled", false)
        item.putBoolean("available", false)
        item.putString("strength", "none")
        item.putString("reason", "not_supported")
      }
      items.pushMap(item)
    }

    val q = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
    addModality(
      "fingerprint",
      pm.hasSystemFeature(android.content.pm.PackageManager.FEATURE_FINGERPRINT),
      1
    )
    addModality(
      "face",
      q && pm.hasSystemFeature(android.content.pm.PackageManager.FEATURE_FACE),
      2
    )
    addModality(
      "iris",
      q && pm.hasSystemFeature(android.content.pm.PackageManager.FEATURE_IRIS),
      4
    )

    val result = Arguments.createMap()
    result.putInt("mask", mask)
    result.putArray("items", items)
    promise.resolve(result)
  }

  // ---- 认证 --------------------------------------------------------------

  /** 按强度认证（系统选模态）。结果类语义：失败也 resolve({success=false, reason})，不 reject。 */
  override fun authenticate(
    title: String,
    subtitle: String,
    reason: String,
    cancelLabel: String,
    allowDeviceCredential: Boolean,
    strength: String,
    promise: Promise
  ) {
    val activity = requireActivity(promise) ?: return

    // strength=weak 叠加弱生物识别（Class 2，如摄像头人脸）；默认仅强。
    val bioAuthenticators =
      if (strength == "weak")
        BiometricManager.Authenticators.BIOMETRIC_STRONG or
          BiometricManager.Authenticators.BIOMETRIC_WEAK
      else
        AUTHENTICATORS

    activity.runOnUiThread {
      val promptInfoBuilder = BiometricPrompt.PromptInfo.Builder()
        .setTitle(title.ifBlank { "身份验证" })
      if (subtitle.isNotBlank()) promptInfoBuilder.setSubtitle(subtitle)
      if (allowDeviceCredential) {
        promptInfoBuilder.setAllowedAuthenticators(
          AUTHENTICATORS or BiometricManager.Authenticators.DEVICE_CREDENTIAL
        )
      } else {
        promptInfoBuilder.setAllowedAuthenticators(bioAuthenticators)
        promptInfoBuilder.setNegativeButtonText(cancelLabel.ifBlank { "取消" })
      }

      val prompt = BiometricPrompt(
        activity,
        mainExecutor(),
        object : BiometricPrompt.AuthenticationCallback() {
          override fun onAuthenticationSucceeded(r: BiometricPrompt.AuthenticationResult) {
            // Android 不告知实际使用的是指纹还是人脸 → usedKind 未知。
            promise.resolve(authOutcome(true, "unknown", ""))
          }

          override fun onAuthenticationError(code: Int, msg: CharSequence) {
            promise.resolve(authOutcome(false, "", mapErrorCode(code)))
          }
        }
      )
      prompt.authenticate(promptInfoBuilder.build())
    }
  }

  /** Android 无法定向到指定模态（系统按强度选），统一返回 not_directable。 */
  override fun authenticateWith(
    kind: String,
    title: String,
    subtitle: String,
    reason: String,
    cancelLabel: String,
    allowDeviceCredential: Boolean,
    promise: Promise
  ) {
    promise.resolve(authOutcome(false, "", "not_directable"))
  }

  private fun authOutcome(
    success: Boolean,
    usedKind: String,
    reason: String
  ): com.facebook.react.bridge.WritableMap = Arguments.createMap().apply {
    putBoolean("success", success)
    putString("usedKind", usedKind)
    putString("reason", reason)
  }

  /** BiometricPrompt 错误码 → AuthFailReason token（与 JS types.ts 对齐）。 */
  private fun mapErrorCode(code: Int): String = when (code) {
    BiometricPrompt.ERROR_USER_CANCELED,
    BiometricPrompt.ERROR_NEGATIVE_BUTTON,
    BiometricPrompt.ERROR_CANCELED -> "canceled"
    BiometricPrompt.ERROR_LOCKOUT,
    BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> "lockout"
    BiometricPrompt.ERROR_TIMEOUT -> "timeout"
    BiometricPrompt.ERROR_NO_BIOMETRICS -> "not_enrolled"
    BiometricPrompt.ERROR_HW_NOT_PRESENT,
    BiometricPrompt.ERROR_HW_UNAVAILABLE -> "not_supported"
    else -> "failed"
  }

  // ---- 生物绑定密钥 ------------------------------------------------------

  override fun createKey(alias: String, promise: Promise) {
    try {
      val ks = KeyStore.getInstance(KEYSTORE).apply { load(null) }
      if (ks.containsAlias(alias)) {
        // 已存在：校验是否仍有效（重新录入生物特征会使其永久失效）。
        // 有效则复用并返回公钥；已失效则删除后走下面的重建流程。
        if (isKeyValid(ks, alias)) {
          promise.resolve(exportPublicKey(ks, alias))
          return
        }
        ks.deleteEntry(alias)
      }
      val generator = KeyPairGenerator.getInstance(
        KeyProperties.KEY_ALGORITHM_EC, KEYSTORE
      )
      val spec = KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_SIGN)
        .setAlgorithmParameterSpec(java.security.spec.ECGenParameterSpec("secp256r1"))
        .setDigests(KeyProperties.DIGEST_SHA256)
        .setUserAuthenticationRequired(true)
        .apply {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG)
          }
          // 重新录入生物特征后密钥失效，保证安全
          setInvalidatedByBiometricEnrollment(true)
        }
        .build()
      generator.initialize(spec)
      generator.generateKeyPair()
      promise.resolve(exportPublicKey(ks, alias))
    } catch (e: Exception) {
      promise.reject("UNKNOWN", e.message, e)
    }
  }

  /** 密钥是否仍有效（未因重新录入生物特征而失效）。initSign 会对已失效密钥抛异常。 */
  private fun isKeyValid(ks: KeyStore, alias: String): Boolean {
    return try {
      val entry = ks.getEntry(alias, null) as? KeyStore.PrivateKeyEntry ?: return false
      Signature.getInstance("SHA256withECDSA").initSign(entry.privateKey)
      true
    } catch (e: android.security.keystore.KeyPermanentlyInvalidatedException) {
      false
    } catch (e: Exception) {
      false
    }
  }

  private fun exportPublicKey(ks: KeyStore, alias: String): com.facebook.react.bridge.WritableMap {
    val cert = ks.getCertificate(alias)
    val der = cert.publicKey.encoded
    return Arguments.createMap().apply {
      putString("publicKey", Base64.encodeToString(der, Base64.NO_WRAP))
    }
  }

  override fun signWithKey(
    alias: String,
    payloadBase64: String,
    promptTitle: String,
    promise: Promise
  ) {
    val activity = requireActivity(promise) ?: return
    try {
      val ks = KeyStore.getInstance(KEYSTORE).apply { load(null) }
      val entry = ks.getEntry(alias, null) as? KeyStore.PrivateKeyEntry
      if (entry == null) {
        promise.reject("INVALID_ARGUMENT", "密钥不存在: $alias")
        return
      }
      val signature = Signature.getInstance("SHA256withECDSA").apply {
        initSign(entry.privateKey)
      }
      val cryptoObject = BiometricPrompt.CryptoObject(signature)
      val payload = Base64.decode(payloadBase64, Base64.NO_WRAP)

      activity.runOnUiThread {
        val info = BiometricPrompt.PromptInfo.Builder()
          .setTitle(promptTitle)
          .setNegativeButtonText("取消")
          .setAllowedAuthenticators(AUTHENTICATORS)
          .build()
        val prompt = BiometricPrompt(
          activity,
          mainExecutor(),
          object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(r: BiometricPrompt.AuthenticationResult) {
              try {
                val sig = r.cryptoObject!!.signature!!
                sig.update(payload)
                val out = sig.sign()
                promise.resolve(Arguments.createMap().apply {
                  putString("signatureBase64", Base64.encodeToString(out, Base64.NO_WRAP))
                })
              } catch (e: Exception) {
                promise.reject("BIOMETRY_KEY_INVALIDATED", e.message, e)
              }
            }

            override fun onAuthenticationError(code: Int, msg: CharSequence) {
              promise.reject(mapErrorCode(code), msg.toString())
            }
          }
        )
        prompt.authenticate(info, cryptoObject)
      }
    } catch (e: android.security.keystore.KeyPermanentlyInvalidatedException) {
      promise.reject("BIOMETRY_KEY_INVALIDATED", e.message, e)
    } catch (e: Exception) {
      promise.reject("UNKNOWN", e.message, e)
    }
  }

  override fun deleteKey(alias: String, promise: Promise) {
    try {
      val ks = KeyStore.getInstance(KEYSTORE).apply { load(null) }
      if (ks.containsAlias(alias)) ks.deleteEntry(alias)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("UNKNOWN", e.message, e)
    }
  }

  override fun keyExists(alias: String, promise: Promise) {
    try {
      val ks = KeyStore.getInstance(KEYSTORE).apply { load(null) }
      promise.resolve(ks.containsAlias(alias))
    } catch (e: Exception) {
      promise.reject("UNKNOWN", e.message, e)
    }
  }
}
