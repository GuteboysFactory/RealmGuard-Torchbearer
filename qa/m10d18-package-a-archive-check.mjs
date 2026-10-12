import assert from "node:assert/strict";
import fs from "node:fs";
const filename=process.argv[2];
assert.ok(filename&&fs.existsSync(filename),"Staged archive listing required");
const paths=fs.readFileSync(filename,"utf8").split(/\r?\n/).filter(Boolean);
const entries=new Set(paths);
const manifest=JSON.parse(fs.readFileSync("system.json","utf8"));
const required=[...new Set(["system.json","realm-guard.mjs",...(manifest.esmodules??[]),
 ...(manifest.styles??[]),...(manifest.languages??[]).map(x=>x.path).filter(Boolean)])];
assert.equal(manifest.id,"realm-guard");
assert.equal(manifest.version,fs.readFileSync("release/READY","utf8").split(/\r?\n/)[0].trim(),"Candidate manifest/READY mismatch");
for(const p of required){
 assert.ok(entries.has(p),"Foundry archive missing manifest dependency: "+p);
 assert.ok(!p.startsWith("/"),"Unexpected absolute manifest path: "+p);
}
for(const p of entries){
 assert.ok(![".git/",".github/","release/","channels/","dist/"].some(x=>p.startsWith(x)),
  "Foundry archive contains internal release asset: "+p);
}
assert.ok(required.length>5,"Foundry package has too few runtime references");
console.log("PASS Package A staging: "+required.length+" manifest dependencies, no internal release paths, no publish");
