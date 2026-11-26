import { isAvailableSkill } from './default-skills.mjs';
import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { withRollUndo, enlistRollActors, snapshotActors, actorChanges } from './roll-undo.mjs';
import {openStandaloneCustomRoll, rollStandaloneD6} from './legacy-free-roll.mjs';
import { registerGmDockTool } from './gm-dock.mjs';
import { baselineObstacle } from './obstacles.mjs';
import { abilityLabel, recordAbilityTest } from './advancement.mjs';
import { installTurnAuthorityBridge, requestTurnAuthority } from './turn-authority-bridge.mjs';
const NS='realm-guard',esc=v=>foundry.utils.escapeHTML(String(v??''));
const DIRECTED_VERSUS = 'DIRECTED_VERSUS_RESPONSE';
let responseQueue = Promise.resolve();

function targetActor(challenge) {
  return (challenge.target.uuid ? globalThis.fromUuidSync?.(challenge.target.uuid) : null) ?? game.actors.get(challenge.target.id);
}

function canRespondToTarget(challenge, user) {
  const target = targetActor(challenge);
  return Boolean(target && (user?.isGM || (target.type === 'character' && target.testUserPermission(user, 'OWNER'))));
}

function recordedResponses(message) {
  return game.messages.filter(reply => reply.flags?.[NS]?.challengeResponse?.messageId === message.id && !reply.flags?.[NS]?.rollUndo?.undone);
}

function responseChallenge(message) {
  const flags = message.flags?.[NS];
  const challenge = flags?.challenge;
  if (!challenge || flags.rollUndo?.undone || flags.challengeResponse) return null;
  // Old releases used to attach an implicit challenge to a completed roll.
  return challenge.target || !message.content?.includes('rg-chat-roll-pipeline') ? challenge : null;
}

async function commitDirectedResponse(SheetClass, { messageId, claim, action, replyId }, requester) {
  const message = game.messages.get(messageId);
  const challenge = message?.flags?.[NS]?.challenge;
  if (!challenge?.target || message.flags?.[NS]?.rollUndo?.undone || !canRespondToTarget(challenge, requester)) {
    return {ok:false, reason:'This Versus is assigned to another character or is no longer available.'};
  }
  const existing = message.flags[NS].directedResponseClaim;
  if (action === 'claim') {
    if (recordedResponses(message).length || existing?.expires > Date.now()) return {ok:false, reason:'This Versus already has a response in progress or recorded.'};
    await message.update({'flags.realm-guard.directedResponseClaim':{ id:claim, userId:requester.id, expires:Date.now()+15*60_000 }});
    return {ok:true};
  }
  if (!existing || existing.id !== claim || existing.userId !== requester.id) return {ok:false, reason:'This response is no longer reserved.'};
  if (action === 'finish') {
    const reply = game.messages.get(replyId);
    const response = reply?.flags?.[NS]?.challengeResponse;
    if (!response || response.messageId !== messageId || reply.author?.id !== requester.id || response.actorId !== challenge.target.id) {
      return {ok:false, reason:'The response could not be matched to the Versus challenge.'};
    }
    const initiator = (challenge.actorUuid ? globalThis.fromUuidSync?.(challenge.actorUuid) : null) ?? game.actors.get(challenge.actorId);
    if (initiator && !response.tied) {
      const trackedIds = [...new Set([initiator.id, ...(challenge.help ?? []).map(entry => entry.actorId)])];
      const before = snapshotActors(trackedIds);
      const passed = !response.passed;
      const margin = Math.abs(challenge.obstacle - response.successes);
      const sheet = {actor: initiator, render: async () => {}};
      const role = initiator.items.get(challenge.source?.itemId);
      const outcome = {passed, tied:false, margin};
      const direct = challenge.source?.key === 'nature';
      let tax = initiator._natureTax(outcome, direct ? {direct:true,scope:challenge.natureUse} : {tapped:challenge.tapNature,scope:challenge.natureScope});
      if (direct && challenge.doubleTapNature && !passed) tax = Math.max(tax, margin);
      if (tax) await initiator._applyNatureTax(tax, 'Directed Versus');
      if (challenge.countLearning) {
        if (challenge.source?.kind === 'ability') await recordAbilityTest(initiator, challenge.source.key, passed);
        else if (role && !challenge.source?.beginner) await SheetClass._recordLearning.call(sheet, role, passed);
        else if (role && !Number(role.system.rating ?? 0)) {
          const needed = Math.max(1, Number(initiator.system.attributes.nature.maximum ?? initiator.system.attributes.nature.value ?? 1));
          const attempts = Math.min(needed, Number(role.system.beginnerAttempts ?? 0) + 1);
          await role.update({'system.beginnerAttempts':attempts});
          if (attempts >= needed) await SheetClass._autoLearnSkill.call(sheet, role, {render:false});
        }
      }
      await SheetClass._commitSynergy.call(sheet, challenge.help ?? [], outcome, `${challenge.label} Help`);
      const settlement = actorChanges(before, snapshotActors(trackedIds));
      if (reply.flags[NS].rollUndo && settlement.length) {
        await reply.update({'flags.realm-guard.rollUndo.settlement': settlement});
      }
    }
  } else if (action !== 'release') return {ok:false, reason:'Unknown response action.'};
  await message.update({'flags.realm-guard.-=directedResponseClaim':null});
  return {ok:true};
}

export function challengeTestChoices(actor) {
  const skills = actor.items.filter(item => item.type === "role" && isAvailableSkill(item.name)).sort((a,b) => a.name.localeCompare(b.name));
  const abilities = ["nature", "health", "will", "circles", "resources"]
    .filter(key => actor.system.attributes?.[key])
    .map(key => ({id: `ability:${key}`, key, type: "ability", name: abilityLabel(key), system: {rating: Number(actor.system.attributes[key].value ?? 0)}}));
  return [...skills, ...abilities];
}

export async function respondToRoll(SheetClass,message){
  const challenge = responseChallenge(message);
  if (!challenge) return;
  const target = challenge.target && targetActor(challenge);
  if (challenge.target && (!canRespondToTarget(challenge, game.user) || recordedResponses(message).length)) return;
  const actors=target ? [target] : game.actors.filter(a=>a.type==='character'&&a.isOwner);
  if (!target) return rollResponse(SheetClass, message, challenge, actors);

  const claim = foundry.utils.randomID();
  const request = (action, replyId) => requestTurnAuthority(DIRECTED_VERSUS, {action, messageId:message.id, claim, replyId}, {primaryOnly:true});
  const reservation = await request('claim');
  if (!reservation.ok) return ui.notifications.warn(reservation.reason);
  try {
    const response = await rollResponse(SheetClass, message, challenge, actors);
    if (response?.replyId) {
      const completed = await request('finish', response.replyId);
      if (!completed.ok) ui.notifications.warn(completed.reason);
    }
    return response?.result;
  } finally {
    await request('release');
  }
}

async function rollResponse(SheetClass, message, challenge, actors) {
  let actor=actors.includes(game.user.character)?game.user.character:actors[0];
  if(!actor)return ui.notifications.warn("Choose a character you own.");
  let role=challengeTestChoices(actor)[0];
  if(!role)return ui.notifications.warn("This character has no available tests.");
  let options,beginner,abilityKey,sheet;
  while(true){
    sheet=actor.sheet??{actor,render:()=>{}};
    const isSkill=role.type==="role";
    beginner=isSkill&&Number(role.system.rating??0)<=0;
    abilityKey=role.system.beginnerAbility||(["fighter","hunter","scout","survivalist"].includes(role.name.toLowerCase())?"health":"will");
    options=await SheetClass._openRollDialog.call(sheet,role,{obstacle:challenge.obstacle,fixedObstacle:true,isSkill,abilityKey:role.key??"",beginnerLuck:beginner,beginnerAbility:abilityKey,replyContext:{label:challenge.label,opponentId:challenge.actorId,actorIds:actors.map(a=>a.id)}});
    if(!options)return;
    if(!options.replySelection)break;
    actor=actors.find(candidate=>candidate.id===options.replySelection.actorId);
    if(!actor?.isOwner)return;
    role=challengeTestChoices(actor).find(choice=>choice.id===options.replySelection.skillId);
    if(!role)return;
  }
  if (challenge.versus) {
    options.tieOpponent = (challenge.actorUuid ? globalThis.fromUuidSync?.(challenge.actorUuid) : null) ?? game.actors.get(challenge.actorId);
    options.tieOpposition = challenge.source;
  }
  const result=role.type==="ability"
    ? await rollChallengeAbility(SheetClass,sheet,role,options,challenge)
    : await rollSkillWithOptions(SheetClass,sheet,role,options,{obstacle:challenge.obstacle,versus:challenge.versus,abilityKey});
  if(result){
    const reply=game.messages.get(actor.getFlag(NS,'lastUndoRoll'));
    if(reply)await reply.update({'flags.realm-guard.challengeResponse':{
      messageId:message.id, actorId:actor.id, successes:result.successes, passed:result.passed, tied:result.tied
    }});
    refreshResponseButtons();
    if (challenge.target) return {result, replyId:reply?.id};
  }
  return result;
}

async function rollChallengeAbility(SheetClass,sheet,ability,options,challenge) {
  const actor=sheet.actor;
  return withRollUndo(actor,async()=>{
    enlistRollActors(actor,(options.help??[]).map(entry=>entry.actorId));
    const talentUse=SheetClass._talentUse.call(sheet,options.talentId,ability.name,{isSkill:false});
    if(options.talentId&&!talentUse)return;
    const extraDice=Number(options.extraDice??0)+Number(talentUse?.diceBonus??0);
    const result=await actor.rollAbility(ability.key,{...options,extraDice,talentUse,obstacle:challenge.obstacle,versus:challenge.versus});
    if(!result)return;
    await SheetClass._commitTalentAfterRoll.call(sheet,talentUse,ability.name);
    await SheetClass._commitSynergy.call(sheet,options.help,result,`${ability.name} Help`);
    if(options.countLearning&&!result.tied)await recordAbilityTest(actor,ability.key,Boolean(result.passed));
    return result;
  });
}
export async function rollSkillWithOptions(SheetClass,sheet,role,options,{obstacle=options.obstacle,versus=false,abilityKey=role.system.beginnerAbility||"will"}={}){
  const actor=sheet.actor,beginner=Number(role.system.rating??0)<=0;
  return withRollUndo(actor,async()=>{
    enlistRollActors(actor,(options.help??[]).map(entry=>entry.actorId));
    // A reply always uses the original card's target, regardless of scene targeting.
    const talentUse=SheetClass._talentUse.call(sheet,options.talentId,role.name,{isSkill:true});if(options.talentId&&!talentUse)return;
    const args={...options,obstacle,versus,talentUse,extraDice:Number(options.extraDice??0)+Number(talentUse?.diceBonus??0)};
    const result=beginner?await actor.rollBeginnerLuck(role,{...args,abilityKey}):await actor.rollRole(role,args);
    if(!result)return;
    await SheetClass._commitTalentAfterRoll.call(sheet,talentUse,role.name);
    await SheetClass._commitSynergy.call(sheet,options.help,result,`${role.name} Help`);
    if(!beginner&&options.countLearning&&!result.tied)await SheetClass._recordLearning.call(sheet,role,result.passed);
    if(beginner&&options.countLearning&&!result.tied){
      const current=actor.items.get(role.id),needed=Math.max(1,Number(actor.system.attributes.nature.maximum??actor.system.attributes.nature.value??1));
      const attempts=Math.min(needed,Number(current.system.beginnerAttempts??0)+1),update={'system.beginnerAttempts':attempts};
      if(attempts>=needed)update['flags.realm-guard.autoLearnRequestedBy']=game.user.id;
      await current.update(update);
      if(attempts>=needed)await SheetClass._autoLearnSkill.call(sheet,current);else await sheet.render?.({force:true});
    }
    return result;
  });
}
function responseNames(message){
  return [...new Set(recordedResponses(message).map(m=>game.actors.get(m.flags[NS].challengeResponse.actorId)?.name).filter(Boolean))];
}
function paintResponseButtons(message,root){
  const challenge = responseChallenge(message);
  if (!challenge) return;
  const names = responseNames(message);
  for(const b of root.querySelectorAll('[data-rg-respond]')){
    if (challenge.target) {
      const response = recordedResponses(message)[0]?.flags?.[NS]?.challengeResponse;
      b.hidden = Boolean(response) || !canRespondToTarget(challenge, game.user);
      b.disabled = Boolean(response || message.flags[NS].directedResponseClaim?.expires > Date.now());
      b.textContent = `Respond · ${challenge.target.name}`;
      const status = root.querySelector('.rg-result-final small');
      if (status && response) status.textContent = response.tied ? 'Tie · see response' : response.passed ? `${challenge.target.name} wins` : 'Challenger wins';
      else if (status) status.textContent = 'Waiting for response';
      continue;
    }
    b.classList.toggle('rg-responded',names.length>0);
    b.textContent=names.length?`${names.join(', ')} Responded`:`Respond · choose Skill or Ability · ${challenge.versus?'Vs.':'Ob'} ${challenge.obstacle}`;
  }
}
function refreshResponseButtons(){
  if(typeof document==='undefined')return;
  for(const message of game.messages.filter(m=>m.flags?.[NS]?.challenge)){
    for(const root of document.querySelectorAll(`[data-message-id="${CSS.escape(message.id)}"],[data-entry-id="${CSS.escape(message.id)}"]`))paintResponseButtons(message,root);
  }
}
export async function publishChallenge(actor,label,obstacle,{versus=false,source=null}={}){
  if(!game.user?.isGM)return;
  const ob=Number(obstacle);if(!Number.isInteger(ob)||ob<0)return;
  return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),flags:{[NS]:{challenge:{label,obstacle:ob,versus,actorId:actor?.id??null,actorUuid:source?.actorUuid??actor?.uuid??null,source}}},content:`<div class="realm-guard rg-challenge"><header>${versus?'VERSUS':'OBSTACLE'}</header><h3>${esc(label)}</h3><strong>Ob ${ob}</strong><p><button type="button" data-rg-respond>Choose Skill and respond</button></p></div>`});
}
export function installLegacyChatActions(SheetClass){
  if(!legacyMixedPolishEnabled())return;
  installTurnAuthorityBridge({[DIRECTED_VERSUS]:(payload,{requester})=>{
    const next = responseQueue.then(()=>commitDirectedResponse(SheetClass,payload,requester));
    responseQueue = next.catch(()=>{});
    return next;
  }});
  for(const hook of ['createChatMessage','updateChatMessage','deleteChatMessage'])Hooks.on(hook,refreshResponseButtons);
  registerGmDockTool({id:'post-obstacle',icon:'fa-solid fa-bullseye',tooltip:'Post Obstacle to chat',order:12,onClick:async()=>{const value=await foundry.applications.api.DialogV2.wait({window:{title:'Post Obstacle'},content:`<label>Test / challenge<input name="label" value="GM challenge"></label><label>Obstacle<input name="ob" type="number" min="0" step="1" value="${baselineObstacle()}"></label>`,modal:false,rejectClose:false,buttons:[{action:'post',label:'Post to chat',callback:(_e,b)=>({label:b.form.elements.label.value,ob:Number(b.form.elements.ob.value)})},{action:'cancel',label:'Cancel',callback:()=>null}]});if(value)await publishChallenge(null,value.label,value.ob);}});
  const chatButton = () => {
    const bar = document.querySelector('#chat-controls, .chat-controls');
    if (!bar || bar.querySelector('[data-rg-custom-chat]')) return;
    const custom = document.createElement('button');
    custom.type = 'button';
    custom.dataset.rgCustomChat = '';
    custom.title = 'Custom Roll';
    custom.setAttribute('aria-label', 'Custom Roll');
    custom.innerHTML = '<i class="fa-solid fa-dice" aria-hidden="true"></i>';
    custom.onclick = () => void openStandaloneCustomRoll();

    const d6 = document.createElement('button');
    d6.type = 'button';
    d6.dataset.rgD6Chat = '';
    d6.title = 'Roll d6s · 4–6 Pass, 1–3 Fail';
    d6.textContent = 'D6s';
    d6.onclick = async () => {
      try {
        await rollStandaloneD6();
      } catch (error) {
        console.error('Realm Guard | D6s roll failed', error);
        ui.notifications.error('Realm Guard: Could not roll d6s.');
      }
    };
    bar.append(custom, d6);
  };
  Hooks.on('renderChatLog',chatButton);Hooks.on('renderChatInput',chatButton);Hooks.once('ready',chatButton);
  Hooks.on('renderChatMessageHTML', (message, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    if (!root) return;
    if (root.querySelector('.realm-guard')) root.classList.add('rg-separated-message');
    if (!responseChallenge(message)) {
      root.querySelectorAll('[data-rg-respond]').forEach(button => button.remove());
      return;
    }
    root.classList.add('rg-separated-message');
    let button = root.querySelector('[data-rg-respond]');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.dataset.rgRespond = '';
      root.append(button);
    }
    button.onclick = () => respondToRoll(SheetClass, message).catch(error => ui.notifications.error(error.message));
    paintResponseButtons(message, root);
  });
  game.realmGuard??={};game.realmGuard.publishChallenge=publishChallenge;
  Hooks.on('renderApplicationV2',app=>{if(app.actor&&app.element){const title=app.element.querySelector('.window-title');if(title){title.textContent=app.actor.name;title.title=app.actor.name;}}});
}
