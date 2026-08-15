import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const release = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const manifest = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const activity = path.join(root, 'android', 'app', 'src', 'main', 'java', 'com', 'beausgames', 'inventory', 'MainActivity.java');

let xml = fs.readFileSync(manifest, 'utf8');
if (!xml.includes('android.permission.CAMERA')) {
  xml = xml.replace('</manifest>', '    <uses-permission android:name="android.permission.CAMERA" />\n    <uses-feature android:name="android.hardware.camera" android:required="false" />\n    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />\n</manifest>');
  fs.writeFileSync(manifest, xml);
}

fs.mkdirSync(path.dirname(activity), { recursive: true });
fs.writeFileSync(activity, `package com.beausgames.inventory;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private PermissionRequest pendingPermissionRequest;
    private static final int CAMERA_PERMISSION_REQUEST = 4001;
    private static final String WEB_RELEASE = "${release}";
    private static final String PREFS = "beau_release";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        android.content.SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        String previousRelease = prefs.getString("webRelease", "");
        if (!WEB_RELEASE.equals(previousRelease)) {
            webView.clearCache(true);
            webView.clearHistory();
            prefs.edit().putString("webRelease", WEB_RELEASE).apply();
        }

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> handleCameraPermissionRequest(request));
            }
        });

        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST);
        }
    }

    private void handleCameraPermissionRequest(final PermissionRequest request) {
        boolean wantsCamera = false;
        for (String resource : request.getResources()) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                wantsCamera = true;
                break;
            }
        }

        if (!wantsCamera) {
            request.deny();
            return;
        }

        if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
        } else {
            pendingPermissionRequest = request;
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != CAMERA_PERMISSION_REQUEST) return;

        PermissionRequest request = pendingPermissionRequest;
        pendingPermissionRequest = null;
        if (request == null) return;

        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
        } else {
            request.deny();
        }
    }

    @Override
    public void onDestroy() {
        if (pendingPermissionRequest != null) {
            pendingPermissionRequest.deny();
            pendingPermissionRequest = null;
        }
        super.onDestroy();
    }
}
`);

execFileSync(process.execPath, ['release-version-check.mjs'], { cwd: root, stdio: 'inherit' });
console.log(`Applied Android camera permission handling and release ${release} WebView cache reset.`);
