/* Beau's Game Inventory — scanner + lookup hotfix v2.4.0 */
(function(){
  'use strict';
  const WORKER='https://beau-reseller-pricing.beaustwrt248.workers.dev';
  const money=v=>Number(v)>0?'$'+Number(v).toFixed(2):'Not available';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function nums(v){
    if(Array.isArray(v))return v.flatMap(nums);
    if(typeof v==='number'&&Number.isFinite(v)&&v>0)return[v];
    if(typeof v==='string'){const n=Number(v.replace(/[^0-9.]/g,''));return Number.isFinite(n)&&n>0?[n]:[]}
    return[];
  }
  function first(obj,keys){for(const k of keys){if(obj&&k in obj){const n=nums(obj[k])[0];if(n)return n}}return 0}
  function normalise(d,barcode){
    const p=d?.product||d?.products?.[0]||d?.data?.product||d?.data?.products?.[0]||d?.result?.product||d?.result?.products?.[0]||d;
    if(!p||typeof p!=='object')throw Error('No product data returned.');
    const pricing=d?.pricing||p?.pricing||{};
    const title=p.title||p.name||p.product_name||p.productName||'Game';
    const image=p.image||p.image_url||p.imageUrl||p.thumbnail||p.thumbnail_url||(Array.isArray(p.images)?p.images[0]:'')||'';
    const platform=p.platform||p.console||p.system||p.consoleName||'';
    const retail=first(pricing,['retailPrice','newPrice','brandNewPrice','rrp','retail'])||first(p,['retailPrice','newPrice','brandNewPrice','rrp','retail','priceNew','newPrice']);
    const second=first(pricing,['secondHandPrice','usedPrice','marketPrice','secondHandValue','preownedPrice','used'])||first(p,['secondHandPrice','usedPrice','marketPrice','secondHandValue','preownedPrice','used','priceUsed']);
    const resale=first(pricing,['suggestedResale','resalePrice','recommendedResale'])||second||(retail?retail*.75:0);
    const buy=first(pricing,['maximumBuy','suggestedBuy','recommendedBuy'])||(resale?resale*.70:0);
    const sourceNames=[];
    const stores=[...(Array.isArray(d?.stores)?d.stores:[]),...(Array.isArray(p?.stores)?p.stores:[])];
    stores.forEach(s=>{const n=s?.source||s?.store||s?.storeName||s?.retailer||s?.name;if(n&&!sourceNames.includes(String(n)))sourceNames.push(String(n))});
    return{title,image,platform,retail,second,resale,buy,barcode,secondEstimated:!second&&!!retail,confidence:sourceNames.length>=3?'High':sourceNames.length>=1?'Medium':'Low',sourceNames};
  }
  async function request(url,options){
    const r=await fetch(url,{...options,cache:'no-store',headers:{Accept:'application/json',...(options?.headers||{})}});
    if(!r.ok)throw Error('HTTP '+r.status);
    const text=await r.text();
    let d;try{d=JSON.parse(text)}catch(e){throw Error('Pricing service returned invalid data')}
    if(d?.success===false)throw Error(d.error||d.message||'Pricing lookup failed');
    return d;
  }
  async function lookupBarcode(code){
    code=String(code||'').replace(/\D/g,'');
    if(!code)return;
    const result=document.getElementById('barcodeResult');
    if(result)result.innerHTML='<div class="loading">🔎 Looking up barcode '+esc(code)+'…</div>';
    const urls=[WORKER+'?barcode='+encodeURIComponent(code),WORKER+'/lookup?barcode='+encodeURIComponent(code),WORKER+'/api/lookup?barcode='+encodeURIComponent(code)];
    let data=null,lastErr=null;
    for(const u of urls){try{data=await request(u);break}catch(e){lastErr=e}}
    if(!data){try{data=await request(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barcode:code})})}catch(e){lastErr=e}}
    if(!data){
      if(result)result.innerHTML='<div class="warning"><strong>Pricing lookup is temporarily unavailable.</strong><br>The barcode was read correctly, but the online pricing service did not return a result. You can try again or enter the barcode manually.<br><small>Service detail: '+esc(lastErr?.message||'Unknown error')+'</small></div>';
      return null;
    }
    let g;try{g=normalise(data,code)}catch(e){if(result)result.innerHTML='<div class="warning">The pricing service responded, but no matching game was found for barcode <strong>'+esc(code)+'</strong>.</div>';return null}
    const checkedAt=new Date().toISOString();
    if(result){
      result.innerHTML='<div class="item"><div class="item-name">'+esc(g.title)+'</div>'+(g.image?'<img class="product-image" src="'+esc(g.image)+'" alt="Game thumbnail">':'')+'<span class="badge">'+esc(g.platform||'Game')+'</span><div class="price-box"><div class="price-row"><span>🆕 Brand New</span><strong>'+money(g.retail)+'</strong></div><div class="price-row"><span>♻️ '+(g.secondEstimated?'Estimated Second-hand':'Second-hand Value')+'</span><strong>'+money(g.resale)+'</strong></div><div class="price-row"><span>💰 Estimated Buy</span><strong class="good">'+money(g.buy)+'</strong></div><div class="price-row"><span>📊 Confidence</span><strong>'+esc(g.confidence)+'</strong></div></div><div class="actions"><button class="primary" id="saveScanToLibrary">📚 Save to Library</button></div></div>';
      const save=document.getElementById('saveScanToLibrary');
      if(save)save.onclick=()=>saveLibrary(g,checkedAt);
    }
    window.lastBarcodePricing=g;
    return g;
  }
  function saveLibrary(g,checkedAt){
    let a=[];try{a=JSON.parse(localStorage.getItem('beauGameLibrary')||'[]')}catch(e){a=[]}if(!Array.isArray(a))a=[];
    const item={title:g.title,image:g.image,platform:g.platform,barcode:g.barcode,retail:g.retail,resale:g.resale,buy:g.buy,secondEstimated:g.secondEstimated,confidence:g.confidence,sourceNames:g.sourceNames,checkedAt};
    const i=a.findIndex(x=>String(x.barcode||'')===String(g.barcode||''));if(i>=0)a[i]={...a[i],...item};else a.unshift(item);localStorage.setItem('beauGameLibrary',JSON.stringify(a));
    const b=document.getElementById('saveScanToLibrary');if(b){b.textContent='✅ Saved to Library';b.disabled=true}
  }

  // ---------- Robust mobile camera scanner ----------
  let scanner=null;
  let starting=false;

  function scannerMessage(html){
    const box=document.getElementById('barcodeResult');
    if(box)box.innerHTML=html;
  }
  function scannerButton(text,disabled){
    const b=document.getElementById('startScannerButton');
    if(b){b.textContent=text;b.disabled=!!disabled}
  }
  async function stopScanner(){
    const current=scanner;
    scanner=null;
    starting=false;
    if(current){try{await current.stop()}catch(e){}try{current.clear()}catch(e){}}
    const reader=document.getElementById('reader');
    if(reader)reader.innerHTML='';
    const box=document.getElementById('scannerBox');
    if(box)box.style.display='none';
    scannerButton('📷 Start Scanner',false);
  }
  function scanSuccess(decodedText){
    const code=String(decodedText||'').trim();
    if(!code)return;
    const search=document.getElementById('barcodeSearch');
    const barcode=document.getElementById('barcode');
    if(search)search.value=code;
    if(barcode)barcode.value=code;
    scannerMessage('<div class="loading">✅ Barcode detected: <strong>'+esc(code)+'</strong><br>Looking up product and pricing…</div>');
    stopScanner().then(()=>lookupBarcode(code));
  }
  function scanFailure(_){}

  async function startScanner(){
    if(starting||scanner)return;
    starting=true;
    const box=document.getElementById('scannerBox');
    const reader=document.getElementById('reader');
    if(box)box.style.display='block';
    if(reader)reader.innerHTML='';
    scannerButton('⏳ Starting camera…',true);

    if(!window.isSecureContext){
      starting=false;scannerButton('📷 Start Scanner',false);
      scannerMessage('<div class="warning"><strong>Camera needs HTTPS.</strong><br>Open the app using the GitHub Pages HTTPS address, not a downloaded HTML file.</div>');
      return;
    }
    if(!window.Html5Qrcode){
      starting=false;scannerButton('📷 Start Scanner',false);
      scannerMessage('<div class="warning"><strong>Scanner library did not load.</strong><br>Refresh the app while connected to the internet.</div>');
      return;
    }
    if(!reader){
      starting=false;scannerButton('📷 Start Scanner',false);
      scannerMessage('<div class="warning">Scanner area is missing. Please refresh the app.</div>');
      return;
    }

    try{
      // getCameras() explicitly requests permission and gives us a real camera device ID.
      const cameras=await Html5Qrcode.getCameras();
      if(!cameras||!cameras.length)throw Error('No camera was found on this device.');
      const rear=cameras.find(c=>/back|rear|environment|world/i.test(c.label||''));
      const cameraId=(rear||cameras[0]).id;
      scanner=new Html5Qrcode('reader',{verbose:false});
      await scanner.start(
        cameraId,
        {fps:10,qrbox:{width:280,height:160},aspectRatio:1.7777778,disableFlip:false},
        scanSuccess,
        scanFailure
      );
      starting=false;
      scannerButton('📷 Scanner Running',false);
      scannerMessage('<div class="loading">📷 Camera is running. Point the <strong>rear camera</strong> at a barcode and keep it inside the scan box.</div>');
    }catch(error){
      console.error('Barcode scanner error:',error);
      await stopScanner();
      const message=String(error?.message||error?.name||error||'Unknown error');
      let help='Check that Chrome has camera permission for this site.';
      if(/permission|denied|notallowed/i.test(message))help='Camera permission was denied. In Chrome, open the site controls next to the address, allow Camera, then refresh the app.';
      else if(/secure|https/i.test(message))help='Open the app through its HTTPS GitHub Pages address.';
      else if(/no camera|notfound|overconstrained/i.test(message))help='No usable camera was detected. Close other apps using the camera and try again.';
      scannerMessage('<div class="warning"><strong>Camera could not be started.</strong><br>'+help+'<br><small>Error: '+esc(message)+'</small></div>');
    }
  }

  window.lookupBarcode=lookupBarcode;
  window.startScanner=startScanner;
  window.stopScanner=stopScanner;
  window.BeauSmartScan={lookup:lookupBarcode,startScanner,stopScanner,version:'2.4.0'};

  function wire(){
    const start=document.getElementById('startScannerButton');
    const stop=document.getElementById('stopScannerButton');
    const lookup=document.getElementById('lookupButton');
    const input=document.getElementById('barcodeSearch');
    if(start)start.onclick=startScanner;
    if(stop)stop.onclick=stopScanner;
    if(lookup)lookup.onclick=e=>{e.preventDefault();lookupBarcode(input?.value||'')};
    if(input)input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lookupBarcode(input.value)}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
