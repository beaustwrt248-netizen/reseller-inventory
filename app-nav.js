/* Beau's Game Inventory — stable single-page mobile navigation + real Settings */
(function(){
  const items=[
    ['📊','Dashboard','dashboard'],['📦','Inventory','inventory'],['📷','Scanner','scanner'],
    ['💰','Pricing','pricing'],['🧾','Sales','sales'],['⚙️','Settings','settings']
  ];
  function ensureSettings(){
    if(document.getElementById('appSettingsPanel')) return;
    const container=document.querySelector('.container'); if(!container) return;
    const panel=document.createElement('section');
    panel.className='panel'; panel.id='appSettingsPanel';
    panel.innerHTML=`<h2>⚙️ Settings</h2>
      <p>Manage updates, appearance and app information.</p>
      <div class="price-box"><h3>🔄 App Updates</h3>
        <p id="settingsVersion">Current version: checking…</p>
        <p id="settingsUpdateStatus" class="source-note">Check for the latest web app version without reinstalling the APK.</p>
        <div class="actions"><button class="primary" id="settingsCheckUpdates">🔎 Check for Updates</button><button class="primary" id="settingsLoadUpdate" style="display:none">⬇️ Load Latest Version</button></div>
      </div>
      <div class="price-box"><h3>🎨 Appearance</h3>
        <p>Choose whether the app uses light or dark mode.</p>
        <div class="actions"><button class="secondary" id="settingsThemeToggle">🌙 Toggle Dark Mode</button></div>
      </div>
      <div class="price-box"><h3>📱 App Information</h3>
        <div class="price-row"><span>App</span><strong>Beau's Game Inventory</strong></div>
        <div class="price-row"><span>Navigation</span><strong>6-section mobile layout</strong></div>
        <div class="price-row"><span>Storage</span><strong>Local device storage</strong></div>
      </div>`;
    container.appendChild(panel);
    wireSettings();
  }
  function wireSettings(){
    const check=document.getElementById('settingsCheckUpdates'),load=document.getElementById('settingsLoadUpdate'),status=document.getElementById('settingsUpdateStatus'),version=document.getElementById('settingsVersion'),theme=document.getElementById('settingsThemeToggle');
    if(!check||check.dataset.wired)return;
    check.dataset.wired='1';
    const current=window.BeauUpdate?.version||'1.6.4'; version.textContent='Current version: v'+current;
    check.onclick=async()=>{status.textContent='Checking for the latest version…';load.style.display='none';try{const d=await window.BeauUpdate.check();version.textContent='Current version: v'+d.current;if(d.available){status.textContent='✨ Update available: v'+d.latest+(d.notes?' — '+d.notes:'');load.style.display='inline-block'}else status.textContent='✅ You are running the latest version.'}catch(e){status.textContent='⚠️ Could not check for updates. Please try again.'}};
    load.onclick=()=>window.BeauUpdate?.reloadLatest();
    theme.onclick=()=>{document.body.classList.toggle('dark-mode');localStorage.setItem('beauDarkMode',document.body.classList.contains('dark-mode')?'1':'0');};
    if(localStorage.getItem('beauDarkMode')==='1')document.body.classList.add('dark-mode');
  }
  function findPanel(type){
    ensureSettings();
    if(type==='dashboard') return document.querySelector('.dashboard');
    const wanted={scanner:'📷 Barcode Scanner',inventory:'📦 Inventory',pricing:'💰 Price Comparison',settings:'⚙️ Settings',sales:'💰 Price Comparison'}[type];
    if(type==='settings') return document.getElementById('appSettingsPanel');
    return [...document.querySelectorAll('.panel')].find(p=>p.querySelector('h2')?.textContent.trim()===wanted)||null;
  }
  function activate(type,scroll=true){
    ensureSettings();
    document.querySelectorAll('.mobile-nav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===type));
    const target=findPanel(type); if(!target)return;
    if(scroll) target.scrollIntoView({behavior:'smooth',block:'start'});
    try{history.replaceState(null,'','#'+type)}catch(e){}
  }
  function mount(){
    document.querySelectorAll('.mobile-nav,.app-shell-nav').forEach(n=>n.remove());
    ensureSettings();
    const nav=document.createElement('nav');nav.className='mobile-nav';nav.setAttribute('aria-label','App navigation');
    nav.innerHTML=items.map(([icon,label,key])=>`<button type="button" data-screen="${key}" aria-label="${label}"><span class="icon">${icon}</span><span class="label">${label}</span></button>`).join('');
    document.body.appendChild(nav);
    nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>activate(b.dataset.screen,true)));
    let initial=(location.hash||'').slice(1);if(!items.some(x=>x[2]===initial))initial='dashboard';
    activate(initial,false);
    window.BeauNavigation={activate};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
