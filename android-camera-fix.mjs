import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
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
import android.webkit.PermissionRequest;

import androidx.annotation.NonNull;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private PermissionRequest pendingPermissionRequest;
    private static final int CAMERA_PERMISSION_REQUEST = 4001;

    @Override
    public void onPermissionRequest(final PermissionRequest request) {
        runOnUiThread(() -> {
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
        });
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
    protected void onDestroy() {
        if (pendingPermissionRequest != null) {
            pendingPermissionRequest.deny();
            pendingPermissionRequest = null;
        }
        super.onDestroy();
    }
}
`);
console.log('Applied Android WebView camera permission handling.');
