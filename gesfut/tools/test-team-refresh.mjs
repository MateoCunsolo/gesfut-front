import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const generated=fileURLToPath(new URL('./.team-refresh.test.mjs',import.meta.url));
try{
 await build({entryPoints:[fileURLToPath(new URL('./team-refresh.test.ts',import.meta.url))],outfile:generated,bundle:true,format:'esm',platform:'node',packages:'external',tsconfig:fileURLToPath(new URL('../tsconfig.json',import.meta.url))});
 const result=spawnSync(process.execPath,['--test',generated],{stdio:'inherit'});process.exitCode=result.status??1;
}finally{await unlink(generated).catch(()=>undefined);}



