import { ProfileResolver } from "./core/rules-profile.mjs";
import { RulesRegistry } from "./core/rules-registry.mjs";
import { MG1E_FOUNDATION_PROFILE } from "./profiles/mg1e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "./profiles/realm-guard-strict.mjs";

const resolver = new ProfileResolver([MG1E_FOUNDATION_PROFILE, REALM_GUARD_STRICT_PROFILE]);

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

function strictState() {
  const profile = resolver.resolve("realm-guard-strict");
  const registry = new RulesRegistry(profile);
  return { profile, registry };
}

const PAGE_SPECS = Object.freeze([
  {
    id:"lineage",
    title:"Strict Source Lineage",
    ruleIds:["PROFILE.IDENTITY"],
    bullets:[
      "Mouse Guard Roleplaying Game (2008 / 1E) is the inherited core.",
      "Realm Guard v1.6 explicitly overrides the inherited core where the hack supplies its own rule.",
      "Mouse Guard 2E and Torchbearer are not fallback sources for Strict Realm Guard."
    ]
  },
  {
    id:"tests",
    title:"Tests, Advancement & Beginner's Luck",
    ruleIds:["TEST.RESOLUTION","ABILITY.ADVANCEMENT","PROGRESSION.LEVELS_TALENTS"],
    bullets:[
      "Ordinary and versus tests use the MG1E core inherited by the profile.",
      "Pass/Fail advancement is retained; Levels and Talents are disabled in Strict Realm Guard.",
      "Beginner's Luck learning opens the trained Skill at rating 2 under the verified Strict policy."
    ]
  },
  {
    id:"wises-traits-help",
    title:"Rated Wises, Traits & Help",
    ruleIds:["WISE.MODE","TRAIT.MODE","HELP.MODE"],
    bullets:[
      "Wises are rated and advance like Skills.",
      "Trait Level 1 gives +1D once per session; Level 2 gives +1D on every applicable test; Level 3 rerolls all failed dice once per session.",
      "I Am Wise is self-Wise augmentation; another Ranger's contribution is Teamwork. Synergy is disabled in Strict."
    ]
  },
  {
    id:"nature-resources",
    title:"Nature, Fate & Persona",
    ruleIds:["NATURE.MODE","RESOURCES.FATE_PERSONA"],
    bullets:[
      "Dúnadan Nature descriptors are Tradition, Family and Grief.",
      "Tap Nature excludes Resources and Circles.",
      "Persona is committed before the roll; Fate opens sixes after a qualifying roll."
    ]
  },
  {
    id:"conditions",
    title:"Conditions & Recovery",
    ruleIds:["CONDITIONS.MODE","RECOVERY.MODE"],
    bullets:[
      "Strict condition set: Healthy, Hungry & Thirsty, Angry, Tired, Injured and Strained.",
      "Strained replaces Sick; Fresh and Afraid are not Strict default conditions.",
      "Recovery uses the MG1E turn/check economy with Realm Guard's Strained recovery override."
    ]
  },
  {
    id:"inventory-conflict",
    title:"Inventory, Conflict & Tokens of Power",
    ruleIds:["INVENTORY.POLICY","CONFLICT.ENGINE","TOKENS_OF_POWER.MODE"],
    bullets:[
      "Strict inventory policy is LOOSE; paper-doll placement may remain as Foundry presentation but is not tabletop-rule authority.",
      "Conflict uses the inherited MG1E structure with Realm Guard tools and content.",
      "Tokens of Power use Realm Guard v1.6 with MG1E trait-level semantics."
    ]
  },
  {
    id:"scale",
    title:"Scale of Might",
    ruleIds:["SCALE_OF_MIGHT.MODE"],
    bullets:[
      "Scale of Might is a separate Realm Guard v1.6 rule axis; it is not derived from Nature.",
      "Fighter/Hunter outcomes depend on rank difference; Militarist and Lore Master can alter what is possible under their source-specific rules.",
      "Token of Power Scale applicability remains MANUAL/GUIDED; the table confirms fictional applicability."
    ]
  },
  {
    id:"session-circles",
    title:"Turns, End Session & Circles",
    ruleIds:["SESSION.TURN_MANAGER","SESSION.END_SESSION","CIRCLES.MODE"],
    bullets:[
      "Players' Turn uses one free test and Checks for additional tests, with the verified solo alternation exception.",
      "End Session rewards are a group/table judgement; the GM is the Foundry commit authority.",
      "Circles uses MG1E ownership including the Enmity Clause; CORE M8 remains Foundry storage/tooling."
    ]
  },
  {
    id:"creation",
    title:"Strict Character Creation",
    ruleIds:["CREATION.RECRUITMENT"],
    bullets:[
      "CORE M9 is reused with the Realm Guard v1.6 Strict creation profile.",
      "Starting Wises are rated; Strict Enemy and Mentor restrictions are validated before commit planning.",
      "Strict creation remains preview-only until profile activation QA."
    ]
  }
]);

export function strictRulesReferenceSnapshot() {
  const { profile, registry } = strictState();
  const pages = PAGE_SPECS.map(spec => ({
    ...spec,
    rules: spec.ruleIds.map(id => registry.explain(id)).filter(Boolean)
  }));
  return freeze({
    phase:"M10A.7",
    mode:"STRICT_READ_ONLY_REFERENCE",
    profileId:profile.id,
    profileName:profile.name,
    profileVersion:profile.version,
    rulesSnapshotHash:profile.rulesSnapshotHash,
    activationState:profile.metadata?.activationState ?? "PREVIEW_ONLY",
    sourceLineage:[...(profile.metadata?.sourceLineage ?? [])],
    liveAuthority:false,
    writesJournal:false,
    writesActors:false,
    writesItems:false,
    writesWorldSettings:false,
    pages
  });
}

export function strictRulesReferenceHtml() {
  const snapshot = strictRulesReferenceSnapshot();
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

  return `<div class="realm-guard rg-system-manual">
    <header class="rg-manual-hero"><div><div class="rg-brand">MG-FAMILY CORE · M10A.7</div><h2>Strict Realm Guard · Rules Reference Preview</h2><p>${esc(snapshot.profileName)} · profile v${esc(snapshot.profileVersion)} · ${esc(snapshot.activationState)}</p></div><i class="fa-solid fa-scale-balanced"></i></header>
    <div class="rg-manual-callout"><i class="fa-solid fa-lock"></i><div><b>READ ONLY</b><span>This reference previews Strict Realm Guard ownership. It does not switch the world, update the permanent Legacy Mixed Rules Journal, or write Actors, Items or settings.</span></div></div>
    <div class="rg-manual-callout"><i class="fa-solid fa-code-branch"></i><div><b>Source lineage</b><span>${snapshot.sourceLineage.map(esc).join(" → ")}</span></div></div>
    ${pages}
  </div>`;
}

export async function openStrictRulesReferencePreview() {
  if (!globalThis.foundry?.applications?.api?.DialogV2) return strictRulesReferenceSnapshot();
  return foundry.applications.api.DialogV2.wait({
    window:{title:"Realm Guard · Strict Rules Reference Preview",resizable:true},
    position:{width:820,height:840},
    content:strictRulesReferenceHtml(),
    modal:false,
    rejectClose:false,
    buttons:[{action:"close",label:"Close",default:true,callback:()=> "close"}]
  });
}
