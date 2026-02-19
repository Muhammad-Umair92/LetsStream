/**
 * @format
 */

import notifee from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { handleVoIPEvent } from './src/services/notifeeVoIP';

// Handle Notifee events when app is in background (e.g. Accept/Decline)
notifee.onBackgroundEvent(async (event) => {
  handleVoIPEvent(event);
});

AppRegistry.registerComponent(appName, () => App);
