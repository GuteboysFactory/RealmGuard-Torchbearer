// Isolated document / settings / socket fixture. Never opens a user's world.
export const copy = value => structuredClone(value);
export function collection(rows = []) {
  const push=Array.prototype.push;
  rows.push=function(...values){for(const value of values){if(value.type&&value.system){value.flags??={};const methods={getFlag:function(ns,key){return this.flags?.[ns]?.[key];},setFlag:async function(ns,key,v){this.flags[ns]??={};this.flags[ns][key]=copy(v);},unsetFlag:async function(ns,key){delete this.flags[ns]?.[key];}};for(const [key,method]of Object.entries(methods))if(!value[key])Object.defineProperty(value,key,{value:method,writable:true,configurable:true});value.update??=async function(data){assignPaths(this,data);return this;};}}return push.apply(this,values);};
  const initial=rows.splice(0);rows.push(...initial);
  rows.get = id => rows.find(row => row.id === id);
  Object.defineProperty(rows, "contents", { get: () => [...rows], configurable: true });
  Object.defineProperty(rows, "size", { get: () => rows.length, configurable: true });
  return rows;
}
export function assignPaths(target, update) {
  for (const [key, value] of Object.entries(update)) {
    const path = key.split('.'); let parent = target;
    for (const part of path.slice(0,-1)) parent = parent[part] ??= {};
    const leaf=path.at(-1);if(leaf.startsWith('-='))delete parent[leaf.slice(2)];else parent[leaf] = copy(value);
  }
}
export function installPlaytestFixture() {
  let sequence = 0;
  const hooks = new Map(), settings = new Map(), dialogs = [], messages = collection(), dice = [], notices = [], writes = [];
  const gm = { id: "gm", isGM: true, active: true, name: "GM" };
  const player = { id: "player", isGM: false, active: true, name: "Player" };
  const observer = { id: "observer", isGM: false, active: true, name: "Observer" };
  settings.set("activeRulesProfileId", "realm-guard-legacy-mixed");
  globalThis.Hooks = { on(name, callback) { const rows = hooks.get(name) ?? []; rows.push(callback); hooks.set(name, rows); }, once(name, callback) { this.on(name, callback); }, callAll(name, ...args) { for (const fn of hooks.get(name) ?? []) fn(...args); } };
  globalThis.game = { system: { version: "1.14.0-qa.1" }, user: gm, users: collection([gm,player,observer]), actors: collection(), items: collection(), messages, packs: collection(), modules: new Map(), realmGuard: {}, settings: { get: (_ns,key) => settings.get(key), set: async (_ns,key,value) => { settings.set(key,value); writes.push([key,value]); Hooks.callAll("updateSetting", { key: `realm-guard.${key}` }); return value; }, register: (_ns,key,options) => { if(!settings.has(key)) settings.set(key,options.default); } }, socket: { emit() {}, on() {} }, i18n: { localize: value => value } };
  globalThis.ui = { notifications: Object.fromEntries(["warn","error","info"].map(kind => [kind, text => { notices.push([kind,text]); }])) };
  for (const user of [gm,player,observer]) user.targets = new Set();
  globalThis.CONST = { DOCUMENT_OWNERSHIP_LEVELS: { OWNER: 3 }, CHAT_MESSAGE_TYPES: { OTHER: 0 } };
  globalThis.foundry = { utils: { escapeHTML: value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'), deepClone: copy, randomID: () => `fixture${++sequence}`, getProperty: (object,path) => path.split('.').reduce((value,key) => value?.[key],object), setProperty: (object,path,value) => assignPaths(object,{[path]:value}), mergeObject: (a,b) => ({...a,...b}) }, applications: { api: { ApplicationV2: class {}, HandlebarsApplicationMixin: Base => Base, DialogV2: { wait: async options => { const answer=dialogs.shift(); if(typeof answer==='function') return answer(options); return answer ?? null; }, confirm: async () => dialogs.shift() ?? false } }, sheets: { ActorSheetV2: class {}, ItemSheetV2: class {} } } };
  globalThis.Actor = class {
    constructor(data = {}) { Object.assign(this, copy(data)); this.id ??= `actor${++sequence}`; this.uuid ??= `Actor.${this.id}`; this.type ??= "character"; this.flags ??= {}; this.apps = {}; this.ownership ??= { player: 3 }; this.items = collection((data.items ?? []).map(item => ({ ...copy(item), parent: this, async update(update) { assignPaths(this,update); return this; } }))); }
    get isOwner() { return game.user.isGM || this.testUserPermission(game.user,3); }
    get hasPlayerOwner() { return Boolean(this.ownership.player); }
    testUserPermission(user) { return Boolean(user?.isGM || this.ownership[user?.id] === 3); }
    getFlag(ns,key) { return this.flags[ns]?.[key]; }
    async setFlag(ns,key,value) { this.flags[ns] ??= {}; this.flags[ns][key]=copy(value); }
    async update(update) { assignPaths(this,update); return this; }
    async updateEmbeddedDocuments(_type, updates) { for(const update of updates) await this.items.get(update._id)?.update(update); return this.items; }
    async createEmbeddedDocuments(_type, rows) { return rows.map(data => {const item={...copy(data),id:`item${++sequence}`,parent:this,async update(update){assignPaths(this,update);}};this.items.push(item);return item;}); }
  };
  globalThis.ChatMessage = { getSpeaker: ({actor}={}) => ({actor:actor?.id,alias:actor?.name??game.user.name}), async create(data) { const message = { ...copy(data), id:`message${++sequence}`, author: game.user, async update(update) { assignPaths(this,update); return this; } }; messages.push(message); return message; } };
  globalThis.Roll = class {
    constructor(formula) { this.formula=formula; }
    async evaluate() { const count=Number(this.formula.match(/^(\d+)d6/)?.[1] ?? 0); const faces=dice.shift() ?? Array(count).fill(4); if(faces instanceof Error) throw faces; if(faces.length!==count) throw Error(`Fixture expected ${count} dice, got ${faces.length}: ${this.formula}`); this.dice=[{results:faces.map(result=>({result}))}]; return this; }
  };
  return { hooks, settings, dialogs, messages, dice, notices, writes, gm, player, observer };
}

export function actorData(id = "ranger") {
  return { id, name: id, type: "character", system: { attributes: { will:{value:4,max:6},health:{value:4,max:6},nature:{value:4,maximum:4},resources:{value:2,max:10},circles:{value:2,max:10} }, resources: { fate:{value:3,max:5},persona:{value:3,max:5},checks:{value:0,max:9} }, progression:{level:2,spentFate:0,spentPersona:0} }, items:[{id:"fighter",name:"Fighter",type:"role",system:{rating:3,learning:{passed:0,failed:0},beginnerAbility:"health"}},{id:"scout",name:"Scout",type:"role",system:{rating:2,learning:{passed:0,failed:0}}},{id:"wise",name:"Road-wise",type:"wise",system:{description:""}}] };
}
