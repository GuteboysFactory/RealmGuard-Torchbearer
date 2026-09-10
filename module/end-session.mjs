import { registerGmDockTool } from "./gm-dock.mjs";
import { resetTokenPowerSessionState } from "./tokens-of-power.mjs";
import { resetTalentSessionState } from "./talents.mjs";
import { resetTraitSessionUses } from "./traits.mjs";

const NS = "realm-guard";
const CYCLE_KEY = "endSessionCycle";
const FINALIZED_KEY = "endSessionFinalized";

function esc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function checked(form, name) {
  return Boolean(form.elements.namedItem(name)?.checked);
}

function value(form, name) {
  return String(form.elements.namedItem(name)?.value ?? "");
}

function participantActors() {
  return game.actors
    .filter(actor => actor.type === "character")
    .sort((a, b) => a.name.localeCompare(b.name));
}

function awardProposal(actor, criteria, mvpId, workhorseId) {
  const accomplishedGoal = Boolean(criteria.personaGoal);
  const fate = Math.min(3,
    Number(Boolean(criteria.fateBelief)) +
    Number(Boolean(criteria.fateGoal) && !accomplishedGoal) +
    Number(Boolean(criteria.fateInstinct))
  );

  const personaRaw =
    Number(accomplishedGoal) +
    Number(Boolean(criteria.personaAgainstBelief)) +
    Number(Boolean(criteria.personaEmbodiment)) +
    Number(actor.id === mvpId) +
    Number(actor.id === workhorseId);

  return {
    fate,
    persona: Math.min(4, personaRaw),
    personaRaw,
    goalFateSuppressed: Boolean(criteria.fateGoal) && accomplishedGoal
  };
}

function actorCard(actor) {
  const belief = esc(actor.system.belief || "—");
  const goal = esc(actor.system.goal || "—");
  const instinct = esc(actor.system.instinct || "—");
  return `<article class="rg-eos-card" data-actor-id="${actor.id}">
    <header><label><input type="checkbox" name="participate_${actor.id}" checked> <strong>${esc(actor.name)}</strong></label><span>Fate ${Number(actor.system.resources?.fate?.value ?? 0)} · Persona ${Number(actor.system.resources?.persona?.value ?? 0)}</span></header>
    <div class="rg-eos-bgi"><p><b>Belief</b>${belief}</p><p><b>Goal</b>${goal}</p><p><b>Instinct</b>${instinct}</p></div>
    <div class="rg-eos-awards">
      <fieldset><legend>Fate</legend>
        <label><input type="checkbox" name="fateBelief_${actor.id}"> Acted on Belief</label>
        <label><input type="checkbox" name="fateGoal_${actor.id}"> Worked toward Goal, but did not accomplish it</label>
        <label><input type="checkbox" name="fateInstinct_${actor.id}"> Played Instinct</label>
      </fieldset>
      <fieldset><legend>Persona</legend>
        <label><input type="checkbox" name="personaGoal_${actor.id}"> Accomplished Goal</label>
        <label><input type="checkbox" name="personaAgainstBelief_${actor.id}"> Played against Belief dramatically</label>
        <label title="Embodiment rewards especially strong portrayal of the Ranger's conditions and traits."><input type="checkbox" name="personaEmbodiment_${actor.id}"> Embodiment <small>(best embodied the Ranger)</small></label>
      </fieldset>
    </div>
  </article>`;
}

function nomineeOptions(actors) {
  return [`<option value="">None</option>`, ...actors.map(actor => `<option value="${actor.id}">${esc(actor.name)}</option>`)].join("");
}

async function collectCriteria(actors, cycle) {
  const options = nomineeOptions(actors);
  const content = `<div class="rg-end-session">
    <header class="rg-eos-intro"><h2>End of Session · Cycle ${cycle}</h2><p>Review each participating Ranger's Belief, Goal and Instinct with the group, then mark the rewards the group agrees were earned.</p><p><small>Goal rule: Working Toward a Goal earns Fate only when the Goal was not accomplished. Persona is capped at 4 per session.</small></p></header>
    <section class="rg-eos-nominations">
      <label><span>MVP <small>(Most Valuable Player)</small></span><select name="mvp">${options}</select></label>
      <label><span>Workhorse <small>(carried the patrol)</small></span><select name="workhorse">${options}</select></label>
      <small><b>MVP:</b> the crucial contribution that let the patrol complete the mission. <b>Workhorse:</b> the Ranger who carried the group through the hard work. They must be different Rangers.</small>
    </section>
    <div class="rg-eos-card-list">${actors.map(actorCard).join("")}</div>
  </div>`;

  return foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · End of Session · ${cycle}`, resizable: true },
    content,
    modal: false,
    rejectClose: false,
    buttons: [
      {
        action: "review",
        label: "Review Awards",
        icon: "fa-solid fa-list-check",
        default: true,
        callback: (event, button) => {
          const form = button.form;
          const participating = actors.filter(actor => checked(form, `participate_${actor.id}`));
          if (!participating.length) return { error: "Select at least one participating Ranger." };

          const participatingIds = new Set(participating.map(actor => actor.id));
          const mvpId = value(form, "mvp");
          const workhorseId = value(form, "workhorse");
          if (mvpId && !participatingIds.has(mvpId)) return { error: "The MVP must be a participating Ranger." };
          if (workhorseId && !participatingIds.has(workhorseId)) return { error: "The Workhorse must be a participating Ranger." };
          if (mvpId && workhorseId && mvpId === workhorseId) return { error: "A Ranger cannot be both MVP and Workhorse in the same session." };

          const rows = participating.map(actor => {
            const criteria = {
              fateBelief: checked(form, `fateBelief_${actor.id}`),
              fateGoal: checked(form, `fateGoal_${actor.id}`),
              fateInstinct: checked(form, `fateInstinct_${actor.id}`),
              personaGoal: checked(form, `personaGoal_${actor.id}`),
              personaAgainstBelief: checked(form, `personaAgainstBelief_${actor.id}`),
              personaEmbodiment: checked(form, `personaEmbodiment_${actor.id}`)
            };
            return { actor, criteria, proposal: awardProposal(actor, criteria, mvpId, workhorseId) };
          });

          const embodimentCount = rows.filter(row => row.criteria.personaEmbodiment).length;
          if (rows.length > 1 && embodimentCount === rows.length) return { error: "Embodiment may be awarded to more than one Ranger, but not to everyone in a multi-Ranger session." };

          return { rows, mvpId, workhorseId };
        }
      },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
}

function criteriaLabels(row, mvpId, workhorseId) {
  const fate = [];
  if (row.criteria.fateBelief) fate.push("Belief");
  if (row.criteria.fateGoal && !row.criteria.personaGoal) fate.push("Goal progress");
  if (row.criteria.fateInstinct) fate.push("Instinct");
  const persona = [];
  if (row.criteria.personaGoal) persona.push("Goal accomplished");
  if (row.criteria.personaAgainstBelief) persona.push("Against Belief");
  if (row.actor.id === mvpId) persona.push("MVP");
  if (row.actor.id === workhorseId) persona.push("Workhorse");
  if (row.criteria.personaEmbodiment) persona.push("Embodiment");
  return { fate, persona };
}

async function reviewAndApprove(result, cycle) {
  const rowsHtml = result.rows.map(row => {
    const labels = criteriaLabels(row, result.mvpId, result.workhorseId);
    const suppressed = row.proposal.goalFateSuppressed ? `<p class="rg-eos-note">Goal progress Fate is not counted because the Goal was accomplished.</p>` : "";
    const capped = row.proposal.personaRaw > 4 ? `<p class="rg-eos-note">Persona proposal capped from ${row.proposal.personaRaw} to 4 by the per-session limit.</p>` : "";
    return `<article class="rg-eos-review-card">
      <header><strong>${esc(row.actor.name)}</strong><span>Current: Fate ${Number(row.actor.system.resources?.fate?.value ?? 0)} · Persona ${Number(row.actor.system.resources?.persona?.value ?? 0)}</span></header>
      <div class="rg-eos-review-grid">
        <section><h3>Fate +${row.proposal.fate}</h3><p>${labels.fate.length ? labels.fate.map(esc).join(" · ") : "No Fate criteria selected"}</p><label><input type="checkbox" name="approveFate_${row.actor.id}" ${row.proposal.fate ? "" : "disabled"}> GM approves Fate</label></section>
        <section><h3>Persona +${row.proposal.persona}</h3><p>${labels.persona.length ? labels.persona.map(esc).join(" · ") : "No Persona criteria selected"}</p><label><input type="checkbox" name="approvePersona_${row.actor.id}" ${row.proposal.persona ? "" : "disabled"}> GM approves Persona</label></section>
      </div>${suppressed}${capped}
    </article>`;
  }).join("");

  const content = `<div class="rg-end-session rg-eos-review"><header class="rg-eos-intro"><h2>Review & Approve · Cycle ${cycle}</h2><p>Fate and Persona are approved separately. Only approved rewards are applied when the session is finished.</p></header><div class="rg-eos-card-list">${rowsHtml}</div></div>`;

  return foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Approve End of Session · ${cycle}`, resizable: true },
    content,
    modal: false,
    rejectClose: false,
    buttons: [
      {
        action: "finish",
        label: "Finish Session",
        icon: "fa-solid fa-flag-checkered",
        default: true,
        callback: (event, button) => ({
          approvals: Object.fromEntries(result.rows.map(row => [row.actor.id, {
            fate: checked(button.form, `approveFate_${row.actor.id}`),
            persona: checked(button.form, `approvePersona_${row.actor.id}`)
          }]))
        })
      },
      { action: "back", label: "Back", icon: "fa-solid fa-arrow-left", callback: () => ({ back: true }) },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
}

async function applyAwards(result, approval, cycle) {
  if (game.settings.get(NS, FINALIZED_KEY)) {
    ui.notifications.warn(`Realm Guard: End of Session cycle ${cycle} has already been finalized. No rewards were applied.`);
    return false;
  }

  const summaries = [];
  for (const row of result.rows) {
    const actor = game.actors.get(row.actor.id);
    if (!actor) continue;
    const actorApproval = approval.approvals?.[actor.id] ?? {};
    const currentFate = Number(actor.system.resources?.fate?.value ?? 0);
    const currentPersona = Number(actor.system.resources?.persona?.value ?? 0);
    const fateMax = Number(actor.system.resources?.fate?.max ?? 999);
    const personaMax = Number(actor.system.resources?.persona?.max ?? 999);
    const approvedFate = actorApproval.fate ? row.proposal.fate : 0;
    const approvedPersona = actorApproval.persona ? row.proposal.persona : 0;
    const nextFate = Math.min(fateMax, currentFate + approvedFate);
    const nextPersona = Math.min(personaMax, currentPersona + approvedPersona);
    const actualFate = nextFate - currentFate;
    const actualPersona = nextPersona - currentPersona;

    if (actualFate || actualPersona) {
      await actor.update({
        "system.resources.fate.value": nextFate,
        "system.resources.persona.value": nextPersona
      });
    }
    summaries.push({ actor, row, actorApproval, actualFate, actualPersona, approvedFate, approvedPersona });
  }

  await game.settings.set(NS, FINALIZED_KEY, true);

  let traitUsesReset = 0;
  for (const actor of game.actors.filter(actor => actor.type === "character" || actor.type === "npc")) {
    traitUsesReset += await resetTraitSessionUses(actor);
  }

  const cards = summaries.map(summary => {
    const fateApproved = Boolean(summary.actorApproval.fate);
    const personaApproved = Boolean(summary.actorApproval.persona);
    const fateState = fateApproved ? `+${summary.actualFate}${summary.actualFate < summary.approvedFate ? " cap" : ""}` : `Not approved (+${summary.row.proposal.fate})`;
    const personaState = personaApproved ? `+${summary.actualPersona}${summary.actualPersona < summary.approvedPersona ? " cap" : ""}` : `Not approved (+${summary.row.proposal.persona})`;
    return `<div class="rg-eos-chat-ranger">
      <strong>${esc(summary.actor.name)}</strong>
      <span class="rg-eos-chat-reward ${fateApproved ? "is-approved" : "is-muted"}"><b>Fate</b><em>${esc(fateState)}</em></span>
      <span class="rg-eos-chat-reward ${personaApproved ? "is-approved" : "is-muted"}"><b>Persona</b><em>${esc(personaState)}</em></span>
    </div>`;
  }).join("");

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker(),
    content: `<div class="realm-guard rg-end-session-chat">
      <header class="rg-eos-chat-head"><strong>End of Session</strong><span>Cycle ${cycle}</span></header>
      <p class="rg-eos-chat-byline">Rewards finalized by ${esc(game.user.name)}.</p>
      <div class="rg-eos-chat-list">${cards}</div>
      <p class="rg-eos-chat-lock"><i class="fa-solid fa-lock"></i> Cycle locked against duplicate rewards.${traitUsesReset ? ` Trait benefit uses reset for the next session.` : ""}</p>
    </div>`
  });
  ui.notifications.info(`Realm Guard: End of Session cycle ${cycle} finalized.${traitUsesReset ? ` ${traitUsesReset} Trait benefit use${traitUsesReset === 1 ? "" : "s"} reset.` : ""}`);
  return true;
}

async function confirmNextCycle(cycle) {
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Session Already Finalized", resizable: true },
    content: `<div class="rg-end-session"><h2>Cycle ${cycle} is already finalized</h2><p>Rewards cannot be applied twice to the same session cycle.</p><p>Start the next cycle only when a new play session is beginning.</p></div>`,
    modal: false,
    rejectClose: false,
    buttons: [
      { action: "next", label: "Start Next Session", icon: "fa-solid fa-forward-step", callback: () => true },
      { action: "close", label: "Close", default: true, callback: () => false }
    ]
  });
  if (!result) return false;
  await game.settings.set(NS, CYCLE_KEY, cycle + 1);
  await game.settings.set(NS, FINALIZED_KEY, false);
  let recharged = 0;
  let talentsReset = 0;
  for (const actor of game.actors.filter(actor => actor.type === "character" || actor.type === "npc")) {
    recharged += await resetTokenPowerSessionState(actor);
    if (actor.type === "character") talentsReset += await resetTalentSessionState(actor);
  }
  ui.notifications.info(`Realm Guard: End of Session cycle ${cycle + 1} is ready.${recharged ? ` ${recharged} Token of Power use${recharged === 1 ? "" : "s"} recharged.` : ""}${talentsReset ? ` ${talentsReset} Talent use${talentsReset === 1 ? "" : "s"} reset.` : ""}`);
  return true;
}

function installEndSessionDockTool() {
  registerGmDockTool({
    id: "end-session",
    icon: "fa-solid fa-flag-checkered",
    tooltip: "Start End Session",
    order: 10,
    onClick: () => openEndSession()
  });
}

export function installEndSession() {
  game.settings.register(NS, CYCLE_KEY, {
    name: "End of Session Cycle",
    hint: "Internal Realm Guard session-cycle counter used to prevent duplicate end-of-session rewards.",
    scope: "world",
    config: false,
    type: Number,
    default: 1
  });
  game.settings.register(NS, FINALIZED_KEY, {
    name: "End of Session Finalized",
    hint: "Internal Realm Guard guardrail for duplicate reward application.",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
  installEndSessionDockTool();
}

export async function openEndSession() {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: End of Session is GM-controlled.");
  const actors = participantActors();
  if (!actors.length) return ui.notifications.warn("Realm Guard: No character Actors are available for End of Session.");

  let cycle = Number(game.settings.get(NS, CYCLE_KEY) ?? 1);
  if (game.settings.get(NS, FINALIZED_KEY)) {
    const advanced = await confirmNextCycle(cycle);
    if (!advanced) return;
    cycle = Number(game.settings.get(NS, CYCLE_KEY) ?? cycle + 1);
  }

  while (true) {
    const criteria = await collectCriteria(actors, cycle);
    if (!criteria) return;
    if (criteria.error) {
      ui.notifications.warn(`Realm Guard: ${criteria.error}`);
      continue;
    }
    const approval = await reviewAndApprove(criteria, cycle);
    if (!approval) return;
    if (approval.back) continue;
    await applyAwards(criteria, approval, cycle);
    return;
  }
}
