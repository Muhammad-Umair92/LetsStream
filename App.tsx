/**
 * LetsStream – Camera preview + VoIP-style notifications (assessment app)
 * @format
 */

import { useEffect } from 'react';
import notifee from '@notifee/react-native';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CameraScreen } from './src/screens/CameraScreen';
import { handleVoIPEvent } from './src/services/notifeeVoIP';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent((event) => {
      handleVoIPEvent(event);
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <CameraScreen />
    </SafeAreaProvider>
  );
}

export default App;
