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
const index = fs.readFileSync('index.html', 'utf8');

if (!releaseStamp.includes('window.BEAU_RELEASE')) fail('release-stamp.js is not using the generated release config');
if (!manualOta.includes('window.BEAU_RELEASE')) fail('manual-ota.js is not using the generated release config');
if (!prepareWeb.includes('release-config.js')) fail('prepare-web.mjs does not generate/package release-config.js');
if (!index.includes('release-config.js')) fail('index.html does not load release-config.js');

const versionCode = (() => {
  const m = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) fail(`unsupported semantic version: ${version}`);
  return Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]);
})();

const config = `window.BEAU_RELEASE={appVersion:${JSON.stringify(version)},webVersion:${JSON.stringify(webVersion)},versionCode:${versionCode}};`;
fs.writeFileSync('release-config.js', config + '\n');

console.log(`Release check passed: app=${version} web=${webVersion} versionCode=${versionCode}`);
