#!/usr/bin/env node
/**
 * 跨平台（macOS / Windows）设置 hdc 端口转发：设备的 8081 -> 本机 Metro
 * （相当于安卓的 adb reverse）。鸿蒙 App 连本机 Metro 必须，否则走离线旧包。
 *
 * best-effort：找不到 hdc / 没连设备都**不报错退出**（exit 0），不阻塞后续 `react-native start`。
 * hdc 解析顺序：① PATH ② $DEVECO_SDK_HOME ③ 各系统 DevEco 默认 SDK 位置（含版本号子目录）。
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';

const isWin = process.platform === 'win32';
const hdcName = isWin ? 'hdc.exe' : 'hdc';

function safeReaddir(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

/** 在一个 SDK 根下找 hdc：先 default，再扫版本号子目录（Windows 上常是 12 / 5.0.0(12) 等）。 */
function findHdcUnder(base) {
  if (!base || !existsSync(base)) return null;
  for (const sub of ['default', ...safeReaddir(base)]) {
    const cand = join(base, sub, 'openharmony', 'toolchains', hdcName);
    if (existsSync(cand)) return cand;
  }
  return null;
}

function resolveHdc() {
  // ① PATH：直接试跑（无 path 分隔符时 spawn 会按 PATH 查找）。
  if (!spawnSync(hdcName, ['-v'], { stdio: 'ignore' }).error) return hdcName;

  // ② $DEVECO_SDK_HOME ③ 各系统默认位置
  const bases = [process.env.DEVECO_SDK_HOME];
  if (process.platform === 'darwin') {
    bases.push('/Applications/DevEco-Studio.app/Contents/sdk');
  } else if (isWin) {
    const home = os.homedir();
    bases.push(
      join(home, 'AppData', 'Local', 'Huawei', 'Sdk'),
      join(home, 'AppData', 'Local', 'OpenHarmony', 'Sdk')
    );
  }
  for (const base of bases) {
    const found = findHdcUnder(base);
    if (found) return found;
  }
  return null;
}

const hdc = resolveHdc();
if (!hdc) {
  console.log(
    '[start:harmony] 找不到 hdc，跳过端口转发。请把 DevEco 的 toolchains 加进 PATH，或设 DEVECO_SDK_HOME。'
  );
  process.exit(0);
}

const ls = spawnSync(hdc, ['fport', 'ls'], { encoding: 'utf8' });
if ((ls.stdout || '').includes('tcp:8081 tcp:8081')) {
  console.log('[start:harmony] 端口转发已就绪 (tcp:8081)');
} else {
  const r = spawnSync(hdc, ['rport', 'tcp:8081', 'tcp:8081'], { stdio: 'ignore' });
  console.log(
    r.status === 0
      ? '[start:harmony] 已设端口转发 (tcp:8081)'
      : '[start:harmony] 端口转发未设（设备没连？连上后执行: hdc rport tcp:8081 tcp:8081）'
  );
}
process.exit(0); // 永远成功，不阻塞 Metro
