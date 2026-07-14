/**
 * Logger utility for HarmonyOS IMSDK TurboModule.
 * Uses console for output to avoid ArkTS type issues with hilog.
 */

const TAG = 'ItcOpenIM';

export default class Logger {
  static info(tag: string, message: string): void {
    console.info(`[${TAG}][${tag}] ${message}`);
  }

  static warn(tag: string, message: string): void {
    console.warn(`[${TAG}][${tag}] ${message}`);
  }

  static error(tag: string, message: string): void {
    console.error(`[${TAG}][${tag}] ${message}`);
  }

  static debug(tag: string, message: string): void {
    console.info(`[${TAG}][${tag}] ${message}`);
  }
}
