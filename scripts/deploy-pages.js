import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, cpSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const source = resolve('.');
const dist = resolve('dist');
if (!existsSync(join(dist, 'index.html'))) throw new Error('Zuerst npm run build:pages ausführen.');
function git(args, cwd=source, allowFailure=false) {
  const result=spawnSync('git',args,{cwd,encoding:'utf8'});
  if (result.error) throw result.error;
  if (result.status && !allowFailure) throw new Error(result.stderr || result.stdout || 'Git-Befehl fehlgeschlagen.');
  return result;
}
const remote=git(['remote','get-url','origin']).stdout.trim();
const parsed=new URL(remote);
if(parsed.protocol !== 'https:' || parsed.hostname !== 'github.com' || parsed.username || parsed.password || parsed.pathname !== '/jayden-ff/Port..git') {
  throw new Error('Diese Veröffentlichung ist für https://github.com/jayden-ff/Port..git vorbereitet. Remote zuerst prüfen.');
}
const temp=mkdtempSync(join(tmpdir(),'port-pages-'));
try {
  const branch=git(['ls-remote','--heads','origin','gh-pages']).stdout.trim();
  if (branch) {
    git(['clone','--single-branch','--branch','gh-pages',remote,temp]);
    if(!existsSync(join(temp,'.port-pages'))) throw new Error('Der vorhandene gh-pages-Branch ist kein von Port. erzeugter Build. Vorhandene Dateien zuerst prüfen.');
    for(const file of readdirSync(temp)) if(!['.git','CNAME'].includes(file)) rmSync(join(temp,file),{recursive:true,force:true});
  } else {
    git(['init','-b','gh-pages'],temp);
    git(['remote','add','origin',remote],temp);
  }
  for(const file of readdirSync(dist)) cpSync(join(dist,file),join(temp,file),{recursive:true});
  writeFileSync(join(temp,'.nojekyll'),'');
  writeFileSync(join(temp,'.port-pages'),'Generated static Port. build. Update with npm run deploy:pages.\n');
  git(['config','user.name',git(['config','--get','user.name'],source,true).stdout.trim() || 'Codex'],temp);
  git(['config','user.email',git(['config','--get','user.email'],source,true).stdout.trim() || 'codex@openai.com'],temp);
  git(['add','--all'],temp);
  const diff=git(['diff','--cached','--quiet'],temp,true);
  if(diff.status===0) { console.log('Der gh-pages-Build ist bereits aktuell.'); }
  else {
    if(diff.status!==1) throw new Error('Git-Diff konnte nicht geprüft werden.');
    git(['commit','-m','Deploy Port. to GitHub Pages'],temp);
    git(['push','origin','HEAD:refs/heads/gh-pages'],temp);
    console.log('Statischer Build auf gh-pages hochgeladen. Pages muss unter Settings > Pages für gh-pages / (root) aktiviert sein.');
  }
} finally { rmSync(temp,{recursive:true,force:true}); }
