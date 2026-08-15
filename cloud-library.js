const CLOUD_LIBRARY={
 url:'https://ccdqmncjpywhpnrajfit.supabase.co',
 key:'sb_publishable_VNuSfZizVdNhbHAPkbBPbw_YYWoqVFH',
 async find(barcode){
  const b=String(barcode||'').replace(/\D/g,'');
  if(!b)return null;
  const r=await fetch(`${this.url}/rest/v1/game_library?select=*&barcode=eq.${encodeURIComponent(b)}&limit=1`,{headers:{apikey:this.key,Authorization:`Bearer ${this.key}`} ,cache:'no-store'});
  if(!r.ok)return null;
  const rows=await r.json();
  return rows[0]||null;
 },
 async learn(game){
  if(!game?.barcode||!game?.title)return false;
  const body={barcode:String(game.barcode).replace(/\D/g,''),title:String(game.title),platform:game.platform||'',region:game.region||'',resale:Number(game.resale)||0,retail:Number(game.retail)||0,image_url:game.image_url||null,source:game.source||'App learned'};
  if(body.barcode.length<8||body.barcode.length>14)return false;
  const r=await fetch(`${this.url}/rest/v1/game_library?on_conflict=barcode`,{method:'POST',headers:{apikey:this.key,Authorization:`Bearer ${this.key}`,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(body)});
  return r.ok;
 },
 async syncLocal(){
  const local=Array.isArray(window.library)?window.library:[];
  for(const game of local)try{await this.learn(game)}catch{}
  return local.length;
 }
};
window.CloudLibrary=CLOUD_LIBRARY;
async function cloudLibraryLookup(barcode){try{return await CLOUD_LIBRARY.find(barcode)}catch{return null}}
async function cloudLibraryLearn(game){try{return await CLOUD_LIBRARY.learn(game)}catch{return false}}
window.cloudLibraryLookup=cloudLibraryLookup;
window.cloudLibraryLearn=cloudLibraryLearn;
