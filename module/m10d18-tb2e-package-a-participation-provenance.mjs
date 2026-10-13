import {freezeTb2e} from "./m10d-tb2e-source-coverage.mjs";
import {tb2ePackageAActorEvidence} from "./m10d18-tb2e-package-a-actor-evidence.mjs";
import {tb2ePackageADocumentEvidence} from "./m10d18-tb2e-package-a-document-provenance.mjs";
import {tb2ePackageAOutcomeAndProgressPlan} from "./m10d18-tb2e-package-a-outcome-chain.mjs";
import {tb2eSkillInfo} from "./m10d-tb2e-abilities-shadow.mjs";
import {tb2eConditionTestEffectPlan} from "./m10d-tb2e-conditions-shadow.mjs";

const result=(ok,reasonCode=null,data={})=>freezeTb2e({
  ok,reasonCode,phase:"M10D.18_PACKAGE_A",profileId:"torchbearer2e",
  mode:"CURRENT_PARTICIPANTS_SAVED_D6_READ_ONLY",sourceEvidence:"DH 58-59,77; SG 36-38,46-52",
  liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
  journalWrite:false,settingsWrite:false,rollExecuted:false,resourceSpendCommitted:false,
  advancementWrite:false,learningWrite:false,actorSourceAuthenticated:false,
  rollSourceAuthenticated:false,gmPermissionAuthenticated:false,
  rollTimeActorStateVerified:false,historicalRewardBalanceVerified:false,
  playerConsentAuthenticated:false,participationAtRollTimeVerified:false,
  noAdvanceAuthorized:true,...data
});
const fail=code=>result(false,code);
const norm=s=>String(s??"").trim().toLowerCase();
const names=(items,name)=>items.filter(i=>norm(i.name)===norm(name));
const conditionsMatch=(claimed,observed)=>Array.isArray(claimed)&&
  JSON.stringify(claimed.map(norm).sort())===JSON.stringify(observed.map(norm).sort());
const positive=n=>Number.isInteger(n)&&n>=1&&n<=6;
const itemId=id=>typeof id==="string"&&/^[A-Za-z0-9]{1,128}$/.test(id);
const sourcePenalty=(evidence,test)=>tb2eConditionTestEffectPlan({conditions:evidence.conditions,test})
  .components.filter(c=>c.kind==="DICE"&&c.condition!=="FRESH").reduce((sum,c)=>sum+c.value,0);

/** Current Actor facts + one saved plain-D6 message. Read-only ordinary Skill
 * or Beginner's Luck, one ordinary helper and one distinct Wise aid source.
 * Fictional relevance and actual player acceptance remain explicit assertions.
 * No rerolls, Heroic/Instinct/Nature/bonus spend or advancement in this bridge.
 */
export function tb2ePackageAParticipationOutcomePlan(options={}){
  const doc=tb2ePackageADocumentEvidence({actorId:options?.actorId,messageId:options?.messageId});
  if(!doc.ok)return fail(doc.reasonCode);
  try {
    if(!options||typeof options!=="object"||Array.isArray(options)||
       Object.keys(options).some(k=>!["actorId","messageId","scenarioInput","helpSourceItemId","wiseAidItemId"].includes(k)))
      return fail("UNSUPPORTED_PARTICIPATION_FIELDS");
    const {actorId,scenarioInput:s,helpSourceItemId=null,wiseAidItemId=null}=options;
    if(!s||typeof s!=="object"||Array.isArray(s)||!["SKILL","BEGINNERS_LUCK"].includes(s.mode)||
       s.actingOnInstinct===true||s.channelNatureFacts!=null||s.heroicRatingSevenUnlocked===true||
       Object.values(s.bonuses??{}).some(v=>v!==0))return fail("PARTICIPATION_BRIDGE_SCOPE_UNSUPPORTED");
    const acting=doc.actorEvidence;
    if(s.actingCharacterId!==actorId)return fail("CURRENT_ACTOR_ID_MISMATCH");
    if(!conditionsMatch(s.actingConditions,acting.conditions))return fail("CURRENT_ACTOR_CONDITIONS_MISMATCH");
    const skill=tb2eSkillInfo(s.skillName);
    if(!skill.ok)return fail("UNKNOWN_PARTICIPATION_SKILL");
    const roles=names(acting.currentSkillItems,skill.skill);
    if(roles.length>1)return fail("AMBIGUOUS_CURRENT_ACTOR_SKILL");
    if(roles.length&&!itemId(roles[0].itemId))return fail("INVALID_CURRENT_ACTOR_SKILL_ITEM");
    let actingSource;
    if(s.mode==="SKILL"){
      if(roles.length!==1||!positive(roles[0].rating)||roles[0].rating!==s.rating)
        return fail("CURRENT_ACTOR_SKILL_RATING_MISMATCH");
      actingSource={kind:"SKILL",itemId:roles[0].itemId,name:skill.skill,rating:roles[0].rating};
    }else{
      if(roles.length&&roles[0].rating!==0)return fail("BEGINNERS_LUCK_REQUIRES_CURRENT_UNTRAINED_SKILL");
      const ability=skill.beginnersLuckAbility.toLowerCase(),rating=acting.currentAbilities[ability];
      if(norm(s.beginnerAbilityName)!==ability||!positive(rating)||rating!==s.rating)
        return fail("CURRENT_BEGINNERS_LUCK_ABILITY_MISMATCH");
      actingSource={kind:"ABILITY",name:skill.beginnersLuckAbility,rating,
        targetSkill:skill.skill,untrainedRoleItemId:roles[0]?.itemId??null};
    }
    const participants=[acting];let helperSource=null,wiseSource=null;
    if(s.help!=null){
      const h=s.help;
      if(!h||typeof h!=="object"||Array.isArray(h)||!h.helpOptions||typeof h.helpOptions!=="object")
        return fail("EXPLICIT_PARTICIPATION_HELP_SOURCE_REQUIRED");
      if(h.helperId===actorId)return fail("HELP_REQUIRES_DISTINCT_CHARACTER");
      const helper=tb2ePackageAActorEvidence({actorId:h.helperId});
      if(!helper.ok)return fail("HELPER_"+helper.reasonCode);
      if(!conditionsMatch(h.helperConditions,helper.conditions))return fail("CURRENT_HELPER_CONDITIONS_MISMATCH");
      const kind=norm(h.helpOptions.sourceKind),sourceName=h.helpOptions.sourceName;
      if(kind==="skill"){
        const selected=helper.currentSkillItems.filter(i=>i.itemId===helpSourceItemId);
        if(!itemId(helpSourceItemId)||selected.length!==1||
           norm(selected[0].name)!==norm(sourceName)||!positive(selected[0].rating)||
           names(helper.currentSkillItems,selected[0].name).length!==1)
          return fail("CURRENT_HELPER_SKILL_ITEM_REQUIRED");
        if(selected[0].rating+sourcePenalty(helper,"SKILL")<=0)
          return fail("HELPER_ZERO_RATED_SOURCE_CANNOT_HELP");
        helperSource={kind:"SKILL",actorId:helper.actorId,...selected[0]};
      }else if(kind==="ability"&&s.mode==="BEGINNERS_LUCK"){
        if(helpSourceItemId!==null)return fail("UNUSED_HELP_SOURCE_ITEM_ID");
        const target=names(helper.currentSkillItems,skill.skill);
        if(target.length>1||target.some(i=>i.rating!==0))
          return fail("BEGINNER_HELPER_MUST_USE_CURRENT_TRAINED_SKILL");
        const ability=skill.beginnersLuckAbility.toLowerCase(),rating=helper.currentAbilities[ability];
        if(norm(sourceName)!==ability||!positive(rating))return fail("CURRENT_HELPER_ABILITY_MISMATCH");
        if(rating+sourcePenalty(helper,skill.beginnersLuckAbility)<=0)
          return fail("HELPER_ZERO_RATED_SOURCE_CANNOT_HELP");
        helperSource={kind:"ABILITY",actorId:helper.actorId,name:skill.beginnersLuckAbility,rating};
      }else return fail("PARTICIPATION_HELP_SOURCE_SCOPE_UNSUPPORTED");
      participants.push(helper);
    }else if(helpSourceItemId!==null)return fail("UNUSED_HELP_SOURCE_ITEM_ID");
    if(s.wiseAid!=null){
      const w=s.wiseAid;
      if(!w||w.helperId===actorId)return fail("WISE_AID_REQUIRES_DISTINCT_CHARACTER");
      if(s.help?.helperId===w.helperId)return fail("SAME_HELPER_CANNOT_HELP_AND_WISE_AID");
      const helper=tb2ePackageAActorEvidence({actorId:w.helperId});
      if(!helper.ok)return fail("WISE_HELPER_"+helper.reasonCode);
      if(!conditionsMatch(w.helperConditions,helper.conditions))return fail("CURRENT_WISE_HELPER_CONDITIONS_MISMATCH");
      const selected=helper.currentWiseItems.filter(i=>i.itemId===wiseAidItemId);
      if(!itemId(wiseAidItemId)||selected.length!==1||!norm(selected[0].name)||
         names(helper.currentWiseItems,selected[0].name).length!==1)
        return fail("CURRENT_WISE_AID_ITEM_REQUIRED");
      wiseSource={actorId:helper.actorId,...selected[0]};participants.push(helper);
    }else if(wiseAidItemId!==null)return fail("UNUSED_WISE_AID_ITEM_ID");
    // Existing source planners still require explicit acceptance, relevance,
    // condition review and Skill/Ability Help eligibility. No assertion grants permission.
    const preview=tb2ePackageAOutcomeAndProgressPlan({scenarioInput:s,
      dice:doc.dice.map(d=>d.face),gmDiceReviewed:true,gmConfirmsNoRerolls:true});
    if(!preview.ok)return fail("PREVIEW_"+preview.reasonCode);
    return result(true,null,{documentEvidence:doc,participantEvidence:participants,
      currentActingSource:actingSource,currentHelpSource:helperSource,currentWiseAidSource:wiseSource,
      outcomePreview:preview,currentParticipantSourcesMatched:true,
      fictionalRelevanceGmAsserted:true,playerAcceptanceGmAsserted:s.help!=null,
      sameTestParticipationGmAsserted:true,completeTestHistoryVerified:false});
  }catch{return fail("PARTICIPATION_DOCUMENT_READ_FAILED");}
}
