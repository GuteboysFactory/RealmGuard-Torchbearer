import assert from "node:assert/strict";
import fs from "node:fs";
import {
  createSocialNetworkServices,
  RelationshipRole,
  RelationshipStatus,
  RelationshipOrigin
} from "../module/core/m8-social-network.mjs";

function fakeActor() {
  const store = {};
  return {
    id:"RANGER-CIRCLES", uuid:"Actor.RANGER-CIRCLES", name:"Circles Tester", type:"character", isOwner:true,
    system:{parents:"",seniorArtisan:"",mentor:"",friend:"",enemy:""},
    getFlag(ns,key){ return store?.[ns]?.[key]; },
    async setFlag(ns,key,value){ store[ns] ??= {}; store[ns][key]=structuredClone(value); return value; }
  };
}

const actor=fakeActor();
const services=createSocialNetworkServices();
const found=await services.social.createContact(actor,{
  name:"Maera",profession:"Guide",people:"Man",location:"North Road",
  status:RelationshipStatus.NEUTRAL,origin:RelationshipOrigin.CIRCLES
});
assert.equal(found.created,true);
assert.equal(found.relationship.role,RelationshipRole.CONTACT);
assert.equal(found.relationship.origin,RelationshipOrigin.CIRCLES);

const duplicate=await services.social.createContact(actor,{
  name:"Maera",profession:"Guide",people:"Man",location:"North Road",
  origin:RelationshipOrigin.CIRCLES
});
assert.equal(duplicate.duplicate,true);
assert.equal(services.social.people(actor).length,1);

const sheet=fs.readFileSync("sheets/actor-sheet.mjs","utf8");
for(const needle of [
  "_prepareCirclesSocialContext",
  "_commitCirclesSocialContext",
  "Known Person / Contact",
  "Find New Person",
  "createM8CirclesContact",
  "Circles found",
  "rg-m8-circles-roll-context"
]) assert.ok(sheet.includes(needle), `Missing qa.39 persistent marker: ${needle}`);

assert.ok(
  sheet.includes("requestM8EnmityDecision") || sheet.includes("No Contact was created"),
  "Failed Find New Person must remain an explicit, non-silent Circles failure path."
);

const service=fs.readFileSync("module/m8-social-network-service.mjs","utf8");
assert.ok(service.includes("createM8CirclesContact"));
assert.ok(service.includes("Circles Contact creation requires ownership of the Ranger."));

console.log("PASS qa.39 Circles Social Network integration smoke");
