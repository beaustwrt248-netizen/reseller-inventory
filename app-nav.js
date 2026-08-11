/* Beau's Game Inventory shared mobile navigation */
(function(){
  const nav=document.createElement('nav');
  nav.className='mobile-nav';
  nav.innerHTML=`
    <a href="./dashboard.html"><span class="icon">📊</span>Dashboard</a>
    <a href="./"><span class="icon">📦</span>Inventory</a>
    <a href="./pricing.html"><span class="icon">💰</span>Pricing</a>
    <a href="./#reader"><span class="icon">📷</span>Scanner</a>`;
  document.body.appendChild(nav);
})();
