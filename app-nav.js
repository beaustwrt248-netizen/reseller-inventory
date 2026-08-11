/* Beau's Game Inventory — single stable mobile navigation */
(function(){
  function mount(){
    document.querySelectorAll('.mobile-nav,.app-shell-nav').forEach((n,i)=>{ if(i>0) n.remove(); });
    let nav=document.querySelector('.mobile-nav');
    if(!nav){nav=document.createElement('nav');nav.className='mobile-nav';document.body.appendChild(nav);}
    const links=[['📊','Dashboard','./dashboard.html'],['📦','Inventory','./'],['📷','Scanner','./scanner.html'],['💰','Pricing','./pricing.html'],['🧾','Sales','./sales.html'],['⚙️','Settings','./settings.html']];
    const here=location.pathname.replace(/\/$/,'')||'/';
    nav.innerHTML=links.map(([icon,label,url])=>{const target=new URL(url,location.href).pathname.replace(/\/$/,'')||'/';const active=target===here?' active':'';return `<a class="${active}" href="${url}"><span class="icon">${icon}</span><span>${label}</span></a>`}).join('');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
