from pathlib import Path
import json

ROOT=Path('.')

def rep(text, old, new, label, count=1):
    c=text.count(old)
    if c!=count: raise SystemExit(f'{label}: expected {count}, found {c}')
    return text.replace(old,new,count)

# --- teamwork.mjs ----------------------------------------------------------
p=ROOT/'module/teamwork.mjs'
t=p.read_text(encoding='utf-8')

t=rep(t,
'''function validHelperActorsForUser(user, excludedActorIds = []) {
  const excluded = new Set(excludedActorIds.filter(Boolean));
  return game.actors.contents.filter(actor => {
    if (actor.type !== "character" || excluded.has(actor.id)) return false;
    if (!userOwnsActor(actor, user)) return false;
    if (hasActiveCondition(actor, "Afraid")) return false;
    return helperSources(actor).length > 0;
  });
}

function activeHelperTargets(session) {
  return game.users.contents.flatMap(user => {
    if (!user.active || user.id === game.user.id || user.isGM) return [];
    if (session.acceptedByUser.has(user.id)) return [];
    const actors = validHelperActorsForUser(user, session.excludedActorIds);
    if (!actors.length) return [];
    return [{ user, actorIds: actors.map(actor => actor.id) }];
  });
}
''',
'''export function helperEligibility(actor, { excludedActorIds = [], allowedActorIds = [] } = {}) {
  if (!actor || actor.type !== "character") return { ok:false, reason:"Not an eligible Ranger." };
  if ((excludedActorIds ?? []).includes(actor.id)) return { ok:false, reason:"This Ranger is already taking the action." };
  if (Array.isArray(allowedActorIds) && allowedActorIds.length && !allowedActorIds.includes(actor.id)) return { ok:false, reason:"Not participating in this Conflict." };
  if (hasActiveCondition(actor, "Afraid")) return { ok:false, reason:"Afraid — this Condition prevents the Ranger from helping." };
  if (!helperSources(actor).length) return { ok:false, reason:"No legal Help source is currently available." };
  return { ok:true, reason:"Available" };
}

function ownedCandidateActors(user, excludedActorIds = [], allowedActorIds = []) {
  const allowed = new Set((allowedActorIds ?? []).filter(Boolean));
  return game.actors.contents.filter(actor => actor.type === "character" && userOwnsActor(actor,user) && (!allowed.size || allowed.has(actor.id)) && !(excludedActorIds ?? []).includes(actor.id));
}

function validHelperActorsForUser(user, excludedActorIds = [], allowedActorIds = []) {
  return ownedCandidateActors(user, excludedActorIds, allowedActorIds).filter(actor => helperEligibility(actor,{excludedActorIds,allowedActorIds}).ok);
}

export function teamworkAvailability(sessionId) {
  const session=sessions.get(sessionId); if(!session) return [];
  return game.users.contents.flatMap(user => {
    if(!user.active || user.id===game.user.id || user.isGM) return [];
    return ownedCandidateActors(user,session.excludedActorIds,session.allowedActorIds).map(actor => {
      const eligibility=helperEligibility(actor,{excludedActorIds:session.excludedActorIds,allowedActorIds:session.allowedActorIds});
      return { userId:user.id, userName:user.name, actorId:actor.id, actorName:actor.name, ...eligibility };
    });
  });
}

function activeHelperTargets(session) {
  return game.users.contents.flatMap(user => {
    if (!user.active || user.id === game.user.id || user.isGM) return [];
    if (session.acceptedByUser.has(user.id)) return [];
    const actors = validHelperActorsForUser(user, session.excludedActorIds, session.allowedActorIds);
    if (!actors.length) return [];
    return [{ user, actorIds: actors.map(actor => actor.id) }];
  });
}
''','teamwork eligibility')

t=rep(t,
'''export function createTeamworkSession({ requesterActorId, testName = "Test", excludedActorIds = [] } = {}) {
''',
'''export function createTeamworkSession({ requesterActorId, testName = "Test", excludedActorIds = [], allowedActorIds = [] } = {}) {
''','session signature')
t=rep(t,
'''    excludedActorIds: [...new Set([requesterActorId, ...excludedActorIds].filter(Boolean))],
    accepted: new Map(),
''',
'''    excludedActorIds: [...new Set([requesterActorId, ...excludedActorIds].filter(Boolean))],
    allowedActorIds: [...new Set((allowedActorIds ?? []).filter(Boolean))],
    accepted: new Map(),
    pending: new Map(),
''','session fields')

t=rep(t,
'''    synergy: Boolean(entry.synergy)
  }));
}
''',
'''    synergy: Boolean(entry.synergy),
    note: String(entry.note ?? ""),
    approvedByGm: Boolean(entry.approvedByGm)
  }));
}
''','teamwork entries')

# Availability feedback on Ask.
t=rep(t,
'''  const targets = activeHelperTargets(session);
  if (!targets.length) {
    ui.notifications.info("Realm Guard: No additional active Ranger players are available to answer a Help request.");
    renderRequesterSession(sessionId);
    return false;
  }
''',
'''  const availability = teamworkAvailability(sessionId);
  const targets = activeHelperTargets(session);
  const blocked = availability.filter(row => !row.ok);
  const availabilityNode = requesterRoot(sessionId)?.querySelector?.("[data-rg-help-availability]");
  if (availabilityNode) availabilityNode.innerHTML = availability.length
    ? availability.map(row => `<div class="rg-help-availability ${row.ok ? "is-available" : "is-blocked"}"><i class="fa-solid ${row.ok ? "fa-circle-check" : "fa-circle-xmark"}"></i><span><b>${esc(row.actorName)}</b> · ${esc(row.reason)}</span></div>`).join("")
    : `<span class="rg-muted">No other online Conflict participants are available.</span>`;
  if (!targets.length) {
    const detail = blocked.length ? ` ${blocked.map(row => `${row.actorName}: ${row.reason}`).join(" · ")}` : "";
    ui.notifications.info(`Realm Guard: No Ranger can currently answer this Help request.${detail}`);
    renderRequesterSession(sessionId);
    return false;
  }
''','ask eligibility feedback')

# Pass participant scope to receiver.
t=rep(t,
'''      helperActorIds: target.actorIds,
      excludedActorIds: session.excludedActorIds,
''',
'''      helperActorIds: target.actorIds,
      excludedActorIds: session.excludedActorIds,
      allowedActorIds: session.allowedActorIds,
''','request scope')

t=rep(t,
'''  const actors = validHelperActorsForUser(game.user, message.excludedActorIds ?? []).filter(actor => allowed.has(actor.id));
''',
'''  const actors = validHelperActorsForUser(game.user, message.excludedActorIds ?? [], message.allowedActorIds ?? []).filter(actor => allowed.has(actor.id));
''','receiver scope')

# Optional descriptive note.
t=rep(t,
'''    <div class="rg-teamwork-source-help" data-helper-source-help>Choose an appropriate trained Skill or Ability for normal Help, or a relevant Wise for I Am Wise.</div>
    <label class="rg-teamwork-request-synergy">''',
'''    <div class="rg-teamwork-source-help" data-helper-source-help>Choose an appropriate trained Skill or Ability for normal Help, or a relevant Wise for I Am Wise.</div>
    <label>How do you help? <textarea rows="3" data-helper-note placeholder="Optional — describe what your Ranger does, especially useful without voice chat."></textarea></label>
    <label class="rg-teamwork-request-synergy">''','helper note UI')

t=rep(t,
'''      const useSynergy = Boolean(synergy.checked && !synergy.disabled && ["Skill", "Ability"].includes(source.kind));
      sendHelperResponse(message, {
''',
'''      const legality = helperEligibility(actor,{excludedActorIds:message.excludedActorIds ?? [],allowedActorIds:message.allowedActorIds ?? []});
      if(!legality.ok) return ui.notifications.warn(`Realm Guard: ${actor.name} cannot Help: ${legality.reason}`);
      const useSynergy = Boolean(synergy.checked && !synergy.disabled && ["Skill", "Ability"].includes(source.kind));
      const note=String(root.querySelector("[data-helper-note]")?.value ?? "").trim();
      sendHelperResponse(message, {
''','recheck before offer')
t=rep(t,
'''        dice: 1,
        synergy: useSynergy
''',
'''        dice: 1,
        synergy: useSynergy,
        note,
        needsReview: source.kind !== "Skill" || useSynergy
''','response payload')

# Add lightweight GM review helpers before receiveResponse.
needle='''function receiveResponse(message) {
'''
insert='''function activeReviewGmId(){ return game.users.contents.filter(u=>u.active&&u.isGM).sort((a,b)=>String(a.id).localeCompare(String(b.id)))[0]?.id ?? null; }

function acceptEntry(session, entry){
  session.pending.delete(entry.actorId);
  session.accepted.set(entry.actorId,entry);
  session.acceptedByUser.add(entry.helperUserId);
  session.declinedUsers.delete(entry.helperUserId);
  renderRequesterSession(session.sessionId);
  ui.notifications.info(`${entry.actorName} joined the roll with ${entry.sourceName} (+1D).`);
}

async function openGmHelpReview(message){
  if(!game.user?.isGM || message.targetGmId!==game.user.id) return;
  const e=message.entry ?? {};
  const content=`<div class="rg-teamwork-review"><div class="rg-custom-chat-tag">HELP REVIEW</div><h3>${esc(e.actorName)} offers Help</h3><p><b>Source:</b> ${esc(e.sourceKind)} · ${esc(e.sourceName)}</p>${e.note ? `<blockquote>${esc(e.note)}</blockquote>` : `<p><small>No description supplied.</small></p>`}${e.synergy ? `<p><b>Synergy:</b> spend 1 Fate.</p>` : ""}<p><small>Approve only if this Help is appropriate to the current fiction/test.</small></p></div>`;
  const approved=await foundry.applications.api.DialogV2.confirm({window:{title:"Realm Guard · Review Help",resizable:true},content,modal:false,rejectClose:false,yes:{label:"Approve Help",icon:"fa-solid fa-check"},no:{label:"Reject",icon:"fa-solid fa-xmark"}});
  game.socket.emit(CHANNEL,{type:"teamwork-review-response",requestId:message.requestId,requesterUserId:message.requesterUserId,helperUserId:e.helperUserId,actorId:e.actorId,approved:Boolean(approved),senderId:game.user.id});
}

function receiveReviewResponse(message){
  if(message.requesterUserId!==game.user.id) return;
  const session=sessions.get(message.requestId); if(!session) return;
  const entry=session.pending.get(message.actorId); if(!entry) return;
  if(message.approved){ entry.approvedByGm=true; acceptEntry(session,entry); }
  else { session.pending.delete(message.actorId); session.declinedUsers.add(entry.helperUserId); renderRequesterSession(message.requestId); ui.notifications.warn(`${entry.actorName}'s Help was not approved by the GM.`); }
}

function receiveResponse(message) {
'''
t=rep(t,needle,insert,'gm review insertion')

# Replace receiveResponse acceptance tail.
t=rep(t,
'''    synergy: Boolean(message.synergy),
    helperUserId: message.helperUserId
  };
  if (!sourceStillValid(entry)) return;
  session.accepted.set(entry.actorId, entry);
  session.acceptedByUser.add(message.helperUserId);
  session.declinedUsers.delete(message.helperUserId);
  renderRequesterSession(message.requestId);
  ui.notifications.info(`${entry.actorName} joined the roll with ${entry.sourceName} (+1D).`);
}
''',
'''    synergy: Boolean(message.synergy),
    note: String(message.note ?? ""),
    helperUserId: message.helperUserId,
    approvedByGm: Boolean(game.user?.isGM)
  };
  if (!sourceStillValid(entry)) return;
  const needsReview=Boolean(message.needsReview);
  if(!needsReview || game.user?.isGM){ acceptEntry(session,entry); return; }
  const targetGmId=activeReviewGmId();
  if(!targetGmId){ ui.notifications.warn("Realm Guard: Help requires GM review, but no GM is online."); return; }
  session.pending.set(entry.actorId,entry);
  renderRequesterSession(message.requestId);
  game.socket.emit(CHANNEL,{type:"teamwork-review-request",requestId:message.requestId,requesterUserId:message.requesterUserId,targetGmId,entry,senderId:game.user.id});
  ui.notifications.info(`${entry.actorName}'s Help is waiting for GM approval.`);
}
''','receive review flow')

# Socket handlers.
t=rep(t,
'''      if (message.type === "teamwork-decline") return receiveDecline(message);
      if (message.type === "teamwork-close") return closeHelperRequest(message);
''',
'''      if (message.type === "teamwork-decline") return receiveDecline(message);
      if (message.type === "teamwork-review-request") return openGmHelpReview(message);
      if (message.type === "teamwork-review-response") return receiveReviewResponse(message);
      if (message.type === "teamwork-close") return closeHelperRequest(message);
''','socket review handlers')

p.write_text(t,encoding='utf-8')

# --- conflicts.mjs ---------------------------------------------------------
p=ROOT/'module/conflicts.mjs'; t=p.read_text(encoding='utf-8')
t=rep(t,
'''import { evaluateM6ConflictStateLiveHandoff } from "./m6-conflict-state-handoff.mjs";
''',
'''import { evaluateM6ConflictStateLiveHandoff } from "./m6-conflict-state-handoff.mjs";
import { createTeamworkSession, teamworkEntries, finishTeamworkSession } from "./teamwork.mjs";
''','teamwork import')

# Story modifier helpers before openPoolDialog.
needle='''async function openPoolDialog({ actor, title, choices, temporaryDice = 0, gear = null, participants = [], side = "ranger", allowSwordChoice = false, state = null, action = "", maxHelpers = null, allowTapNature = true, baseAbilityHint = "will" }) {
'''
insert='''function storyModifierKey(state,side){ return `${Number(state?.exchange ?? 1)}:${Number(state?.currentIndex ?? 0)}:${side}`; }
function storyModifierFor(state,side){ const raw=state?.gmRollModifiers?.[storyModifierKey(state,side)] ?? {}; return { dice:Number(raw.dice ?? 0), reason:String(raw.reason ?? "").trim() }; }

async function editStoryModifier(side,state){
  if(!game.user?.isGM || !state || !["gm","ranger"].includes(side)) return;
  const current=storyModifierFor(state,side);
  const result=await foundry.applications.api.DialogV2.wait({window:{title:`Realm Guard · ${side==="gm"?"GM / Opposition":"Ranger"} Story Modifier`,resizable:true},modal:false,rejectClose:false,content:`<div class="rg-gm-story-modifier"><h3>GM Story / Circumstance Modifier</h3><p>Use this only for a situational circumstance not already represented by Conditions, Maneuver or Conflict Tool effects.</p><label>Dice modifier <input type="number" name="dice" min="-20" max="20" value="${Number(current.dice)}"></label><label>Reason <input type="text" name="reason" value="${esc(current.reason)}" placeholder="e.g. Fighting in complete darkness"></label></div>`,buttons:[{action:"save",label:"Save Modifier",icon:"fa-solid fa-check",default:true,callback:(_e,b)=>({dice:Math.max(-20,Math.min(20,Number(b.form?.elements?.dice?.value ?? 0))),reason:String(b.form?.elements?.reason?.value ?? "").trim()})},{action:"clear",label:"Clear",callback:()=>({dice:0,reason:""})},{action:"cancel",label:"Cancel",callback:()=>null}]});
  if(result===null) return;
  const next=clone(state); next.gmRollModifiers={...(next.gmRollModifiers ?? {})}; next.gmRollModifiers[storyModifierKey(next,side)]=result; await setPublicState(next);
}

async function openPoolDialog({ actor, title, choices, temporaryDice = 0, gear = null, participants = [], side = "ranger", allowSwordChoice = false, state = null, action = "", maxHelpers = null, allowTapNature = true, baseAbilityHint = "will" }) {
'''
t=rep(t,needle,insert,'story helpers')

# Replace static helper block with session setup and modifier previews.
old='''  const helperBlocks = side === "ranger" ? participants.filter(id => id !== actor.id).map(id => {
    const h = actorById(id); if (!h || conditionActive(h, "Afraid")) return "";
    return `<label class="rg-conflict-helper"><input type="checkbox" name="helper" value="${id}"> ${esc(h.name)} +1D Help</label>`;
  }).join("") : "";
'''
new='''  const teamworkSessionId = side === "ranger" && participants.some(id => id !== actor.id)
    ? createTeamworkSession({ requesterActorId: actor.id, testName: title, excludedActorIds: [actor.id], allowedActorIds: participants })
    : null;
  const teamworkBlock = teamworkSessionId ? `<fieldset class="rg-conflict-teamwork" data-rg-teamwork-session="${teamworkSessionId}"><legend>Teamwork</legend><div class="rg-teamwork-requester"><button type="button" class="rg-teamwork-ask" data-rg-teamwork-ask="${teamworkSessionId}"><i class="fa-solid fa-handshake-angle"></i> Ask for Help</button><span data-rg-help-request-status>Help is optional. Ask online Rangers participating in this Conflict.</span></div><div data-rg-help-availability class="rg-help-availability-list"></div><div data-rg-help-summary class="rg-teamwork-accepted-list"><span class="rg-muted">No Help accepted yet.</span></div>${Number.isFinite(maxHelpers) ? `<small>Up to ${maxHelpers} patrol-mates may contribute to this action.</small>` : ""}</fieldset>` : "";
'''
t=rep(t,old,new,'teamwork block setup')

# Add modifier preview data before content.
needle='''  const natureCurrent = Math.max(0, Number(actor.system.attributes?.nature?.value ?? 0));
'''
insert='''  const storyModifier=storyModifierFor(state,side);
  const conditionPreview=Object.fromEntries(choices.map(c=>{ const isSkill=c.id!=="@nature"&&c.kind!=="ability"; const d=actor._activeConditionRollData?.(c.name,{isSkill}) ?? {dice:0,active:[]}; return [c.id,{dice:Number(d.dice ?? 0),names:(d.active ?? []).map(x=>String(x.name ?? "Condition"))}]; }));
  const initialCondition=conditionPreview[choices[0]?.id] ?? {dice:0,names:[]};
  const autoBase=Number(temporaryDice ?? 0)+Number(gear?.dice ?? 0)+Number(storyModifier.dice ?? 0);
  const modifierData=esc(JSON.stringify(conditionPreview));
  const natureCurrent = Math.max(0, Number(actor.system.attributes?.nature?.value ?? 0));
'''
t=rep(t,needle,insert,'modifier preview setup')

# Replace core fields and helper rendering.
t=rep(t,
'''    <div class="rg-roll-dialog-grid rg-conflict-core-fields"><label><span>Modifier</span><input type="number" name="modifier" value="0"><small>Situational dice modifier.</small></label><label><span>Extra Dice</span><input type="number" name="extra" min="0" value="0"><small>Manual bonus dice only.</small></label></div>
''',
'''    <div class="rg-roll-dialog-grid rg-conflict-core-fields"><label><span>Modifier Total</span><input type="number" data-rg-auto-modifier readonly value="${autoBase+Number(initialCondition.dice ?? 0)}"><small>Locked. Conditions, Maneuver, Conflict Tool and GM circumstance are applied automatically.</small></label><label><span>GM Extra Dice</span><input type="number" name="extra" min="0" value="0" ${game.user?.isGM ? "" : "readonly"}><small>${game.user?.isGM ? "GM-only manual bonus for exceptional circumstances." : "Locked for players."}</small></label></div>
    <input type="hidden" name="modifier" value="${Number(storyModifier.dice ?? 0)}">
    <div class="rg-modifier-breakdown" data-rg-modifier-breakdown data-rg-condition-preview="${modifierData}" data-rg-auto-base="${autoBase}"><b>Automatic modifier breakdown</b><span data-rg-condition-line>Conditions: ${Number(initialCondition.dice ?? 0) >= 0 ? "+" : ""}${Number(initialCondition.dice ?? 0)}D${initialCondition.names.length ? ` · ${initialCondition.names.map(esc).join(", ")}` : ""}</span>${temporaryDice ? `<span>Maneuver: ${temporaryDice>0?"+":""}${temporaryDice}D</span>` : ""}${gear?.dice ? `<span>Conflict Tool: ${Number(gear.dice)>0?"+":""}${Number(gear.dice)}D</span>` : ""}${storyModifier.dice ? `<span>GM circumstance: ${Number(storyModifier.dice)>0?"+":""}${Number(storyModifier.dice)}D${storyModifier.reason ? ` · ${esc(storyModifier.reason)}` : ""}</span>` : ""}</div>
''','locked modifier fields')

t=rep(t,
'''    ${helperBlocks ? `<fieldset><legend>Teamwork</legend>${helperBlocks}${Number.isFinite(maxHelpers) ? `<small>Up to ${maxHelpers} patrol-mates may help this action.</small>` : ""}</fieldset>` : ""}
''',
'''    ${teamworkBlock}
''','teamwork render')

# Replace direct return wait with wrapped result and teamwork snapshot.
t=rep(t,
'''  return await foundry.applications.api.DialogV2.wait({
''',
'''  let result=null;
  try { result = await foundry.applications.api.DialogV2.wait({
''','dialog try',1)
# The first occurrence after openPoolDialog might be wrong: there are earlier waits! We replaced global first occurrence likely startConflictDialog. Abort if marker location unsuitable handled by verification below.
# Detect and repair if startConflictDialog got changed instead.
if 'let result=null;\n  try { result = await foundry.applications.api.DialogV2.wait' in t.split('async function openPoolDialog',1)[0]:
    # undo first wrong replacement and perform scoped replacement after openPoolDialog only
    t=t.replace('let result=null;\n  try { result = await foundry.applications.api.DialogV2.wait','return await foundry.applications.api.DialogV2.wait',1)
    pre,post=t.split('async function openPoolDialog',1)
    post=post.replace('  return await foundry.applications.api.DialogV2.wait({','  let result=null;\n  try { result = await foundry.applications.api.DialogV2.wait({',1)
    t=pre+'async function openPoolDialog'+post

old='''        modifier: Number(b.form?.elements?.modifier?.value ?? 0), extra: Math.max(0, Number(b.form?.elements?.extra?.value ?? 0)),
        persona: Math.max(0, Math.min(3, Number(b.form?.elements?.persona?.value ?? 0))), traitId: b.form?.elements?.traitId?.value || null, wiseId: b.form?.elements?.wiseId?.value || null, tokenPowerId: b.form?.elements?.tokenPowerId?.value || null, talentId: b.form?.elements?.talentId?.value || null,
        helperIds: (() => { const ids = [...(b.form?.querySelectorAll('input[name="helper"]:checked') ?? [])].map(el => el.value); return Number.isFinite(maxHelpers) ? ids.slice(0, maxHelpers) : ids; })(), lockSword: Boolean(b.form?.elements?.lockSword?.checked),
'''
new='''        modifier: Number(storyModifier.dice ?? 0), extra: game.user?.isGM ? Math.max(0, Number(b.form?.elements?.extra?.value ?? 0)) : 0,
        persona: Math.max(0, Math.min(3, Number(b.form?.elements?.persona?.value ?? 0))), traitId: b.form?.elements?.traitId?.value || null, wiseId: b.form?.elements?.wiseId?.value || null, tokenPowerId: b.form?.elements?.tokenPowerId?.value || null, talentId: b.form?.elements?.talentId?.value || null,
        helperEntries: (()=>{ const entries=teamworkSessionId ? teamworkEntries(teamworkSessionId) : []; return Number.isFinite(maxHelpers) ? entries.slice(0,maxHelpers) : entries; })(), lockSword: Boolean(b.form?.elements?.lockSword?.checked),
'''
t=rep(t,old,new,'roll callback teamwork')
# close try/finally at openPoolDialog end.
t=rep(t,
'''    ]
  });
}

async function executeActorPool''',
'''    ]
  }); } finally { if(teamworkSessionId) finishTeamworkSession(teamworkSessionId); }
  return result;
}

async function executeActorPool''','dialog finally')

# executeActorPool accepts helper entries and derives IDs.
t=rep(t,
'''async function executeActorPool({ actor, source, modifier = 0, extra = 0, persona = 0, traitId = null, wiseId = null, tokenPowerId = null, talentId = null, helperIds = [], temporaryDice = 0,''',
'''async function executeActorPool({ actor, source, modifier = 0, extra = 0, persona = 0, traitId = null, wiseId = null, tokenPowerId = null, talentId = null, helperIds = [], helperEntries = [], temporaryDice = 0,''','pool signature')
t=rep(t,
'''  const helpDice = helperIds.length;
''',
'''  const committedHelpers=(helperEntries ?? []).filter(entry=>entry?.actorId);
  if(committedHelpers.length) helperIds=committedHelpers.map(entry=>entry.actorId);
  const helpDice = helperIds.length;
''','pool helper provenance')
t=rep(t,
'''    helperIds, helpDice, modifier: Number(modifier), extra: Number(extra),''',
'''    helperIds, helpers: committedHelpers, helpDice, modifier: Number(modifier), extra: Number(extra),''','roll helper provenance')

# Calls pass helperEntries.
t=t.replace('helperIds: dialog.helperIds, label: "Starting Disposition"','helperIds: dialog.helperIds, helperEntries: dialog.helperEntries, label: "Starting Disposition"')
t=t.replace('helperIds: dialog.helperIds, temporaryDice: tactical','helperIds: dialog.helperIds, helperEntries: dialog.helperEntries, temporaryDice: tactical')

# GM story modifier buttons in current action.
t=rep(t,
'''${gmCan ? `<button type="button" class="rg-conflict-primary gm" data-conflict-action="roll" data-side="gm"''',
'''${game.user?.isGM ? `<button type="button" class="rg-conflict-story-modifier" data-conflict-action="story-modifier" data-side="gm"><i class="fa-solid fa-sliders"></i> GM Modifier</button>` : ""}${gmCan ? `<button type="button" class="rg-conflict-primary gm" data-conflict-action="roll" data-side="gm"''','gm modifier button')
t=rep(t,
'''${rangerCan ? `<button type="button" class="rg-conflict-primary ranger" data-conflict-action="roll" data-side="ranger"''',
'''${game.user?.isGM ? `<button type="button" class="rg-conflict-story-modifier" data-conflict-action="story-modifier" data-side="ranger"><i class="fa-solid fa-sliders"></i> GM Modifier</button>` : ""}${rangerCan ? `<button type="button" class="rg-conflict-primary ranger" data-conflict-action="roll" data-side="ranger"''','ranger modifier button')

t=rep(t,
'''  if (action === "roll") return rollCurrentAction(side, state);
''',
'''  if (action === "roll") return rollCurrentAction(side, state);
  if (action === "story-modifier") return editStoryModifier(side, state);
''','handle story modifier')

# Add initial gmRollModifiers.
t=rep(t,
'''    loreMasterActions: {}, weaponIds: {},
    outcome: null, compromise: null, log: []
''',
'''    loreMasterActions: {}, weaponIds: {}, gmRollModifiers: {},
    outcome: null, compromise: null, log: []
''','state modifier map')

# Dynamic modifier display listener inside ready hook.
t=rep(t,
'''  Hooks.once("ready", () => {
    game.socket.on(SOCKET_CHANNEL, onSocket);
''',
'''  Hooks.once("ready", () => {
    game.socket.on(SOCKET_CHANNEL, onSocket);
    document.addEventListener("change", event => {
      const source=event.target?.closest?.('.rg-conflict-roll-dialog select[name="source"]'); if(!source) return;
      const root=source.closest('.rg-conflict-roll-dialog'); const box=root?.querySelector?.('[data-rg-modifier-breakdown]'); if(!box) return;
      let map={}; try{ map=JSON.parse(box.dataset.rgConditionPreview || '{}'); }catch(_e){}
      const row=map[source.value] ?? {dice:0,names:[]}; const base=Number(box.dataset.rgAutoBase ?? 0); const input=root.querySelector('[data-rg-auto-modifier]'); if(input) input.value=String(base+Number(row.dice ?? 0));
      const line=box.querySelector('[data-rg-condition-line]'); if(line) line.textContent=`Conditions: ${Number(row.dice ?? 0)>=0?'+':''}${Number(row.dice ?? 0)}D${row.names?.length ? ` · ${row.names.join(', ')}` : ''}`;
    });
''','modifier dynamic listener')

p.write_text(t,encoding='utf-8')

# --- realm-guard.mjs -------------------------------------------------------
p=ROOT/'realm-guard.mjs'; t=p.read_text(encoding='utf-8')
t=rep(t,'import { installActorSheetScrollPersistence } from "./module/actor-sheet-scroll-state.mjs";\n','import { installActorSheetScrollPersistence } from "./module/actor-sheet-scroll-state.mjs";\nimport { installWindowPositionPersistence } from "./module/window-position-service.mjs";\n','window import')
t=rep(t,'  installActorSheetScrollPersistence(RealmGuardActorSheet);\n','  installActorSheetScrollPersistence(RealmGuardActorSheet);\n  installWindowPositionPersistence();\n','window install')
t=t.replace('game.system?.version ?? "1.8.0-qa.6"','game.system?.version ?? "1.8.0-qa.9"')
p.write_text(t,encoding='utf-8')

# --- window position service hardening ------------------------------------
p=ROOT/'module/window-position-service.mjs'; t=p.read_text(encoding='utf-8')
t=t.replace('''  element.dataset.rgWindowPositionKey = key;
  if (!observed.has(element)) {
    observed.add(element);
    resizeObserver?.observe(element);
  }
  requestAnimationFrame(() => applySaved(element, key));
''','''  element.dataset.rgWindowPositionKey = key;
  requestAnimationFrame(() => {
    applySaved(element,key);
    if(!observed.has(element)){ observed.add(element); resizeObserver?.observe(element); }
  });
''')
t=t.replace('''      for (const record of records) for (const node of record.addedNodes) if (node instanceof HTMLElement) scan(node);
''','''      for (const record of records) for (const node of record.addedNodes) if (node instanceof HTMLElement) { scan(node); const shell=node.closest?.(".application"); if(shell) manage(shell); }
''')
p.write_text(t,encoding='utf-8')

# --- CSS ------------------------------------------------------------------
p=ROOT/'styles/conflict-parchment-prototype.css'; t=p.read_text(encoding='utf-8')
marker='/* v1.8.0-qa.9 — Conflict continuity / Help / modifiers */'
if marker not in t:
    t += r'''

/* v1.8.0-qa.9 — Conflict continuity / Help / modifiers */
.rg-conflict-roll-dialog .rg-modifier-breakdown{display:grid;gap:4px;padding:8px 10px;margin:8px 0;border:1px solid rgba(105,72,36,.30);border-left:4px solid #9b6a2d;border-radius:6px;background:rgba(255,244,213,.62);color:#4e3b24}
.rg-conflict-roll-dialog .rg-modifier-breakdown>b{color:#382615}.rg-conflict-roll-dialog .rg-modifier-breakdown span{font-size:12px;color:#665139}
.rg-conflict-roll-dialog input[readonly]{cursor:default;opacity:.9}
.rg-conflict-teamwork{margin-top:9px}.rg-help-availability-list{display:grid;gap:4px;margin:5px 0}.rg-help-availability{display:flex;gap:7px;align-items:center;padding:5px 7px;border-radius:5px;font-size:12px}.rg-help-availability.is-available{background:rgba(65,103,58,.09);border:1px solid rgba(70,105,61,.28)}.rg-help-availability.is-blocked{background:rgba(126,63,52,.08);border:1px solid rgba(126,63,52,.26)}.rg-help-availability.is-available i{color:#526b32}.rg-help-availability.is-blocked i{color:#8e493e}
.rg-teamwork-request textarea{width:100%;min-height:62px;resize:vertical}
.rg-teamwork-review{display:grid;gap:8px;min-width:min(440px,90vw)}.rg-teamwork-review blockquote{margin:0;padding:8px 10px;border-left:3px solid #9b6a2d;background:rgba(201,151,76,.08)}
.rg-conflict-window .rg-conflict-story-modifier{min-height:30px;margin:6px auto 0;padding:4px 9px;color:#5a4327!important;background:rgba(194,151,76,.10)!important;border:1px solid rgba(139,98,46,.45)!important;border-radius:5px!important;font-size:11px;font-weight:800}.rg-conflict-window .rg-conflict-story-modifier:hover{background:rgba(194,151,76,.18)!important}
.rg-gm-story-modifier{display:grid;gap:8px;min-width:min(460px,88vw)}.rg-gm-story-modifier label{display:grid;gap:4px}
'''
    p.write_text(t,encoding='utf-8')

# --- manifest / docs -------------------------------------------------------
p=ROOT/'system.json'; data=json.loads(p.read_text(encoding='utf-8')); data['version']='1.8.0-qa.9'; data['download']='https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download/1.8.0-qa.9/realm-guard.zip'; p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
(ROOT/'RELEASE_NOTES_v1.8.0-qa.9.md').write_text('''# v1.8.0-qa.9 — Conflict UX Continuity\n\n- Per-user persistent RG/TB window position/size with viewport clamping.\n- Conflict Help request workflow restored to Conflict rolls.\n- Help is limited to online Conflict participants and blocked before request when eligibility fails (including Afraid).\n- Helper may add an optional written description.\n- Trained Skill Help auto-accepts; Ability/Wise/Synergy offers receive GM review to avoid routine extra clicks.\n- Conflict modifier field is locked. Conditions, Maneuver, Conflict Tool and GM circumstance are displayed as automatic modifier sources.\n- GM can set a story/circumstance modifier for either side from Current Action.\n- No M6 resolution/state authority changes.\n''',encoding='utf-8')
(ROOT/'TEST_PROTOCOL_v1.8.0-qa.9.md').write_text('''# QA — v1.8.0-qa.9\n\n1. Move/resize Conflict and Conflict Roll windows; click through actions and reopen dialogs. They must remain where the user left them. Reload and verify persistence. Resize viewport smaller and verify clamping.\n2. Player opens Ranger Conflict roll and clicks Ask for Help. Only online Rangers participating in the Conflict receive requests.\n3. Afraid participant: request is blocked before popup and the requester sees the reason. Recheck also blocks stale acceptance.\n4. Helper can Offer Help or Decline and may add optional description.\n5. Trained Skill Help should flow without an extra GM click. Wise/Ability/Synergy should request GM review. Approve and Reject both work.\n6. Accepted Help appears in the roll dialog and contributes +1D per accepted helper up to the action limit.\n7. Modifier Total is readonly. Change source and verify Condition contribution display recalculates. Maneuver/Tool modifiers remain automatic.\n8. GM sets Story Modifier from Current Action; player sees it read-only and the roll uses it.\n9. M6 regression: handoff/state/shadow mismatches remain 0; Conflict stacking and scroll remain good.\n''',encoding='utf-8')
print('Applied v1.8.0-qa.9 Conflict UX continuity package')
