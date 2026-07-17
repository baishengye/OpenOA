/**
 * @itc/permission 权限常量
 * 基于 react-native-permissions 和 @react-native-ohos/react-native-permissions
 * 提供统一格式的权限常量
 */

// ── 权限状态常量 ──────────────────────────────────────────────────────────────

/**
 * 权限状态枚举
 */
export const ITC_RESULTS = Object.freeze({
  UNAVAILABLE: 'unavailable',
  BLOCKED: 'blocked',
  DENIED: 'denied',
  GRANTED: 'granted',
  LIMITED: 'limited',
} as const);

export type ITC_RESULT = (typeof ITC_RESULTS)[keyof typeof ITC_RESULTS];

// ── Android 权限常量 ─────────────────────────────────────────────────────────

const ANDROID_PERMISSIONS = Object.freeze({
  ACCEPT_HANDOVER: 'android.permission.ACCEPT_HANDOVER',
  ACCESS_BACKGROUND_LOCATION: 'android.permission.ACCESS_BACKGROUND_LOCATION',
  ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
  ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
  ACCESS_MEDIA_LOCATION: 'android.permission.ACCESS_MEDIA_LOCATION',
  ACTIVITY_RECOGNITION: 'android.permission.ACTIVITY_RECOGNITION',
  ADD_VOICEMAIL: 'com.android.voicemail.permission.ADD_VOICEMAIL',
  ANSWER_PHONE_CALLS: 'android.permission.ANSWER_PHONE_CALLS',
  BLUETOOTH_ADVERTISE: 'android.permission.BLUETOOTH_ADVERTISE',
  BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
  BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
  BODY_SENSORS: 'android.permission.BODY_SENSORS',
  BODY_SENSORS_BACKGROUND: 'android.permission.BODY_SENSORS_BACKGROUND',
  CALL_PHONE: 'android.permission.CALL_PHONE',
  CAMERA: 'android.permission.CAMERA',
  GET_ACCOUNTS: 'android.permission.GET_ACCOUNTS',
  NEARBY_WIFI_DEVICES: 'android.permission.NEARBY_WIFI_DEVICES',
  POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
  PROCESS_OUTGOING_CALLS: 'android.permission.PROCESS_OUTGOING_CALLS',
  READ_CALENDAR: 'android.permission.READ_CALENDAR',
  READ_CALL_LOG: 'android.permission.READ_CALL_LOG',
  READ_CONTACTS: 'android.permission.READ_CONTACTS',
  READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
  READ_MEDIA_AUDIO: 'android.permission.READ_MEDIA_AUDIO',
  READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
  READ_MEDIA_VIDEO: 'android.permission.READ_MEDIA_VIDEO',
  READ_MEDIA_VISUAL_USER_SELECTED: 'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
  READ_PHONE_NUMBERS: 'android.permission.READ_PHONE_NUMBERS',
  READ_PHONE_STATE: 'android.permission.READ_PHONE_STATE',
  READ_SMS: 'android.permission.READ_SMS',
  RECEIVE_MMS: 'android.permission.RECEIVE_MMS',
  RECEIVE_SMS: 'android.permission.RECEIVE_SMS',
  RECEIVE_WAP_PUSH: 'android.permission.RECEIVE_WAP_PUSH',
  RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
  SEND_SMS: 'android.permission.SEND_SMS',
  USE_SIP: 'android.permission.USE_SIP',
  UWB_RANGING: 'android.permission.UWB_RANGING',
  WRITE_CALENDAR: 'android.permission.WRITE_CALENDAR',
  WRITE_CALL_LOG: 'android.permission.WRITE_CALL_LOG',
  WRITE_CONTACTS: 'android.permission.WRITE_CONTACTS',
  WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
} as const);

// ── iOS 权限常量 ─────────────────────────────────────────────────────────────

const IOS_PERMISSIONS = Object.freeze({
  APP_TRACKING_TRANSPARENCY: 'ios.permission.APP_TRACKING_TRANSPARENCY',
  BLUETOOTH: 'ios.permission.BLUETOOTH',
  CALENDARS: 'ios.permission.CALENDARS',
  CALENDARS_WRITE_ONLY: 'ios.permission.CALENDARS_WRITE_ONLY',
  CAMERA: 'ios.permission.CAMERA',
  CONTACTS: 'ios.permission.CONTACTS',
  FACE_ID: 'ios.permission.FACE_ID',
  LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',
  LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
  MEDIA_LIBRARY: 'ios.permission.MEDIA_LIBRARY',
  MICROPHONE: 'ios.permission.MICROPHONE',
  MOTION: 'ios.permission.MOTION',
  PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
  PHOTO_LIBRARY_ADD_ONLY: 'ios.permission.PHOTO_LIBRARY_ADD_ONLY',
  REMINDERS: 'ios.permission.REMINDERS',
  SIRI: 'ios.permission.SIRI',
  SPEECH_RECOGNITION: 'ios.permission.SPEECH_RECOGNITION',
  STOREKIT: 'ios.permission.STOREKIT',
} as const);

// ── HarmonyOS 权限常量 ──────────────────────────────────────────────────────

const HARMONY_PERMISSIONS = Object.freeze({
  LOCATION_IN_BACKGROUND: 'ohos.permission.LOCATION_IN_BACKGROUND',
  LOCATION: 'ohos.permission.LOCATION',
  APPROXIMATELY_LOCATION: 'ohos.permission.APPROXIMATELY_LOCATION',
  CAMERA: 'ohos.permission.CAMERA',
  MICROPHONE: 'ohos.permission.MICROPHONE',
  READ_CALENDAR: 'ohos.permission.READ_CALENDAR',
  WRITE_CALENDAR: 'ohos.permission.WRITE_CALENDAR',
  READ_WHOLE_CALENDAR: 'ohos.permission.READ_WHOLE_CALENDAR',
  WRITE_WHOLE_CALENDAR: 'ohos.permission.WRITE_WHOLE_CALENDAR',
  ACTIVITY_MOTION: 'ohos.permission.ACTIVITY_MOTION',
  READ_HEALTH_DATA: 'ohos.permission.READ_HEALTH_DATA',
  DISTRIBUTED_DATASYNC: 'ohos.permission.DISTRIBUTED_DATASYNC',
  ANSWER_CALL: 'ohos.permission.ANSWER_CALL',
  MANAGE_VOICEMAIL: 'ohos.permission.MANAGE_VOICEMAIL',
  READ_CONTACTS: 'ohos.permission.READ_CONTACTS',
  WRITE_CONTACTS: 'ohos.permission.WRITE_CONTACTS',
  READ_CALL_LOG: 'ohos.permission.READ_CALL_LOG',
  WRITE_CALL_LOG: 'ohos.permission.WRITE_CALL_LOG',
  READ_CELL_MESSAGES: 'ohos.permission.READ_CELL_MESSAGES',
  READ_MESSAGES: 'ohos.permission.READ_MESSAGES',
  RECEIVE_MMS: 'ohos.permission.RECEIVE_MMS',
  RECEIVE_SMS: 'ohos.permission.RECEIVE_SMS',
  RECEIVE_WAP_MESSAGES: 'ohos.permission.RECEIVE_WAP_MESSAGES',
  SEND_MESSAGES: 'ohos.permission.SEND_MESSAGES',
  WRITE_AUDIO: 'ohos.permission.WRITE_AUDIO',
  READ_AUDIO: 'ohos.permission.READ_AUDIO',
  READ_DOCUMENT: 'ohos.permission.READ_DOCUMENT',
  WRITE_DOCUMENT: 'ohos.permission.WRITE_DOCUMENT',
  READ_MEDIA: 'ohos.permission.READ_MEDIA',
  WRITE_MEDIA: 'ohos.permission.WRITE_MEDIA',
  WRITE_IMAGEVIDEO: 'ohos.permission.WRITE_IMAGEVIDEO',
  READ_IMAGEVIDEO: 'ohos.permission.READ_IMAGEVIDEO',
  MEDIA_LOCATION: 'ohos.permission.MEDIA_LOCATION',
  APP_TRACKING_CONSENT: 'ohos.permission.APP_TRACKING_CONSENT',
  GET_INSTALLED_BUNDLE_LIST: 'ohos.permission.GET_INSTALLED_BUNDLE_LIST',
  ACCESS_BLUETOOTH: 'ohos.permission.ACCESS_BLUETOOTH',
} as const);

// ── 统一导出 ITC_PERMISSIONS ────────────────────────────────────────────────

export const ITC_PERMISSIONS = Object.freeze({
  ANDROID: ANDROID_PERMISSIONS,
  IOS: IOS_PERMISSIONS,
  HARMONY: HARMONY_PERMISSIONS,
} as const);

export type ITC_ANDROID_PERMISSION =
  (typeof ANDROID_PERMISSIONS)[keyof typeof ANDROID_PERMISSIONS];
export type ITC_IOS_PERMISSION = (typeof IOS_PERMISSIONS)[keyof typeof IOS_PERMISSIONS];
export type ITC_HARMONY_PERMISSION =
  (typeof HARMONY_PERMISSIONS)[keyof typeof HARMONY_PERMISSIONS];
export type ITC_PERMISSION =
  | ITC_ANDROID_PERMISSION
  | ITC_IOS_PERMISSION
  | ITC_HARMONY_PERMISSION;
