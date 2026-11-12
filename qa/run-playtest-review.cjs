const cp=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve('output/playtest-followup');fs.mkdirSync(dir,{recursive:true});
const results=[];
for(const file of ['qa/run-playtest-checks.cjs','qa/release-preflight.mjs','qa/conflict-session-browser.mjs','qa/legacy-character-workspace-browser.mjs','qa/legacy-playtest-followup-browser.mjs','qa/legacy-qa6-browser.mjs','qa/legacy-cleanup-browser.mjs']){
 const result=cp.spawnSync(process.execPath,[file],{encoding:'utf8',env:process.env,timeout:180000});
 fs.writeFileSync(path.join(dir,path.basename(file)+'.log'),result.stdout+result.stderr);
 results.push({file,ok:result.status===0,exitCode:result.status,error:result.error?.message});console.log(`${result.status===0?'PASS':'FAIL'} ${file}`);if(result.status!==0)console.log((result.stdout+result.stderr).slice(-6000));
}
fs.writeFileSync(path.join(dir,'review-checks.json'),JSON.stringify(results,null,2));process.exitCode=results.every(r=>r.ok)?0:1;
