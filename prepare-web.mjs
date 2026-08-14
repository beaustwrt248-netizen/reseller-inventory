import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const files = fs
  .readdirSync(root)
  .filter((f) => /\.(html|css|js|json)$/.test(f) && !['package.json', 'capacitor.config.ts'].includes(f));

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}

// Inject the lightweight dashboard/performance layer into the main app at build time.
const indexPath = path.join(out, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  const cssTag = '<link rel="stylesheet" href="./dashboard-performance.css?v=1.0.0">';
  const jsTag = '<script src="./dashboard-performance.js?v=1.0.0"></script>';

  if (!html.includes('dashboard-performance.css')) {
    html = html.replace('</head>', `${cssTag}</head>`);
  }
  if (!html.includes('dashboard-performance.js')) {
    html = html.replace('</body>', `${jsTag}</body>`);
  }

  fs.writeFileSync(indexPath, html);
}

console.log(`Prepared ${files.length} web files in www/ with dashboard/performance enhancements.`);
