import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const files = fs
  .readdirSync(root)
  .filter((f) => /\.(html|css|js|json)$/.test(f) && !['package.json', 'capacitor.config.ts'].includes(f));

for (const file of files) fs.copyFileSync(path.join(root, file), path.join(out, file));

const indexPath = path.join(out, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  const cssTag = '<link rel="stylesheet" href="./dashboard-performance.css?v=1.0.0">';
  const jsTag = '<script src="./dashboard-performance.js?v=1.0.0"></script>';
  const bundleTag = '<script src="./bundle-profit.js?v=1.0.0"></script>';
  if (!html.includes('dashboard-performance.css')) html = html.replace('</head>', `${cssTag}</head>`);
  if (!html.includes('dashboard-performance.js')) html = html.replace('</body>', `${jsTag}</body>`);
  if (!html.includes('bundle-profit.js')) html = html.replace('</body>', `${bundleTag}</body>`);
  fs.writeFileSync(indexPath, html);
}

const scannerPath = path.join(out, 'scanner-v3.html');
if (fs.existsSync(scannerPath)) {
  let html = fs.readFileSync(scannerPath, 'utf8');
  const tag = '<script src="./scanner-deal-analyser.js?v=1.0.0"></script>';
  if (!html.includes('scanner-deal-analyser.js')) html = html.replace('</body>', `${tag}</body>`);
  fs.writeFileSync(scannerPath, html);
}

console.log(`Prepared ${files.length} web files with dashboard/performance, scanner deal-analysis and bundle-profit enhancements.`);
