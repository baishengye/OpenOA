import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { hotfix } from '@itc/hotfix';

const HotfixApp = hotfix.wrapApp(App, { checkFrequency: 'ON_APP_RESUME' });
AppRegistry.registerComponent(appName, () => HotfixApp);
