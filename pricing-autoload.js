/* Automatically run Pricing lookup when Scanner passes ?barcode=... */
(function(){
  const barcode=new URLSearchParams(location.search).get('barcode');
  if(!barcode)return;
  const field=document.getElementById('barcode');
  const button=document.getElementById('lookup');
  if(!field||!button)return;
  field.value=barcode;
  setTimeout(()=>button.click(),150);
})();
