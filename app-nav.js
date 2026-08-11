/* Beau's Game Inventory — stable single-page mobile navigation */
(function(){
  const items=[
    ['📊','Dashboard','dashboard'],
    ['📦','Inventory','inventory'],
    ['📷','Scanner','scanner'],
    ['💰','Pricing','pricing'],
    ['🧾','Sales','sales'],
    ['⚙️','Settings','settings']
  ];
  function findPanel(type){
    if(type==='dashboard') return document.querySelector('.dashboard');
    const wanted={scanner:'📷 Barcode Scanner',inventory:'📦 Inventory',pricing:'💰 Price Comparison',settings:'💾 Backup',sales:'💰 Price Comparison'}[type];
    return [...document.querySelectorAll('.panel')].find(p=>p.querySelector('h2')?.textContent.trim()===wanted)||null;
  }
  function activate(type,scroll=true){
    document.querySelectorAll('.mobile-nav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===type));
    const target=findPanel(type);
    if(!target)return;
    if(scroll) target.scrollIntoView({behavior:'smooth',block:'start'});
    try{history.replaceState(null,'','#'+type)}catch(e){}
  }
  function mount(){
    document.querySelectorAll('.mobile-nav,.app-shell-nav').forEach(n=>n.remove());
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
