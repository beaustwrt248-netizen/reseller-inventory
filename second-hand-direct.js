/* Direct second-hand panel — compact site result cards, robust search identity. */
(function(){'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const money=v=>Number(v)>0?'$'+Number(v).toFixed(2):'—';
  const query=(title,platform)=>[title,platform].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  const urls=q=>({cash:'https://www.cashconverters.com.au/search-results?query='+encodeURIComponent(q),ebay:'https://www.ebay.com.au/sch/i.html?_nkw='+encodeURIComponent(q)+'&LH_Sold=1&LH_Complete=1',superRetro:'https://superretro.com.au/search?q='+encodeURIComponent(q)});
  const verified={'5016488130837':{title:'Extinction',platform:'Xbox One',sites:{'Cash Converters':{average:10,count:1},'eBay Sold':{average:11.35,count:1},'Super Retro':null}}};
  const siteMeta={'Cash Converters':{icon:'💵'},'eBay Sold':{icon:'🏷️'},'Super Retro':{icon:'🕹️'}};

  function normaliseSearchIdentity(title,platform){
    let t=String(title||'').replace(/\s+/g,' ').trim();
    let p=String(platform||'').replace(/\s+/g,' ').trim();

    // Clean common retail/edition noise from the search phrase.
    const explicit=t.match(/\((PS[2345]|PSP|PS\s*Vita|Xbox(?:\s+One|\s+360|\s+Series(?:\s+[XS])?)?|Nintendo\s+Switch|Wii(?:\s+U)?|3DS|DS)\)/i);
    const inferred=explicit?.[1]?.replace(/\s+/g,' ').trim();
    if(inferred && (!p || /^other$/i.test(p)))p=inferred;

    // Known title cleanup: remove duplicate subtitle/brand text and Platinum edition label.
    if(/simpsons/i.test(t)&&/hit\s*(?:&|and)\s*run/i.test(t)){
      t='The Simpsons Hit and Run';
      p=/ps\s*2/i.test(inferred||p)?'PS2':(p&&!/^other$/i.test(p)?p:'PS2');
    }else{
      t=t.replace(/\s*\((?:Platinum|Classics|Essentials|Greatest Hits|Special Edition|Limited Edition)[^)]*\)\s*$/i,'');
      t=t.replace(/\s+Platinum(?:\s+Edition)?\b/ig,'');
      t=t.replace(/\s*\(([^)]*)\)\s*$/g,(m,inside)=>/^(PS[2345]|PSP|PS\s*Vita|Xbox|Nintendo|Wii|3DS|DS)/i.test(inside.trim())?'':m);
    }
    if(/^other$/i.test(p))p='';
    return{title:t,platform:p};
  }

  function parseResult(){
    const host=document.getElementById('scanResult');
    if(!host)return null;
    const text=(host.innerText||host.textContent||'').replace(/\u00a0/g,' ');
    const marker=text.match(/(?:·|•)\s*Barcode\s*(\d{8,14})/i);
    if(!marker)return null;
    const barcode=marker[1].replace(/\D/g,'');
    const before=text.slice(0,marker.index).replace(/\r/g,'');
    const lines=before.split(/\n+/).map(s=>s.trim()).filter(Boolean).filter(s=>!/^🎮?\s*Result$/i.test(s));
    if(!lines.length)return null;
    const platformMatch=before.match(/(?:^|\n)([^\n]+?)\s*$/);
    const platform=(platformMatch?.[1]||'').replace(/^🎮\s*/,'').trim();
    let titleLines=lines.slice();
    if(titleLines.length>1 && titleLines[titleLines.length-1]===platform)titleLines=titleLines.slice(0,-1);
    const title=titleLines.join(' ').replace(/^🎮\s*/,'').replace(/\s+/g,' ').trim();
    return {host,title,platform,barcode};
  }

  function render(){
    const p=parseResult();if(!p||!p.title)return false;
    const host=p.host;const old=document.getElementById('secondHandDirectPanel');if(old)old.remove();
    const v=verified[p.barcode];
    const rawTitle=v?.title||p.title,rawPlatform=v?.platform||p.platform;
    const identity=normaliseSearchIdentity(rawTitle,rawPlatform);
    const title=identity.title,platform=identity.platform,q=query(title,platform),links=urls(q);
    const sites=v?.sites||{'Cash Converters':null,'eBay Sold':null,'Super Retro':null};
    const values=Object.values(sites).filter(Boolean).map(x=>Number(x.average)).filter(n=>Number.isFinite(n)&&n>0);
    const overall=values.length?values.reduce((a,b)=>a+b,0)/values.length:0;
    const buy10=overall*.10,buy20=overall*.20,buy25=overall*.25,buy30=overall*.30,buy40=overall*.40;
    const siteCard=(name,data)=>{const m=siteMeta[name]||{icon:'🔎'};const href=name==='Cash Converters'?links.cash:name==='eBay Sold'?links.ebay:links.superRetro;return '<a class="sh-site" href="'+href+'" target="_blank" rel="noopener"><div class="sh-site-icon">'+m.icon+'</div><div class="sh-site-main"><div class="sh-site-name">'+esc(name)+'</div><div class="sh-site-label">Site average</div></div><div class="sh-site-value">'+(data?money(data.average):'—')+'</div></a>'};
    const panel=document.createElement('div');panel.id='secondHandDirectPanel';panel.className='result';
    panel.innerHTML='<div class="sh-head"><div><h3>♻️ Second-Hand Pricing</h3><div class="sh-sub">'+esc(title)+' · '+esc(platform||'Unknown console')+'</div></div><div class="sh-query">🔎 '+esc(q||title)+'</div></div>'+ 
      '<div class="sh-sites">'+siteCard('Cash Converters',sites['Cash Converters'])+siteCard('eBay Sold',sites['eBay Sold'])+siteCard('Super Retro',sites['Super Retro'])+'</div>'+ 
      '<div class="sh-overall"><span>Overall site average</span><strong>'+money(overall)+'</strong></div>'+ 
      '<div class="buygrid sh-buygrid"><div class="buy"><span>10% EXCELLENT</span><strong>'+money(buy10)+'</strong></div><div class="buy"><span>20% VERY GOOD</span><strong>'+money(buy20)+'</strong></div><div class="buy recommended"><span>25% RECOMMENDED ⭐</span><strong>'+money(buy25)+'</strong></div><div class="buy"><span>30% TARGET</span><strong>'+money(buy30)+'</strong></div><div class="buy"><span>40% MAXIMUM</span><strong>'+money(buy40)+'</strong></div></div>'+ 
      '<div class="row sh-deal-row"><label>Seller asking price<input id="secondHandDirectAsking" class="input" type="number" min="0" step="1" placeholder="Enter listing price"></label><button id="secondHandDirectDeal" class="btn primary">⚡ Check Deal</button></div>'+ 
      '<div id="secondHandDirectDecision" class="muted sh-decision">Enter a seller price to get BUY / MAYBE / PASS.</div>';
    const style=document.createElement('style');style.textContent='.sh-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}.sh-head h3{margin:0 0 4px}.sh-sub{font-size:12px;color:#666}.sh-query{font-size:11px;background:#fff;border:1px solid #ddd;border-radius:999px;padding:7px 10px;max-width:48%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sh-sites{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}.sh-site{display:flex;align-items:center;gap:9px;padding:10px 11px;border:1px solid #ddd;border-radius:14px;background:#fff;color:inherit;text-decoration:none;min-width:0}.sh-site:hover{border-color:#bbb;transform:translateY(-1px)}.sh-site-icon{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:#f2f2f5;flex:0 0 32px;font-size:16px}.sh-site-main{min-width:0}.sh-site-name{font-size:11px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sh-site-label{font-size:9px;color:#777;margin-top:2px}.sh-site-value{margin-left:auto;font-weight:950;font-size:16px;white-space:nowrap}.sh-overall{display:flex;justify-content:space-between;align-items:center;padding:11px 12px;margin:4px 0 10px;background:#fff;border:1px solid #ddd;border-radius:14px}.sh-overall span{font-size:11px;color:#666;font-weight:800}.sh-overall strong{font-size:20px}.sh-buygrid{gap:7px;margin-top:8px}.sh-buygrid .buy{padding:10px}.sh-buygrid .buy strong{font-size:20px}.sh-deal-row{align-items:end}.sh-decision{padding-top:7px}@media(max-width:700px){.sh-head{display:block}.sh-query{display:inline-block;max-width:100%;margin-top:7px}.sh-sites{grid-template-columns:1fr}.sh-site-value{font-size:17px}}';document.head.appendChild(style);
    const asking=panel.querySelector('#secondHandDirectAsking'),btn=panel.querySelector('#secondHandDirectDeal'),decision=panel.querySelector('#secondHandDirectDecision');
    btn.onclick=()=>{const a=Number(asking.value)||0;if(!a){decision.textContent='Enter a seller price to get BUY / MAYBE / PASS.';return}let label='❌ PASS';if(overall>0&&a<=buy25)label='✅ BUY';else if(overall>0&&a<=buy40)label='🟡 MAYBE';decision.innerHTML='<b>'+label+'</b> · Asking '+money(a)+' · Recommended '+money(buy25)+' · Maximum '+money(buy40)};
    host.appendChild(panel);return true;
  }
  function tryRender(){return !!document.getElementById('secondHandDirectPanel')||render()}
  const start=()=>{tryRender();const host=document.getElementById('scanResult');if(host)new MutationObserver(()=>setTimeout(tryRender,20)).observe(host,{subtree:true,childList:true,characterData:true});let tries=0;const timer=setInterval(()=>{if(tryRender()||++tries>40)clearInterval(timer)},250)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
