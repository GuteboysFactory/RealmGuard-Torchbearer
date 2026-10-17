import { TB2E_BETA_ID, tb2eLabel } from "./profiles/torchbearer2e-beta-creation.mjs";
import { tb2eCreationModel } from "./m10d-tb2e-creation-shadow.mjs";
import { createProfileCreationDraft, validateProfileCreation, profileCreationCommitPlan } from "./m10b-character-creation.mjs";
import { FoundryCreationCommitAdapter } from "./m9-creation-commit-adapter.mjs";
import { getActiveRulesSnapshot, getActiveRulesProfile } from "./rules-profile-service.mjs";

const QUESTIONS = {
  DWARF: [["REVENGE", "NEGOTIATE"], ["DIG_DEEPER", "FEAR_BELOW"], ["CRAFT", "SPEND_GOLD"]],
  ELF: [["SING", "ENCHANT"], ["CONFRONT_EVIL", "RETREAT_HIDE"], ["JOURNEY_WEST", "STRUGGLE"]],
  HALFLING: [["FEAST", "HOARD"], ["RIDDLE", "FIGHT"], ["SNEAK", "DEMAND"]],
  HUMAN: [["BOAST", "PREPARE"], ["DEMAND_RIGHTS", "LISTEN_ELDERS"], ["FLEE_HIDE", "FIGHT"]]
};
const esc = value => foundry.utils.escapeHTML(String(value ?? ""));
const select = (name, label, choices, values) => `<label>${esc(label)}<select name="${name}">${choices.map(choice => `<option value="${esc(choice)}" ${values[name] === choice ? "selected" : ""}>${esc(tb2eLabel(choice))}</option>`).join("")}</select></label>`;
const input = (name, label, values, type = "text") => `<label>${esc(label)}<input type="${type}" name="${name}" value="${esc(values[name])}"></label>`;
async function form(title, body, values, next = "Continue") {
  return foundry.applications.api.DialogV2.wait({
    window: { title: `TB2E Beta - ${title}`, resizable: true }, position: { width: 700 }, rejectClose: false,
    content: `<form class="realm-guard rg-recruitment" style="max-height:65vh;overflow:auto;padding:12px"><h2>${esc(title)}</h2>${body}</form>`,
    buttons: [
      { action: "next", label: next, callback: (_event, button) => { Object.assign(values, Object.fromEntries(new FormData(button.form))); return "next"; } },
      { action: "cancel", label: "Cancel", default: true, callback: () => "cancel" }
    ]
  });
}

export async function openTb2eBetaCreation() {
  if (getActiveRulesProfile().id !== TB2E_BETA_ID) throw Error("Activate TB2E Beta before creating a character.");
  if (!game.user.isGM && !game.user.can("ACTOR_CREATE")) return ui.notifications.warn("Actor creation permission is required.");
  const model = tb2eCreationModel(), a = { name: "", rank: "WARRIOR", will: 4, health: 4, age: 18 };
  if (await form("Class and identity", input("name", "Name", a) + select("rank", "Class", model.classes, a) + input("will", "Human Will (Will + Health = 8; maximum 6 each)", a, "number") + input("health", "Human Health (other stocks use fixed values)", a, "number"), a) !== "next") return null;
  const stock = model.classRules[a.rank].stock;
  a.age = model.ageRanges[stock].min;
  const homes = Object.keys(model.homes).filter(home => model.homes[home].stocks.includes(stock));
  if (await form("Home", select("home", "Home", homes, a), a) !== "next") return null;
  const home = model.homes[a.home];
  let body = input("name", "Name", a) + input("age", `Age (${model.ageRanges[stock].min}-${model.ageRanges[stock].max})`, a, "number") + input("raiment", "Appearance and clothing", a);
  if (stock === "HUMAN") body += input("will", "Will (Will + Health = 8)", a, "number") + input("health", "Health (maximum 6 each)", a, "number") + select("upbringing", "Human upbringing skill", model.humanUpbringing, a);
  body += select("homeSkill", "Home skill", home.skills, a) + select("homeTrait", "Home trait", home.traits, a) + select("social", "Social grace", model.socialGraces, a) + select("specialty", "Specialty (unique in your party)", model.specialties, a);
  body += "<h3>Nature</h3>" + QUESTIONS[stock].map((choices, i) => select(`q${i + 1}`, `Nature choice ${i + 1}`, choices, a)).join("");
  if (["ELF", "HUMAN"].includes(stock)) body += select("replacementTrait", "Replacement home trait (only if required by Nature choice)", stock === "ELF" ? ["FIERY", "CURIOUS", "RESTLESS"] : ["LONER", "FOOLHARDY", "DEFENDER"], a);
  if (stock === "HUMAN") body += select("secondWise", "Wise when listening to elders", ["ELF_WISE", "DWARF_WISE", "POLITICS_WISE"], a);
  body += "<h3>Wises</h3>";
  if (stock !== "HUMAN") body += select("stockWise", "Stock Wise", model.wises[stock].stockChoices, a);
  body += input("customWise", "Your own specific Wise", a);
  body += select("relationshipRoute", "Relationships: Friend or Loner", ["FRIEND", "LONER"], a);
  body += "<h3>Relationships</h3><p>Friend route requires a named Friend. Loner route uses only a named Enemy; leave Friend, Parents and Mentor empty. Magicians cannot use Loner in this bounded beta.</p><p>Name up to three. Magicians must have a mentor. Additional details can be edited on the sheet. Keepsakes and gold pouches are selected with the GM from existing Items.</p>";
  for (const name of ["friend", "parents", "mentor", "enemy"]) body += input(name, tb2eLabel(name), a);
  for (const name of ["belief", "goal", "instinct", "creed"]) body += input(name, name === "creed" ? "Creed (takes effect from level 3)" : tb2eLabel(name), a);
  while (true) {
    if (await form("Character choices", body, a) !== "next") return null;
    body = body.replace(/(<input[^>]*name="([^"]+)"[^>]*value=")[^"]*(")/g, (_all, start, name, end) => start + esc(a[name]) + end);
    body = body.replace(/<select name="([^"]+)">([\s\S]*?)<\/select>/g, (_all, name, options) => `<select name="${name}">${options.replace(/<option value="([^"]+)"[^>]*>/g, (_o, value) => `<option value="${value}" ${a[name] === value ? "selected" : ""}>`)}</select>`);
    const draft = createProfileCreationDraft(TB2E_BETA_ID, { answers: a });
    const validation = validateProfileCreation(TB2E_BETA_ID, draft);
    if (!validation.valid) { ui.notifications.warn(validation.errors.map(e => e.message ?? e.code).join("; ")); continue; }
    const d = draft.derivedValues;
    const review = `<h3>${esc(a.name)} - ${esc(tb2eLabel(a.rank))}</h3><p>${esc(d.descriptors)}</p><dl>${Object.entries(d.abilities).map(([name, value]) => `<dt>${esc(tb2eLabel(name))}</dt><dd>${value}</dd>`).join("")}</dl><h3>Skills</h3><p>${Object.entries(d.skillChecks).map(([name, value]) => `${esc(name)} ${value}`).join(", ")}</p><h3>Traits and Wises</h3><p>${esc(Object.keys(d.traitChecks).join(", "))}; ${esc(Object.keys(d.wiseChecks).join(", "))}</p><p>After creation, choose starting equipment from your existing Items with the GM. Magic, class benefits and trait effects are handled manually in this beta.</p>`;
    if (await form("Review before creation", review, a, "Create character") !== "next") return null;
    // Resolve again after review: a profile switch must invalidate this commit.
    if (getActiveRulesProfile().id !== TB2E_BETA_ID) throw Error("The active profile changed. Reopen character creation.");
    const plan = profileCreationCommitPlan(TB2E_BETA_ID, draft);
    let result;
    try { result = await new FoundryCreationCommitAdapter({ shadowOnly: false }).execute(plan, { isGM: game.user.isGM, userId: game.user.id, rulesSnapshot: getActiveRulesSnapshot() }); }
    catch (error) { ui.notifications.error(error.message); return null; }
    result.actor.sheet.render(true);
    return result.actor;
  }
}
