import fs from 'node:fs';import path from 'node:path';
const root=process.cwd(),out=path.join(root,'www');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const files=fs.readdirSync(root).filter(f=>/\.(html|css|js|json)$/.test(f)&&!['package.json','capacitor.config.ts'].includes(f));
for(const f of files){
  let content=fs.readFileSync(path.join(root,f),'utf8');
  if(/\.html$/i.test(f)&&!content.includes('nav-safe-area.js')){
    content=content.replace('</head>','<script src="./nav-safe-area.js"></script></head>');
  }
  fs.writeFileSync(path.join(out,f),content);
}
console.log(`Prepared ${files.length} web files in www/`);