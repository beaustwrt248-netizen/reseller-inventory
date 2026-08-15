/* Beau's Game Inventory — pricing engine v3.4.0 — international EAN/JAN/GTIN fallback */
(function(){
'use strict';
const WORKER='https://beau-reseller-pricing.beaustwrt248.workers.dev';
const nativeFetch=window.fetch.bind(window);
const nums=v=>{if(Array.isArray(v))return v.flatMap(nums);if(typeof v==='number'&&Number.isFinite(v)&&v>0)return[v];if(typeof v==='string'){const n=Number(v.replace(/[^0-9.]/g,''));return Number.isFinite(n)&&n>0?[n]:[]}return[]};
const first=(o,keys)=>{for(const k of keys){const n=nums(o?.[k])[0];if(n)return n}return 0};
const median=a=>{if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2};
const robust=a=>{const v=a.filter(x=>x>0);if(!v.length)return 0;if(v.length<3)return median(v);const m=median(v),d=v.map(x=>Math.abs(x-m)),mad=median(d);if(!mad)return m;const k=v.filter(x=>Math.abs(x-m)<=3*mad);return median(k.length?k:v)};
const unwrap=d=>d?.data?.data?.data||d?.data?.data||d?.data||d;
const titleOf=p=>String(p?.title||p?.name||p?.product_name||p?.productName||p?.productTitle||'').trim();
const isGenericTitle=t=>{const x=String(t||'').trim().toLowerCase();return !x||x==='game'||x==='product'||x==='item'||x==='unknown game'||x==='unknown product'||x==='unknown'||x==='generic product'||/^([a-z0-9_-]{20,}):(\d+)$/.test(x)};
function usefulProduct(p){const t=titleOf(p);return !isGenericTitle(t)&&t.length>=3}
function collectObjects(v,seen=new Set(),out=[]){if(!v||typeof v!=='object'||seen.has(v))return out;seen.add(v);if(Array.isArray(v)){for(const x of v)collectObjects(x,seen,out);return out}out.push(v);for(const k of Object.keys(v))if(k!=='image'&&k!=='images')collectObjects(v[k],seen,out);return out}
function findProduct(d){const objs=collectObjects(d);const preferred=objs.find(usefulProduct);if(preferred)return preferred;return objs.find(o=>titleOf(o).length>=3)||null}
function buyGuide(resale,condition='Used - Good'){const r=Number(resale)||0;const rates={'New':.30,'Like New':.28,'Used - Good':.25,'Used - Fair':.23,'For Parts':.21};const recommended=rates[condition]??.25;return{conservative:Math.round(r*.21),recommended:Math.round(r*recommended),maximum:Math.round(r*.30),recommendedRate:recommended,condition};}
function normalise(data,barcode){const root=unwrap(data)||{};const p=findProduct(data);const pricing=root.pricing||data?.pricing||p?.pricing||{};const stores=[...(Array.isArray(root.stores)?root.stores:[]),...(Array.isArray(data?.stores)?data.stores:[])];const all=[p,root,data,pricing,...stores].filter(Boolean);const retailKeys=['retailPrice','newPrice','brandNewPrice','retail_price','rrp','current_price','new_price','priceNew','new'];const secondKeys=['secondHandPrice','usedPrice','marketPrice','market_price','used_price','second_hand_price','secondHand','used','priceUsed','preownedPrice','preOwnedPrice','secondHandValue','resalePrice','suggestedResale','recommendedResale'];const collect=keys=>all.flatMap(o=>keys.flatMap(k=>nums(o?.[k])));const rv=collect(retailKeys),sv=collect(secondKeys),retail=robust(rv),second=robust(sv),secondEstimated=!second&&!!retail;const resale=first(pricing,['suggestedResale','resalePrice','recommendedResale'])||second||(retail?retail*.75:0),guide=buyGuide(resale,'Used - Good');const title=titleOf(p)||titleOf(root)||'Unknown game';const image=p?.image||p?.image_url||p?.imageUrl||p?.thumbnail||p?.thumbnail_url||(Array.isArray(p?.images)?p.images[0]:'')||'';const platform=p?.platform||p?.console||p?.system||p?.consoleName||root?.platform||'';const sourceNames=[...new Set(stores.map(s=>s?.source||s?.store||s?.storeName||s?.retailer||s?.name).filter(Boolean).map(String))];if(!sourceNames.length&&p?.source)sourceNames.push(String(p.source));const count=Math.max(new Set(rv).size,new Set(sv).size,sourceNames.length);return{title,image,platform,retail,second,resale,buy:guide.recommended,buyGuide:guide,barcode,sources:stores,sourceNames,confidence:count>=4?'High':count>=2?'Medium':'Low',sampleCount:count,secondEstimated};}
async function json(url,init){const r=await nativeFetch(url,{...init,cache:'no-store',headers:{Accept:'application/json',...(init?.headers||{})}}),t=await r.text();let d;try{d=JSON.parse(t)}catch(_){throw Error('Invalid JSON (HTTP '+r.status+')')}if(!r.ok||d?.success===false)throw Error(d?.error||d?.message||('HTTP '+r.status));return d}
function barcodeVariants(code){const c=String(code||'').replace(/\D/g,'');const a=[c];if(c.length===13&&c.startsWith('0'))a.push(c.slice(1));return[...new Set(a)].filter(Boolean)}
async function workerLookup(code){let last;for(const b of barcodeVariants(code)){for(const path of ['/lookup','/api/lookup','/price','']){try{return{data:await json(WORKER+path+'?barcode='+encodeURIComponent(b)),route:path||'worker',barcode:b}}catch(e){last=e}}try{return{data:await json(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barcode:b})}),route:'worker-post',barcode:b}}catch(e){last=e}}throw last||Error('Pricing service unavailable')}
/* International fallback. UPCitemdb accepts UPC, EAN and GTIN, so EAN-13/JAN products from Europe, Japan and other regions can still be identified when the Australian pricing worker has no record. Free endpoint: 100 combined requests/day. Results are cached locally to reduce repeat calls. */
async function internationalLookup(code){
 const b=String(code||'').replace(/\D/g,'');
 if(!b)throw Error('Enter a barcode');
 const cacheKey='internationalBarcode:'+b;
 try{const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');if(cached&&cached.data&&Date.now()-Number(cached.checkedAt||0)<7*24*60*60*1000)return{data:cached.data,route:'International barcode cache',barcode:b}}catch(_){ }
 const r=await nativeFetch('https://api.upcitemdb.com/prod/trial/lookup?upc='+encodeURIComponent(b),{cache:'no-store',headers:{Accept:'application/json'}});
 const t=await r.text();let d;try{d=JSON.parse(t)}catch(_){throw Error('International barcode service returned invalid data')}
 if(!r.ok||d?.code!=='OK'||!Array.isArray(d.items)||!d.items.length)throw Error('International barcode not found');
 const item=d.items[0]||{};
 const title=titleOf(item);
 if(!usefulProduct(item))throw Error('International lookup returned no usable title');
 const category=String(item.category||'');
 const text=(title+' '+String(item.description||'')+' '+category).toLowerCase();
 let platform='';
 if(/playstation\s*5|ps5/.test(text))platform='PlayStation 5';
 else if(/playstation\s*4|ps4/.test(text))platform='PlayStation 4';
 else if(/playstation\s*3|ps3/.test(text))platform='PlayStation 3';
 else if(/xbox\s*series/.test(text))platform='Xbox Series';
 else if(/xbox\s*one/.test(text))platform='Xbox One';
 else if(/nintendo\s*switch/.test(text))platform='Nintendo Switch';
 else if(/wii\s*u/.test(text))platform='Wii U';
 else if(/wii/.test(text))platform='Wii';
 else if(/3ds/.test(text))platform='Nintendo 3DS';
 else if(/ds/.test(text))platform='Nintendo DS';
 const offers=Array.isArray(item.offers)?item.offers:[];
 const audOffers=offers.filter(o=>String(o?.currency||'').toUpperCase()==='AUD').map(o=>Number(o?.price||o?.list_price)||0).filter(x=>x>0);
 const audRetail=audOffers.length?Math.round(robust(audOffers)):0;
 const image=Array.isArray(item.images)&&item.images.length?item.images[0]:'';
 const synthetic={product:{title,image,platform,brand:item.brand||'',model:item.model||'',description:item.description||'',ean:item.ean||b,gtin:item.gtin||b,source:'International barcode database'},pricing:audRetail?{retailPrice:audRetail}: {},stores:[{source:'UPCitemdb — international EAN/GTIN',retailPrice:audRetail}],international:true,barcode:b};
 try{localStorage.setItem(cacheKey,JSON.stringify({checkedAt:Date.now(),data:synthetic}))}catch(_){ }
 return{data:synthetic,route:'International EAN/GTIN lookup',barcode:b};
}
/* Known Australian game barcode fallbacks. Used only when the worker does not return a usable title. */
const localCatalog={
 '5030917298462':{product:{title:'Diablo IV',platform:'PlayStation 5',brand:'Blizzard Entertainment'},pricing:{retailPrice:88},stores:[{source:'Australian retail reference',retailPrice:88}]},
 '5902367642372':{product:{title:'Cyberpunk 2077: Ultimate Edition',platform:'PlayStation 5',brand:'CD Projekt Red'},pricing:{retailPrice:100,suggestedResale:77},stores:[{source:'Gamesmen',retailPrice:100,marketPrice:77}]}
};
async function lookup(code){const b=String(code||'').replace(/\D/g,'');if(!b)throw Error('Enter a barcode');try{const w=await workerLookup(b);const product=findProduct(w.data);if(product&&usefulProduct(product))return w;const local=localCatalog[b];if(local)return{data:local,route:'Australian verified barcode fallback',barcode:b};try{return await internationalLookup(b)}catch(_){throw Error('No usable product title was returned for this barcode.')}}catch(e){const local=localCatalog[b];if(local)return{data:local,route:'Australian verified barcode fallback',barcode:b};try{return await internationalLookup(b)}catch(_){throw e}}}
window.BeauPricingEngine={normalise,lookup,buyGuide,version:'3.4.0'};
})();
