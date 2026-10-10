import { freezeTb2e } from "./m10d-tb2e-source-coverage.mjs";
import { tb2eCoreDomainAudit } from "./m10d-tb2e-core-source-expansion.mjs";

const PROFILE_ID = "torchbearer2e";
const PHASE = "M10D.18_P2.1";
const EVIDENCE = "Dungeoneer's Handbook, Traits pp. 79-81";
const norm = value => String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
const isCount = value => Number.isInteger(value) && value >= 0;

function response(data) {
  return freezeTb2e({
    phase: PHASE, profileId: PROFILE_ID, mode: "READ_ONLY_SHADOW",
    sourceEvidence: EVIDENCE, liveApplication: false, writesPlanned: 0,
    actorWrite: false, itemWrite: false, checksWrite: false,
    ...data
  });
}
function blocked(reasonCode, details={}) { return response({ok:false, reasonCode, ...details}); }
function effect(type, value, target, timing, rule) {
  return {type, value, target, timing,
    provenance:{profileId:PROFILE_ID, domain:"traits", source:EVIDENCE, rule}};
}

export function tb2eTraitsShadowStatus() {
  return freezeTb2e({
    phase:PHASE, profileId:PROFILE_ID, profileVersion:1,
    mode:"TB2E_TRAITS_READ_ONLY_SHADOW", adapterReady:true,
    sourceClassification:tb2eCoreDomainAudit("traits")?.status ?? "VERIFIED",
    sourceEvidence:EVIDENCE, liveEnabled:false, liveApplication:false,
    automation:"SHADOW_ONLY", activationAllowed:false,
    actorMutationAllowed:false, itemMutationAllowed:false,
    checkMutationAllowed:false, effectMutationAllowed:false,
    writes:{actors:0, items:0, journals:0, settings:0},
    boundaries:["ONE_TRAIT_PER_TEST","GM_TABLE_DETERMINES_FICTIONAL_APPLICABILITY",
      "LEVEL_3_ONLY_ON_PASSED_OR_TIED_TESTS","AGAINST_ONCE_PER_TRAIT_PER_SESSION",
      "AGAINST_NOT_IN_CAMP_TOWN_OR_PVP","CLASS_TRAIT_LOSS_NEEDS_MANUAL_REVIEW",
      "NO_LIVE_TRAIT_OR_CHECK_MUTATION"],
    nextStep:"Foundry shadow QA Gate P2.1; Armor, Conflict and Magic still pending"
  });
}

export function tb2eTraitModel() {
  return response({
    levels:{
      1:{bonus:"+1D",usesPerSession:1,timing:"PRE_ROLL"},
      2:{bonus:"+1D",usesPerSession:2,timing:"PRE_ROLL"},
      3:{bonus:"+1s",usesPerSession:null,timing:"POST_ROLL_PASS_OR_TIE"}
    },
    against:{
      usesPerTraitPerSession:1, excludedPhases:["CAMP","TOWN"], excludedContext:"PVP",
      options:[
        {id:"SELF_MINUS_1D",bonusDice:-1,checks:1},
        {id:"OPPONENT_PLUS_2D",opponentDice:2,checks:2,versusOnly:true},
        {id:"BREAK_TIE",opponentWinsTie:true,checks:2,tiedVersusOnly:true}
      ]
    },
    oneTraitPerTest:true, refreshAfterNewSessionPrologue:true,
    checkSpending:{camp:"ONE_CHECK_PER_TEST_OR_CONFLICT",
      enteringTown:"ONE_CHECK_PER_RECOVERY_TEST", canShareChecks:true},
    classTraitLostOrChangedBeyondRecognition:"RETIREMENT_REQUIRES_GM_REVIEW"
  });
}

/**
 * Pure plan: no Actor, Item, Foundry or random dependencies.
 * 'applies' means the table already accepted the trait's fictional relevance.
 * All usage counters and post-roll outcomes must be caller-supplied.
 */
export function tb2eTraitUsePlan({
  level=1, mode="BENEFIT", againstOption="SELF_MINUS_1D",
  phase="ADVENTURE", applies=false, angry=false, pvp=false,
  versus=false, outcome=null, traitAlreadyUsedOnTest=false,
  benefitUses=0, againstUses=0
}={}) {
  if (![1,2,3].includes(level)) return blocked("INVALID_TRAIT_LEVEL",{level});
  if (!isCount(benefitUses) || !isCount(againstUses)) return blocked("INVALID_USAGE_COUNTER");
  const kind=norm(mode), place=norm(phase), choice=norm(againstOption);
  if (!["BENEFIT","AGAINST"].includes(kind)) return blocked("INVALID_TRAIT_MODE");
  if (!place) return blocked("PHASE_REQUIRED");
  if (traitAlreadyUsedOnTest) return blocked("ONLY_ONE_TRAIT_PER_TEST");
  if (!applies) return blocked("FICTIONAL_APPLICABILITY_NOT_APPROVED");

  if (kind==="BENEFIT") {
    if (angry) return blocked("ANGRY_BLOCKS_BENEFICIAL_TRAIT");
    if (level<=2) {
      if (benefitUses>=level) return blocked("BENEFIT_USES_EXHAUSTED",{limit:level});
      return response({ok:true, mode:"BENEFIT", level, phase:place,
        effects:[effect("DICE_MODIFIER",1,"SELF","PRE_ROLL","TRAIT_BENEFIT_L"+level)],
        usage:{current:benefitUses,limit:level,wouldConsume:1},
        checksAwarded:0, commitAllowed:false});
    }
    const result=norm(outcome);
    if (!["PASS","FAIL","TIE"].includes(result)) return blocked("LEVEL_3_NEEDS_POST_ROLL_OUTCOME");
    return response({ok:true, mode:"BENEFIT", level, phase:place, outcome:result,
      effects:result==="FAIL" ? [] : [effect("SUCCESS_MODIFIER",1,"SELF","POST_ROLL","TRAIT_BENEFIT_L3")],
      usage:{current:benefitUses,limit:null,wouldConsume:0},
      checksAwarded:0, commitAllowed:false});
  }

  if (["CAMP","TOWN"].includes(place)) return blocked("TRAIT_AGAINST_FORBIDDEN_IN_PHASE",{phase:place});
  if (pvp) return blocked("TRAIT_AGAINST_FORBIDDEN_IN_PVP");
  if (againstUses>=1) return blocked("TRAIT_AGAINST_ALREADY_USED_THIS_SESSION");
  if (!["SELF_MINUS_1D","OPPONENT_PLUS_2D","BREAK_TIE"].includes(choice))
    return blocked("INVALID_AGAINST_OPTION");
  if (choice!=="SELF_MINUS_1D" && !versus) return blocked("AGAINST_REQUIRES_VERSUS");
  if (choice==="BREAK_TIE" && norm(outcome)!=="TIE")
    return blocked("AGAINST_BREAK_TIE_REQUIRES_TIED_VERSUS");
  const rule="TRAIT_AGAINST_"+choice;
  const mechanical = choice==="SELF_MINUS_1D"
    ? effect("DICE_MODIFIER",-1,"SELF","PRE_ROLL",rule)
    : choice==="OPPONENT_PLUS_2D"
      ? effect("DICE_MODIFIER",2,"OPPONENT","PRE_ROLL",rule)
      : effect("STATE_CHANGE","OPPONENT_WINS_TIE","OUTCOME","POST_ROLL",rule);
  const checksAwarded=choice==="SELF_MINUS_1D"?1:2;
  return response({ok:true, mode:"AGAINST", level, phase:place, againstOption:choice,
    effects:[mechanical,effect("CURRENCY",checksAwarded,"CHECKS","POST_RESOLVE",rule)],
    usage:{current:againstUses,limit:1,wouldConsume:1},
    checksAwarded, checksAwardCommitted:false, commitAllowed:false});
}

export function tb2eTraitRefreshPlan({newSessionPrologueDelivered=false}={}) {
  return response({ok:true, operation:"TRAIT_SESSION_REFRESH",
    eligible:Boolean(newSessionPrologueDelivered),
    resets:["LEVEL_1_BENEFIT_USES","LEVEL_2_BENEFIT_USES","TRAIT_AGAINST_USES"],
    actionApplied:false});
}

export function tb2eClassTraitBoundaryPlan({traitLostOrUnrecognizable=false}={}) {
  return response({ok:true, operation:"CLASS_TRAIT_RETIREMENT",
    gmReviewRequired:Boolean(traitLostOrUnrecognizable),
    outcome:"MANUAL_GM_ADJUDICATION", retirementCommitted:false});
}
