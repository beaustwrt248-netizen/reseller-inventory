import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),out=path.join(root,'www');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const files=fs.readdirSync(root).filter(f=>/\.(html|css|js|json)$/.test(f)&&!['package.json','capacitor.config.ts'].includes(f));
for(const f of files)fs.copyFileSync(path.join(root,f),path.join(out,f));
console.log(`Prepared ${files.length} web files in www/`);