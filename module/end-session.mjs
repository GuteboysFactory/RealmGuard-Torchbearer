import { legacyMixedPolishEnabled } from "./legacy-mixed-scope.mjs";
import { END_SESSION_ROSTER_KEY, endSessionRosterActors, saveEndSessionRoster, endSessionRosterHtml, bindEndSessionRoster } from "./end-session-roster.mjs";
import { installEndSession as baselineInstall, openEndSession as baselineOpen } from "./baseline-1.13.1/end-session.mjs";
import { registerGmDockTool } from "./gm-dock.mjs";
import { getActiveM10BSessionCirclesProgressionPolicy, familyEndSessionValidation } from "./m10b-session-circles-progression.mjs";
import { resetTokenPowerSessionState } from "./tokens-of-power.mjs";
import { resetTalentSessionState } from "./talents.mjs";
import { resetTraitSessionUses } from "./traits.mjs";
import { observeM7RewardProposal, observeM7RewardCommit, observeM7Lifecycle } from "./m7-session-shadow.mjs";
import { createM7Services } from "./core/m7-session-services.mjs";
import { evaluateM7RewardProposalLiveHandoff, evaluateM7RewardCommitLiveHandoff } from "./m7-session-live-handoff.mjs";

const NS = "realm-guard";
const CYCLE_KEY = "endSessionCycle";
const FINALIZED_KEY = "endSessionFinalized";
const REWARD_POLICY = Object.freeze({ personaCap: null, mortalCrisis: true });

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
  return endSessionRosterActors();
}

function legacyAwardProposal(actor, criteria, mvpId, workhorseId) {
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
    Number(Boolean(criteria.personaMortalCrisis)) +
    Number(actor.id === mvpId) +
    Number(actor.id === workhorseId);

  return {
    fate,
    persona: personaRaw,
    personaRaw,
    goalFateSuppressed: Boolean(criteria.fateGoal) && accomplishedGoal
  };
}

function awardProposal(actor, criteria, mvpId, workhorseId) {
  const legacy = legacyAwardProposal(actor, criteria, mvpId, workhorseId);
  const services = createM7Services();
  return evaluateM7RewardProposalLiveHandoff({
    actorId: actor?.id ?? "",
    legacy,
    corePlan: () => services.rewardEngine.proposal({
      actorId: actor?.id ?? "",
      criteria,
      mvpId,
      workhorseId, rewardPolicy: REWARD_POLICY
    })
  });
}

function actorCard(actor) {
  const belief = esc(actor.system.belief || "—");
  const goal = esc(actor.system.goal || "—");
  const instinct = esc(actor.system.instinct || "—");
  const creed = esc(actor.system.creed || "—");
  return `<article class="rg-eos-card" data-actor-id="${actor.id}">
    <header><strong>${esc(actor.name)}</strong><input type="checkbox" name="participate_${actor.id}" checked hidden><span>Fate ${Number(actor.system.resources?.fate?.value ?? 0)} · Persona ${Number(actor.system.resources?.persona?.value ?? 0)}</span></header>
    <div class="rg-eos-bgi"><p><b>Belief</b>${belief}</p><p><b>Goal</b>${goal}</p><p><b>Instinct</b>${instinct}</p><p class="rg-eos-creed"><b>Creed</b>${creed}</p></div>
    <div class="rg-eos-awards">
      <fieldset><legend>Fate</legend>
        <label><input type="checkbox" name="fateBelief_${actor.id}"> Acted on Belief</label>
        <label><input type="checkbox" name="fateGoal_${actor.id}"> Worked toward Goal, but did not accomplish it</label>
        <label><input type="checkbox" name="fateInstinct_${actor.id}"> Played Instinct · beneficial or detrimental</label>
      </fieldset>
      <fieldset><legend>Persona</legend>
        <label><input type="checkbox" name="personaAgainstBelief_${actor.id}"> Played against Belief</label>
        <label><input type="checkbox" name="personaGoal_${actor.id}"> Accomplished Goal</label>
        <label><input type="checkbox" name="personaMortalCrisis_${actor.id}"> Mortal Crisis · Creed</label>
      </fieldset>
    </div>
  </article>`;
}

function nomineeOptions(actors) {
  return [`<option value="">None</option>`, ...actors.map(actor => `<option value="${actor.id}">${esc(actor.name)}</option>`)].join("");
}

async function collectCriteria(actors, cycle, draft = null) {
  const options = nomineeOptions(actors);
  const content = `<div class="realm-guard rg-end-session rg-eos-legacy">
    <header class="rg-eos-intro"><div class="rg-brand">REALM GUARD</div><h2>End of Session <span>Cycle ${cycle}</span></h2><p>Review the session together, then choose the rewards earned.</p></header>
    ${endSessionRosterHtml(actors)}
    <details class="rg-eos-guidance"><summary>Reward guidance</summary><p>Review Belief, Goal, Instinct and Creed together. Mortal Crisis earns 1 Persona when Creed causes inner turmoil, or is fiercely defended at great risk. Working toward a Goal earns Fate only when the Goal was not accomplished. All earned Persona is awarded; there is no per-session Persona cap. Only one character may receive Embodiment.</p></details>
    <section class="rg-eos-nominations">
      <label><span>MVP <small>(Most Valuable Player)</small></span><select name="mvp">${options}</select></label>
      <label><span>Teamworker / Workhorse <small>(carried the patrol)</small></span><select name="workhorse">${options}</select></label>
      <fieldset><legend>Embodiment · best embodied the character</legend><div data-eos-embodiment>${actors.map(actor => `<label><input type="checkbox" name="personaEmbodiment_${actor.id}"> ${esc(actor.name)}</label>`).join("")}</div></fieldset>
      <small><b>MVP:</b> the crucial contribution that let the patrol complete the mission. <b>Teamworker / Workhorse:</b> the Ranger who carried the group through the hard work. They must be different Rangers.</small>
    </section>
    <div class="rg-eos-card-list">${actors.map(actorCard).join("")}</div>
  </div>`;

  return foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · End of Session · ${cycle}`, resizable: true },
    position: { width: 820 },
    render: (_event, dialog) => bindEndSessionRoster(dialog.element?.querySelector(".rg-eos-legacy"), actors, { actorCard, nomineeOptions, draft }),
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
          const participating = actors.filter(actor => game.actors.get(actor.id) && checked(form, `participate_${actor.id}`));
          if (!participating.length) return { error: "Select at least one participating Ranger." };

          const participatingIds = new Set(participating.map(actor => actor.id));
          const mvpId = value(form, "mvp");
          const workhorseId = value(form, "workhorse");
          if (mvpId && !participatingIds.has(mvpId)) return { error: "The MVP must be a participating Ranger." };
          if (workhorseId && !participatingIds.has(workhorseId)) return { error: "The Teamworker / Workhorse must be a participating Ranger." };
          if (mvpId && workhorseId && mvpId === workhorseId) return { error: "A Ranger cannot be both MVP and Teamworker / Workhorse in the same session." };

          const rows = participating.map(actor => {
            const criteria = {
              fateBelief: checked(form, `fateBelief_${actor.id}`),
              fateGoal: checked(form, `fateGoal_${actor.id}`),
              fateInstinct: checked(form, `fateInstinct_${actor.id}`),
              personaGoal: checked(form, `personaGoal_${actor.id}`),
              personaAgainstBelief: checked(form, `personaAgainstBelief_${actor.id}`),
              personaEmbodiment: checked(form, `personaEmbodiment_${actor.id}`),
              personaMortalCrisis: checked(form, `personaMortalCrisis_${actor.id}`)
            };
            const legacyProposal = legacyAwardProposal(actor, criteria, mvpId, workhorseId);
            const proposal = awardProposal(actor, criteria, mvpId, workhorseId);
            observeM7RewardProposal({ actor, criteria, mvpId, workhorseId, rewardPolicy: REWARD_POLICY, legacyProposal });
            return { actor, criteria, proposal };
          });

          const embodimentCount = rows.filter(row => row.criteria.personaEmbodiment).length;
          if (embodimentCount > 1) return { error: "Only one character may receive Embodiment per session." };

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
  if (row.actor.id === workhorseId) persona.push("Teamworker / Workhorse");
  if (row.criteria.personaEmbodiment) persona.push("Embodiment");
  if (row.criteria.personaMortalCrisis) persona.push("Mortal Crisis · Creed");
  return { fate, persona };
}

async function reviewAndApprove(result, cycle) {
  const rowsHtml = result.rows.map(row => {
    const labels = criteriaLabels(row, result.mvpId, result.workhorseId);
    const suppressed = row.proposal.goalFateSuppressed ? `<p class="rg-eos-note">Goal progress Fate is not counted because the Goal was accomplished.</p>` : "";
    const capped = "";
    return `<article class="rg-eos-review-card">
      <header><strong>${esc(row.actor.name)}</strong><span>Current: Fate ${Number(row.actor.system.resources?.fate?.value ?? 0)} · Persona ${Number(row.actor.system.resources?.persona?.value ?? 0)}</span></header>
      <div class="rg-eos-review-grid">
        <section><h3>Fate +${row.proposal.fate}</h3><p>${labels.fate.length ? labels.fate.map(esc).join(" · ") : "No Fate criteria selected"}</p></section>
        <section><h3>Persona +${row.proposal.persona}</h3><p>${labels.persona.length ? labels.persona.map(esc).join(" · ") : "No Persona criteria selected"}</p></section>
      </div>${suppressed}${capped}
    </article>`;
  }).join("");

  const content = `<div class="realm-guard rg-end-session rg-eos-legacy rg-eos-review"><header class="rg-eos-intro"><div class="rg-brand">REALM GUARD</div><h2>Review Awards <span>Cycle ${cycle}</span></h2><p>Finish Session approves all rewards shown below. Use Back to change the selections.</p></header><div class="rg-eos-card-list">${rowsHtml}</div></div>`;

  return foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Approve End of Session · ${cycle}`, resizable: true },
    position: { width: 820 },
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
            fate: true,
            persona: true
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

  observeM7Lifecycle("SESSION_ENDING", {
    source: "LEGACY_END_SESSION",
    sessionCycle: cycle,
    participantActorIds: Object.freeze(result.rows.map(row => String(row.actor?.id ?? "")).filter(Boolean))
  });

  const summaries = [];
  for (const row of result.rows) {
    const actor = game.actors.get(row.actor.id);
    if (!actor) continue;
    const actorApproval = approval.approvals?.[actor.id] ?? {};
    const currentFate = Number(actor.system.resources?.fate?.value ?? 0);
    const currentPersona = Number(actor.system.resources?.persona?.value ?? 0);
    const fateMax = Number(actor.system.resources?.fate?.max ?? 999);
    const personaMax = currentPersona + Math.max(0, Number(row.proposal.persona ?? 0));
    const approvedFate = actorApproval.fate ? row.proposal.fate : 0;
    const approvedPersona = actorApproval.persona ? row.proposal.persona : 0;
    const legacyCommit = {
      beforeFate: currentFate,
      beforePersona: currentPersona,
      approvedFate,
      approvedPersona,
      nextFate: Math.min(fateMax, currentFate + approvedFate),
      nextPersona: Math.min(personaMax, currentPersona + approvedPersona)
    };
    legacyCommit.actualFate = legacyCommit.nextFate - currentFate;
    legacyCommit.actualPersona = legacyCommit.nextPersona - currentPersona;

    const services = createM7Services();
    const commitPlan = evaluateM7RewardCommitLiveHandoff({
      actorId: actor.id,
      legacy: legacyCommit,
      corePlan: () => services.rewardEngine.previewCommit({
        currentFate,
        currentPersona,
        fateMax,
        personaMax,
        proposal: row.proposal,
        approval: actorApproval
      })
    });

    if (commitPlan.actualFate || commitPlan.actualPersona) {
      await actor.update({
        "system.resources.fate.value": commitPlan.nextFate,
        "system.resources.persona.value": commitPlan.nextPersona
      });
    }
    observeM7RewardCommit({
      actor,
      proposal: row.proposal,
      approval: actorApproval,
      legacy: {
        ...legacyCommit,
        fateMax,
        personaMax
      }
    });
    summaries.push({
      actor,
      row,
      actorApproval,
      actualFate: commitPlan.actualFate,
      actualPersona: commitPlan.actualPersona,
      approvedFate: commitPlan.approvedFate,
      approvedPersona: commitPlan.approvedPersona
    });
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
  observeM7Lifecycle("SESSION_ENDED", {
    source: "LEGACY_END_SESSION",
    sessionCycle: cycle,
    finalized: Boolean(game.settings.get(NS, FINALIZED_KEY)),
    participantActorIds: Object.freeze(summaries.map(summary => String(summary.actor?.id ?? "")).filter(Boolean)),
    traitUsesReset
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
  observeM7Lifecycle("SESSION_STARTING", {
    source: "LEGACY_END_SESSION",
    previousSessionCycle: cycle,
    sessionCycle: cycle + 1
  });
  await game.settings.set(NS, CYCLE_KEY, cycle + 1);
  await game.settings.set(NS, FINALIZED_KEY, false);
  let recharged = 0;
  let talentsReset = 0;
  for (const actor of game.actors.filter(actor => actor.type === "character" || actor.type === "npc")) {
    recharged += await resetTokenPowerSessionState(actor);
    const profilePolicy = getActiveM10BSessionCirclesProgressionPolicy();
    if (actor.type === "character" && profilePolicy.progression.talentsEnabled) talentsReset += await resetTalentSessionState(actor);
  }
  observeM7Lifecycle("SESSION_STARTED", {
    source: "LEGACY_END_SESSION",
    sessionCycle: cycle + 1,
    finalized: Boolean(game.settings.get(NS, FINALIZED_KEY)),
    tokenPowerUsesRecharged: recharged,
    talentUsesReset: talentsReset
  });
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
  if (!legacyMixedPolishEnabled()) return baselineInstall();
  game.settings.register(NS, END_SESSION_ROSTER_KEY, { name: "Legacy Mixed End Session participants", scope: "world", config: false, type: Object, default: { initialized: false, actorIds: [] } });
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
  if (!legacyMixedPolishEnabled()) return baselineOpen();
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: End of Session is GM-controlled.");
  const actors = participantActors();
  await saveEndSessionRoster(actors);

  let cycle = Number(game.settings.get(NS, CYCLE_KEY) ?? 1);
  if (game.settings.get(NS, FINALIZED_KEY)) {
    const advanced = await confirmNextCycle(cycle);
    if (!advanced) return;
    cycle = Number(game.settings.get(NS, CYCLE_KEY) ?? cycle + 1);
  }

  let draft = null;
  while (true) {
    const criteria = await collectCriteria(actors, cycle, draft);
    if (!criteria) return;
    if (criteria.error) {
      ui.notifications.warn(`Realm Guard: ${criteria.error}`);
      continue;
    }
    draft = criteria;
    const approval = await reviewAndApprove(criteria, cycle);
    if (!approval) return;
    if (approval.back) continue;
    await applyAwards(criteria, approval, cycle);
    return;
  }
}
