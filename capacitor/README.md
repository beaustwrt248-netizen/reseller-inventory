# Beau Reseller Inventory — Capacitor Android

This folder is the Android wrapper configuration for the existing Reseller Inventory web app.

## Current architecture

The Android app loads the live HTTPS GitHub Pages app:

`https://beaustwrt248-netizen.github.io/reseller-inventory/`

That lets the APK use the same scanner, pricing lookup, Cloudflare Worker, dashboard and inventory UI while we transition toward a more native Android experience.

## Build setup

1. Install Node.js and Android Studio on a computer.
2. From this `capacitor` folder run `npm install`.
3. Run `npx cap add android` once.
4. Run `npx cap sync android`.
5. Run `npx cap open android`.
6. In Android Studio, build the debug APK for testing.

Capacitor's Android platform is installed separately from the core package. Keep the Capacitor package versions aligned.

## Important

The current configuration uses the live HTTPS site. This is intentional for the first APK so we do not duplicate or replace the working web application. A later release can bundle the web assets locally for better offline behavior.
