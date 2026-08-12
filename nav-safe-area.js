/* Beau's Game Inventory — safe area handling for Android, Samsung and browsers */
(function(){
  'use strict';
  const STYLE_ID='beau-native-nav-safe-style';
  function apply(){
    // Android WebView already accounts for the system navigation bar in its viewport.
    // The old 52px native fallback pushed the app nav too far upward and clipped labels.
    const fallback='0px';
    document.documentElement.style.setProperty('--app-native-bottom',fallback);
    document.documentElement.style.setProperty('--safe-bottom','env(safe-area-inset-bottom, 0px)');
    let style=document.getElementById(STYLE_ID);
    if(!style){style=document.createElement('style');style.id=STYLE_ID;document.head.appendChild(style)}
    style.textContent=`
      :root{--app-safe-bottom:max(env(safe-area-inset-bottom,0px),var(--app-native-bottom,0px));--app-nav-total:calc(var(--nav-h,72px) + var(--app-safe-bottom));}
      html{scroll-padding-bottom:calc(var(--app-nav-total) + 16px)!important;}
      body{padding-bottom:calc(var(--app-nav-total) + 16px)!important;overflow-x:hidden;}
      .mobile-nav,.nav,.app-shell-nav{bottom:var(--app-safe-bottom)!important;}
      .mobile-nav{height:var(--nav-h,72px)!important;padding:4px 4px!important;}
    `;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('resize',apply,{passive:true});
  window.addEventListener('orientationchange',apply,{passive:true});
})();
