import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),out=path.join(root,'www');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const files=fs.readdirSync(root).filter(f=>/\.(html|css|js|json)$/.test(f)&&!['package.json','capacitor.config.ts'].includes(f));
const appPages=new Set(['index.html','scanner.html']);
/* app-nav.js is now the only navigation owner. Do not inject mobile-layout.js,
   which creates a second .mobile-nav and caused the extra blank button. */
const inject=['nav-safe-area.js','page-transitions.js','app-update.js','smart-buy.js','analytics.js','backup.js','app-tools.js'];
for(const f of files){
  let content=fs.readFileSync(path.join(root,f),'utf8');
  if(/\.html$/i.test(f)&&appPages.has(f)){
    for(const script of inject){
      if(!content.includes(script))content=content.replace('</head>',`<script src="./${script}"></script></head>`);
    }
  }
  fs.writeFileSync(path.join(out,f),content);
}
console.log(`Prepared ${files.length} web files in www/`);
