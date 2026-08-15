import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'www');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'update.json'), 'utf8'));
const appVersion = String(pkg.version);
const webVersion = String(manifest.webVersion);
const versionCode = Number(appVersion.split('.').slice(0, 3).map(Number).reduce((a, n, i) => a + n * [10000, 100, 1][i], 0));

fs.writeFileSync(
  path.join(root, 'release-config.js'),
  `window.BEAU_RELEASE={appVersion:${JSON.stringify(appVersion)},webVersion:${JSON.stringify(webVersion)},versionCode:${versionCode}};\n`
);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const files = fs.readdirSync(root).filter((f) => /\.(html|css|js|json)$/.test(f) && !['package.json','capacitor.config.ts'].includes(f));
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(out, file));

const indexPath = path.join(out, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(/(<[^>]+id="appVersion">)[^<]*(<\/[^>]+>)/, `$1${appVersion}$2`);
  const tags = [
    '<script src="./release-config.js?v=release"></script>',
    '<link rel="stylesheet" href="./dashboard-performance.css?v=1.0.0">',
    '<script src="./dashboard-performance.js?v=1.0.0"></script>',
    '<script src="./bundle-profit.js?v=1.0.0"></script>',
    '<script src="./reseller-intelligence.js?v=1.0.0"></script>',
    '<script src="./sales-intelligence.js?v=1.0.0"></script>',
    '<script src="./listing-assistant.js?v=1.0.0"></script>',
    '<script src="./marketplace-sales.js?v=1.0.0"></script>',
    '<script src="./international-verified-fallback.js?v=1.0.0"></script>',
    '<script src="./release-stamp.js?v=release"></script>'
  ];
  if (!html.includes('release-config.js')) html = html.replace('</head>', `${tags[0]}</head>`);
  for (const tag of tags.slice(1)) {
    const key = tag.match(/\.\/(.*?)(?:\?|\"|')/)[1];
    if (!html.includes(key)) html = html.replace('</body>', `${tag}</body>`);
  }
  fs.writeFileSync(indexPath, html);
}

const scannerPath = path.join(out, 'scanner-v3.html');
if (fs.existsSync(scannerPath)) {
  let html = fs.readFileSync(scannerPath, 'utf8');
  const tags = [
    '<script src="./scanner-deal-analyser.js?v=1.0.0"></script>',
    '<script src="./international-verified-fallback.js?v=1.0.0"></script>'
  ];
  for (const tag of tags) {
    const key = tag.match(/\.\/(.*?)(?:\?|\"|')/)[1];
    if (!html.includes(key)) html = html.replace('</body>', `${tag}</body>`);
  }
  fs.writeFileSync(scannerPath, html);
}

console.log(`Prepared ${files.length} web files for release ${appVersion} / web ${webVersion}.`);
