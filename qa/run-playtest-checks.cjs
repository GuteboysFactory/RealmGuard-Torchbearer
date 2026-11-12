const fs=require('fs'),path=require('path'),cp=require('child_process');fs.mkdirSync('output/playtest-followup',{recursive:true});
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const results=[];
for(const f of ['realm-guard.mjs',...files('module'),...files('sheets')].filter(f=>f.endsWith('.mjs'))){const r=cp.spawnSync(process.execPath,['--check',f],{encoding:'utf8'});results.push({kind:'syntax',file:f,ok:r.status===0,output:r.stdout+r.stderr});}
for(const f of fs.readdirSync('qa').filter(f=>f.endsWith('-smoke.mjs'))){const r=cp.spawnSync(process.execPath,[path.join('qa',f)],{encoding:'utf8',timeout:60000});results.push({kind:'smoke',file:f,ok:r.status===0,output:r.stdout+r.stderr});}
fs.writeFileSync('output/playtest-followup/checks.json',JSON.stringify(results,null,2));console.log(JSON.stringify({syntax:results.filter(r=>r.kind==='syntax').length,smoke:results.filter(r=>r.kind==='smoke').length,failed:results.filter(r=>!r.ok)},null,2));
process.exitCode=results.some(r=>!r.ok)?1:0;
