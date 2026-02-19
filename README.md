# LetsStream

Single-screen React Native app: **camera preview**, **permission handling**, and **VoIP-style notifications** (Accept/Decline) that work when the app is in the background. Built for a React Native technical assessment.

## Features

- **Camera preview** (front/back) with **mute/unmute** microphone
- **Permissions:** CAMERA + RECORD_AUDIO via `useAppPermissions`; **Open Settings** when denied
- **Cleanup:** Camera and tracks released on unmount (no leaks)
- **Notifee:** High-priority incoming-call notification with **Accept** (opens app) and **Decline** (dismisses)
- **Background:** Notification can be triggered when app is in background (demo: 2s after backgrounding; production: data-only FCM/APNs)

## Prerequisites

- Node 18+
- macOS: Xcode, CocoaPods, Watchman
- Android: Android Studio, JDK 17
- iOS: run `pod install` from `ios/` (if you see encoding errors, try `LANG=en_US.UTF-8 pod install`)

## Setup and run

```bash
# Install dependencies (already done if you created with CLI)
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## Native configuration

### iOS – `ios/LetsStream/Info.plist`

Required for camera and microphone:

```xml
<key>NSCameraUsageDescription</key>
<string>LetsStream needs camera access for video preview.</string>
<key>NSMicrophoneUsageDescription</key>
<string>LetsStream needs microphone access for audio.</string>
```

### Android – `android/app/src/main/AndroidManifest.xml`

Required permissions:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## How to try it

1. **Camera:** Grant camera (and optionally mic). Use **Flip** and **Mute**.
2. **Simulate call:** Tap **Simulate call** to show the VoIP notification with Accept/Decline.
3. **Background:** Send the app to background; after ~2 seconds the same notification appears (demo of “notification when backgrounded”).

## Docs

- [Data-only push and background](docs/DATA_PUSH_AND_BACKGROUND.md) – How the background demo works and how to replace it with FCM/APNs.
- [Scaling to 1,000+ users](docs/SCALING.md) – P2P vs SFU vs MCU and where to run media servers.

## Tech stack

- **React Native** (CLI, 0.84)
- **react-native-vision-camera** – Camera preview
- **@notifee/react-native** – VoIP-style notifications

## License

MIT
