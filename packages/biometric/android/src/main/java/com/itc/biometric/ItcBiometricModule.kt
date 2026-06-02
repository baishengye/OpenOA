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

  // ---- 能力探测 ----------------------------------------------------------

  override fun isAvailable(promise: Promise) {
    val manager = BiometricManager.from(ctx)
    val result = Arguments.createMap()
    when (manager.canAuthenticate(AUTHENTICATORS)) {
      BiometricManager.BIOMETRIC_SUCCESS -> {
        result.putBoolean("available", true)
        result.putString("biometryType", guessBiometryType())
        result.putString("errorCode", "")
      }
      BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE,
      BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> {
        result.putBoolean("available", false)
        result.putString("biometryType", "none")
        result.putString("errorCode", "BIOMETRY_NO_HARDWARE")
      }
      BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
        result.putBoolean("available", false)
        result.putString("biometryType", guessBiometryType())
        result.putString("errorCode", "BIOMETRY_NOT_ENROLLED")
      }
      else -> {
        result.putBoolean("available", false)
        result.putString("biometryType", "none")
        result.putString("errorCode", "UNSUPPORTED")
      }
    }
    promise.resolve(result)
  }

  /** Android 无法精确区分指纹/人脸，统一上报 fingerprint（多数设备语义），face 由设备能力决定。 */
  private fun guessBiometryType(): String {
    val pm = ctx.packageManager
    val hasFace =
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
        pm.hasSystemFeature(android.content.pm.PackageManager.FEATURE_FACE)
    val hasFinger =
      pm.hasSystemFeature(android.content.pm.PackageManager.FEATURE_FINGERPRINT)
    return when {
      hasFinger -> "fingerprint"
      hasFace -> "face"
      else -> "none"
    }
  }

  // ---- 认证 --------------------------------------------------------------

  override fun authenticate(
    title: String,
    subtitle: String,
    reason: String,
    cancelLabel: String,
    allowDeviceCredential: Boolean,
    allowWeak: Boolean,
    promise: Promise
  ) {
    val activity = requireActivity(promise) ?: return

    // 基础认证：默认仅强生物识别；allowWeak 时叠加弱生物识别（Class 2，如摄像头人脸）。
    // 注意：密钥签名(signWithKey)不走这里，始终用强生物识别。
    val bioAuthenticators =
      if (allowWeak)
        BiometricManager.Authenticators.BIOMETRIC_STRONG or
          BiometricManager.Authenticators.BIOMETRIC_WEAK
      else
        AUTHENTICATORS

    activity.runOnUiThread {
      val promptInfoBuilder = BiometricPrompt.PromptInfo.Builder()
        .setTitle(title.ifBlank { "身份验证" })
      if (subtitle.isNotBlank()) promptInfoBuilder.setSubtitle(subtitle)
      if (allowDeviceCredential) {
        // 设备凭据不能与弱生物识别叠加，这里用强生物识别 + 设备凭据
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
            val map = Arguments.createMap().apply { putBoolean("success", true) }
            promise.resolve(map)
          }

          override fun onAuthenticationError(code: Int, msg: CharSequence) {
            promise.reject(mapErrorCode(code), msg.toString())
          }
        }
      )
      prompt.authenticate(promptInfoBuilder.build())
    }
  }

  private fun mapErrorCode(code: Int): String = when (code) {
    BiometricPrompt.ERROR_USER_CANCELED,
    BiometricPrompt.ERROR_NEGATIVE_BUTTON,
    BiometricPrompt.ERROR_CANCELED -> "USER_CANCELED"
    BiometricPrompt.ERROR_LOCKOUT,
    BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> "BIOMETRY_LOCKOUT"
    BiometricPrompt.ERROR_NO_BIOMETRICS -> "BIOMETRY_NOT_ENROLLED"
    BiometricPrompt.ERROR_HW_NOT_PRESENT,
    BiometricPrompt.ERROR_HW_UNAVAILABLE -> "BIOMETRY_NO_HARDWARE"
    else -> "BIOMETRY_AUTH_FAILED"
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
