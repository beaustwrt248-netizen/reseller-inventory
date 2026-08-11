import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'au.beau.resellerinventory',
  appName: 'Beau Reseller Inventory',
  webDir: 'www',
  server: {
    url: 'https://beaustwrt248-netizen.github.io/reseller-inventory/',
    cleartext: false
  }
};

export default config;
