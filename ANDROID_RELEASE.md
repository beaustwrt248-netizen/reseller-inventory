# Beau's Game Inventory — Android release

## Current status
The debug APK build is working. A signed release APK requires an Android signing key owned by the app publisher.

## Safe signing setup
Create a private upload/release keystore on your own computer. Never commit the `.jks` file or passwords to GitHub.

Then add these GitHub Actions secrets:

- `ANDROID_KEYSTORE_BASE64` — base64-encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD` — keystore password
- `ANDROID_KEY_ALIAS` — signing key alias
- `ANDROID_KEY_PASSWORD` — signing key password

The release workflow can then decode the keystore, configure Gradle signing, build `assembleRelease`, and publish the signed APK as a GitHub Release asset.

## Important
Keep an offline backup of the keystore. If the signing key is lost, future updates cannot be signed with the same identity.
