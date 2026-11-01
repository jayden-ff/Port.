import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,readdir,rm,cp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
function git(args,cwd=root){return execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','inherit']}).trim()}
execFileSync('npm',['test'],{cwd:root,stdio:'inherit'});
execFileSync('npm',['run','build'],{cwd:root,stdio:'inherit'});
git(['fetch','origin','gh-pages']);
const temp=await mkdtemp(join(tmpdir(),'port-learning-pages-'));
const checkout=join(temp,'pages');
let attached=false;
try{
 git(['worktree','add','--detach',checkout,'FETCH_HEAD']);attached=true;
 let cname;try{cname=await readFile(join(checkout,'CNAME'),'utf8')}catch{}
 for(const entry of await readdir(checkout)){if(entry!=='.git')await rm(join(checkout,entry),{recursive:true,force:true})}
 await cp(join(root,'dist'),checkout,{recursive:true});
 await writeFile(join(checkout,'.port-pages'),'port. learning platform\n');
 if(cname)await writeFile(join(checkout,'CNAME'),cname);
 git(['add','--all'],checkout);
 if(git(['diff','--cached','--name-only'],checkout)){
  git(['commit','-m','Publish port. learning platform'],checkout);
  git(['push','origin','HEAD:gh-pages'],checkout);
  console.log('Pushed static learning site to gh-pages. GitHub Pages builds this branch.');
 }else console.log('The published branch already matches this build.');
}finally{
 if(attached)git(['worktree','remove',checkout]);
 await rm(temp,{recursive:true,force:true});
}
