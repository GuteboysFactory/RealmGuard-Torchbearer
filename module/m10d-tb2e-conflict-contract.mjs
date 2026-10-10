import { freezeTb2e } from "./m10d-tb2e-source-coverage.mjs";
export const TB2E_CONFLICT_ACTIONS=freezeTb2e(["ATTACK","DEFEND","FEINT","MANEUVER"]);
export const TB2E_CONFLICT_TYPES=freezeTb2e(["CAPTURE","CONVINCE","CONVINCE_CROWD","DRIVE_OFF","FLEE_OR_PURSUE","KILL","TRICK_OR_RIDDLE"]);
export const TB2E_CONFLICT_MATRIX=freezeTb2e({
 ATTACK:{ATTACK:"INDEPENDENT",DEFEND:"VERSUS",FEINT:"INDEPENDENT",MANEUVER:"VERSUS"},
 DEFEND:{ATTACK:"VERSUS",DEFEND:"INDEPENDENT",FEINT:"NO_TEST",MANEUVER:"VERSUS"},
 FEINT:{ATTACK:"NO_TEST",DEFEND:"INDEPENDENT",FEINT:"VERSUS",MANEUVER:"INDEPENDENT"},
 MANEUVER:{ATTACK:"VERSUS",DEFEND:"VERSUS",FEINT:"INDEPENDENT",MANEUVER:"INDEPENDENT"}
});
export const TB2E_CONFLICT_SKILLS=freezeTb2e({
 CAPTURE:{disposition:["Fighter","Hunter"],base:"Will",actions:["Fighter","Hunter","Hunter","Fighter"]},
 CONVINCE:{disposition:["Persuader"],base:"Will",actions:["Persuader","Persuader","Manipulator","Manipulator"]},
 CONVINCE_CROWD:{disposition:["Orator"],base:"Will",actions:["Orator","Orator","Manipulator","Manipulator"]},
 DRIVE_OFF:{disposition:["Fighter"],base:"Health",actions:["Fighter","Will","Fighter","Will"]},
 FLEE_OR_PURSUE:{disposition:["Scout","Rider"],base:"Health",actions:["Scout or Rider","Health","Scout or Rider","Health"]},
 KILL:{disposition:["Fighter"],base:"Health",actions:["Fighter","Health","Fighter","Health"]},
 TRICK_OR_RIDDLE:{disposition:["Manipulator"],base:"Will",actions:["Manipulator","Lore Master","Manipulator","Lore Master"]}
});
export const TB2E_MANEUVER_COSTS=freezeTb2e({IMPEDE:1,GAIN_POSITION:2,DISARM:3,REARM:4});
export const tb2eConflictKey=value=>String(value??"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_|_$/g,"");
export const tb2eConflictTypeKey=value=>{
 const id=tb2eConflictKey(value);
 return ["FLEE","PURSUE","FLEE_OR_PURSUE"].includes(id)?"FLEE_OR_PURSUE":id;
};
export const tb2eConflictCount=value=>Number.isInteger(value)&&value>=0;
export function tb2eConflictResult(data){
 return freezeTb2e({phase:"M10D.18_P2.3",profileId:"torchbearer2e",mode:"READ_ONLY_SHADOW",
 sourceEvidence:"Scholar's Guide pp. 59-81; Dungeoneer's Handbook pp. 156-159",
 liveApplication:false,writesPlanned:0,actorWrite:false,itemWrite:false,
 settingWrite:false,hpWrite:false,rollExecuted:false,commitAllowed:false,...data});
}
export const tb2eConflictBlocked=(reasonCode,extra={})=>tb2eConflictResult({ok:false,reasonCode,...extra});
