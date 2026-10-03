import { mg2eWiseUsePlan } from "./m10c-mg2e-shadow-adapters.mjs";

/** The caller is the active MG2E Actor roll pipeline, before Fate/open sixes. */
export async function applyMg2eWiseEffect(actor, baseFaces, wise, { choose = null, excludedIndexes = [] } = {}) {
  const unchanged = () => ({ faces: [...baseFaces], rerollFaces: [], traitRerollFaces: [], rerolledIndexes: [] });
  if (wise?.type !== "wise") return unchanged();
  const eligible = baseFaces.map((face, index) => face < 4 && !excludedIndexes.includes(index) ? index : -1).filter(index => index >= 0);
  if (!eligible.length) return unchanged();
  const resources = actor.system?.resources ?? {};
  const fate = Number(resources.fate?.value ?? 0);
  const persona = Number(resources.persona?.value ?? 0);
  if (fate < 1 && persona < 1) return unchanged();
  const selection = choose ? await choose({ eligible, fate, persona }) : await foundry.applications.api.DialogV2.wait({
    window: { title: "Mouse Guard 2E · Wise", resizable: true },
    content: `<div class="realm-guard"><p>Use <b>${foundry.utils.escapeHTML(wise.name)}</b> on this test?</p>
      <p>Deeper Understanding spends 1 Fate to reroll one failed die. Of Course spends 1 Persona to reroll all failed dice, before opening sixes.</p>
      <label>Deeper Understanding die <select name="wiseDie">${eligible.map(index => `<option value="${index}">Die ${index + 1}: ${baseFaces[index]}</option>`).join("")}</select></label></div>`,
    modal: true, rejectClose: false,
    buttons: [
      ...(fate > 0 ? [{ action: "deeper", label: "Deeper Understanding · 1 Fate", callback: (_event, button) => ({ effect: "Deeper Understanding", index: Number(button.form?.elements?.wiseDie?.value ?? eligible[0]) }) }] : []),
      ...(persona > 0 ? [{ action: "course", label: "Of Course · 1 Persona", callback: () => ({ effect: "Of Course" }) }] : []),
      { action: "keep", label: "Keep roll", default: true, callback: () => null }
    ]
  });
  if (!selection) return unchanged();
  const plan = mg2eWiseUsePlan(selection.effect, { failedDice: eligible.length });
  if (!plan.ok || !["DEEPER_UNDERSTANDING", "OF_COURSE"].includes(plan.effect)) throw new Error("Choose an MG2E self Wise reroll effect.");
  const kind = plan.resourceCost === "FATE" ? "fate" : "persona";
  if (Number(actor.system.resources[kind]?.value ?? 0) < 1) throw new Error(`No ${kind} remains for this Wise effect.`);
  const indexes = plan.effect === "DEEPER_UNDERSTANDING" ? [Number(selection.index ?? eligible[0])] : eligible;
  if (indexes.some(index => !eligible.includes(index))) throw new Error("Wise rerolls require an eligible failed die that has not already been rerolled.");
  // Evaluate before spending; an evaluation error leaves resources untouched.
  const roll = await new Roll(`${indexes.length}d6`).evaluate();
  const rerollFaces = roll.dice.flatMap(die => die.results.map(result => result.result));
  const spent = await actor.spendTrackedResource(kind, 1, { source: "MG2E_WISE", reason: plan.effect });
  if (spent?.ok === false) throw new Error(`Could not spend ${kind} for this Wise effect.`);
  const faces = [...baseFaces];
  indexes.forEach((index, n) => { faces[index] = rerollFaces[n]; });
  return { faces, rerollFaces, traitRerollFaces: [], rerolledIndexes: indexes, wiseEffect: plan.effect, resourceCost: kind };
}
