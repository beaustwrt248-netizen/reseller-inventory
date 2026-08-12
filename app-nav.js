/* Beau's Game Inventory v1.9.2 — one navigation shell for every screen */
(function(){
'use strict';
const items=[['📊','Dashboard','dashboard'],['📦','Inventory','inventory'],['📷','Scanner','scanner'],['💰','Pricing','pricing'],['🧾','Sales','sales'],['⚙️','Settings','settings']];
function load(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;document.head.appendChild(s)}
function pageMap(){return {dashboard:'page-dashboard',inventory:'page-inventory',scanner:'page-scanner',pricing:'page-pricing',sales:'page-sales',settings:'page-settings'}}
function pageForPanel(panel){
 const t=(panel.querySelector('h2')?.textContent||'').trim().toLowerCase();
 if(t.includes('barcode scanner')||t.includes('scanner'))return 'scanner';
 if(t.includes('quick sale')||t.includes('sales history')||t.includes('record sale')||t==='sales'||t.includes('sell inventory'))return 'sales';
 if(t.includes('price comparison')||t.includes('pricing')||t.includes('market price'))return 'pricing';
 if(t.includes('backup')||t.includes('settings')||t.includes('appearance')||t.includes('updates'))return 'settings';
 if(t.includes('add / edit item')||t==='📦 inventory'||t.includes('inventory'))return 'inventory';
 return null;
}
function getContainer(){return document.querySelector('.container')}
function buildPages(){
 const c=getContainer();if(!c)return;
 if(c.querySelector(':scope > .app-page'))return;
 const d=c.querySelector(':scope > .dashboard');
 const pages={dashboard:[],inventory:[],scanner:[],pricing:[],sales:[],settings:[]};
 if(d)pages.dashboard.push(d);
 [...c.querySelectorAll(':scope > .panel')].forEach(p=>{const k=pageForPanel(p);if(k)pages[k].push(p)});
 Object.entries(pages).forEach(([k,els])=>{
   const p=document.createElement('main');p.className='app-page';p.id='page-'+k;
   els.forEach(e=>p.appendChild(e));c.appendChild(p);
 });
}
function moveNewPanels(){
 const c=getContainer();if(!c)return;
 const pages=pageMap();
 [...c.querySelectorAll(':scope > .panel')].forEach(panel=>{
   const k=pageForPanel(panel);if(k&&document.getElementById(pages[k]))document.getElementById(pages[k]).appendChild(panel);
 });
}
function watchDynamicPanels(){
 const c=getContainer();if(!c||c.dataset.navObserver)return;
 c.dataset.navObserver='1';
 const observer=new MutationObserver(()=>moveNewPanels());
 observer.observe(c,{childList:true,subtree:false});
}
function ensureSettings(){
 const p=document.getElementById('page-settings');if(!p)return;
 if(!document.getElementById('appSettingsPanel')){
  const s=document.createElement('section');s.className='panel';s.id='appSettingsPanel';
  s.innerHTML='<h2>⚙️ Settings</h2><p>Manage updates, appearance, backup and administration.</p><div class="price-box"><h3>🔄 App Updates</h3><p id="settingsVersion">Current version: checking…</p><p id="settingsUpdateStatus">Check for the latest web app version.</p><div class="actions"><button class="primary" id="settingsCheckUpdates">🔎 Check for Updates</button><button class="primary" id="settingsLoadUpdate" style="display:none">⬇️ Load Latest Version</button></div></div><div class="price-box"><h3>🎨 Appearance</h3><button class="secondary" id="settingsThemeToggle">🌙 Toggle Dark Mode</button></div><div class="price-box"><h3>📱 App Information</h3><div class="price-row"><span>App</span><strong>Beau\'s Game Inventory</strong></div><div class="price-row"><span>Version</span><strong>v1.9.2</strong></div></div>';
  p.appendChild(s);
 }
 wireSettings();
 load('beauAdminPanel','./admin-panel.js?v=1.9.2');
 if(!document.getElementById('beauAdminCss')){const l=document.createElement('link');l.id='beauAdminCss';l.rel='stylesheet';l.href='./admin-panel.css?v=1.9.2';document.head.appendChild(l)}
}
function wireSettings(){
 const c=document.getElementById('settingsCheckUpdates'),l=document.getElementById('settingsLoadUpdate'),st=document.getElementById('settingsUpdateStatus'),v=document.getElementById('settingsVersion'),th=document.getElementById('settingsThemeToggle');
 if(!c||c.dataset.wired)return;c.dataset.wired='1';
 v.textContent='Current version: v'+(window.BeauUpdate?.version||'1.9.2');
 c.onclick=async()=>{st.textContent='Checking for the latest version…';l.style.display='none';try{const d=await window.BeauUpdate.check();v.textContent='Current version: v'+d.current;if(d.available){st.textContent='✨ Update available: v'+d.latest+(d.notes?' — '+d.notes:'');l.style.display='inline-block'}else st.textContent='✅ You are running the latest version.'}catch(e){st.textContent='⚠️ Could not check for updates.'}};
 l.onclick=()=>window.BeauUpdate?.reloadLatest();
 th.onclick=()=>{const on=!document.body.classList.contains('dark-mode');document.body.classList.toggle('dark-mode',on);localStorage.setItem('beauDarkMode',on?'1':'0');localStorage.setItem('resellerDarkMode',on?'1':'0')};
 if(localStorage.getItem('beauDarkMode')==='1'||localStorage.getItem('resellerDarkMode')==='1')document.body.classList.add('dark-mode');
}
function activate(k,transition){
 buildPages();moveNewPanels();ensureSettings();
 if(!items.some(x=>x[2]===k))k='dashboard';
 document.querySelectorAll('.mobile-nav button').forEach(b=>{const active=b.dataset.screen===k;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false')});
 document.querySelectorAll('.app-page').forEach(p=>p.classList.toggle('active',p.id==='page-'+k));
 const p=document.getElementById('page-'+k);
 if(transition&&p){p.classList.remove('page-enter');void p.offsetWidth;p.classList.add('page-enter')}
 window.scrollTo({top:0,left:0,behavior:'auto'});
 try{history.replaceState(null,'','#'+k)}catch(e){}
}
function mount(){
 buildPages();ensureSettings();watchDynamicPanels();
 /* Remove every legacy navigation bar before mounting the single one. */
 document.querySelectorAll('.mobile-nav,.app-shell-nav,.nav').forEach(n=>n.remove());
 const n=document.createElement('nav');n.className='mobile-nav';n.setAttribute('aria-label','App navigation');
 n.innerHTML=items.map(x=>`<button type="button" data-screen="${x[2]}" aria-label="${x[1]}"><span class="icon" aria-hidden="true">${x[0]}</span><span class="label">${x[1]}</span></button>`).join('');
 document.body.appendChild(n);
 n.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
   const k=b.dataset.screen;
   if(k==='scanner'){window.location.href='./scanner.html';return;}
   activate(k,true);
 }));
 let k=(location.hash||'').slice(1);if(!items.some(x=>x[2]===k)||k==='scanner')k='dashboard';
 activate(k,false);
 window.addEventListener('hashchange',()=>{let h=(location.hash||'').slice(1);if(h==='scanner'){location.href='./scanner.html';return}if(items.some(x=>x[2]===h))activate(h,false)});
 window.BeauNavigation={activate};
 load('beauNavSafeArea','./nav-safe-area.js?v=1.9.2');
 load('beauSmartToolsScript','./smart-reseller.js?v=1.9.2');
 load('beauSmartScanScript','./smart-scan.js?v=1.9.2');
 load('beauSmartScanCss','./smart-scan.css?v=1.9.2');
 load('beauPriceComparisonCleanup','./price-comparison-cleanup.js?v=1.9.2');
 load('beauProToolsScript','./pro-tools.js?v=1.9.2');
 load('beauWelcomeCss','./welcome-tutorial.css?v=1.9.2');
 load('beauWelcomeTutorial','./welcome-tutorial.js?v=1.9.2');
 load('beauNavLayoutFix','./navigation-layout-fix.css?v=1.9.2');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
