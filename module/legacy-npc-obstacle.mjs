import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { rollSkillWithOptions } from './legacy-chat-actions.mjs';
export async function rollNpcObstacle(sheet,SheetClass,role=null){
  if(!legacyMixedPolishEnabled()||!game.user?.isGM||!sheet.actor?.isOwner)return;
  role??=sheet.actor.items.filter(i=>i.type==='role'&&Number(i.system.rating)>0).sort((a,b)=>Number(b.system.rating)-Number(a.system.rating))[0];
  if(!role)return SheetClass._customRoll.call(sheet);
  while(true){
    const beginner=Number(role.system.rating??0)<=0;
    const abilityKey=role.system.beginnerAbility||sheet.actor._tiebreakOptions?.(role.name,'role')?.[0]||'will';
    const options=await SheetClass._openRollDialog.call(sheet,role,{obstacle:0,fixedObstacle:true,beginnerLuck:beginner,beginnerAbility:abilityKey,replyContext:{label:'NPC Obstacle · rolled successes become the players’ OB',actorIds:[sheet.actor.id]}});
    if(!options)return;
    if(options.replySelection){role=sheet.actor.items.get(options.replySelection.skillId);if(!role||role.type!=='role')return;continue;}
    return rollSkillWithOptions(SheetClass,sheet,role,options,{obstacle:0,abilityKey});
  }
}
export function installNpcObstacleTools(sheet,SheetClass){
  if(!legacyMixedPolishEnabled()||!game.user?.isGM||!sheet.isEditable)return;
  const root=sheet.element;root?.querySelector('[data-rg-npc-obstacle]')?.remove();
  root?.querySelectorAll('.rg-npc-skill .rg-role-versus').forEach(control=>control.remove());
  for(const row of root?.querySelectorAll('.rg-npc-skill[data-item-id]')??[]){
    const roll=row.querySelector('.rg-npc-skill-roll'),name=roll?.querySelector('span');
    if(name&&!roll.querySelector('.rg-normal-roll-hint')){const hint=document.createElement('small');hint.className='rg-normal-roll-hint';hint.textContent='– click name for normal roll';name.after(hint);}
    let b=row.querySelector('[data-rg-skill-obstacle]');if(!b){b=document.createElement('button');b.type='button';b.dataset.rgSkillObstacle='';b.textContent='OB';b.title='Roll this Skill as the opposing Obstacle';b.onclick=()=>void rollNpcObstacle(sheet,SheetClass,sheet.actor.items.get(row.dataset.itemId));}
    if(roll)roll.after(b);
  }
}
