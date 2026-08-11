/* Beau's Game Inventory — single stable navigation shell */
(function(){
 const links=[['📊','Dashboard','./dashboard.html'],['📦','Inventory','./'],['📷','Scanner','./scanner.html'],['💰','Pricing','./pricing.html'],['🧾','Sales','./sales.html'],['⚙️','Settings','./settings.html']];
 function mount(){
  document.querySelectorAll('.mobile-nav,.app-shell-nav').forEach(n=>n.remove());
  const nav=document.createElement('nav');nav.className='app-shell-nav';
  const here=location.pathname.replace(/\/$/,'')||'/';
  nav.innerHTML=links.map(([icon,label,url])=>{const target=new URL(url,location.href).pathname.replace(/\/$/,'')||'/';const active=target===here?' active':'';return `<a class="${active}" href="${url}"><span>${icon}</span>${label}</a>`}).join('');
  document.body.appendChild(nav);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
