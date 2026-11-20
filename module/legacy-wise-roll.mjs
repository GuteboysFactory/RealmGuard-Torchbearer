import { legacyMixedPolishEnabled } from './legacy-mixed-scope.mjs';
import { hasActiveCondition } from "./conditions.mjs";
import { spendRollResource } from "./roll-chat.mjs";

export function legacyWiseHelp(helpers, preparedWise) {
  if (!legacyMixedPolishEnabled()) return null;
  const wises = (helpers ?? []).filter(entry => entry.sourceKind === "Wise");
  if (wises.length + Number(preparedWise?.type === "wise") > 1) {
    throw new Error("Use only one Wise per test, including Wise Help.");
  }
  const entry = wises[0];
  if (entry && game.actors.get(entry.actorId)?.items.get(entry.sourceId)?.type !== "wise") {
    throw new Error("The helper's Wise is no longer available.");
  }
  return entry ?? null;
}

// A prepared Wise or a helper's Wise already contributed to the base pool.
export async function applyLegacyWiseReroll(actor, baseFaces, preparedWise, chatDecision, wiseHelp = null) {
  const unchanged = () => ({ faces: [...baseFaces], rerollFaces: [], traitRerollFaces: [], rerolledIndexes: [] });
  const indexes = baseFaces.map((face, i) => face < 4 ? i : -1).filter(i => i >= 0);
  if (!indexes.length || preparedWise?.type === "wise" || wiseHelp || hasActiveCondition(actor, "Angry")) return unchanged();
  const options = actor.wises ?? [];
  if (!chatDecision || !options.length || Number(actor.system.resources?.persona?.value ?? 0) < 1) return unchanged();
  const id = await chatDecision.ask("Use a relevant Wise to reroll failed dice? Costs 1 Persona.", options.map(item => ({ label: `${item.name} · 1 Persona`, value: item.id })));
  if (!id) return unchanged();
  const wise = actor.items.get(id);
  if (wise?.type !== "wise" || hasActiveCondition(actor, "Angry")) throw new Error("This Wise is no longer available.");
  const roll = await new Roll(`${indexes.length}d6`).evaluate();
  await spendRollResource(actor, "persona", 1, { reason: `${wise.name} · Wise reroll` });
  const rerollFaces = roll.dice.flatMap(die => die.results.map(result => result.result));
  const faces = [...baseFaces]; indexes.forEach((index, i) => { faces[index] = rerollFaces[i]; });
  return { faces, rerollFaces, traitRerollFaces: [], rerolledIndexes: indexes, wiseId: wise.id, personaSpent: 1 };
}
