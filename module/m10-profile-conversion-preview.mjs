const STRICT_TARGET_ID = "realm-guard-strict";

export const STRICT_CONVERSION_DELTAS = Object.freeze([
  Object.freeze({ id: "SOURCE_LINEAGE", domain: "profile", severity: "RULE_OWNERSHIP", title: "Rules source lineage", from: "Legacy Mixed project behavior", to: "Mouse Guard 1E / 2008 inheritance + Realm Guard v1.6 overrides", dataAction: "NONE", note: "Changes source ownership and interpretation, not stored campaign data." }),
  Object.freeze({ id: "WISE_RATINGS", domain: "wises", severity: "DATA_REVIEW_REQUIRED", title: "Wises become rated", from: "Unrated Wise Items", to: "Rated Wises that test and advance like Skills", dataAction: "PRESERVE_AND_REVIEW", note: "Rated-Wise schema support is now additive and non-destructive. Existing preserved Wises remain rating 0 until an explicit future conversion or GM assignment." }),
  Object.freeze({ id: "TRAIT_SEMANTICS", domain: "traits", severity: "RULE_POLICY", title: "Trait level semantics", from: "Legacy Mixed trait behavior", to: "MG1E L1 once/session · L2 every applicable test · L3 reroll all failed dice once/session", dataAction: "NONE", note: "Trait Items are preserved; only future Strict rule interpretation changes." }),
  Object.freeze({ id: "HELP_I_AM_WISE", domain: "help", severity: "RULE_POLICY", title: "I Am Wise separated from Teamwork", from: "Legacy helper workflow / project Synergy", to: "Own Wise augmentation = I Am Wise; another Ranger's help = Teamwork; Synergy disabled", dataAction: "NONE", note: "No Actor write is required." }),
  Object.freeze({ id: "CONDITION_SET", domain: "conditions", severity: "DATA_PRESERVE_RULE_DISABLE", title: "Strict condition set", from: "Legacy Mixed includes supplementary Fresh / Afraid handling", to: "Healthy · Hungry & Thirsty · Angry · Tired · Injured · Strained", dataAction: "PRESERVE_EXISTING_ITEMS", note: "Fresh/Afraid Items are never deleted by conversion; they are flagged for GM review." }),
  Object.freeze({ id: "INVENTORY_POLICY", domain: "inventory", severity: "DATA_PRESERVE_POLICY_CHANGE", title: "Structured inventory becomes loose rules inventory", from: "STRUCTURED placement is rules-significant", to: "LOOSE inventory policy", dataAction: "PRESERVE_PLACEMENT_METADATA", note: "Paper-doll/container metadata remains available as UX data but stops being tabletop-rule authority under Strict." }),
  Object.freeze({ id: "CONFLICT_TOOL_OWNERSHIP", domain: "conflict", severity: "RULE_POLICY", title: "Conflict tools become profile-owned", from: "Legacy held-slot/tool assumptions and universal unarmed -1D", to: "MG1E conflict structure + Realm Guard content; no universal unarmed penalty", dataAction: "NONE", note: "Existing Gear/Conflict Tool data remains intact." }),
  Object.freeze({ id: "LEVELS_TALENTS", domain: "progression", severity: "DATA_PRESERVE_RULE_DISABLE", title: "Levels / Talents disabled", from: "Enabled", to: "Disabled in Strict Realm Guard", dataAction: "PRESERVE_EXISTING_DATA", note: "Level fields and Talent Items are preserved." }),
  Object.freeze({ id: "SESSION_REWARDS", domain: "session", severity: "RULE_POLICY", title: "MG1E session / reward ownership", from: "Legacy Mixed session workflow", to: "MG1E Players' Turn / Checks / End Session semantics", dataAction: "NONE", note: "Existing M7 engine is retained; Strict later binds source-correct policy." }),
  Object.freeze({ id: "CIRCLES_OWNERSHIP", domain: "circles", severity: "RULE_OWNERSHIP", title: "Circles source ownership", from: "Legacy Mixed compatibility", to: "MG1E Circles + Enmity Clause", dataAction: "NONE", note: "M8 Social Network storage remains Foundry tooling." }),
  Object.freeze({ id: "CREATION_PROFILE", domain: "creation", severity: "FUTURE_CREATION_ONLY", title: "Strict Character Creation", from: "CORE M9 Legacy Mixed creation profile", to: "CORE M9 Strict Realm Guard creation profile", dataAction: "NO_OLD_ACTOR_MIGRATION", note: "Existing Actors are not rewritten." }),
  Object.freeze({ id: "TOKENS_OF_POWER", domain: "tokensOfPower", severity: "RULE_POLICY", title: "Tokens of Power source-owned by Realm Guard", from: "Legacy project feature", to: "Realm Guard v1.6 rule using MG1E trait-level semantics", dataAction: "NONE", note: "Existing Token Items are preserved." }),
  Object.freeze({ id: "SCALE_OF_MIGHT", domain: "scaleOfMight", severity: "NEW_RULE_DOMAIN", title: "Scale of Might", from: "No dedicated live Strict domain", to: "Realm Guard v1.6 Scale of Might · manual/guided initially", dataAction: "NONE", note: "M10A.1 documents ownership only; it does not invent automatic resolution." })
]);

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
  return value;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}

function same(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function listItems(actor) {
  if (Array.isArray(actor?.items?.contents)) return actor.items.contents;
  try { return Array.from(actor?.items ?? []); } catch (_error) { return []; }
}

function actorRef(actor) {
  return Object.freeze({ id: String(actor?.id ?? ""), name: String(actor?.name ?? "Unnamed Actor"), type: String(actor?.type ?? "") });
}

function creationProvenance(actor) {
  return actor?.flags?.["realm-guard"]?.creationProvenance ?? actor?.getFlag?.("realm-guard", "creationProvenance") ?? null;
}

export function profileDomainDiff(fromProfile, toProfile) {
  const fromDomains = fromProfile?.domains ?? {};
  const toDomains = toProfile?.domains ?? {};
  return freeze([...new Set([...Object.keys(fromDomains), ...Object.keys(toDomains)])].sort()
    .filter(domain => !same(fromDomains[domain], toDomains[domain]))
    .map(domain => ({ domain, from: clone(fromDomains[domain] ?? null), to: clone(toDomains[domain] ?? null) })));
}

export function scanStrictWorldImpact(actors = [], worldItems = []) {
  const rows = Array.from(actors ?? []);
  const refs = key => [];
  const wiseActors = [], talentActors = [], progressionActors = [], structuredGearActors = [], nonStrictConditionActors = [], legacyCreationActors = [];
  let wiseItems = 0, talentItems = 0, structuredGearItems = 0, freshItems = 0, afraidItems = 0, aboveLevelOne = 0;

  for (const actor of rows) {
    const items = listItems(actor);
    const wises = items.filter(i => i?.type === "wise");
    const talents = items.filter(i => i?.type === "talent");
    const gear = items.filter(i => i?.type === "gear" && (() => {
      const inv = i?.system?.inventory ?? {};
      return String(inv.mode ?? "unassigned") !== "unassigned" || Boolean(inv.location) || Boolean(inv.containerId);
    })());
    const conditions = items.filter(i => i?.type === "condition");
    const fresh = conditions.filter(i => String(i?.name ?? "").trim().toLowerCase() === "fresh");
    const afraid = conditions.filter(i => String(i?.name ?? "").trim().toLowerCase() === "afraid");

    wiseItems += wises.length;
    talentItems += talents.length;
    structuredGearItems += gear.length;
    freshItems += fresh.length;
    afraidItems += afraid.length;

    if (wises.length) wiseActors.push(actorRef(actor));
    if (talents.length) talentActors.push(actorRef(actor));
    if (actor?.system?.progression && typeof actor.system.progression === "object") progressionActors.push(actorRef(actor));
    if (Number(actor?.system?.progression?.level ?? 1) > 1) aboveLevelOne += 1;
    if (gear.length) structuredGearActors.push(actorRef(actor));
    if (fresh.length || afraid.length) nonStrictConditionActors.push(actorRef(actor));

    const provenance = creationProvenance(actor);
    if (String(provenance?.rulesProfileId ?? provenance?.profileId ?? "") === "realm-guard-legacy-mixed") legacyCreationActors.push(actorRef(actor));
  }

  const standalone = Array.from(worldItems ?? []);
  return freeze({
    actors: rows.length,
    rangers: rows.filter(a => a?.type === "character").length,
    wiseItems,
    rangersWithWises: wiseActors.filter(a => a.type === "character").length,
    actorsWithWises: wiseActors.length,
    talentItems,
    actorsWithTalents: talentActors.length,
    actorsWithProgressionData: progressionActors.length,
    actorsAboveLevelOne: aboveLevelOne,
    structuredGearItems,
    actorsWithStructuredGear: structuredGearActors.length,
    freshItems,
    afraidItems,
    actorsWithFreshOrAfraid: nonStrictConditionActors.length,
    actorsWithLegacyCreationProvenance: legacyCreationActors.length,
    standaloneTemplates: {
      wises: standalone.filter(i => i?.type === "wise").length,
      talents: standalone.filter(i => i?.type === "talent").length,
      gear: standalone.filter(i => i?.type === "gear").length
    },
    affectedActors: { wises: wiseActors, talents: talentActors, structuredGear: structuredGearActors, freshOrAfraid: nonStrictConditionActors, legacyCreation: legacyCreationActors }
  });
}

export function buildStrictConversionPreview({ fromProfile, toProfile, actors = [], worldItems = [] } = {}) {
  if (!fromProfile?.id) throw new Error("Strict conversion preview requires a source Rules Profile.");
  if (toProfile?.id !== STRICT_TARGET_ID) throw new Error("Strict conversion preview requires realm-guard-strict as target.");
  return freeze({
    kind: "ProfileConversionPreview",
    mode: "READ_ONLY",
    readOnly: true,
    activationAllowed: false,
    writesPlanned: 0,
    source: { id: fromProfile.id, version: fromProfile.version, name: fromProfile.name, rulesSnapshotHash: fromProfile.rulesSnapshotHash },
    target: { id: toProfile.id, version: toProfile.version, name: toProfile.name, rulesSnapshotHash: toProfile.rulesSnapshotHash, lineage: clone(toProfile.lineage ?? []) },
    domainDiff: profileDomainDiff(fromProfile, toProfile),
    deltas: STRICT_CONVERSION_DELTAS.map(clone),
    worldImpact: scanStrictWorldImpact(actors, worldItems),
    safety: {
      actorWrites: 0,
      itemWrites: 0,
      settingWrites: 0,
      profileSwitch: false,
      destructiveConversion: false,
      preserveExistingActors: true,
      preserveWiseItems: true,
      preserveTalentItems: true,
      preserveInventoryMetadata: true,
      preserveFreshAfraidItems: true
    },
    nextStep: "M10A.9 Stable Activation Candidate · CLOSURE QA"
  });
}

function esc(value) {
  return globalThis.foundry?.utils?.escapeHTML ? globalThis.foundry.utils.escapeHTML(String(value ?? "")) : String(value ?? "");
}

export function strictConversionPreviewHtml(preview) {
  const w = preview.worldImpact;
  const impact = [
    ["Rangers", w.rangers],
    ["Rangers with Wises", w.rangersWithWises],
    ["Wise Items", w.wiseItems],
    ["Talent Items", w.talentItems],
    ["Actors with progression data", w.actorsWithProgressionData],
    ["Actors above Level 1", w.actorsAboveLevelOne],
    ["Structured Gear Items", w.structuredGearItems],
    ["Actors with Fresh / Afraid", w.actorsWithFreshOrAfraid],
    ["Legacy Mixed provenance", w.actorsWithLegacyCreationProvenance]
  ].map(([label, value]) => `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(128,128,128,.16);"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join("");

  const deltas = preview.deltas.map(delta => `
    <section style="padding:9px 0;border-top:1px solid rgba(128,128,128,.22);">
      <b>${esc(delta.title)}</b> <small>· ${esc(delta.domain)} · ${esc(delta.dataAction)}</small>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px;">
        <div><small>Legacy Mixed</small><br>${esc(delta.from)}</div>
        <div><small>Strict</small><br>${esc(delta.to)}</div>
      </div>
      <small>${esc(delta.note)}</small>
    </section>`).join("");

  return `<div class="realm-guard rg-rules-registry-scroll" style="padding:4px 10px;max-height:calc(100vh - 190px);overflow:auto;">
    <h2>Strict Realm Guard · Conversion Preview</h2>
    <p><b>READ ONLY.</b> This report performs no profile switch and writes no Actors, Items or world settings.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><small>Current</small><br><b>${esc(preview.source.name)}</b><br><small>${esc(preview.source.rulesSnapshotHash)}</small></div>
      <div><small>Preview target</small><br><b>${esc(preview.target.name)}</b><br><small>${esc(preview.target.rulesSnapshotHash)}</small></div>
    </div>
    <div style="margin:12px 0;padding:9px;border-left:3px solid currentColor;background:rgba(128,128,128,.08);"><b>No Activate / Convert action exists in M10A.7.</b><br><small>Writes planned: 0 · destructive conversion: NO.</small></div>
    <section><h3>World impact scan</h3>${impact}</section>
    <section><h3>Profile deltas</h3><small>${preview.domainDiff.length} technical domain differences · ${preview.deltas.length} reviewed deltas.</small>${deltas}</section>
  </div>`;
}

export async function openStrictConversionPreview({ fromState, toState, actors, worldItems } = {}) {
  if (!globalThis.game?.user?.isGM) return globalThis.ui?.notifications?.warn?.("Realm Guard: Strict conversion preview is GM-only.");
  const preview = buildStrictConversionPreview({
    fromProfile: fromState.profile,
    toProfile: toState.profile,
    actors: actors ?? globalThis.game?.actors?.contents ?? [],
    worldItems: worldItems ?? globalThis.game?.items?.contents ?? []
  });
  await globalThis.foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Strict Conversion Preview", resizable: true },
    position: { width: 860, height: 820 },
    content: strictConversionPreviewHtml(preview),
    modal: false,
    rejectClose: false,
    buttons: [{ action: "close", label: "Close", default: true }]
  });
  return preview;
}
