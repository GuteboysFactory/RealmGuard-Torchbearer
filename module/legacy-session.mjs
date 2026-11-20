import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { registerGmDockTool } from './gm-dock.mjs';
import { resetTraitSessionUses } from './traits.mjs';
import { resetTokenPowerSessionState } from './tokens-of-power.mjs';
import { resetTalentSessionState } from './talents.mjs';

const NS = 'realm-guard';
export async function resetWiseSessionUses(actor){let count=0;for(const wise of actor.items.filter(i=>i.type==='wise'))if(wise.getFlag?.(NS,'wiseUsed')??wise.flags?.[NS]?.wiseUsed){await wise.update({[`flags.${NS}.-=wiseUsed`]:null});count++;}return count;}
export async function resetLegacySessionUses(actor) {
  await resetWiseSessionUses(actor);
  const traitUsesReset = await resetTraitSessionUses(actor);
  const tokenUsesReset = await resetTokenPowerSessionState(actor);
  const talentUsesReset = await resetTalentSessionState(actor);
  return {traitUsesReset, tokenUsesReset, talentUsesReset};
}

let starting = false;
export async function startLegacySession() {
  if (!game.user?.isGM || starting) return;
  const approved = await foundry.applications.api.DialogV2.confirm({window:{title:'Start a new session'},content:'<p>Start a new session? Resets session-limited Trait benefits, Tokens of Power and session Talents for all characters and NPCs. Fate, Persona, Conditions and Learning are retained.</p>',modal:false});
  if (!approved || starting) return;
  starting = true;
  try {
    for (const actor of game.actors.filter(a => ['character','npc'].includes(a.type))) {
      await resetLegacySessionUses(actor);
    }
    await game.settings.set(NS,'endSessionCycle',Number(game.settings.get(NS,'endSessionCycle') ?? 1)+1);
    await game.settings.set(NS,'endSessionFinalized',false);
    await ChatMessage.create({content:'<div class="realm-guard rg-session-notice"><h3>New session started</h3><p>Session uses restored: Traits, Tokens of Power and Talents.</p></div>'});
  } finally { starting = false; }
}
export function installLegacySession() {
  if (!legacyMixedPolishEnabled()) return;
  registerGmDockTool({id:'start-session',icon:'fa-solid fa-play',tooltip:'Start Session · reset session uses',order:9,onClick:startLegacySession});
}
