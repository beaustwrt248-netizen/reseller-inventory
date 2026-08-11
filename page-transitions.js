/* Beau's Game Inventory — smooth mobile screen transitions */
(function(){
  var STYLE_ID='beau-page-transition-style';
  if(!document.getElementById(STYLE_ID)){
    var s=document.createElement('style'); s.id=STYLE_ID;
    s.textContent=`
      :root{--page-transition-ms:220ms}
      body{opacity:0;transform:translateY(5px);transition:opacity var(--page-transition-ms) ease,transform var(--page-transition-ms) ease}
      body.beau-page-ready{opacity:1;transform:none}
      body.beau-page-leaving{opacity:0;transform:translateY(-5px);pointer-events:none}
      @media(prefers-reduced-motion:reduce){body{transition:none!important;transform:none!important}}
    `;
    (document.head||document.documentElement).appendChild(s);
  }
  function ready(){requestAnimationFrame(function(){document.body.classList.add('beau-page-ready')})}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready,{once:true}); else ready();
  document.addEventListener('click',function(e){
    var a=e.target.closest && e.target.closest('a[href]');
    if(!a || e.defaultPrevented || a.target==='_blank' || a.hasAttribute('download')) return;
    var href=a.getAttribute('href');
    if(!href || href.charAt(0)==='#' || /^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;
    var url;
    try{url=new URL(href,location.href)}catch(_){return}
    if(url.origin!==location.origin) return;
    e.preventDefault();
    document.body.classList.remove('beau-page-ready');
    document.body.classList.add('beau-page-leaving');
    setTimeout(function(){location.href=url.href},220);
  },true);
})();
