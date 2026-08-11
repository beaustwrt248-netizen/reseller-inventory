import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId:'com.beausgames.inventory',
  appName:"Beau's Game Inventory",
  webDir:'www',
  server:{
    androidScheme:'https',
    url:'https://beaustwrt248-netizen.github.io/reseller-inventory/',
    cleartext:false
  }
};
export default config;
