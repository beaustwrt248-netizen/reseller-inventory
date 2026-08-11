# Beau Reseller Inventory — Android build

This folder contains the Capacitor Android configuration for the app.

## Build on a computer

1. Install Node.js and Android Studio.
2. From this `capacitor` folder run `npm install`.
3. Run `npx cap add android` if the Android platform has not yet been generated.
4. Run `npx cap sync android`.
5. Open the generated `android` project in Android Studio.
6. Build an APK using **Build > Build APK(s)**.

The app uses the existing live web application, so the GitHub Pages/Cloudflare Worker backend can remain unchanged while the Android wrapper is developed.

## Permissions

Camera and Internet permissions are configured for barcode scanning and the pricing service.

## Important

The final signed/release APK should be built on a computer with the Android SDK and signing configuration. Do not commit private signing keys to GitHub.
