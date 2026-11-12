import assert from 'node:assert/strict';
import {installPlaytestFixture,collection,assignPaths} from './lib/playtest-foundry-fixture.mjs';
const fx=installPlaytestFixture();
const {refreshRulesProfileRuntime}=await import('../module/rules-profile-service.mjs');
class FixtureDocument {
 static async createDocuments(rows,{pack}) { const target=game.packs.get(pack);const docs=structuredClone(rows).map((row,index)=>({...row,id:`doc${target.docs.length+index}`}));target.docs.push(...docs);return docs; }
 static async updateDocuments(updates,{pack}) {for(const update of updates){assert.ok(Object.keys(update).every(k=>['_id','folder','name','system.description'].includes(k)));const doc=game.packs.get(pack).docs.get(update._id);for(const [key,value]of Object.entries(update))if(key!=='_id')assignPaths(doc,{[key]:value});} }
}
globalThis.Folder={async create(data,{pack}={}){const target=game.packs.get(pack),folder={...data,id:`folder${target.folders.length}`};target.folders.push(folder);return folder;}};
globalThis.CompendiumCollection={async createCompendium(definition){const id=`world.${definition.name}`;const pack={id,collection:id,documentName:definition.type,documentClass:FixtureDocument,docs:collection(),folders:collection(),config:{},async configure(c){Object.assign(this.config,c);},async getDocuments(){return this.docs;}};game.packs.push(pack);return pack;}};
const {ensureStarterCompendiums}=await import('../module/compendiums.mjs');
fx.settings.set('activeRulesProfileId','mg1e');refreshRulesProfileRuntime();
let result=await ensureStarterCompendiums({syncMissing:true});assert.equal(result.failed,0);
const talents=game.packs.get('world.realm-guard-starter-talents');assert.equal(talents.docs.length,12,'Other profiles still seed the original library');
fx.settings.set('activeRulesProfileId','realm-guard-legacy-mixed');refreshRulesProfileRuntime();
const {LEGACY_TRAITS}=await import('../module/legacy-trait-catalog.mjs');const traitPack=game.packs.get('world.realm-guard-starter-traits');const missingTraits=LEGACY_TRAITS.filter(t=>!traitPack.docs.some(d=>d.flags['realm-guard'].starterKey===t.key)).length;
result=await ensureStarterCompendiums({syncMissing:true});assert.equal(result.failed,0);assert.equal(result.added,124+missingTraits);assert.equal(talents.docs.length,136,'Migration preserves existing starter items');
assert.ok(LEGACY_TRAITS.every(t=>traitPack.docs.some(d=>d.name===t.name&&d.system.description===t.description)));assert.equal(traitPack.folders.length,1);
const gifted=talents.docs.find(t=>t.name==='Blood of the Fae');assert.equal(gifted.type,'talent');assert.equal(gifted.system.effectMode,'manual');assert.equal(gifted.flags['realm-guard'].talentSource.page,115);
assert.equal(talents.folders.length,11);assert.equal(talents.folders.find(f=>f.id===gifted.folder).name,'Level 2');assert.equal(talents.config.ownership.PLAYER,'OBSERVER');
gifted.name='Gifted';gifted.system.description='Preserved GM rule text';
await ensureStarterCompendiums({syncMissing:true});assert.equal(gifted.name,'Blood of the Fae');assert.equal(gifted.system.description,'Preserved GM rule text','Known QA.5 title migrates without replacing the effect');
gifted.name='GM edited Gifted';gifted.system.description='My custom effect';
result=await ensureStarterCompendiums({syncMissing:true});assert.equal(result.added,0);assert.equal(gifted.system.description,'My custom effect');assert.equal(talents.docs.length,136);
assert.equal(talents.docs.filter(t=>t.name.includes('[working title]')).length,0);
talents.config.ownership={PLAYER:'NONE'};await ensureStarterCompendiums({syncMissing:true});assert.equal(talents.config.ownership.PLAYER,'NONE','Explicit GM visibility is retained');assert.equal(talents.folders.length,11);
console.log('PASS Legacy Talent compendium: profile scope; 124 missing entries seeded; source provenance; existing 12 retained; repeated sync and GM edits preserved');
