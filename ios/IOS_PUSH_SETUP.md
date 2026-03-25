# iOS Push Notifications Setup

This guide covers the manual steps required to complete iOS push notification setup.

## 1. Add GoogleService-Info.plist

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Add an **iOS app** if not already added:
   - Click the iOS icon
   - Bundle ID: Must match your app (check `ios/Astroma.xcodeproj` → General tab)
   - Download `GoogleService-Info.plist`
4. Add the file to `ios/Astroma/`:
   - Open `ios/Astroma.xcworkspace` in Xcode
   - Right-click the Astroma folder → "Add Files to Astroma"
   - Select `GoogleService-Info.plist`
   - Ensure "Copy items if needed" is checked
   - Ensure the Astroma target is selected

## 2. Enable Capabilities in Xcode

1. Open `ios/Astroma.xcworkspace` in Xcode
2. Select the **Astroma** project → **Astroma** target
3. Go to **Signing & Capabilities** tab
4. Click **+ Capability** and add:
   - **Push Notifications**
   - **Background Modes** (check "Remote notifications")

## 3. Configure APNs in Firebase Console

1. In [Firebase Console](https://console.firebase.google.com/) → Project Settings → Cloud Messaging
2. Under **Apple app configuration**, upload your APNs authentication key:
   - In [Apple Developer](https://developer.apple.com/account/resources/authkeys/list), create a key with **Apple Push Notifications service (APNs)** enabled
   - Download the `.p8` file and note the Key ID
   - Upload to Firebase and enter Key ID + Team ID + Bundle ID

## 4. Production Builds

For **Release/Production** builds, update `ios/Astroma/Astroma.entitlements`:
- Change `aps-environment` from `development` to `production`

Or add a separate entitlements file for Release configuration in Xcode.

## 5. Rebuild

```bash
cd ios
pod install --repo-update
cd ..
npx react-native run-ios
```

**Note:** Push notifications only work on a **physical iOS device** (or Apple Silicon Simulator on iOS 16+). They do not work on Intel-based simulators.
