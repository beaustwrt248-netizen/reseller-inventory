/* Live second-hand pricing bridge. Clean search identity + live site averages + safe fallback states. */
(function(){'use strict';
const API='https://ccdqmncjpywhpnrajfit.supabase.co/functions/v1/secondhand-pricing-public';
const TTL=10*60*1000;
const inflight=window.__secondHandInflight||(window.__secondHandInflight=new Map());
const cache=window.__secondHandCache||(window.__secondHandCache=new Map());
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const money=v=>Number(v)>0?'$'+Number(v).toFixed(2):'—';
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
function identity(title,platform){
  let t=clean(title),p=clean(platform);
  t=t.replace(/\[(?:pre[- ]?owned|used|second[- ]?hand)\]/ig,'').replace(/\((?:pre[- ]?owned|used|second[- ]?hand)\)/ig,'').replace(/\s+/g,' ').trim();
  const m=t.match(/\((PS[2345]|PSP|PS\s*Vita|Xbox(?:\s+One|\s+360|\s+Series\s*[XS])?|Nintendo\s+Switch(?:\s+2)?|Wii(?:\s+U)?|3DS|DS)\)/i);
  if(m){if(!p||/^other$/i.test(p))p=m[1].replace(/\s+/g,' ');t=t.replace(m[0],' ').replace(/\s+/g,' ').trim();}
  if(/simpsons/i.test(t)&&/hit\s*(?:&|and)\s*run/i.test(t)){t='The Simpsons Hit and Run';p='PS2';}
  t=t.replace(/\s+(?:Platinum|Platinum Edition|Classics|Essentials|Greatest Hits|Special Edition|Limited Edition|Pre[- ]?Owned|Used)\b/ig,'').replace(/\s*[-–—:]\s*$/,'').replace(/\s+/g,' ').trim();
  if(/^playstation\s*4$/i.test(p))p='PS4';else if(/^playstation\s*5$/i.test(p))p='PS5';else if(/^playstation\s*3$/i.test(p))p='PS3';else if(/^playstation\s*2$/i.test(p))p='PS2';else if(/^nintendo\s+switch$/i.test(p))p='Switch';
  if(/^other$/i.test(p))p='';
  return{title:t,platform:p};
}
function parse(){
  const host=document.getElementById('scanResult');if(!host)return null;
  const text=(host.innerText||host.textContent||'').replace(/\u00a0/g,' '),m=text.match(/(?:·|•)\s*Barcode\s*(\d{8,14})/i);if(!m)return null;
  const before=text.slice(0,m.index),lines=before.split(/\n+/).map(x=>x.trim()).filter(Boolean).filter(x=>!/^🎮?\s*Result$/i.test(x));
  const platform=(before.match(/(?:^|\n)([^\n]+?)\s*$/)?.[1]||'').replace(/^🎮\s*/,'').trim();
  const titleLines=lines.filter(x=>x!==platform);
  return{barcode:m[1],...identity(titleLines.join(' ').replace(/^🎮\s*/,'').trim(),platform)};
}
function queryFor(p){return[p.title,p.platform].filter(Boolean).join(' ').replace(/\s+/g,' ').trim()}
function keyFor(p){return queryFor(p).toLowerCase()}
function fetchLive(p){const key=keyFor(p),cached=cache.get(key);if(cached&&Date.now()-cached.ts<TTL)return Promise.resolve(cached.data);if(inflight.has(key))return inflight.get(key);const promise=fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:p.title,platform:p.platform,query:queryFor(p)}),cache:'no-store',keepalive:false}).then(async r=>{const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data?.error||('HTTP '+r.status));return data}).then(data=>{cache.set(key,{ts:Date.now(),data});return data}).finally(()=>inflight.delete(key));inflight.set(key,promise);return promise}
function renderSites(panel,data){const sites=data?.sites||[],find=n=>sites.find(x=>x.site===n),names=['Cash Converters','eBay Sold','Super Retro'];const html=names.map(name=>{const s=find(name),price=s?.ok&&s.average>0?money(s.average):'—',label=s?.ok&&s.count?'Site average · '+s.count+' sample'+(s.count===1?'':'s')+' · live':s?.error?'Unavailable':'No price samples',icon=name==='Cash Converters'?'💵':name==='eBay Sold'?'🏷️':'🕹️',href=name==='Cash Converters'?'https://www.cashconverters.com.au/search-results?query='+encodeURIComponent(data?.query||''):name==='eBay Sold'?'https://www.ebay.com.au/sch/i.html?_nkw='+encodeURIComponent(data?.query||'')+'&LH_Sold=1&LH_Complete=1':'https://superretro.com.au/search?q='+encodeURIComponent(data?.query||'');return`<a class="sh-site" href="${href}" target="_blank" rel="noopener"><div class="sh-site-icon">${icon}</div><div class="sh-site-main"><div class="sh-site-name">${esc(name)}</div><div class="sh-site-label">${esc(label)}</div></div><div class="sh-site-value">${price}</div></a>`}).join('');const host=panel.querySelector('#secondHandSites');if(host)host.innerHTML=html;const vals=sites.filter(x=>x.ok&&x.average>0).map(x=>Number(x.average));const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;const o=panel.querySelector('#secondHandOverall strong');if(o)o.textContent=money(avg);const b=panel.querySelector('#secondHandBuy');if(b){const rs=[.1,.2,.25,.3,.4].map(r=>Math.round(avg*r));b.innerHTML=rs.map((v,i)=>`<div class="buy${i===2?' recommended':''}"><span>${[10,20,25,30,40][i]}% ${['EXCELLENT','VERY GOOD','RECOMMENDED ⭐','TARGET','MAXIMUM'][i]}</span><strong>${money(v)}</strong></div>`).join('')}}
async function run(){const p=parse();if(!p)return;const panel=document.getElementById('secondHandDirectPanel');if(!panel)return;const status=panel.querySelector('#secondHandLiveStatus');try{const key=keyFor(p);if(panel.dataset.secondHandQuery===key&&panel.dataset.secondHandFetched)return;panel.dataset.secondHandQuery=key;if(status)status.textContent='Fetching live site averages…';const data=await fetchLive(p);if(panel!==document.getElementById('secondHandDirectPanel'))return;renderSites(panel,data);panel.dataset.secondHandFetched='1';if(status)status.textContent=(data?.sites||[]).some(x=>x.ok&&x.average>0)?'Live site price data loaded.':'No live site price samples returned; search links remain available.';}catch(e){if(status)status.textContent='Live pricing temporarily unavailable; search links remain available.';}}
function start(){run();const host=document.getElementById('scanResult');if(host)new MutationObserver(()=>setTimeout(run,80)).observe(host,{subtree:true,childList:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
