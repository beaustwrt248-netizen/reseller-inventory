/* Beau's Game Inventory — mobile app-style layout */
(function(){
  function init(){
    if(document.getElementById('beau-mobile-nav')) return;
    const isMobile=()=>window.matchMedia('(max-width:700px)').matches;
    const container=document.querySelector('.container');
    if(!container) return;
    const panels=[...container.querySelectorAll(':scope > .panel')];
    if(panels.length<5) return;
    const dashboard=container.querySelector(':scope > .dashboard');
    const scanner=panels[0], editor=panels[1], pricing=panels[2], inventory=panels[3], backup=panels[4];
    scanner.id='screen-scan'; editor.id='screen-edit'; pricing.id='screen-pricing'; inventory.id='screen-inventory'; backup.id='screen-more';
    if(dashboard) dashboard.id='screen-home';
    const nav=document.createElement('nav'); nav.id='beau-mobile-nav'; nav.className='mobile-nav'; nav.setAttribute('aria-label','Main navigation');
    const items=[['home','⌂','Home'],['inventory','▣','Inventory'],['scan','⌕','Scan'],['pricing','◈','Pricing'],['more','☰','More']];
    nav.innerHTML=items.map(([id,icon,label])=>`<a href="#screen-${id}" data-screen="${id}"><span class="icon">${icon}</span><span>${label}</span></a>`).join('');
    document.body.appendChild(nav);
    const screens={home:[dashboard],inventory:[inventory,editor],scan:[scanner],pricing:[pricing],more:[backup]};
    let active='home';
    function show(name,updateHash=true){
      if(!isMobile()) return;
      active=name;
      Object.entries(screens).forEach(([key,els])=>els.forEach(el=>{if(el) el.classList.toggle('mobile-screen-hidden',key!==name)}));
      nav.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.dataset.screen===name));
      if(name==='inventory') editor.classList.add('mobile-secondary-panel');
      window.scrollTo({top:0,behavior:'smooth'});
      if(updateHash) history.replaceState(null,'','#screen-'+name);
    }
    nav.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();show(a.dataset.screen)});
    function resize(){
      if(isMobile()){
        const hash=location.hash.replace('#screen-','');
        show(screens[hash]?hash:'home',false);
      }else{
        Object.values(screens).flat().forEach(el=>el&&el.classList.remove('mobile-screen-hidden','mobile-secondary-panel'));
      }
    }
    window.addEventListener('resize',resize,{passive:true});
    resize();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
