/* Pricing -> Inventory actions */
(function(){
  window.addToInventoryFromPricing=function(title,barcode,price){
    let inv=[];try{inv=JSON.parse(localStorage.getItem('resellerInventory')||'[]');if(!Array.isArray(inv))inv=[]}catch(e){inv=[]}
    barcode=String(barcode||'').trim();price=Number(price||0);title=String(title||'Scanned Product');
    let existing=inv.find(i=>String(i.barcode||'')===barcode);
    if(existing){existing.name=title||existing.name;existing.marketPrice=price;existing.selling=price*.9;alert('This barcode is already in inventory. Its pricing has been updated.');}
    else {inv.push({id:Date.now(),name:title,barcode,category:'Game',platform:'Other',condition:'Used - Good',quantity:1,cost:0,rrp:0,marketPrice:price,selling:price*.9,dateAdded:new Date().toISOString()});alert('✅ Product added to inventory.');}
    localStorage.setItem('resellerInventory',JSON.stringify(inv));
    location.href='./?added=1';
  };
})();
