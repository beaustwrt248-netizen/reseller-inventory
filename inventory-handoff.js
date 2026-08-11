/* Scan -> Pricing -> Inventory helper */
(function(){
  const q=new URLSearchParams(location.search);
  const barcode=q.get('barcode');
  const title=q.get('title');
  const price=q.get('price');
  if(!barcode)return;
  function save(){
    let inv=[];
    try{inv=JSON.parse(localStorage.getItem('resellerInventory')||'[]');if(!Array.isArray(inv))inv=[]}catch(e){inv=[]}
    const existing=inv.find(x=>String(x.barcode||'')===barcode);
    if(existing){existing.marketPrice=Number(price||existing.marketPrice||0);if(title)existing.name=title;}
    else inv.push({id:Date.now(),name:title||'Scanned Product',barcode,category:'Game',platform:'Other',condition:'Used - Good',quantity:1,cost:0,rrp:0,marketPrice:Number(price||0),selling:Number(price||0)*.9,dateAdded:new Date().toISOString()});
    localStorage.setItem('resellerInventory',JSON.stringify(inv));
    location.href='./?added=1';
  }
  window.addScannedProductToInventory=save;
})();
