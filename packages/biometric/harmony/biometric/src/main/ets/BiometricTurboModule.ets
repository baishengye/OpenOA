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

interface CapabilityItem {
  kind: string;
  hardware: boolean;
  enrolled: boolean;
  available: boolean;
  strength: string;
  directable: boolean;
  reason: string;
}

interface CapabilitiesResult {
  mask: number;
  items: CapabilityItem[];
}

/** 认证结果（结果类语义：失败不 reject，resolve 带 reason）。 */
interface AuthOutcome {
  success: boolean;
  usedKind: string;
  reason: string;
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

  /** 在给定信任等级下，按 AUTH_TYPES 顺序（优先指纹）返回第一个可用类型；都不可用返回 null。 */
  private static pickAuthType(atl: userAuth.AuthTrustLevel): userAuth.UserAuthType | null {
    for (const t of ItcBiometricTurboModule.AUTH_TYPES) {
      try {
        userAuth.getAvailableStatus(t, atl);
        return t;
      } catch (e) { /* 该类型在此等级不可用 */ }
    }
    return null;
  }

  private static kindToAuthType(kind: string): userAuth.UserAuthType | null {
    if (kind === 'fingerprint') return userAuth.UserAuthType.FINGERPRINT;
    if (kind === 'face') return userAuth.UserAuthType.FACE;
    return null; // 鸿蒙 userAuth 暂不暴露 iris
  }

  private static authTypeToKind(t: userAuth.UserAuthType): string {
    if (t === userAuth.UserAuthType.FINGERPRINT) return 'fingerprint';
    if (t === userAuth.UserAuthType.FACE) return 'face';
    return '';
  }

  /** 探测单个模态能力：ATL3 通过=strong，ATL1 通过=weak/available；据错误码判 hardware/enrolled。 */
  private static capabilityFor(authType: userAuth.UserAuthType, kind: string): CapabilityItem {
    let strong = false;
    let weak = false;
    let code = 0;
    try {
      userAuth.getAvailableStatus(authType, userAuth.AuthTrustLevel.ATL3);
      strong = true;
    } catch (e) { code = (e as BusinessError).code; }
    try {
      userAuth.getAvailableStatus(authType, userAuth.AuthTrustLevel.ATL1);
      weak = true;
    } catch (e) { code = (e as BusinessError).code; }

    const available: boolean = strong || weak;
    const strength: string = strong ? 'strong' : (weak ? 'weak' : 'none');
    let hardware = false;
    let enrolled = false;
    let reason = '';
    if (available) {
      hardware = true;
      enrolled = true;
    } else if (code === 12500010) { // NOT_ENROLLED：硬件在、未录入
      hardware = true;
      reason = 'not_enrolled';
    } else if (code === 12500005) { // TYPE_NOT_SUPPORT：无此硬件
      reason = 'not_supported';
    } else {
      reason = code !== 0 ? `code_${code}` : 'unknown';
    }
    const item: CapabilityItem = {
      kind: kind,
      hardware: hardware,
      enrolled: enrolled,
      available: available,
      strength: strength,
      directable: true,
      reason: reason,
    };
    return item;
  }

  private static outcomeFromResult(code: number, authType: userAuth.UserAuthType): AuthOutcome {
    if (code === userAuth.UserAuthResultCode.SUCCESS) {
      return { success: true, usedKind: ItcBiometricTurboModule.authTypeToKind(authType), reason: '' };
    }
    let reason = 'failed';
    if (code === userAuth.UserAuthResultCode.CANCELED) reason = 'canceled';
    else if (code === userAuth.UserAuthResultCode.LOCKED) reason = 'lockout';
    else if (code === userAuth.UserAuthResultCode.TIMEOUT) reason = 'timeout';
    else if (code === userAuth.UserAuthResultCode.NOT_ENROLLED) reason = 'not_enrolled';
    else if (code === userAuth.UserAuthResultCode.TYPE_NOT_SUPPORT) reason = 'not_supported';
    else if (code === userAuth.UserAuthResultCode.TRUST_LEVEL_NOT_SUPPORT) reason = 'not_supported';
    else if (code === userAuth.UserAuthResultCode.BUSY) reason = 'busy';
    return { success: false, usedKind: '', reason: reason };
  }

  /** 单类型 widget 认证，永不 reject：成功/失败都 resolve 成 AuthOutcome。 */
  private runWidgetAuth(
    authType: userAuth.UserAuthType,
    atl: userAuth.AuthTrustLevel,
    title: string
  ): Promise<AuthOutcome> {
    return new Promise<AuthOutcome>((resolve) => {
      try {
        const challenge: Uint8Array = cryptoFramework.createRandom().generateRandomSync(16).data;
        const authParam: userAuth.AuthParam = {
          challenge: challenge,
          authType: [authType],
          authTrustLevel: atl,
        };
        const widgetParam: userAuth.WidgetParam = { title: title.length > 0 ? title : '身份验证' };
        const instance = userAuth.getUserAuthInstance(authParam, widgetParam);
        instance.on('result', {
          onResult: (result: userAuth.UserAuthResult) => {
            instance.off('result');
            resolve(ItcBiometricTurboModule.outcomeFromResult(result.result, authType));
          },
        });
        instance.start();
      } catch (e) {
        resolve({ success: false, usedKind: '', reason: 'failed' });
      }
    });
  }

  private fullAlias(alias: string): string {
    return `com.itc.biometric.${alias}`;
  }

  // ---- 能力枚举 ----------------------------------------------------------

  getCapabilities(): Promise<CapabilitiesResult> {
    return new Promise<CapabilitiesResult>((resolve) => {
      const finger: CapabilityItem =
        ItcBiometricTurboModule.capabilityFor(userAuth.UserAuthType.FINGERPRINT, 'fingerprint');
      const face: CapabilityItem =
        ItcBiometricTurboModule.capabilityFor(userAuth.UserAuthType.FACE, 'face');
      const items: CapabilityItem[] = [finger, face];
      let mask = 0;
      if (finger.available) mask = mask | 1;
      if (face.available) mask = mask | 2;
      const result: CapabilitiesResult = { mask: mask, items: items };
      resolve(result);
    });
  }

  // ---- 认证 --------------------------------------------------------------

  /** 按强度认证（系统在该等级下可用类型中选；本机多类型组合会被秒拒，故取单一类型）。 */
  authenticate(
    title: string,
    _subtitle: string,
    _reason: string,
    _cancelLabel: string,
    _allowDeviceCredential: boolean,
    strength: string
  ): Promise<AuthOutcome> {
    const atl: userAuth.AuthTrustLevel =
      strength === 'weak' ? userAuth.AuthTrustLevel.ATL1 : userAuth.AuthTrustLevel.ATL3;
    const chosen: userAuth.UserAuthType | null = ItcBiometricTurboModule.pickAuthType(atl);
    if (chosen === null) {
      return Promise.resolve<AuthOutcome>({ success: false, usedKind: '', reason: 'not_enrolled' });
    }
    return this.runWidgetAuth(chosen, atl, title);
  }

  /** 定向认证到指定模态（鸿蒙真支持）。 */
  authenticateWith(
    kind: string,
    title: string,
    _subtitle: string,
    _reason: string,
    _cancelLabel: string,
    _allowDeviceCredential: boolean
  ): Promise<AuthOutcome> {
    const authType: userAuth.UserAuthType | null = ItcBiometricTurboModule.kindToAuthType(kind);
    if (authType === null) {
      return Promise.resolve<AuthOutcome>({ success: false, usedKind: '', reason: 'not_supported' });
    }
    try {
      userAuth.getAvailableStatus(authType, userAuth.AuthTrustLevel.ATL3);
    } catch (e) {
      const code: number = (e as BusinessError).code;
      const reason: string = code === 12500010 ? 'not_enrolled' : 'not_supported';
      return Promise.resolve<AuthOutcome>({ success: false, usedKind: '', reason: reason });
    }
    return this.runWidgetAuth(authType, userAuth.AuthTrustLevel.ATL3, title);
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
      // 同 authenticate：只请求单一、ATL3 下可用的类型（密钥按 指纹|人脸 绑定，
      // 用其中达标的那个出 authToken 即可），避免多类型组合被 widget 秒拒。
      const chosen: userAuth.UserAuthType | null =
        ItcBiometricTurboModule.pickAuthType(userAuth.AuthTrustLevel.ATL3);
      if (chosen === null) {
        reject(new CodedError('BIOMETRY_NOT_ENROLLED', '当前无可用于签名的强生物识别'));
        return;
      }
      const authParam: userAuth.AuthParam = {
        challenge: challenge,
        authType: [chosen],
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
