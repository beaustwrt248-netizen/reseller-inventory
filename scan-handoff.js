/* Scanner -> Pricing hand-off */
function openPricingForBarcode(barcode){
  const b=String(barcode||'').trim();
  if(!b)return;
  window.location.href='./pricing.html?barcode='+encodeURIComponent(b);
}
