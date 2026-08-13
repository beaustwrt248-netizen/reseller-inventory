/* Beau's Reseller Hub — Stock Editor 1.0
   Adds safer in-place inventory editing without replacing unrelated item data. */
(function(){'use strict';
  function el(id){return document.getElementById(id)}
  function getInventory(){try{const x=JSON.parse(localStorage.getItem('resellerInventory')||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
  function saveInventory(items){localStorage.setItem('resellerInventory',JSON.stringify(items));if(typeof window.renderAll==='function')window.renderAll();else if(typeof window.renderInventory==='function')window.renderInventory()}
  window.saveInventoryEdit=function(){
    const name=(el('eName').value||'').trim()||'Unnamed Game';
    const barcode=(el('eBarcode').value||'').trim();
    const platform=el('ePlatform').value||'Other';
    const condition=el('eCondition').value||'Used - Good';
    const qty=Math.max(1,Math.floor(Number(el('eQty').value)||1));
    const rawCost=(el('eCost').value||'').trim();
    if(rawCost===''){if(typeof window.toast==='function')window.toast('Enter the actual purchase price before saving');el('eCost').focus();return}
    const cost=Number(rawCost);
    if(!Number.isFinite(cost)||cost<0){if(typeof window.toast==='function')window.toast('Purchase price must be a valid amount');el('eCost').focus();return}
    const market=Math.round(Number(el('eMarket').value)||0),sell=Math.round(Number(el('eSell').value)||0);
    const id=window.editingId||null;
    const inventory=getInventory();
    if(id){
      const index=inventory.findIndex(x=>String(x.id)===String(id));
      if(index<0){if(typeof window.toast==='function')window.toast('Stock item no longer exists');return}
      inventory[index]={...inventory[index],name,barcode,platform,condition,qty,cost:Math.round(cost),market,sell};
    }else{
      inventory.push({id:String(Date.now()),name,barcode,platform,condition,qty,cost:Math.round(cost),market,sell,dateAdded:new Date().toISOString(),sales:[]});
    }
    saveInventory(inventory);
    if(typeof window.closeEdit==='function')window.closeEdit();
    if(typeof window.toast==='function')window.toast('Stock saved');
  };
  window.editInventory=function(id){
    const inventory=getInventory();
    const item=inventory.find(x=>String(x.id)===String(id));
    if(!item){if(typeof window.toast==='function')window.toast('Stock item not found');return}
    window.editingId=item.id;
    el('editTitle').textContent='Edit Stock Item';
    el('eName').value=item.name||'';
    el('eBarcode').value=item.barcode||'';
    el('ePlatform').value=item.platform||'Other';
    el('eCondition').value=item.condition||'Used - Good';
    el('eQty').value=Math.max(1,Number(item.qty||item.quantity)||1);
    el('eCost').value=Number(item.cost)||0;
    el('eMarket').value=Number(item.market||item.marketPrice)||0;
    el('eSell').value=Number(item.sell||item.selling)||0;
    el('editModal').classList.add('show');
  };
  window.openInventoryEdit=function(item){
    window.editingId=item&&item.id?item.id:null;
    el('editTitle').textContent=window.editingId?'Edit Stock Item':'Add Stock Item';
    el('eName').value=item&&item.name||'';
    el('eBarcode').value=item&&item.barcode||'';
    el('ePlatform').value=item&&item.platform||'Other';
    el('eCondition').value=item&&item.condition||'Used - Good';
    el('eQty').value=item&&Math.max(1,Number(item.qty||item.quantity)||1)||1;
    el('eCost').value=item&&item.cost!=null?item.cost:'';
    el('eMarket').value=item&&Number(item.market||item.marketPrice)||0;
    el('eSell').value=item&&Number(item.sell||item.selling)||0;
    el('editModal').classList.add('show');
  };
})();
