import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// Copy the web app as-is. Navigation and feature scripts are now owned by
// their actual entry points instead of being injected globally at build time.
const files = fs
  .readdirSync(root)
  .filter((f) => /\.(html|css|js|json)$/.test(f) && !['package.json', 'capacitor.config.ts'].includes(f));

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}

console.log(`Prepared ${files.length} web files in www/`);
