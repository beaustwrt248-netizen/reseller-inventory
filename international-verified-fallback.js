/* Beau's Reseller Hub — verified international game fallbacks */
(function(){
  'use strict';
  const VERIFIED = {
    '5016488130806': {
      product: {
        title: 'Extinction',
        platform: 'PlayStation 4',
        region: 'PAL/EU',
        barcodeType: 'EAN-13',
        description: 'Extinction for PlayStation 4, PAL/EU release.',
        source: 'Verified international barcode reference'
      },
      pricing: {
        resalePrice: 8,
        secondHandPrice: 8
      },
      stores: [{
        source: 'EB Games Australia — preowned reference',
        secondHandPrice: 8
      }],
      international: true
    }
  };

  const original = window.BeauPricingEngine;
  if (!original || typeof original.lookup !== 'function') return;

  const lookup = original.lookup.bind(original);
  window.BeauPricingEngine = {
    ...original,
    async lookup(code){
      const b = String(code || '').replace(/\D/g, '');
      if (VERIFIED[b]) return { data: VERIFIED[b], route: VERIFIED[b].product.source, barcode: b };
      return lookup(code);
    }
  };
})();
