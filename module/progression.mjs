const NS = "realm-guard";

// Torchbearer 2E cumulative Fate/Persona thresholds, deliberately adapted as
// Realm Guard's optional long-term progression math. Realm Guard does NOT import
// Torchbearer's Town/class structure; only committed lifetime resource spend is used.
export const LEVEL_REQUIREMENTS = Object.freeze([
  { level: 1, fate: 0, persona: 0 },
  { level: 2, fate: 3, persona: 3 },
  { level: 3, fate: 7, persona: 6 },
  { level: 4, fate: 14, persona: 9 },
  { level: 5, fate: 22, persona: 12 },
  { level: 6, fate: 31, persona: 16 },
  { level: 7, fate: 41, persona: 20 },
  { level: 8, fate: 52, persona: 24 },
  { level: 9, fate: 64, persona: 28 },
  { level: 10, fate: 77, persona: 32 }
]);

export function progressionLevelFor(spentFate = 0, spentPersona = 0) {
  const fate = Math.max(0, Number(spentFate ?? 0));
  const persona = Math.max(0, Number(spentPersona ?? 0));
  let level = 1;
  for (const requirement of LEVEL_REQUIREMENTS) {
    if (fate >= requirement.fate && persona >= requirement.persona) level = requirement.level;
  }
  return level;
}

export function progressionView(actor) {
  const p = actor?.system?.progression ?? {};
  const spentFate = Math.max(0, Number(p.spentFate ?? 0));
  const spentPersona = Math.max(0, Number(p.spentPersona ?? 0));
  const computed = progressionLevelFor(spentFate, spentPersona);
  const level = Math.max(1, Math.min(10, Number(p.level ?? computed), computed));
  const next = LEVEL_REQUIREMENTS.find(row => row.level === level + 1) ?? null;
  const previous = LEVEL_REQUIREMENTS.find(row => row.level === level) ?? LEVEL_REQUIREMENTS[0];
  const talentCount = actor?.items?.filter?.(item => item.type === "talent")?.length ?? 0;
  const slots = Math.max(0, level - 1);
  const pendingTalents = Math.max(0, slots - talentCount);
  const progress = (value, start, goal) => {
    if (!goal || goal <= start) return 100;
    return Math.max(0, Math.min(100, Math.round(((value - start) / (goal - start)) * 100)));
  };
  return {
    level,
    spentFate,
    spentPersona,
    next,
    maxLevel: !next,
    talentCount,
    talentSlots: slots,
    pendingTalents,
    fateProgress: next ? progress(spentFate, previous.fate, next.fate) : 100,
    personaProgress: next ? progress(spentPersona, previous.persona, next.persona) : 100,
    fateRemaining: next ? Math.max(0, next.fate - spentFate) : 0,
    personaRemaining: next ? Math.max(0, next.persona - spentPersona) : 0
  };
}

async function announceLevelUp(actor, oldLevel, newLevel) {
  if (!actor || newLevel <= oldLevel) return;
  const esc = foundry.utils.escapeHTML;
  const choices = Math.max(0, newLevel - oldLevel);
  const content = `<div class="realm-guard rg-level-up-chat rg-celebration-chat rg-level-celebration"><div class="rg-level-stars">★ ✦ ★</div><div class="rg-celebration-kicker">LEVEL UP!</div><h2>${esc(actor.name)} reaches Level ${newLevel}!</h2><div class="rg-level-jump"><span>LEVEL ${oldLevel}</span><i class="fa-solid fa-arrow-right"></i><strong>LEVEL ${newLevel}</strong></div><p><b>Congratulations, Ranger!</b> Your deeds, sacrifices and hard-earned experience have carried you to a new level.</p>${choices ? `<p class="rg-talent-unlock"><i class="fa-solid fa-sparkles"></i> <b>${choices} new Talent choice${choices === 1 ? "" : "s"}</b> unlocked.</p>` : ""}</div>`;
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content });
  ui.notifications.info(`Realm Guard: ${actor.name} reached Level ${newLevel}!${choices ? ` ${choices} Talent choice${choices === 1 ? "" : "s"} unlocked.` : ""}`);
  if (choices) {
    setTimeout(() => {
      void import("./talents.mjs").then(({ chooseTalentForActor }) => chooseTalentForActor(actor)).catch(error => console.warn(`${NS} | could not open Talent choice after level-up`, error));
    }, 150);
  }
}

export async function spendTrackedResource(actor, kind, amount = 1, { reason = "" } = {}) {
  if (!actor || !["fate", "persona"].includes(kind)) return { ok: false, reason: "Unsupported tracked resource." };
  const spend = Math.max(0, Math.trunc(Number(amount ?? 0)));
  if (!spend) return { ok: true, spent: 0, levelUp: false, level: Number(actor.system?.progression?.level ?? 1) };
  const current = Math.max(0, Number(actor.system?.resources?.[kind]?.value ?? 0));
  if (current < spend) return { ok: false, reason: `Not enough ${kind === "fate" ? "Fate" : "Persona"}.` };

  const update = { [`system.resources.${kind}.value`]: current - spend };
  let oldLevel = Math.max(1, Number(actor.system?.progression?.level ?? 1));
  let newLevel = oldLevel;
  if (actor.type === "character") {
    const spentFate = Math.max(0, Number(actor.system?.progression?.spentFate ?? 0)) + (kind === "fate" ? spend : 0);
    const spentPersona = Math.max(0, Number(actor.system?.progression?.spentPersona ?? 0)) + (kind === "persona" ? spend : 0);
    newLevel = Math.max(oldLevel, progressionLevelFor(spentFate, spentPersona));
    update["system.progression.spentFate"] = spentFate;
    update["system.progression.spentPersona"] = spentPersona;
    update["system.progression.level"] = newLevel;
  }
  await actor.update(update, { realmGuardProgressionSpend: true, realmGuardProgressionReason: reason });
  if (actor.type === "character" && newLevel > oldLevel) await announceLevelUp(actor, oldLevel, newLevel);
  return { ok: true, spent: spend, levelUp: newLevel > oldLevel, oldLevel, level: newLevel };
}

export async function setProgressionTotals(actor, spentFate = 0, spentPersona = 0) {
  if (!actor || actor.type !== "character") return { ok: false, reason: "Progression belongs to Ranger characters." };
  const fate = Math.max(0, Math.trunc(Number(spentFate ?? 0)));
  const persona = Math.max(0, Math.trunc(Number(spentPersona ?? 0)));
  const level = progressionLevelFor(fate, persona);
  await actor.update({
    "system.progression.spentFate": fate,
    "system.progression.spentPersona": persona,
    "system.progression.level": level
  }, { realmGuardProgressionAdmin: true });
  return { ok: true, level, fate, persona };
}

export async function reconcileProgression(actor) {
  if (!actor || actor.type !== "character") return false;
  const spentFate = Math.max(0, Number(actor.system?.progression?.spentFate ?? 0));
  const spentPersona = Math.max(0, Number(actor.system?.progression?.spentPersona ?? 0));
  const computed = progressionLevelFor(spentFate, spentPersona);
  const stored = Math.max(1, Number(actor.system?.progression?.level ?? 1));
  if (stored === computed) return false;
  await actor.update({ "system.progression.level": computed }, { realmGuardProgressionMigration: true });
  return true;
}

export function installProgression() {
  Hooks.once("ready", async () => {
    if (!game.user?.isGM) return;
    for (const actor of game.actors.filter(a => a.type === "character")) {
      try { await reconcileProgression(actor); }
      catch (error) { console.warn(`${NS} | progression migration failed for ${actor.name}`, error); }
    }
  });
}
