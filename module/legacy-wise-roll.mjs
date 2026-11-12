import { wiseAvailable, consumeWise } from './legacy-session.mjs';
import { hasActiveCondition } from "./conditions.mjs";
import { spendRollResource } from "./roll-chat.mjs";

// A prepared Wise is used once as part of that roll. If none was prepared,
// the actor may choose one relevant Wise after seeing failures, for 1 Persona.
export async function applyLegacyWiseReroll(actor, baseFaces, preparedWise, chatDecision) {
  const unchanged = () => ({ faces: [...baseFaces], rerollFaces: [], traitRerollFaces: [], rerolledIndexes: [] });
  const indexes = baseFaces.map((face, i) => face < 4 ? i : -1).filter(i => i >= 0);
  if (!indexes.length || hasActiveCondition(actor, "Angry")) return unchanged();
  let wise = preparedWise?.type === "wise" ? preparedWise : null;
  if(wise && !wiseAvailable(wise)) throw new Error("This Wise was already used this session.");
  let paid = false;
  if (!wise) {
    const options = (actor.wises ?? []).filter(wiseAvailable);
    if (!chatDecision || !options.length || Number(actor.system.resources?.persona?.value ?? 0) < 1) return unchanged();
    const id = await chatDecision.ask("Use a relevant Wise to reroll failed dice? Costs 1 Persona.", options.map(item => ({ label: `${item.name} · 1 Persona`, value: item.id })));
    if (!id) return unchanged();
    wise = actor.items.get(id);
    if (wise?.type !== "wise" || !wiseAvailable(wise) || hasActiveCondition(actor, "Angry")) throw new Error("This Wise is no longer available.");
    paid = true;
  }
  const roll = await new Roll(`${indexes.length}d6`).evaluate();
  if (paid) await spendRollResource(actor, "persona", 1, { reason: `${wise.name} · Wise reroll` });
  await consumeWise(wise);
  const rerollFaces = roll.dice.flatMap(die => die.results.map(result => result.result));
  const faces = [...baseFaces]; indexes.forEach((index, i) => { faces[index] = rerollFaces[i]; });
  return { faces, rerollFaces, traitRerollFaces: [], rerolledIndexes: indexes, wiseId: wise.id, personaSpent: paid ? 1 : 0 };
}
