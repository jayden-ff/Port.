import { fetch, EnvHttpProxyAgent } from 'undici';
import { createMarketService, createAPI } from './market.js';
export { normalizeFeed } from './market.js';
const dispatcher = new EnvHttpProxyAgent();
const service = createMarketService((url,options)=>fetch(url,{...options,dispatcher}));
const allowedOrigins=['https://jayden-ff.github.io','http://localhost:5173','http://127.0.0.1:5173','http://localhost:4173','http://127.0.0.1:4173',...(process.env.ALLOWED_ORIGINS||'').split(',').filter(Boolean)];
const handle = createAPI(service,{allowedOrigins});
export async function apiRouter(req,res,next) {
  if(!new URL(req.url,'http://localhost').pathname.startsWith('/api/')) return next?.();
  const response=await handle(new Request(new URL(req.url,'http://localhost'),{method:req.method,headers:req.headers}),req.socket?.remoteAddress);
  res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(await response.text());
}
