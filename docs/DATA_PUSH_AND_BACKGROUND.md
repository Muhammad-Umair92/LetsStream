# Data-only push and background behaviour

## What this app does (demo)

- **Foreground:** Tap "Simulate call" to show the VoIP-style notification (Accept/Decline).
- **Background:** When you send the app to background, after 2 seconds a local incoming-call notification is shown. This simulates the app being "woken" or notified while in the background.

In production, that background trigger would **not** be a timer. It would be a **data-only push** from your server via FCM (Android) and APNs (iOS).

## Data-only push: what it is and why

- **Data-only (silent) push:** The payload has no `notification` (FCM) or `alert`/`sound` (APNs). It only carries data. The OS may wake your app in the background so you can process it (e.g. show a local notification, update state).
- **Use case:** Your backend knows "incoming call for user X". It sends a data-only message to that device. Your app receives it in the background and then uses **Notifee** (or the native API) to display the high-priority/VoIP-style notification with Accept/Decline.

## Replacing the demo with real FCM (Android)

1. Add `@react-native-firebase/app` and `@react-native-firebase/messaging`.
2. Get an FCM server key / service account and send messages from your server to device tokens.
3. In the app, call `messaging().getToken()` and send it to your backend.
4. In a **background handler** (registered outside the React tree), handle `onMessage` / `setBackgroundMessageHandler`:
   - When you receive a data payload (e.g. `type: 'incoming_call'`), call `showIncomingCallNotification()` from this repo so the VoIP notification appears even when the app was in the background or killed.
5. Request the optional POST_NOTIFICATIONS permission on Android 13+.

## Replacing the demo with real APNs (iOS)

1. Enable Push Notifications and Background Modes (Voice over IP and/or Remote notifications) in Xcode.
2. Use a push provider (e.g. Node with `apn`, or Firebase) to send a **content-available** (data-only) payload to the device token. No `alert`/`sound` if you only want to wake the app.
3. In the app, request the device token and send it to your backend; handle the token in `messaging().getToken()` if using Firebase.
4. When the app is woken in the background by the data-only push, run your logic (e.g. call `showIncomingCallNotification()`) so the user sees the incoming-call UI. For a true phone-style experience you’d use **CallKit** (iOS) and the corresponding high-priority channel/notification on Android.

## Summary

| Current demo                         | Production replacement                          |
|--------------------------------------|--------------------------------------------------|
| Timer 2s after app goes to background | Server sends data-only FCM/APNs to device       |
| Local Notifee notification           | Same Notifee API, triggered from push handler    |
| Accept/Decline                       | Same; can send result to your backend           |

The behaviour you see (notification when app is in background, Accept/Decline) stays the same; only the **trigger** changes from a local timer to a remote data-only push.
