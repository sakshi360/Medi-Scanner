/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import awsconfig from './aws-exports';
// import {Amplify, API, PubSub} from 'aws-amplify';

// Amplify.configure(awsconfig);
// PubSub.configure(awsconfig);
// API.configure(awsconfig);

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by messageLogBox.ignoreAllLogs();//Ignore all log notifications

console.disableYellowBox = true;
AppRegistry.registerComponent(appName, () => App);
