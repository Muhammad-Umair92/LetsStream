/**
 * Single-screen camera preview with toggle camera and mute mic.
 * Uses useAppPermissions (CAMERA + RECORD_AUDIO, Open Settings when denied).
 * Cleanup: Vision Camera releases the device and stops all tracks when <Camera> unmounts.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleSheet as RNStyleSheet,
  AppState,
  AppStateStatus,
  Alert,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useAppPermissions } from '../hooks/useAppPermissions';
import { showIncomingCallNotification } from '../services/notifeeVoIP';

export function CameraScreen() {
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const [isMuted, setIsMuted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const {
    hasCamera: hasCameraPermission,
    hasMicrophone: hasMicPermission,
    requestPermissions,
    openSettings,
    showOpenSettings,
  } = useAppPermissions();

  const device = useCameraDevice(cameraPosition);

  // Step 5: Cleanup on unmount. Vision Camera releases the device and stops
  // all camera/audio tracks when <Camera> is unmounted (no explicit ref API).
  useEffect(() => {
    return () => {
      // Camera component unmount → native side releases AVCaptureSession (iOS)
      // and camera/audio resources (Android). No leaks when leaving the screen.
    };
  }, []);

  // Step 6: When app goes to background, trigger VoIP notification after 2s (demo).
  // In production this would be a data-only FCM/APNs payload that wakes the app.
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background') {
        backgroundTimerRef.current = setTimeout(() => {
          showIncomingCallNotification();
          backgroundTimerRef.current = null;
        }, 2000);
      } else if (state === 'active' && backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
        backgroundTimerRef.current = null;
      }
    });
    return () => {
      if (backgroundTimerRef.current) clearTimeout(backgroundTimerRef.current);
      sub.remove();
    };
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraPosition((p) => (p === 'front' ? 'back' : 'front'));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  const simulateIncomingCall = useCallback(async () => {
    try {
      await showIncomingCallNotification();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      Alert.alert('Simulate call failed', message);
    }
  }, []);

  // Permission not granted: show request or "Open Settings" if previously denied
  if (!hasCameraPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>
          Camera and microphone access are required for the preview.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermissions}>
          <Text style={styles.buttonText}>Grant access</Text>
        </TouchableOpacity>
        {showOpenSettings && (
          <TouchableOpacity
            style={[styles.button, styles.settingsButton]}
            onPress={openSettings}
          >
            <Text style={styles.buttonText}>Open Settings</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>No camera device found.</Text>
      </View>
    );
  }

  // Camera restricted by OS/device policy (e.g. emulator or managed device)
  if (cameraError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Camera unavailable</Text>
        <Text style={[styles.message, styles.smallText]}>{cameraError}</Text>
        <Text style={[styles.message, styles.smallText]}>
          You can still test: tap "Simulate call" below to try VoIP notifications, or send the app to background.
        </Text>
        <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={() => setCameraError(null)}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={simulateIncomingCall}>
          <Text style={styles.buttonText}>Simulate call</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={RNStyleSheet.absoluteFill}
        device={device}
        isActive={true}
        audio={!isMuted && hasMicPermission}
        onError={(error) => setCameraError(error.message)}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
          <Text style={styles.controlLabel}>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
          <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={simulateIncomingCall}>
          <Text style={styles.controlLabel}>Simulate call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  smallText: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.9,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  settingsButton: {
    marginTop: 12,
    backgroundColor: '#555',
  },
  controls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 16,
  },
});
