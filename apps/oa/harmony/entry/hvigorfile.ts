import { hapTasks } from '@ohos/hvigor-ohos-plugin';
// op-sqlite 的 hvigor 插件：构建时按 RN 工程 package.json 的 op-sqlite 开关（sqlcipher/libsql）配置原生编译。
import { opSqlitePlugin } from './oh_modules/@react-native-ohos/op-sqlite/hvigorfile.ts';

const path = require('path');
// __dirname=entry，上溯两级到 RN 工程根 apps/oa/package.json（op-sqlite 开关在那里）。
const rootRNPackagePath = path.join(__dirname, '../../package.json');

export default {
  system: hapTasks, /* Built-in plugin of Hvigor. It cannot be modified. */
  plugins: [opSqlitePlugin(rootRNPackagePath)]
}