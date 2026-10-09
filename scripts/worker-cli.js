import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
// Keep CLI state in the project when running in a restricted cloud workspace.
const result=spawnSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),...process.argv.slice(2)],{
  stdio:'inherit',env:{...process.env,XDG_CONFIG_HOME:process.env.XDG_CONFIG_HOME || resolve('.wrangler/config'),WRANGLER_SEND_METRICS:'false'},
});
if(result.error)throw result.error;
process.exit(result.status ?? 1);
