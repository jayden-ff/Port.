import {mkdir,copyFile,cp,rm,writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of ['index.html','styles.css','fonts.css','favicon.svg','app.js','core.js','curriculum.js','experiments.js','visuals.js'])await copyFile(file,`dist/${file}`);
await cp('fonts','dist/fonts',{recursive:true});
await cp('images','dist/images',{recursive:true});
await writeFile('dist/.nojekyll','');
console.log('Built static site in dist/. No runtime dependencies, API keys or server required.');
