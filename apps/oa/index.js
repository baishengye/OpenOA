import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { hotfix } from '@itc/hotfix';

// MANUAL：不自动检查更新，只有手动调 hotfix.sync()（「同步更新」按钮）才升级。
// 用 ON_APP_RESUME/ON_APP_START 会在启动/回前台时自动下载安装，冷启动即生效（演示场景不需要）。
const HotfixApp = hotfix.wrapApp(App, { checkFrequency: 'MANUAL' });
AppRegistry.registerComponent(appName, () => HotfixApp);
