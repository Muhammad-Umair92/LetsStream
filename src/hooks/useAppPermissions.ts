/**
 * useAppPermissions – CAMERA and RECORD_AUDIO with "Open Settings" when denied.
 * Assessment requirement: reusable hook, no crash on denied, open System Settings if permanently denied.
 */

import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import {
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

export type AppPermissionStatus = 'granted' | 'denied' | 'not-determined';

export interface AppPermissionsState {
  camera: AppPermissionStatus;
  microphone: AppPermissionStatus;
  /** True after we've requested and user denied (show "Open Settings") */
  showOpenSettings: boolean;
}

export interface UseAppPermissionsReturn extends AppPermissionsState {
  /** Request both camera and microphone permissions */
  requestPermissions: () => Promise<void>;
  /** Open the app's page in System Settings */
  openSettings: () => Promise<void>;
  /** True if camera is granted (required for preview) */
  hasCamera: boolean;
  /** True if microphone is granted (optional for mute/unmute) */
  hasMicrophone: boolean;
}

export function useAppPermissions(): UseAppPermissionsReturn {
  const {
    hasPermission: hasCamera,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMic,
    requestPermission: requestMicPermission,
  } = useMicrophonePermission();

  const [showOpenSettings, setShowOpenSettings] = useState(false);

  const requestPermissions = useCallback(async () => {
    const camResult = await requestCameraPermission();
    const micResult = await requestMicPermission();
    // If either was denied, user may have to go to Settings (especially on Android "Don't ask again")
    if (camResult === 'denied' || micResult === 'denied') {
      setShowOpenSettings(true);
    }
  }, [requestCameraPermission, requestMicPermission]);

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  const cameraStatus: AppPermissionStatus = hasCamera ? 'granted' : 'denied';
  const micStatus: AppPermissionStatus = hasMic ? 'granted' : 'denied';

  return {
    camera: cameraStatus,
    microphone: micStatus,
    showOpenSettings,
    requestPermissions,
    openSettings,
    hasCamera,
    hasMicrophone: hasMic,
  };
}
