import { getActiveRulesProfile, resolveRulesProfile } from "./rules-profile-service.mjs";
import { resolveM10BComparativeScalePolicy } from "./m10b-comparative-scale.mjs";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

const SHARED_PAGES = Object.freeze([
  {
    id:"lineage",
    title:"Source Lineage",
    ruleIds:["PROFILE.IDENTITY"],
    bulletsByProfile:{
      mg1e:[
        "Mouse Guard Roleplaying Game (2008 / 1E) is the source authority for this profile.",
        "MG1E owns its source rules and does not use MG2E as fallback."
      ],
      mg2e:[
        "Mouse Guard Roleplaying Game: Second Edition (2015) is the sole source authority for this profile.",
        "MG2E is standalone and does not inherit MG1E or Realm Guard Strict overrides."
      ],
      "realm-guard-strict":[
        "Mouse Guard Roleplaying Game (2008 / 1E) is the inherited core.",
        "Realm Guard v1.6 explicitly overrides the inherited core where the hack supplies its own rule.",
        "Mouse Guard 2E and Torchbearer are not fallback sources for Strict Realm Guard."
      ]
    }
  },
  {
    id:"tests",
    title:"Tests, Advancement & Beginner's Luck",
    ruleIds:["TEST.RESOLUTION","ABILITY.ADVANCEMENT","PROGRESSION.LEVELS_TALENTS"],
    bulletsByProfile:{
      mg1e:[
        "Ordinary and versus tests use the MG1E-family test engine.",
        "Pass/Fail advancement is profile-owned; Levels and Talents are not part of MG1E progression.",
        "Beginner's Luck follows the MG1E source route."
      ],
      mg2e:[
        "Ordinary and versus tests use the source-owned MG2E test contract.",
        "Ability and Skill advancement requires passed tests equal to rating and failed tests equal to rating minus one; ratings 0/1 require one passed test.",
        "Beginner's Luck opens a new Skill at rating 2 after attempts equal to Maximum Nature and does not advance Will or Health."
      ],
      "realm-guard-strict":[
        "Ordinary and versus tests use the MG1E-family test engine with Realm Guard v1.6 overrides.",
        "Pass/Fail advancement is profile-owned; Levels and Talents are not part of Strict source progression.",
        "Beginner's Luck follows the inherited MG1E-family route unless Realm Guard explicitly overrides it."
      ]
    }
  },
  {
    id:"wises-traits-help",
    title:"Wises, Traits & Help",
    ruleIds:["WISE.MODE","TRAIT.MODE","HELP.MODE"],
    bulletsByProfile:{
      mg1e:[
        "Wises are rated and advance like Skills.",
        "Traits use MG1E level semantics with Trait Against / Checks.",
        "I Am Wise and Teamwork remain separate profile-routed contributions."
      ],
      mg2e:[
        "Wises are unrated. I Am Wise grants +1D to an ally in place of ordinary Help.",
        "Deeper Understanding spends Fate to reroll one failed die; Of Course! spends Persona to reroll all failed dice.",
        "Trait level 1 grants +1D once per session, level 2 grants +1D twice per session and level 3 grants +1s to applicable tests."
      ],
      "realm-guard-strict":[
        "Wises are rated under Realm Guard v1.6 / inherited MG1E semantics.",
        "Traits use the Strict profile's source-owned level semantics.",
        "I Am Wise and Teamwork remain separate profile-routed contributions."
      ]
    }
  },
  {
    id:"nature-resources",
    title:"Nature, Fate & Persona",
    ruleIds:["NATURE.MODE","RESOURCES.FATE_PERSONA"],
    bulletsByProfile:{
      mg1e:[
        "Mouse Nature descriptors are Escaping, Climbing, Hiding and Foraging.",
        "Nature is distinct from Natural Order; one does not determine the other.",
        "Tap Nature excludes Resources and Circles."
      ],
      mg2e:[
        "Mouse Nature descriptors are Escaping, Climbing, Hiding and Foraging.",
        "Nature is distinct from Natural Order; one does not determine the other.",
        "Recruitment starts from Nature 3 and asks three source questions; Tap Nature excludes Resources and Circles."
      ],
      "realm-guard-strict":[
        "Dúnadan Nature descriptors are Tradition, Family and Grief.",
        "Nature is distinct from Scale of Might; one does not determine the other.",
        "Tap Nature excludes Resources and Circles."
      ]
    }
  },
  {
    id:"conditions",
    title:"Conditions & Recovery",
    ruleIds:["CONDITIONS.MODE","RECOVERY.MODE"],
    bulletsByProfile:{
      mg1e:[
        "MG1E conditions are Healthy, Hungry & Thirsty, Angry, Tired, Injured and Sick.",
        "Recovery uses the MG1E turn/check economy."
      ],
      mg2e:[
        "MG2E conditions are Healthy, Hungry & Thirsty, Angry, Tired, Injured and Sick.",
        "Injured self-recovery is Health Ob4 with Healer Ob3 after failure; Sick self-recovery is Will Ob4 with Healer Ob4 after failure.",
        "GM Turn recovery costs two Checks."
      ],
      "realm-guard-strict":[
        "Strict conditions are Healthy, Hungry & Thirsty, Angry, Tired, Injured and Strained.",
        "Strained replaces Sick under Realm Guard v1.6 ownership.",
        "Recovery uses the MG1E turn/check economy with Realm Guard's Strained override."
      ]
    }
  },
  {
    id:"inventory-conflict",
    title:"Inventory & Conflict",
    ruleIds:["INVENTORY.POLICY","CONFLICT.ENGINE","TOKENS_OF_POWER.MODE"],
    bulletsByProfile:{
      mg1e:[
        "MG1E uses LOOSE inventory rules authority; Foundry placement metadata remains presentation.",
        "Conflict uses the shared MG-family structure with MG1E-owned action/disposition content.",
        "Fictional applicability and unusual edge cases remain table decisions."
      ],
      mg2e:[
        "MG2E uses LOOSE inventory authority with source carrying guidance; relevant Gear can grant +1D.",
        "Conflict uses three actions per exchange, Attack / Defend / Feint / Maneuver and at most two action helpers.",
        "Weapons and armor use MG2E source-owned action effects; Foundry placement metadata remains presentation."
      ],
      "realm-guard-strict":[
        "Strict uses LOOSE inventory rules authority; Foundry placement metadata remains presentation.",
        "Conflict uses the shared MG-family structure with Realm Guard-owned action/disposition content.",
        "Fictional applicability and unusual edge cases remain table decisions."
      ]
    }
  },
  {
    id:"session-circles",
    title:"Turns, End Session & Circles",
    ruleIds:["SESSION.TURN_MANAGER","SESSION.END_SESSION","CIRCLES.MODE"],
    bulletsByProfile:{
      mg1e:[
        "Players' Turn uses one free test and Checks for additional tests.",
        "End Session rewards are a table/group judgement with GM Foundry commit authority.",
        "Circles uses source-profile ownership while CORE M8 remains storage/tooling."
      ],
      mg2e:[
        "Players' Turn grants one free test; later tests and a Player Turn Conflict cost one Check, with alternation except when solo.",
        "Fate is capped at three awards per session and Persona at four; MVP and Workhorse are unique and cannot go to the same player.",
        "Circles grants +1D in the hometown and +1D for a known Contact; Enmity grants +3s to Argument/Speech disposition."
      ],
      "realm-guard-strict":[
        "Players' Turn uses one free test and Checks for additional tests.",
        "End Session rewards are a table/group judgement with GM Foundry commit authority.",
        "Circles uses source-profile ownership while CORE M8 remains storage/tooling."
      ]
    }
  },
  {
    id:"creation",
    title:"Character Creation",
    ruleIds:["CREATION.RECRUITMENT"],
    bulletsByProfile:{
      mg1e:[
        "CORE M9 hosts a source-owned Mouse Guard 1E Recruitment profile.",
        "Starting Wises are rated and the source-owned profile is transactional when MG1E is active.",
        "Existing Actors are never migrated by profile activation."
      ],
      mg2e:[
        "CORE M9 hosts a source-owned Mouse Guard 2E Recruitment profile using the 21-step source structure.",
        "Five Guard ranks, source hometown packages, Skill selection, three Nature questions and unrated Wise restrictions are profile-owned.",
        "The transactional commit plan is READY_WHEN_ACTIVE but remains read-only while MG2E is foundation-only; no existing Actor is migrated."
      ],
      "realm-guard-strict":[
        "CORE M9 is reused with the Realm Guard v1.6 Strict creation profile.",
        "Starting Wises are rated and Strict source restrictions are validated.",
        "CORE M9 commits only while Strict Realm Guard is the active world profile."
      ]
    }
  }
]);

function scalePage(profileId) {
  if (profileId === "mg2e") return {
    id:"scale",
    title:"Natural Order",
    ruleIds:["NATURAL_ORDER.MODE"],
    bullets:[
      "Natural Order is Mouse Guard 2E's comparative-scale axis and is separate from Nature.",
      "Mouse is rank 3 on the standalone nine-rank MG2E Natural Order scale.",
      "Fighter/Hunter outcomes are limited by rank difference; Militarist and Scientist provide MG2E source-specific high-scale routes.",
      "MG2E does not inherit MG1E-only Natural Order entries such as Chipmunk or Star-Nosed Mole."
    ]
  };
  if (profileId === "mg1e") return {
    id:"scale",
    title:"Natural Order",
    ruleIds:["NATURAL_ORDER.MODE"],
    bullets:[
      "Natural Order is Mouse Guard 1E's comparative-scale axis and is separate from Nature.",
      "Mouse is rank 3 on the nine-rank Natural Order scale.",
      "Fighter/Hunter outcomes are limited by rank difference; Militarist and Scientist provide source-specific high-scale routes.",
      "The MG1E Militarist army table remains separate from Realm Guard's Scale of Might army table."
    ]
  };
  if (profileId === "realm-guard-strict") return {
    id:"scale",
    title:"Scale of Might",
    ruleIds:["SCALE_OF_MIGHT.MODE"],
    bullets:[
      "Scale of Might is Realm Guard v1.6's comparative-scale axis and is separate from Nature.",
      "Dúnadan is rank 3 on the six-rank Scale of Might.",
      "Fighter/Hunter outcomes depend on rank difference; Militarist and Lore Master provide source-specific routes.",
      "Token of Power scale applicability remains MANUAL/GUIDED; Realm Guard v1.6 is authoritative for Strict army thresholds."
    ]
  };
  return null;
}

function pagesFor(profileId) {
  const scale = scalePage(profileId);
  const pages = [...SHARED_PAGES];
  if (scale) pages.splice(6,0,scale);
  return pages;
}

function bulletsFor(spec, profileId) {
  return spec.bulletsByProfile?.[profileId] ?? spec.bullets ?? [];
}

export function profileRulesReferenceSnapshot(profileId = null) {
  const { profile, registry } = resolveRulesProfile(profileId);
  if (!["mg1e","mg2e","realm-guard-strict"].includes(profile.id)) {
    return freeze({
      phase:"M10B.8",
      mode:"LEGACY_MIXED_REFERENCE_OWNED_EXTERNALLY",
      profileId:profile.id,
      profileName:profile.name,
      profileVersion:profile.version,
      rulesSnapshotHash:profile.rulesSnapshotHash,
      activationState:profile.metadata?.activationState ?? "ACTIVE",
      sourceLineage:[...(profile.metadata?.sourceLineage ?? [])],
      liveAuthority:true,
      writesJournal:false,
      writesActors:false,
      writesItems:false,
      writesWorldSettings:false,
      comparativeScale:resolveM10BComparativeScalePolicy(profile.id),
      pages:[]
    });
  }
  let activeId = "";
  try { activeId = String(getActiveRulesProfile()?.id ?? ""); } catch (_error) {}
  const active = activeId === profile.id && profile.metadata?.foundationOnly !== true;
  const pages = pagesFor(profile.id).map(spec => ({
    id:spec.id,
    title:spec.title,
    bullets:bulletsFor(spec, profile.id),
    rules:spec.ruleIds.map(id => registry.explain(id)).filter(Boolean)
  }));
  return freeze({
    phase:"M10B.8",
    mode:active ? "ACTIVE_PROFILE_REFERENCE" : "READ_ONLY_PROFILE_REFERENCE",
    profileId:profile.id,
    profileName:profile.name,
    profileVersion:profile.version,
    rulesSnapshotHash:profile.rulesSnapshotHash,
    activationState:profile.metadata?.activationState ?? "FOUNDATION_ONLY",
    sourceLineage:[...(profile.metadata?.sourceLineage ?? [])],
    liveAuthority:active,
    foundationOnly:profile.metadata?.foundationOnly === true,
    selectable:profile.metadata?.selectable !== false,
    comparativeScale:resolveM10BComparativeScalePolicy(profile.id),
    writesJournal:false,
    writesActors:false,
    writesItems:false,
    writesWorldSettings:false,
    pages
  });
}

export function profileRulesReferenceHtml(profileId = null) {
  const snapshot = profileRulesReferenceSnapshot(profileId);
  const profileLabel = snapshot.profileId === "mg1e" ? "Mouse Guard 1E" : snapshot.profileId === "mg2e" ? "Mouse Guard 2E" : snapshot.profileId === "realm-guard-strict" ? "Strict Realm Guard" : snapshot.profileName;
  const pages = snapshot.pages.map(page => `
    <details class="rg-rules-detail">
      <summary><i class="fa-solid fa-book-bookmark"></i> ${esc(page.title)}</summary>
      <div class="rg-manual-body">
        <ul>${page.bullets.map(bullet => `<li>${esc(bullet)}</li>`).join("")}</ul>
        ${page.rules.map(rule => `
          <p><b>${esc(rule.title)}:</b> ${esc(rule.activeValue)}<br>
          <small>${esc(rule.classification)} · ${esc(rule.automation)} · Source: ${esc(rule.source)}${rule.sourceVersion ? ` · ${esc(rule.sourceVersion)}` : ""}</small></p>
        `).join("")}
      </div>
    </details>`).join("");

  return `<div class="realm-guard rg-reference-shell" data-rg-reference-root data-rg-profile-reference="${esc(snapshot.profileId)}">
    <div class="rg-reference-toolbar">
      <label class="rg-reference-search">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        <input type="search" data-rg-reference-search placeholder="Search ${esc(profileLabel)} rules…" autocomplete="off" spellcheck="false" aria-label="Search ${esc(profileLabel)} rules">
        <button type="button" data-rg-reference-clear title="Clear search" aria-label="Clear search"><i class="fa-solid fa-xmark"></i></button>
      </label>
      <div class="rg-reference-toolbar-actions">
        <span class="rg-reference-search-count" data-rg-reference-search-count>All sections</span>
        <button type="button" data-rg-reference-expand><i class="fa-solid fa-angles-down"></i><span>Expand All</span></button>
        <button type="button" data-rg-reference-collapse><i class="fa-solid fa-angles-up"></i><span>Collapse All</span></button>
      </div>
    </div>
    <div class="rg-reference-scroll"><div class="rg-system-manual">
      <header class="rg-manual-hero"><div><div class="rg-brand">MG-FAMILY CORE · M10B.8</div><h2>${esc(profileLabel)} · Rules Reference${snapshot.liveAuthority ? "" : " Preview"}</h2><p>${esc(snapshot.profileName)} · profile v${esc(snapshot.profileVersion)} · ${esc(snapshot.activationState)}</p></div><i class="fa-solid fa-scale-balanced"></i></header>
      <div class="rg-manual-callout"><i class="fa-solid ${snapshot.liveAuthority ? "fa-circle-check" : "fa-lock"}"></i><div><b>${snapshot.liveAuthority ? "ACTIVE RULES PROFILE" : "READ ONLY PREVIEW"}</b><span>${snapshot.liveAuthority ? "This reference describes the active source-owned profile. It remains presentation-only and writes no campaign data." : "This reference does not switch the world or write Actors, Items, Journals or settings."}</span></div></div>
      <div class="rg-manual-callout"><i class="fa-solid fa-code-branch"></i><div><b>Source lineage</b><span>${snapshot.sourceLineage.map(esc).join(" → ")}</span></div></div>
      ${pages}
    </div></div>
  </div>`;
}

export async function openProfileRulesReference(profileId = null) {
  const snapshot = profileRulesReferenceSnapshot(profileId);
  if (!globalThis.foundry?.applications?.api?.DialogV2) return snapshot;
  const profileLabel = snapshot.profileId === "mg1e" ? "Mouse Guard 1E" : snapshot.profileId === "mg2e" ? "Mouse Guard 2E" : snapshot.profileId === "realm-guard-strict" ? "Strict Realm Guard" : snapshot.profileName;
  return foundry.applications.api.DialogV2.wait({
    window:{title:`Realm Guard · ${profileLabel} Rules Reference${snapshot.liveAuthority ? "" : " Preview"}`,resizable:true},
    position:{width:820,height:840},
    content:profileRulesReferenceHtml(snapshot.profileId),
    modal:false,
    rejectClose:false,
    buttons:[{action:"close",label:"Close",default:true,callback:()=> "close"}]
  });
}

export function getM10B8RulesReferenceStatus() {
  return freeze({
    phase:"M10B.8",
    mode:"GENERIC_PROFILE_RULES_REFERENCE",
    strict:profileRulesReferenceSnapshot("realm-guard-strict"),
    mg1e:profileRulesReferenceSnapshot("mg1e"),
    mg2e:profileRulesReferenceSnapshot("mg2e"),
    extendedPhase:"M10C.5",
    legacyPermanentJournalPreserved:true,
    writesJournal:false,
    writesActors:false,
    writesItems:false,
    writesWorldSettings:false
  });
}
