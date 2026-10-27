import { MODEL, blankAnswers } from "../../module/profiles/torchbearer2e-wizard-creation.mjs";
  const nature={
    HUMAN:{q1:"BOAST",q2:"DEMAND_RIGHTS",q3:"FLEE_HIDE"},
    ELF:{q1:"SING",q2:"RETREAT_HIDE",q3:"JOURNEY_WEST"},
    DWARF:{q1:"REVENGE",q2:"DIG_DEEPER",q3:"CRAFT"},
    HALFLING:{q1:"FEAST",q2:"RIDDLE",q3:"SNEAK"}
  };
  export function sample(className){
    const stock=MODEL.classRules[className].stock;
    const answers={...blankAnswers(),name:`QA ${className}`,className,will:4,health:4,
      upbringing:"CRIMINAL",home:"REMOTE_VILLAGE",hometown:"Oak",homeSkill:"CARPENTER",homeTrait:"ROUGH_HANDS",
      socialGrace:"PERSUADER",specialty:"SCOUT",natureAnswers:nature[stock],
      stockWise:MODEL.wises[stock].stockChoices[0]??"",customWise:"Troll-wise",
      relationships:{route:"social",parents:true,mentor:true,enemy:false,friendIsAdventurer:false},
      people:{friend:{name:"A",profession:"Cook",location:"Oak",lastSeen:"Last spring"},mother:{name:"B"},father:{},mentor:{name:"C"},enemy:{}},
      familyName:"Oakborn",parentsProfession:"Carpenters",
      gear:[{name:"Backpack",type:"gear",system:{quantity:1,inventory:{containerType:"backpack",capacity:6,mode:"unassigned",location:"",containerId:""}},flags:{"realm-guard":{creationSourceUuid:"Item.pack"}}}],
      gearReviewed:true,magicNotes:"GM-agreed starting spells or relics",drives:{belief:"Protect my friends",goal:"Find the gate",instinct:"Always check the rope"},
      age:MODEL.ageRanges[stock].min,raiment:"Green cloak"};
    return {mode:"guided",answers,allocations:{skills:{...MODEL.classRules[className].skills}}};
  }
