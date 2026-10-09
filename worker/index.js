import { createMarketService, createAPI } from '../server/market.js';
const service=createMarketService((url,options)=>fetch(url,{...options,cf:{cacheTtl:55,cacheEverything:true}}));
let handle;
export default {
  fetch(request,env) {
    const origins=(env.ALLOWED_ORIGINS || 'https://jayden-ff.github.io').split(',').map(s=>s.trim()).filter(Boolean);
    handle ||= createAPI(service,{allowedOrigins:origins});
    return handle(request,request.headers.get('CF-Connecting-IP') || '');
  },
};
