import { diceFacesHtml } from "./dice-ui.mjs";

const esc = value => foundry.utils.escapeHTML(String(value ?? ""));

export function rollCardDiceHistory(initial = [], wise = {}, token = {}, fate = []) {
  const wiseIndexes = wise.wiseRerolledIndexes ?? [];
  const aligned = Boolean(wise.personaSpent && wise.rerollFaces?.length && wiseIndexes.length === wise.rerollFaces.length);
  const replacements = aligned
    ? initial.map((_face, index) => wise.rerollFaces[wiseIndexes.indexOf(index)] ?? null)
    : wise.rerollFaces;
  const adjustments = [
    ["Wise reroll", replacements, { keepSlots: aligned }],
    ["Talent reroll", wise.talentRerollFaces],
    ["Token reroll", token.rerollFaces],
    ["Fate dice", fate]
  ].filter(([, faces]) => faces?.length);
  const rows = initial.length && adjustments.length
    ? [["Initial roll", initial, { crossedIndexes: aligned ? wiseIndexes : [] }], ...adjustments]
    : adjustments;
  const count = (wise.rerollFaces?.length ?? 0) + (wise.talentRerollFaces?.length ?? 0) + (token.rerollFaces?.length ?? 0);
  const summary = [count && `${count} rerolled`, fate.length && `${fate.length} Fate dice`].filter(Boolean).join(" · ");
  const alignment = aligned ? ` style="--rg-dice-columns:${Math.min(initial.length, 7)}"` : "";
  return {
    html: rows.length ? `<div class="rg-roll-faces-rows${aligned ? " rg-wise-dice-timeline" : ""}"${alignment}>${rows.map(([label, faces, options]) =>
      `<div><b>${label}</b>${diceFacesHtml(faces, options)}</div>`
    ).join("")}</div>` : "",
    summary
  };
}

export function rollCardFold(label, summary, html) {
  return html ? `<details class="rg-roll-card-fold"><summary>${esc(label)}${summary ? ` <small>· ${esc(summary)}</small>` : ""}</summary><div>${html}</div></details>` : "";
}

export function rollCardResult(faces = [], outcome = "", diceOptions) {
  return `<div class="rg-roll-card-result">${faces.length ? `<div><b>Result</b>${diceFacesHtml(faces, diceOptions)}</div>` : ""}${outcome}</div>`;
}

export function rollCardOutcome(successes, target, { targetLabel = "Obstacle", tied = false, passed = successes >= target, margin = Math.abs(successes - target), detail = "" } = {}) {
  const state = tied ? "tie" : passed ? "pass" : "fail";
  const signedMargin = !tied && !detail && margin ? (passed ? `+${margin}` : `−${margin}`) : "";
  return `<div class="rg-result-summary"><span><b>Successes</b><strong>${Number(successes ?? 0)}</strong></span><span><b>${esc(targetLabel)}</b><strong>${Number(target ?? 0)}</strong></span><span class="rg-result-final"><strong class="rg-roll-outcome ${state}"${signedMargin ? ` data-rg-margin="${esc(signedMargin)}" aria-label="${state.toUpperCase()} ${esc(signedMargin)}"` : ""}>${state.toUpperCase()}</strong><small class="rg-result-margin">${esc(detail || (tied ? "Tiebreak required" : `${passed ? "Success" : "Failed"}: ${margin}`))}</small></span></div>`;
}

export function compactRollCard({
  title, kind = "", pool, entries = [], support = "", history, extraHistory = "",
  faces = [], outcome = "", diceOptions, classes = ""
}) {
  const breakdown = entries.filter(entry => entry && entry[1] != null && entry[1] !== "");
  const visible = breakdown.filter(([label]) => ["Base", "Ability Base", "Teamwork", "Extra Dice"].includes(label));
  const hidden = breakdown.filter(entry => !visible.includes(entry));
  const renderEntries = rows => rows.map(([label, value]) => `<span><b>${esc(label)}</b> ${esc(value)}</span>`).join("");
  const teamwork = breakdown.find(([label]) => label === "Teamwork")?.[1];
  const contributions = (hidden.length ? `<div class="rg-roll-card-pool">${renderEntries(hidden)}</div>` : "") + support;
  return `<div class="realm-guard chat-roll rg-compact-roll-card ${classes}">
    <header class="rg-roll-card-head"><h3>${esc(title)}</h3><span>${kind ? `<small>${esc(kind)}</small>` : ""}${pool != null ? ` <b>${Number(pool)}D</b>` : ""}</span></header>
    ${visible.length ? `<div class="rg-roll-card-pool">${renderEntries(visible)}</div>` : ""}
    ${rollCardFold("Teamwork & costs", teamwork, contributions)}
    ${rollCardFold("Dice history", history?.summary, (history?.html ?? "") + extraHistory)}
    ${rollCardResult(faces, outcome, diceOptions)}
  </div>`;
}

// Older cards and the compatibility-profile renderers already store their HTML.
// Reuse the dice and outcome they actually recorded when displaying those cards.
function compactStoredRoll(card) {
  const heading = card.querySelector(":scope > h3");
  if (!heading) return;
  const timeline = card.querySelector(":scope > .rg-roll-faces-rows");
  const rows = [...(timeline?.children ?? [])];
  const diceValues = group => [...(group?.querySelectorAll(".rg-die-face:not(.rg-die-slot) > span") ?? [])]
    .map(die => Number(die.textContent)).filter(value => value >= 1 && value <= 6);
  const rowLabel = row => row?.querySelector(":scope > b")?.textContent.trim() ?? "";
  const finalRow = rows.find(row => rowLabel(row) === "Result");
  const poolLine = [...card.children].find(node => /^(Pool:|\d+D · Base)/i.test(node.textContent.trim()));
  const results = [...card.children].filter(node => node.matches("p, .rg-dice-faces") && node.querySelector(".rg-die-face") && !node.matches(".rg-teamwork-chat"));
  const baseDice = results[0]?.matches(".rg-dice-faces") ? results[0] : results[0]?.querySelector(".rg-dice-faces");
  const fateRow = rows.find(row => rowLabel(row) === "Fate dice");
  const fateLine = results.find(node => /^Fate \/ Open 6s:/i.test(node.textContent.trim()));
  let faces = finalRow ? diceValues(finalRow) : [...diceValues(rows[0] ?? baseDice), ...diceValues(fateRow ?? fateLine)];
  if (!timeline && card.matches(".rg-nature-chat")) faces = diceValues([...results[0]?.querySelectorAll(".rg-dice-faces") ?? []].at(-1));
  if (!timeline && card.matches(".rg-auto-versus")) {
    const fateLabel = [...results[0]?.querySelectorAll("b") ?? []].find(node => node.textContent.trim() === "Fate dice:");
    faces.push(...diceValues(fateLabel?.nextElementSibling));
  }
  if (!faces.length) return;

  const history = rows.filter(row => row !== finalRow);
  if (!finalRow && history.length > 1) {
    const label = history[0].querySelector(":scope > b");
    if (label) label.textContent = "Dice before Fate";
  }
  const historyHtml = timeline && history.length > 1 ? `<div class="${timeline.className}"${timeline.hasAttribute("style") ? ` style="${esc(timeline.getAttribute("style"))}"` : ""}>${history.map(node => node.outerHTML).join("")}</div>` : "";
  const outcome = card.querySelector(":scope > .rg-result-summary, :scope > .rg-roll-outcome");
  const tally = [...card.children].find(node => /^(Successes:|Pass\s+\d+\s+·\s+Fail)/.test(node.textContent.trim()));
  const oldFinal = card.querySelector(".rg-roll-final-count");
  const customTag = card.querySelector(":scope > .rg-custom-chat-tag");
  const breakdown = card.querySelector(":scope > .rg-roll-breakdown");
  const pool = breakdown?.querySelector("header strong")?.textContent
    ?? (poolLine ?? heading).textContent.match(/\d+[dD](?:6\b|\b)/)?.[0]
    ?? results[0]?.textContent.match(/\d+[dD](?:6\b|\b)/)?.[0];
  const entries = [...(breakdown?.querySelectorAll(".rg-roll-breakdown-grid > span") ?? [])]
    .map(row => [row.querySelector("b")?.textContent, row.querySelector("em")?.textContent]);
  const detail = heading.querySelector(".rg-chat-versus");
  const kind = detail?.textContent ?? (customTag ? "Custom Roll" : "");
  detail?.remove();
  const plainD6 = /^D6s(?:\s|$)/.test(heading.textContent);
  const title = plainD6 ? "D6s" : heading.textContent.trim();
  const inlineRoll = card.matches(".rg-auto-versus, .rg-nature-chat");
  const historyWhileRolling = results.filter(node => inlineRoll || (node !== results[0] && !node.matches(".rg-dice-faces")));
  const extraHistory = historyWhileRolling.map(node => node.outerHTML).join("")
    + [...card.querySelectorAll(":scope > .rg-roll-opponent, :scope > .rg-tiebreak-detail")].map(node => node.outerHTML).join("");
  // Keep inline metadata on old rolls whose breakdown was printed next to the dice.
  const inlineSummary = results[0]?.cloneNode(true);
  if (inlineSummary && !(inlineSummary.matches(".rg-dice-faces"))) inlineSummary.querySelectorAll(".rg-dice-faces").forEach(node => node.remove());
  const skip = new Set([heading, timeline, outcome, tally, oldFinal, customTag, breakdown, ...results]);
  let support = [...card.children].filter(node => !skip.has(node) && !node.matches(".rg-roll-opponent, .rg-tiebreak-detail"))
    .map(node => node.outerHTML).join("");
  if (inlineSummary && inlineRoll) support += inlineSummary.outerHTML;
  const decisions = card.parentElement?.querySelector(":scope > .rg-roll-decisions");
  if (decisions) {
    support += decisions.outerHTML;
    decisions.remove();
  }
  card.outerHTML = compactRollCard({
    title, kind, pool: pool ? parseInt(pool, 10) : faces.length, entries, support,
    history: { html: historyHtml }, extraHistory, faces, diceOptions: { openSixes: !plainD6 },
    outcome: `${tally?.outerHTML ?? ""}${outcome?.outerHTML ?? ""}`
  });
}

export function compactStoredRollCards(root) {
  for (const card of root.querySelectorAll(".realm-guard.chat-roll:not(.rg-compact-roll-card, .rg-roll-paused)")) {
    if (card.querySelector(".rg-result-summary, .rg-roll-outcome") || card.matches(".rg-standalone-roll-chat")) compactStoredRoll(card);
  }
  for (const card of root.querySelectorAll(".realm-guard .rg-conflict-side-card:not(.rg-compact-roll-card, .is-trumped), .realm-guard.rg-disposition-chat:not(.rg-compact-roll-card)")) {
    const dice = card.querySelector(":scope > .rg-conflict-side-dice, :scope > .rg-disposition-dice");
    const outcome = card.querySelector(":scope > .rg-conflict-side-primary, :scope > .rg-disposition-total");
    if (!dice || !outcome) continue;
    const support = card.querySelector(":scope > .rg-conflict-roll-details > div, :scope > .rg-disposition-breakdown");
    card.classList.add("rg-compact-roll-card");
    const notes = [...card.querySelectorAll(":scope > .rg-disposition-note")];
    dice.insertAdjacentHTML("beforebegin", rollCardFold("Teamwork & costs", "", (support?.outerHTML ?? "") + notes.map(note => note.outerHTML).join("")));
    const result = document.createElement("div");
    result.className = "rg-roll-card-result";
    if (card.querySelector(".rg-roll-card-fold")) card.querySelector(".rg-roll-card-fold").after(result);
    else dice.before(result);
    result.innerHTML = "<div><b>Result</b></div>";
    result.firstElementChild.append(dice);
    result.append(outcome);
    (support?.closest("details") ?? support)?.remove();
    notes.forEach(note => note.remove());
  }
}
