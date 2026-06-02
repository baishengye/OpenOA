import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { userAuth } from '@kit.UserAuthenticationKit';
import { huks } from '@kit.UniversalKeystoreKit';
import { cryptoFramework } from '@kit.CryptoArchitectureKit';
import { buffer } from '@kit.ArkTS';
import { BusinessError } from '@kit.BasicServicesKit';

/**
 * 生物识别 TurboModule（鸿蒙 NEXT / RNOH）。
 *
 * - 认证：UserAuthenticationKit（userAuth），支持指纹 + 人脸
 * - 密钥：UniversalKeystoreKit（HUKS），EC P-256，绑定生物识别访问控制
 *
 * 方法签名对应 src/NativeItcBiometric.ts 的 Spec（基本类型入参）。
 * ⚠️ HUKS 生物绑定签名为「挑战值 → userAuth → authToken → finish」三步流程，
 *    需在真机验证 authToken 透传细节（不同 ROM 版本 API 微调）。
 */
export class ItcBiometricTurboModule extends TurboModule {
  static readonly NAME = 'ItcBiometric';

  private static readonly AUTH_TYPES = [
    userAuth.UserAuthType.FINGERPRINT,
    userAuth.UserAuthType.FACE,
  ];

  private fullAlias(alias: string): string {
    return `com.itc.biometric.${alias}`;
  }

  // ---- 能力探测 ----------------------------------------------------------

  isAvailable(): Promise<{ available: boolean; biometryType: string; errorCode: string }> {
    return new Promise((resolve) => {
      let biometryType = 'none';
      let fingerOk = false;
      let faceOk = false;
      try {
        userAuth.getAvailableStatus(
          userAuth.UserAuthType.FINGERPRINT,
          userAuth.AuthTrustLevel.ATL3
        );
        fingerOk = true;
      } catch (_) { /* 不支持指纹 */ }
      try {
        userAuth.getAvailableStatus(
          userAuth.UserAuthType.FACE,
          userAuth.AuthTrustLevel.ATL3
        );
        faceOk = true;
      } catch (_) { /* 不支持人脸 */ }

      if (fingerOk) biometryType = 'fingerprint';
      else if (faceOk) biometryType = 'face';

      if (fingerOk || faceOk) {
        resolve({ available: true, biometryType, errorCode: '' });
      } else {
        resolve({ available: false, biometryType: 'none', errorCode: 'BIOMETRY_NOT_ENROLLED' });
      }
    });
  }

  // ---- 认证 --------------------------------------------------------------

  authenticate(
    title: string,
    subtitle: string,
    _reason: string,
    _cancelLabel: string,
    _allowDeviceCredential: boolean
  ): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      try {
        const challenge = cryptoFramework.createRandom().generateRandomSync(16).data;
        const authParam: userAuth.AuthParam = {
          challenge,
          authType: ItcBiometricTurboModule.AUTH_TYPES,
          authTrustLevel: userAuth.AuthTrustLevel.ATL3,
        };
        const widgetParam: userAuth.WidgetParam = {
          title: title || '身份验证',
          ...(subtitle ? { navigationButtonText: subtitle } : {}),
        };
        const instance = userAuth.getUserAuthInstance(authParam, widgetParam);
        instance.on('result', {
          onResult: (result) => {
            instance.off('result');
            if (result.result === userAuth.UserAuthResultCode.SUCCESS) {
              resolve({ success: true });
            } else if (result.result === userAuth.UserAuthResultCode.CANCELED) {
              reject(this.makeError('USER_CANCELED', '用户取消'));
            } else if (result.result === userAuth.UserAuthResultCode.LOCKED) {
              reject(this.makeError('BIOMETRY_LOCKOUT', '生物识别已锁定'));
            } else {
              reject(this.makeError('BIOMETRY_AUTH_FAILED', `认证失败: ${result.result}`));
            }
          },
        });
        instance.start();
      } catch (e) {
        reject(this.makeError('BIOMETRY_AUTH_FAILED', (e as BusinessError).message));
      }
    });
  }

  // ---- 生物绑定密钥（HUKS） ---------------------------------------------

  async createKey(alias: string): Promise<{ publicKey: string }> {
    const keyAlias = this.fullAlias(alias);
    const exists = await this.huksKeyExists(keyAlias);
    if (!exists) {
      const genOptions: huks.HuksOptions = {
        properties: [
          { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_ECC },
          { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_ECC_KEY_SIZE_256 },
          {
            tag: huks.HuksTag.HUKS_TAG_PURPOSE,
            value:
              huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_SIGN |
              huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_VERIFY,
          },
          { tag: huks.HuksTag.HUKS_TAG_DIGEST, value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256 },
          // 生物绑定：使用前需用户认证；重新录入生物特征后密钥失效
          {
            tag: huks.HuksTag.HUKS_TAG_USER_AUTH_TYPE,
            value: huks.HuksUserAuthType.HUKS_USER_AUTH_TYPE_FINGERPRINT |
              huks.HuksUserAuthType.HUKS_USER_AUTH_TYPE_FACE,
          },
          {
            tag: huks.HuksTag.HUKS_TAG_KEY_AUTH_ACCESS_TYPE,
            value: huks.HuksAuthAccessType.HUKS_AUTH_ACCESS_INVALID_NEW_BIO_ENROLL,
          },
          {
            tag: huks.HuksTag.HUKS_TAG_CHALLENGE_TYPE,
            value: huks.HuksChallengeType.HUKS_CHALLENGE_TYPE_NORMAL,
          },
        ],
      };
      await huks.generateKeyItem(keyAlias, genOptions);
    }

    const exportOptions: huks.HuksOptions = { properties: [] };
    const ret = await huks.exportKeyItem(keyAlias, exportOptions);
    // HUKS 导出 ECC 公钥为 X9.63（04||X||Y）原始格式，与 iOS 一致、与 Android(DER) 不同。
    return { publicKey: buffer.from(ret.outData as Uint8Array).toString('base64') };
  }

  async signWithKey(
    alias: string,
    payloadBase64: string,
    promptTitle: string
  ): Promise<{ signatureBase64: string }> {
    const keyAlias = this.fullAlias(alias);
    const payload = new Uint8Array(buffer.from(payloadBase64, 'base64').buffer);

    const signProps: huks.HuksParam[] = [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_ECC },
      { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_ECC_KEY_SIZE_256 },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_SIGN },
      { tag: huks.HuksTag.HUKS_TAG_DIGEST, value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256 },
    ];

    // 1) init → 拿到 HUKS 挑战值
    const initRet = await huks.initSession(keyAlias, { properties: signProps });
    const handle = initRet.handle;
    const challenge = initRet.challenge as Uint8Array;

    // 2) 用挑战值发起 userAuth，拿到 authToken
    const authToken = await this.authenticateForToken(challenge, promptTitle);

    // 3) finish 时透传 authToken 完成签名
    const finishProps: huks.HuksParam[] = [
      ...signProps,
      { tag: huks.HuksTag.HUKS_TAG_AUTH_TOKEN, value: authToken },
    ];
    await huks.updateSession(handle, { properties: finishProps, inData: payload });
    const finishRet = await huks.finishSession(handle, {
      properties: finishProps,
      inData: new Uint8Array(0),
    });
    return {
      signatureBase64: buffer.from(finishRet.outData as Uint8Array).toString('base64'),
    };
  }

  async deleteKey(alias: string): Promise<void> {
    const keyAlias = this.fullAlias(alias);
    if (await this.huksKeyExists(keyAlias)) {
      await huks.deleteKeyItem(keyAlias, { properties: [] });
    }
  }

  keyExists(alias: string): Promise<boolean> {
    return this.huksKeyExists(this.fullAlias(alias));
  }

  // ---- 内部工具 ----------------------------------------------------------

  private async huksKeyExists(keyAlias: string): Promise<boolean> {
    try {
      return await huks.isKeyItemExist(keyAlias, { properties: [] });
    } catch (_) {
      return false;
    }
  }

  /** 用 HUKS 挑战值发起生物认证，返回 authToken（HUKS finish 校验用）。 */
  private authenticateForToken(challenge: Uint8Array, title: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const authParam: userAuth.AuthParam = {
        challenge,
        authType: ItcBiometricTurboModule.AUTH_TYPES,
        authTrustLevel: userAuth.AuthTrustLevel.ATL3,
      };
      const widgetParam: userAuth.WidgetParam = { title: title || '签名验证' };
      const instance = userAuth.getUserAuthInstance(authParam, widgetParam);
      instance.on('result', {
        onResult: (result) => {
          instance.off('result');
          if (result.result === userAuth.UserAuthResultCode.SUCCESS && result.token) {
            resolve(result.token);
          } else if (result.result === userAuth.UserAuthResultCode.CANCELED) {
            reject(this.makeError('USER_CANCELED', '用户取消'));
          } else {
            reject(this.makeError('BIOMETRY_KEY_INVALIDATED', `签名认证失败: ${result.result}`));
          }
        },
      });
      instance.start();
    });
  }

  private makeError(code: string, message: string): Error {
    const e = new Error(message);
    (e as Error & { code: string }).code = code;
    return e;
  }
}
