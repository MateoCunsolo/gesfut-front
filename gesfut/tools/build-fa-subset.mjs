// Genera src/styles/fa-subset.css con solo los iconos de Font Awesome que usa la app (auditoria 22/10, #15).
// Ejecutar despues de agregar un icono nuevo: node tools/build-fa-subset.mjs
import fs from 'node:fs'; import path from 'node:path';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,'$1')),'..');
const css=fs.readFileSync(path.join(root,'node_modules/@fortawesome/fontawesome-free/css/all.css'),'utf8');
const used=new Set(); const walk=d=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name); if(f.isDirectory())walk(p); else if(/\.(html|ts|scss)$/.test(f.name)&&!p.includes('fa-subset')){for(const m of fs.readFileSync(p,'utf8').matchAll(/fa-[a-z0-9-]+/g))used.add(m[0]);}}}; walk(path.join(root,'src'));
let out=''; let i=0; let kept=0, dropped=0;
const blocks=[]; // top-level split
while(i<css.length){ const o=css.indexOf('{',i); if(o<0)break; let depth=1,j=o+1; while(depth&&j<css.length){ if(css[j]==='{')depth++; else if(css[j]==='}')depth--; j++; } blocks.push([css.slice(i,o).trim(),css.slice(o,j)]); i=j; }
for(const [sel,body] of blocks){
  const isIcon=/^\{\s*content:\s*"[^"]*";\s*\}$/.test(body.trim()) && /::before/.test(sel) && !sel.startsWith('@');
  if(!isIcon){ out+=sel.replace(/\/\*[\s\S]*?\*\//g,'').trim()+' '+body.replace(/url\((["']?)\.\.\/webfonts\//g,'url($1../../node_modules/@fortawesome/fontawesome-free/webfonts/')+'\n'; continue; }
  const keep=sel.split(',').map(s=>s.trim()).filter(s=>{const m=s.match(/^\.(fa-[a-z0-9-]+)::before$/); return m&&used.has(m[1]);});
  if(keep.length){ out+=keep.join(',')+' '+body+'\n'; kept++; } else dropped++;
}
fs.mkdirSync(path.join(root,'src/styles'),{recursive:true});
fs.writeFileSync(path.join(root,'src/styles/fa-subset.css'),'/* Generado por tools/build-fa-subset.mjs desde @fortawesome/fontawesome-free all.css. No editar a mano. */\n'+out);
console.log('iconos usados',used.size,'reglas icono conservadas',kept,'descartadas',dropped,'bytes',out.length);

