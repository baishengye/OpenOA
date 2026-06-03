import { UITurboModule } from '@rnoh/react-native-openharmony/ts';
import { userAuth } from '@kit.UserAuthenticationKit';
import { huks } from '@kit.UniversalKeystoreKit';
import { cryptoFramework } from '@kit.CryptoArchitectureKit';
import { buffer } from '@kit.ArkTS';
import { BusinessError } from '@kit.BasicServicesKit';

/**
 * 生物识别 TurboModule（鸿蒙 NEXT / RNOH）。
 * - 认证：UserAuthenticationKit（userAuth），指纹 + 人脸
 * - 密钥：UniversalKeystoreKit（HUKS），EC P-256，生物绑定访问控制
 *
 * 注意：ArkTS 严格模式不允许内联对象类型 / 无类型对象字面量 / 对象 spread / 交叉类型，
 * 因此所有返回结构都用显式 interface，错误用 CodedError 类承载 code。
 */

interface AvailabilityResult {
  available: boolean;
  biometryType: string;
  errorCode: string;
}

interface AuthResult {
  success: boolean;
}

interface PublicKeyResult {
  publicKey: string;
}

interface SignatureResult {
  signatureBase64: string;
}

/** 带错误码的错误（替代 TS 的 Error & { code } 交叉类型）。 */
class CodedError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class ItcBiometricTurboModule extends UITurboModule {
  static readonly NAME: string = 'ItcBiometric';

  private static readonly AUTH_TYPES: userAuth.UserAuthType[] = [
    userAuth.UserAuthType.FINGERPRINT,
    userAuth.UserAuthType.FACE,
  ];

  private fullAlias(alias: string): string {
    return `com.itc.biometric.${alias}`;
  }

  // ---- 能力探测 ----------------------------------------------------------

  isAvailable(): Promise<AvailabilityResult> {
    return new Promise<AvailabilityResult>((resolve) => {
      let biometryType = 'none';
      let fingerOk = false;
      let faceOk = false;
      try {
        userAuth.getAvailableStatus(userAuth.UserAuthType.FINGERPRINT, userAuth.AuthTrustLevel.ATL3);
        fingerOk = true;
      } catch (e) { /* 不支持指纹 */ }
      try {
        userAuth.getAvailableStatus(userAuth.UserAuthType.FACE, userAuth.AuthTrustLevel.ATL3);
        faceOk = true;
      } catch (e) { /* 不支持人脸 */ }

      if (fingerOk) biometryType = 'fingerprint';
      else if (faceOk) biometryType = 'face';

      const ok: boolean = fingerOk || faceOk;
      const result: AvailabilityResult = {
        available: ok,
        biometryType: ok ? biometryType : 'none',
        errorCode: ok ? '' : 'BIOMETRY_NOT_ENROLLED',
      };
      resolve(result);
    });
  }

  // ---- 认证 --------------------------------------------------------------

  authenticate(
    title: string,
    subtitle: string,
    _reason: string,
    _cancelLabel: string,
    _allowDeviceCredential: boolean,
    allowWeak: boolean
  ): Promise<AuthResult> {
    return new Promise<AuthResult>((resolve, reject) => {
      try {
        const challenge: Uint8Array = cryptoFramework.createRandom().generateRandomSync(16).data;
        const authParam: userAuth.AuthParam = {
          challenge: challenge,
          authType: ItcBiometricTurboModule.AUTH_TYPES,
          authTrustLevel: allowWeak ? userAuth.AuthTrustLevel.ATL1 : userAuth.AuthTrustLevel.ATL3,
        };
        const widgetParam: userAuth.WidgetParam = { title: title.length > 0 ? title : '身份验证' };
        const instance = userAuth.getUserAuthInstance(authParam, widgetParam);
        instance.on('result', {
          onResult: (result: userAuth.UserAuthResult) => {
            instance.off('result');
            if (result.result === userAuth.UserAuthResultCode.SUCCESS) {
              const r: AuthResult = { success: true };
              resolve(r);
            } else if (result.result === userAuth.UserAuthResultCode.CANCELED) {
              reject(new CodedError('USER_CANCELED', '用户取消'));
            } else if (result.result === userAuth.UserAuthResultCode.LOCKED) {
              reject(new CodedError('BIOMETRY_LOCKOUT', '生物识别已锁定'));
            } else {
              reject(new CodedError('BIOMETRY_AUTH_FAILED', `认证失败: ${result.result}`));
            }
          },
        });
        instance.start();
      } catch (e) {
        reject(new CodedError('BIOMETRY_AUTH_FAILED', (e as BusinessError).message));
      }
    });
  }

  // ---- 生物绑定密钥（HUKS） ---------------------------------------------

  async createKey(alias: string): Promise<PublicKeyResult> {
    const keyAlias = this.fullAlias(alias);
    const exists = await this.huksKeyExists(keyAlias);
    if (!exists) {
      const props: huks.HuksParam[] = [
        { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_ECC },
        { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_ECC_KEY_SIZE_256 },
        {
          tag: huks.HuksTag.HUKS_TAG_PURPOSE,
          value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_SIGN | huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_VERIFY,
        },
        { tag: huks.HuksTag.HUKS_TAG_DIGEST, value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256 },
        {
          tag: huks.HuksTag.HUKS_TAG_USER_AUTH_TYPE,
          value: huks.HuksUserAuthType.HUKS_USER_AUTH_TYPE_FINGERPRINT | huks.HuksUserAuthType.HUKS_USER_AUTH_TYPE_FACE,
        },
        {
          tag: huks.HuksTag.HUKS_TAG_KEY_AUTH_ACCESS_TYPE,
          value: huks.HuksAuthAccessType.HUKS_AUTH_ACCESS_INVALID_NEW_BIO_ENROLL,
        },
        { tag: huks.HuksTag.HUKS_TAG_CHALLENGE_TYPE, value: huks.HuksChallengeType.HUKS_CHALLENGE_TYPE_NORMAL },
      ];
      const genOptions: huks.HuksOptions = { properties: props };
      await huks.generateKeyItem(keyAlias, genOptions);
    }

    const exportOptions: huks.HuksOptions = { properties: [] };
    const ret = await huks.exportKeyItem(keyAlias, exportOptions);
    // HUKS 导出 ECC 公钥为 X9.63（04||X||Y），与 iOS 一致、与 Android(DER) 不同。
    const out: PublicKeyResult = {
      publicKey: buffer.from(ret.outData as Uint8Array).toString('base64'),
    };
    return out;
  }

  async signWithKey(alias: string, payloadBase64: string, promptTitle: string): Promise<SignatureResult> {
    const keyAlias = this.fullAlias(alias);
    const payload = new Uint8Array(buffer.from(payloadBase64, 'base64').buffer);

    const signProps: huks.HuksParam[] = [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_ECC },
      { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_ECC_KEY_SIZE_256 },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_SIGN },
      { tag: huks.HuksTag.HUKS_TAG_DIGEST, value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256 },
    ];

    // 1) init → 拿到 HUKS 挑战值
    const initOptions: huks.HuksOptions = { properties: signProps };
    const initRet = await huks.initSession(keyAlias, initOptions);
    const handle = initRet.handle;
    const challenge = initRet.challenge as Uint8Array;

    // 2) 用挑战值发起 userAuth，拿到 authToken
    const authToken = await this.authenticateForToken(challenge, promptTitle);

    // 3) finish 时透传 authToken 完成签名
    const finishProps: huks.HuksParam[] = signProps.slice();
    finishProps.push({ tag: huks.HuksTag.HUKS_TAG_AUTH_TOKEN, value: authToken });
    const updateOptions: huks.HuksOptions = { properties: finishProps, inData: payload };
    await huks.updateSession(handle, updateOptions);
    const finishOptions: huks.HuksOptions = { properties: finishProps, inData: new Uint8Array(0) };
    const finishRet = await huks.finishSession(handle, finishOptions);

    const out: SignatureResult = {
      signatureBase64: buffer.from(finishRet.outData as Uint8Array).toString('base64'),
    };
    return out;
  }

  async deleteKey(alias: string): Promise<void> {
    const keyAlias = this.fullAlias(alias);
    if (await this.huksKeyExists(keyAlias)) {
      const opts: huks.HuksOptions = { properties: [] };
      await huks.deleteKeyItem(keyAlias, opts);
    }
  }

  keyExists(alias: string): Promise<boolean> {
    return this.huksKeyExists(this.fullAlias(alias));
  }

  // ---- 内部工具 ----------------------------------------------------------

  private async huksKeyExists(keyAlias: string): Promise<boolean> {
    try {
      const opts: huks.HuksOptions = { properties: [] };
      return await huks.isKeyItemExist(keyAlias, opts);
    } catch (e) {
      return false;
    }
  }

  /** 用 HUKS 挑战值发起生物认证，返回 authToken（HUKS finish 校验用）。 */
  private authenticateForToken(challenge: Uint8Array, title: string): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      const authParam: userAuth.AuthParam = {
        challenge: challenge,
        authType: ItcBiometricTurboModule.AUTH_TYPES,
        authTrustLevel: userAuth.AuthTrustLevel.ATL3,
      };
      const widgetParam: userAuth.WidgetParam = { title: title.length > 0 ? title : '签名验证' };
      const instance = userAuth.getUserAuthInstance(authParam, widgetParam);
      instance.on('result', {
        onResult: (result: userAuth.UserAuthResult) => {
          instance.off('result');
          if (result.result === userAuth.UserAuthResultCode.SUCCESS && result.token !== undefined) {
            resolve(result.token);
          } else if (result.result === userAuth.UserAuthResultCode.CANCELED) {
            reject(new CodedError('USER_CANCELED', '用户取消'));
          } else {
            reject(new CodedError('BIOMETRY_KEY_INVALIDATED', `签名认证失败: ${result.result}`));
          }
        },
      });
      instance.start();
    });
  }
}
