/* Beau's Game Inventory — compatibility navigation shell */
(function(){
 const links=[['📊','Dashboard','./#dashboard'],['📦','Inventory','./#inventory'],['📷','Scanner','./scanner.html'],['💰','Pricing','./#pricing'],['🧾','Sales','./#sales'],['⚙️','Settings','./#settings']];
 function mount(){
  document.querySelectorAll('.mobile-nav,.app-shell-nav,.nav').forEach(n=>n.remove());
  const nav=document.createElement('nav');nav.className='mobile-nav';nav.setAttribute('aria-label','App navigation');
  const hash=(location.hash||'#dashboard').slice(1);
  nav.innerHTML=links.map(([icon,label,url])=>{const key=url.includes('#')?url.split('#')[1]:'';const active=key===hash?' active':'';return `<a class="${active}" href="${url}"><span class="icon">${icon}</span><span class="label">${label}</span></a>`}).join('');
  document.body.appendChild(nav);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
