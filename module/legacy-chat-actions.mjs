import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { withRollUndo, enlistRollActors } from './roll-undo.mjs';
import {openStandaloneCustomRoll} from './legacy-free-roll.mjs';
import { registerGmDockTool } from './gm-dock.mjs';
import { baselineObstacle } from './obstacles.mjs';
const NS='realm-guard',esc=v=>foundry.utils.escapeHTML(String(v??''));
export async function respondToRoll(SheetClass,message){
  const challenge=message.flags?.[NS]?.challenge;if(!challenge||message.flags?.[NS]?.rollUndo?.undone)return;
  const actors=game.actors.filter(a=>a.type==='character'&&a.isOwner);
  let actor=game.user.character?.isOwner?game.user.character:actors[0];
  if(!actor)return ui.notifications.warn("Choose a character you own.");
  let role=actor.items.filter(i=>i.type==="role").sort((a,b)=>a.name.localeCompare(b.name))[0];
  if(!role)return ui.notifications.warn("This character has no Skills.");
  let options,beginner,abilityKey,sheet;
  while(true){
    sheet=actor.sheet??{actor,render:()=>{}};beginner=Number(role.system.rating??0)<=0;
    abilityKey=role.system.beginnerAbility||(["fighter","hunter","scout","survivalist"].includes(role.name.toLowerCase())?"health":"will");
    options=await SheetClass._openRollDialog.call(sheet,role,{obstacle:challenge.obstacle,fixedObstacle:true,isSkill:true,beginnerLuck:beginner,beginnerAbility:abilityKey,replyContext:{label:challenge.label,actorIds:actors.map(a=>a.id)}});
    if(!options)return;
    if(!options.replySelection)break;
    actor=game.actors.get(options.replySelection.actorId);role=actor?.items.get(options.replySelection.skillId);
    if(!actor?.isOwner||role?.type!=="role")return;
  }
  const result=await rollSkillWithOptions(SheetClass,sheet,role,options,{obstacle:challenge.obstacle,versus:challenge.versus,abilityKey});
  if(result){
    const reply=game.messages.get(actor.getFlag(NS,'lastUndoRoll'));
    if(reply)await reply.update({'flags.realm-guard.challengeResponse':{messageId:message.id,actorId:actor.id}});
    refreshResponseButtons();
  }
  return result;
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
  return [...new Set(game.messages.filter(m=>m.flags?.[NS]?.challengeResponse?.messageId===message.id&&!m.flags?.[NS]?.rollUndo?.undone).map(m=>game.actors.get(m.flags[NS].challengeResponse.actorId)?.name).filter(Boolean))];
}
function paintResponseButtons(message,root){
  const names=responseNames(message),challenge=message.flags?.[NS]?.challenge;
  for(const b of root.querySelectorAll('[data-rg-respond]')){
    b.classList.toggle('rg-responded',names.length>0);
    b.textContent=names.length?`${names.join(', ')} Responded`:`Respond · choose Skill · Ob ${challenge.obstacle}`;
  }
}
function refreshResponseButtons(){
  if(typeof document==='undefined')return;
  for(const message of game.messages.filter(m=>m.flags?.[NS]?.challenge)){
    for(const root of document.querySelectorAll(`[data-message-id="${CSS.escape(message.id)}"],[data-entry-id="${CSS.escape(message.id)}"]`))paintResponseButtons(message,root);
  }
}
export async function publishChallenge(actor,label,obstacle,{versus=false}={}){
  if(!game.user?.isGM)return;
  const ob=Number(obstacle);if(!Number.isInteger(ob)||ob<0)return;
  return ChatMessage.create({speaker:ChatMessage.getSpeaker({actor}),flags:{[NS]:{challenge:{label,obstacle:ob,versus,actorId:actor?.id??null}}},content:`<div class="realm-guard rg-challenge"><header>${versus?'VERSUS':'OBSTACLE'}</header><h3>${esc(label)}</h3><strong>Ob ${ob}</strong><p><button type="button" data-rg-respond>Choose Skill and respond</button></p></div>`});
}
export function installLegacyChatActions(SheetClass){
  if(!legacyMixedPolishEnabled())return;
  for(const hook of ['createChatMessage','updateChatMessage','deleteChatMessage'])Hooks.on(hook,refreshResponseButtons);
  registerGmDockTool({id:'post-obstacle',icon:'fa-solid fa-bullseye',tooltip:'Post Obstacle to chat',order:12,onClick:async()=>{const value=await foundry.applications.api.DialogV2.wait({window:{title:'Post Obstacle'},content:`<label>Test / challenge<input name="label" value="GM challenge"></label><label>Obstacle<input name="ob" type="number" min="0" step="1" value="${baselineObstacle()}"></label>`,modal:false,rejectClose:false,buttons:[{action:'post',label:'Post to chat',callback:(_e,b)=>({label:b.form.elements.label.value,ob:Number(b.form.elements.ob.value)})},{action:'cancel',label:'Cancel',callback:()=>null}]});if(value)await publishChallenge(null,value.label,value.ob);}});
  const chatButton=()=>{const bar=document.querySelector('#chat-controls, .chat-controls');if(!bar||bar.querySelector('[data-rg-custom-chat]'))return;const b=document.createElement('button');b.type='button';b.dataset.rgCustomChat='';b.title='Custom Roll';b.setAttribute('aria-label','Custom Roll');b.innerHTML='<i class="fa-solid fa-dice"></i>';b.onclick=()=>void openStandaloneCustomRoll();bar.append(b);};
  Hooks.on('renderChatLog',chatButton);Hooks.on('renderChatInput',chatButton);Hooks.once('ready',chatButton);
  Hooks.on('renderChatMessageHTML',(message,html)=>{const root=html instanceof HTMLElement?html:html?.[0];if(!root)return;if(root.querySelector('.realm-guard'))root.classList.add('rg-separated-message');
    const challenge=message.flags?.[NS]?.challenge;if(challenge&&!message.flags?.[NS]?.rollUndo?.undone){root.classList.add('rg-separated-message');if(!root.querySelector("[data-rg-respond]")){const button=document.createElement("button");button.type="button";button.dataset.rgRespond="";button.textContent=`Respond · choose Skill · Ob ${challenge.obstacle}`;root.append(button);}for(const b of root.querySelectorAll('[data-rg-respond]'))b.addEventListener('click',()=>void respondToRoll(SheetClass,message));paintResponseButtons(message,root);}
    if(game.user.isGM&&!challenge&&root.querySelector('.rg-chat-roll-pipeline')&&!message.flags?.[NS]?.rollDecisionPending&&!message.flags?.[NS]?.conflictRoll){const b=document.createElement('button');b.type='button';b.textContent='Ask players to respond…';b.onclick=async()=>{const values=await foundry.applications.api.DialogV2.wait({window:{title:'Player response target'},content:'<label>Obstacle / rolled successes<input name="ob" type="number" min="0" step="1" value="1"></label><label><input type="checkbox" name="versus" checked> Versus</label>',modal:false,rejectClose:false,buttons:[{action:'post',label:'Post challenge',callback:(_e,btn)=>({ob:Number(btn.form.elements.ob.value),versus:btn.form.elements.versus.checked})},{action:'cancel',label:'Cancel',callback:()=>null}]});if(values)await publishChallenge(game.actors.get(message.speaker?.actor),message.speaker?.alias??'GM challenge',values.ob,{versus:values.versus});};root.append(b);}
  });
  game.realmGuard??={};game.realmGuard.publishChallenge=publishChallenge;
  Hooks.on('renderApplicationV2',app=>{if(app.actor&&app.element){const title=app.element.querySelector('.window-title');if(title){title.textContent=app.actor.name;title.title=app.actor.name;}}});
}
