import fs from 'node:fs';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = (message) => { console.error(`RELEASE CHECK FAILED: ${message}`); process.exit(1); };

const pkg = readJson('package.json');
const manifest = readJson('update.json');
const version = String(pkg.version || '').trim();
const manifestVersion = String(manifest.version || '').trim();
const webVersion = String(manifest.webVersion || '').trim();

if (!version) fail('package.json has no version');
if (version !== manifestVersion) fail(`package.json ${version} != update.json ${manifestVersion}`);
if (!webVersion) fail('update.json has no webVersion');

const releaseStamp = fs.readFileSync('release-stamp.js', 'utf8');
const manualOta = fs.readFileSync('manual-ota.js', 'utf8');
const prepareWeb = fs.readFileSync('prepare-web.mjs', 'utf8');
const cameraFix = fs.readFileSync('android-camera-fix.mjs', 'utf8');

if (!releaseStamp.includes('window.BEAU_RELEASE')) fail('release-stamp.js is not using the generated release config');
if (!manualOta.includes('window.BEAU_RELEASE')) fail('manual-ota.js is not using the generated release config');
if (!prepareWeb.includes('release-config.js')) fail('prepare-web.mjs does not generate/package release-config.js');
if (!cameraFix.includes('release-version-check.mjs')) fail('android-camera-fix.mjs does not run the release check');

const versionCode = (() => {
  const m = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) fail(`unsupported semantic version: ${version}`);
  return Number(m[1]) * 100 + Number(m[2]) * 10 + Number(m[3]);
})();

const config = `window.BEAU_RELEASE={appVersion:${JSON.stringify(version)},webVersion:${JSON.stringify(webVersion)},versionCode:${versionCode}};`;
fs.writeFileSync('release-config.js', config + '\n');

const www = fs.existsSync('www/index.html');
if (www) {
  const packagedIndex = fs.readFileSync('www/index.html', 'utf8');
  const packagedConfig = fs.readFileSync('www/release-config.js', 'utf8');
  if (!packagedIndex.includes('release-config.js')) fail('packaged www/index.html is missing release-config.js');
  if (!packagedConfig.includes(`appVersion:${JSON.stringify(version)}`)) fail('packaged release-config.js has the wrong app version');
  if (!packagedConfig.includes(`webVersion:${JSON.stringify(webVersion)}`)) fail('packaged release-config.js has the wrong web version');
  if (!packagedIndex.includes(`id="appVersion">${version}`)) fail('packaged Settings version is stale');
}

const gradle = 'android/app/build.gradle';
if (fs.existsSync(gradle)) {
  const text = fs.readFileSync(gradle, 'utf8');
  if (!text.includes(`versionCode ${versionCode}`)) fail(`Android Gradle versionCode does not match ${versionCode}`);
  if (!text.includes(`versionName "${version}"`)) fail(`Android Gradle versionName does not match ${version}`);
}

console.log(`Release check passed: app=${version} web=${webVersion} versionCode=${versionCode}${www ? ' packaged=verified' : ''}${fs.existsSync(gradle) ? ' android=verified' : ''}`);
