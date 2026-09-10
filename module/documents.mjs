import { conditionRollData, hasActiveCondition } from "./conditions.mjs";
import { claimPlayerTurnTest, playerTurnSpendHtml, currentTurnPhase, turnManagerEnabled } from "./turns.mjs";
import { resolveTokenPowerUse, tokenPowerChatText } from "./tokens-of-power.mjs";
import { spendTrackedResource } from "./progression.mjs";
import { diceFacesHtml } from "./dice-ui.mjs";
import { traitLevel, traitPositiveStatus, traitPositiveDice, traitPositiveSuccessBonus, consumeTraitPositiveUse } from "./traits.mjs";

function personaDiceCount(value) {
  const raw = typeof value === "boolean" ? (value ? 1 : 0) : Number(value ?? 0);
  return Math.max(0, Math.min(3, Math.trunc(Number.isFinite(raw) ? raw : 0)));
}

function signedDice(value) {
  const n = Number(value ?? 0);
  return `${n > 0 ? "+" : ""}${n}D`;
}

function rollBreakdownHtml(total, entries = []) {
  const esc = foundry.utils.escapeHTML;
  const rows = entries.filter(entry => entry && entry[1] !== "" && entry[1] !== null && entry[1] !== undefined);
  return `<section class="rg-roll-breakdown"><header><span>Dice Pool</span><strong>${Number(total ?? 0)}D</strong></header><div class="rg-roll-breakdown-grid">${rows.map(([label, value]) => `<span><b>${esc(label)}</b><em>${esc(value)}</em></span>`).join("")}</div></section>`;
}

function rollFacesRowsHtml(rows = []) {
  return `<div class="rg-roll-faces-rows">${rows.filter(row => row?.faces?.length).map(row => `<div><b>${foundry.utils.escapeHTML(row.label)}</b>${diceFacesHtml(row.faces)}</div>`).join("")}</div>`;
}
export class RealmGuardActor extends Actor {
  get roles() { return this.items.filter(i => i.type === "role"); }
  get traits() { return this.items.filter(i => i.type === "trait"); }
  get wises() { return this.items.filter(i => i.type === "wise"); }
  get gear() { return this.items.filter(i => i.type === "gear"); }
  get tokensOfPower() { return this.items.filter(i => i.type === "tokenOfPower"); }
  get talents() { return this.items.filter(i => i.type === "talent"); }
  get conditions() { return this.items.filter(i => i.type === "condition"); }

  _activeConditionRollData(rollName = "", { isSkill = true } = {}) {
    return conditionRollData(this, rollName, { isSkill });
  }

  async spendTrackedResource(kind, amount = 1, options = {}) {
    return spendTrackedResource(this, kind, amount, options);
  }

  async _askFateAfterSixes({ roleName, sixCount }) {
    const fateValue = Number(this.system.resources.fate.value ?? 0);
    if (sixCount < 1 || fateValue < 1) return false;
    const DialogV2 = foundry.applications.api.DialogV2;
    return Boolean(await DialogV2.wait({
      window: { title: "Realm Guard · Fate Decision", resizable: true },
      content: `<div class="rg-fate-dialog"><p><strong>${foundry.utils.escapeHTML(roleName)}</strong> rolled ${sixCount} six${sixCount === 1 ? "" : "es"}.</p><p>Spend 1 Fate to open sixes?</p><p><small>Fate available: ${fateValue}</small></p></div>`,
      modal: false,
      rejectClose: false,
      buttons: [
        { action: "spend", label: "Spend 1 Fate", icon: "fa-solid fa-star", default: true, callback: () => true },
        { action: "keep", label: "Don't Spend Fate", icon: "fa-solid fa-xmark", callback: () => false }
      ]
    }));
  }

  async _explodeSixes(initialFaces) {
    const bonusFaces = [];
    let open = initialFaces.filter(v => v === 6).length;
    while (open > 0) {
      const extra = await new Roll(`${open}d6`).evaluate();
      const extraFaces = extra.dice.flatMap(d => d.results.map(r => r.result));
      bonusFaces.push(...extraFaces);
      open = extraFaces.filter(v => v === 6).length;
    }
    return bonusFaces;
  }

  _rollAssist({ traitId = null, wiseId = null, traitMode = "help", versus = false } = {}) {
    const angry = hasActiveCondition(this, "Angry");
    const trait = traitId ? this.items.get(traitId) : null;
    const requestedWise = wiseId ? this.items.get(wiseId) : null;
    const requestedMode = trait?.type === "trait" ? String(traitMode || "help") : "none";
    const traitStatus = trait?.type === "trait" ? traitPositiveStatus(this, trait) : null;
    const exhaustedTraitHelp = requestedMode === "help" && trait?.type === "trait" && !traitStatus?.available;
    const blockedTraitHelp = requestedMode === "help" && trait?.type === "trait" && (angry || exhaustedTraitHelp);
    const blockedTraitReason = angry ? "Angry blocks beneficial Trait use" : exhaustedTraitHelp ? "beneficial use already spent this session" : "";
    const blockedWise = angry && requestedWise?.type === "wise";
    const wise = blockedWise ? null : requestedWise;
    const mode = blockedTraitHelp ? "blocked-help" : requestedMode;
    const helpDice = mode === "help" && trait?.type === "trait" ? traitPositiveDice(this, trait) : 0;
    const impedeDice = mode === "against" && trait?.type === "trait" ? -1 : 0;
    const opponentDice = mode === "hurt" && versus && trait?.type === "trait" ? 2 : 0;
    const checks = mode === "against" ? 1 : (mode === "hurt" && versus ? 2 : 0);
    return { trait, traitStatus, wise, requestedWise, traitMode: mode, requestedTraitMode: requestedMode, traitDice: helpDice + impedeDice, opponentDice, checks, blockedTraitHelp, blockedTraitReason, blockedWise };
  }

  async _commitTraitBenefit(assist) {
    if (!assist?.trait || assist.traitMode !== "help") return { consumed: false };
    return consumeTraitPositiveUse(this, assist.trait);
  }

  _traitSuccessBonus(assist, baseSuccesses, target, { versus = false } = {}) {
    if (!assist?.trait || assist.traitMode !== "help") return 0;
    return traitPositiveSuccessBonus(this, assist.trait, { baseSuccesses, target, versus });
  }

  async _awardTraitChecks(assist) {
    const requested = Math.max(0, Number(assist?.checks ?? 0));
    if (!requested || !turnManagerEnabled() || currentTurnPhase() !== "gm") return 0;
    const current = Math.max(0, Number(this.system.resources?.checks?.value ?? 0));
    const maximum = Math.max(current, Number(this.system.resources?.checks?.max ?? 9));
    const next = Math.min(maximum, current + requested);
    const earned = Math.max(0, next - current);
    if (earned) await this.update({ "system.resources.checks.value": next });
    return earned;
  }

  _traitChatText(assist, earnedChecks = 0) {
    if (!assist?.trait) return "";
    const esc = foundry.utils.escapeHTML;
    if (assist.traitMode === "blocked-help") return ` · Trait: ${esc(assist.trait.name)} (${esc(assist.blockedTraitReason || "beneficial use unavailable")})`;
    if (assist.traitMode === "against") return ` · Trait Against: ${esc(assist.trait.name)} -1D${earnedChecks ? ` · +${earnedChecks} Check` : !turnManagerEnabled() ? " · no Check (Turn Manager disabled)" : currentTurnPhase() === "player" ? " · no Check in Players' Turn" : ""}`;
    if (assist.traitMode === "hurt") return ` · Trait Against: ${esc(assist.trait.name)} · opponent +2D${earnedChecks ? ` · +${earnedChecks} Checks` : !turnManagerEnabled() ? " · no Checks (Turn Manager disabled)" : currentTurnPhase() === "player" ? " · no Checks in Players' Turn" : ""}`;
    const level = traitLevel(assist.trait);
    if (level === 3) return ` · Trait: ${esc(assist.trait.name)} +1s`;
    const status = traitPositiveStatus(this, assist.trait);
    return ` · Trait: ${esc(assist.trait.name)} +1D${status.limit ? ` · ${status.remaining}/${status.limit} use${status.limit === 1 ? "" : "s"} left` : ""}`;
  }

  async _applyWiseReroll(baseFaces, wise) {
    if (!wise || wise.type !== "wise") return { faces: [...baseFaces], rerollFaces: [], rerolledIndexes: [] };
    const failedIndexes = baseFaces.map((v, i) => v < 4 ? i : -1).filter(i => i >= 0);
    if (!failedIndexes.length) return { faces: [...baseFaces], rerollFaces: [], rerolledIndexes: [] };
    const reroll = await new Roll(`${failedIndexes.length}d6`).evaluate();
    const rerollFaces = reroll.dice.flatMap(d => d.results.map(r => r.result));
    const faces = [...baseFaces];
    failedIndexes.forEach((idx, n) => { faces[idx] = rerollFaces[n]; });
    return { faces, rerollFaces, rerolledIndexes: failedIndexes };
  }

  _tokenPowerUse(tokenPowerId, sourceName, { isSkill = true } = {}) {
    return resolveTokenPowerUse(this, tokenPowerId, sourceName, { isSkill });
  }

  async _commitTokenPowerUse(power) {
    if (!power?.token || !power.consumeOnRoll) return false;
    if (Boolean(power.token.system?.session?.used)) return false;
    await power.token.update({ "system.session.used": true });
    return true;
  }

  async _askTokenPowerReroll(power, failedCount) {
    if (!power?.token || failedCount < 1) return false;
    const DialogV2 = foundry.applications.api.DialogV2;
    const tokenName = foundry.utils.escapeHTML(power.token.name);
    return Boolean(await DialogV2.wait({
      window: { title: "Realm Guard · Token of Power", resizable: true },
      content: `<div class="rg-token-power-decision"><p><strong>${tokenName}</strong> can reroll ${failedCount} failed ${failedCount === 1 ? "die" : "dice"}.</p><p>Use its Level 3 power now?</p><p><small>This use is available once per session.</small></p></div>`,
      modal: false,
      rejectClose: false,
      buttons: [
        { action: "use", label: "Use Token", icon: "fa-solid fa-gem", default: true, callback: () => true },
        { action: "keep", label: "Keep for Later", icon: "fa-solid fa-xmark", callback: () => false }
      ]
    }));
  }

  async _applyTokenPowerReroll(baseFaces, power, excludedIndexes = []) {
    if (!power?.reroll || !power.token || Boolean(power.token.system?.session?.used)) return { faces: [...baseFaces], rerollFaces: [], rerolledIndexes: [] };
    const excluded = new Set(excludedIndexes ?? []);
    const failedIndexes = baseFaces.map((v, i) => v < 4 && !excluded.has(i) ? i : -1).filter(i => i >= 0);
    if (!failedIndexes.length) return { faces: [...baseFaces], rerollFaces: [], rerolledIndexes: [] };
    const confirmed = await this._askTokenPowerReroll(power, failedIndexes.length);
    if (!confirmed) return { faces: [...baseFaces], rerollFaces: [], rerolledIndexes: [] };
    const reroll = await new Roll(`${failedIndexes.length}d6`).evaluate();
    const rerollFaces = reroll.dice.flatMap(d => d.results.map(r => r.result));
    const faces = [...baseFaces];
    failedIndexes.forEach((idx, n) => { faces[idx] = rerollFaces[n]; });
    await power.token.update({ "system.session.used": true });
    return { faces, rerollFaces, rerolledIndexes: failedIndexes };
  }

  _tokenPowerChatText(power, tokenResult = null) {
    return tokenPowerChatText(power, { rerolled: Boolean(tokenResult?.rerollFaces?.length) });
  }

  _tiebreakOptions(sourceName, sourceKind = "role") {
    const name = String(sourceName ?? "").trim().toLowerCase();
    if (sourceKind === "ability") {
      if (name === "will" || name === "health") return ["nature"];
      if (name === "nature") return ["will", "health"];
      return ["will", "health"];
    }

    // Mouse Guard 2E Beginner's Luck categories give us the same physical/mental
    // split used by the tiebreaker rule. Realm Guard additions are included here.
    const physical = new Set([
      "armorer", "animal handler", "boatcrafter", "brewer", "carpenter", "fighter",
      "glazier", "harvester", "hunter", "laborer", "miller", "potter", "rider",
      "scout", "smith", "stonemason", "survivalist"
    ]);
    const mental = new Set([
      "administrator", "alchemist", "apiarist", "archivist", "baker", "cartographer",
      "cook", "deceiver", "haggler", "healer", "herdsman", "instructor", "lore master",
      "militarist", "orator", "pathfinder", "persuader", "scientist", "weather watcher",
      "weaver"
    ]);
    if (physical.has(name)) return ["health"];
    if (mental.has(name)) return ["will"];
    // Custom skills cannot be classified safely by the system; the GM chooses.
    return ["will", "health"];
  }

  _abilityLabel(key) {
    const k = String(key ?? "").toLowerCase();
    return k ? k.charAt(0).toUpperCase() + k.slice(1) : "Ability";
  }

  _abilityPool(actor, abilityKey) {
    const key = String(abilityKey ?? "").toLowerCase();
    const stat = actor?.system?.attributes?.[key];
    if (!stat) return null;
    const label = this._abilityLabel(key);
    const conditions = conditionRollData(actor, label, { isSkill: false });
    const base = Number(stat.value ?? 0);
    return { key, label, base, conditions, dice: Math.max(0, base + Number(conditions.dice ?? 0)) };
  }

  async _openTieDecision({ role, opponent, opposition, ownFaces, fateAlreadySpent = false } = {}) {
    const esc = foundry.utils.escapeHTML;
    const ownOptions = this._tiebreakOptions(role.name, "role");
    const oppOptions = this._tiebreakOptions(opposition.name, opposition.kind);
    const canFate = !fateAlreadySpent && Number(this.system.resources.fate.value ?? 0) > 0 && ownFaces.some(v => v === 6);
    const canTraitYield = this.traits.length > 0 && !Boolean(opponent?.hasPlayerOwner);
    const select = (name, options) => `<select name="${name}">${options.map(k => `<option value="${k}">${esc(this._abilityLabel(k))}</option>`).join("")}</select>`;
    const traitSelect = canTraitYield ? `<label>Trait used against yourself <select name="traitId">${this.traits.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select></label>` : "";
    const content = `<div class="rg-tie-dialog">
      <h3>Versus Tie</h3>
      <p><b>${esc(this.name)} · ${esc(role.name)}</b> and <b>${esc(opponent.name)} · ${esc(opposition.name)}</b> are tied.</p>
      <p class="rg-tie-rule">Resolve in rule order: trait in the opponent's favor, Fate on an unused 6, or a tiebreaker roll.</p>
      ${traitSelect}
      <fieldset><legend>Tiebreaker abilities</legend>
        <label>${esc(this.name)} ${select("ownAbility", ownOptions)}</label>
        <label>${esc(opponent.name)} ${select("oppAbility", oppOptions)}</label>
      </fieldset>
      ${canFate ? `<p><small>You have an unused 6 and may still spend 1 Fate before the tiebreaker.</small></p>` : ""}
    </div>`;
    const buttons = [];
    if (canTraitYield) buttons.push({
      action: "trait", label: "Trait → Opponent Wins", icon: "fa-solid fa-masks-theater",
      callback: (_event, button) => ({ action: "trait", traitId: button.form?.elements?.traitId?.value || null })
    });
    if (canFate) buttons.push({ action: "fate", label: "Spend 1 Fate", icon: "fa-solid fa-star", callback: () => ({ action: "fate" }) });
    buttons.push({
      action: "tiebreak", label: "Roll Tiebreaker", icon: "fa-solid fa-dice",
      default: true,
      callback: (_event, button) => ({
        action: "tiebreak",
        ownAbility: button.form?.elements?.ownAbility?.value || ownOptions[0],
        oppAbility: button.form?.elements?.oppAbility?.value || oppOptions[0]
      })
    });
    buttons.push({ action: "later", label: "Resolve Later", icon: "fa-solid fa-clock", callback: () => ({ action: "later" }) });
    return await foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard · Resolve Versus Tie", resizable: true }, content, modal: false, rejectClose: false, buttons
    });
  }

  async _secondTieDecision({ opponent, ownFaces, fateAlreadySpent = false } = {}) {
    const canFate = !fateAlreadySpent && Number(this.system.resources.fate.value ?? 0) > 0 && ownFaces.some(v => v === 6);
    const canTraitYield = this.traits.length > 0 && !Boolean(opponent?.hasPlayerOwner);
    const esc = foundry.utils.escapeHTML;
    const buttons = [];
    if (canTraitYield) buttons.push({ action: "trait", label: "Trait → Opponent Wins", icon: "fa-solid fa-masks-theater", callback: () => ({ action: "trait" }) });
    if (canFate) buttons.push({ action: "fate", label: "Spend 1 Fate", icon: "fa-solid fa-star", callback: () => ({ action: "fate" }) });
    buttons.push({ action: "gm", label: opponent?.hasPlayerOwner ? "GM Decides" : "GM Wins", icon: "fa-solid fa-gavel", default: true, callback: () => ({ action: "gm" }) });
    return await foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard · Second Tie", resizable: true },
      content: `<div class="rg-tie-dialog"><h3>Second Tie</h3><p>The tiebreaker also tied. A trait or unused Fate may still break it. Otherwise ${opponent?.hasPlayerOwner ? "the GM determines the winner" : "the GM wins the test"}.</p><p><small>Opponent: ${esc(opponent?.name ?? "Opponent")}</small></p></div>`,
      modal: false, rejectClose: false, buttons
    });
  }

  async _resolveAutomaticVersusTie({ role, opponent, opposition, ownFaces, opponentFaces, fateAlreadySpent = false } = {}) {
    const initialOwn = ownFaces.filter(v => v >= 4).length;
    const initialOpp = opponentFaces.filter(v => v >= 4).length;
    const decision = await this._openTieDecision({ role, opponent, opposition, ownFaces, fateAlreadySpent });
    if (!decision || decision.action === "later") {
      return { resolved: false, tied: true, outcome: "TIE", passed: false, method: "pending", learningResult: null };
    }

    if (decision.action === "trait") {
      const trait = decision.traitId ? this.items.get(decision.traitId) : null;
      const currentChecks = Number(this.system.resources.checks.value ?? 0);
      const maxChecks = Number(this.system.resources.checks.max ?? 9);
      const earnedChecks = turnManagerEnabled() && currentTurnPhase() === "gm" ? Math.max(0, Math.min(2, maxChecks - currentChecks)) : 0;
      if (earnedChecks) await this.update({ "system.resources.checks.value": currentChecks + earnedChecks });
      return { resolved: true, tied: false, outcome: "FAIL", passed: false, method: "trait", traitName: trait?.name ?? "Trait", earnedChecks, learningResult: false, margin: 0 };
    }

    let fateSpent = fateAlreadySpent;
    let fateFaces = [];
    if (decision.action === "fate") {
      fateFaces = await this._explodeSixes(ownFaces);
      await this.spendTrackedResource("fate", 1, { reason: "Fate / Open 6s or Versus tie" });
      fateSpent = true;
      const fateSuccesses = ownFaces.concat(fateFaces).filter(v => v >= 4).length;
      if (fateSuccesses > initialOpp) {
        return { resolved: true, tied: false, outcome: "PASS", passed: true, method: "fate", learningResult: true, margin: fateSuccesses - initialOpp, fateFaces, finalOwnSuccesses: fateSuccesses, finalOpponentSuccesses: initialOpp, fateSpent: true };
      }
      // Fate did not break the tie; continue to the rules' tiebreaker roll.
    }

    const ownOptions = this._tiebreakOptions(role.name, "role");
    const oppOptions = this._tiebreakOptions(opposition.name, opposition.kind);
    const ownAbility = decision.ownAbility || ownOptions[0];
    const oppAbility = decision.oppAbility || oppOptions[0];
    const ownPool = this._abilityPool(this, ownAbility);
    const oppPool = this._abilityPool(opponent, oppAbility);
    if (!ownPool || !oppPool || ownPool.dice < 1 || oppPool.dice < 1) {
      ui.notifications.warn("Realm Guard: Tiebreaker abilities must both have at least 1D.");
      return { resolved: false, tied: true, outcome: "TIE", passed: false, method: "pending", learningResult: null };
    }
    const ownRoll = await new Roll(`${ownPool.dice}d6`).evaluate();
    const oppRoll = await new Roll(`${oppPool.dice}d6`).evaluate();
    let ownTieFaces = ownRoll.dice.flatMap(d => d.results.map(r => r.result));
    const oppTieFaces = oppRoll.dice.flatMap(d => d.results.map(r => r.result));
    let ownTieSuccesses = ownTieFaces.filter(v => v >= 4).length;
    const oppTieSuccesses = oppTieFaces.filter(v => v >= 4).length;
    if (ownTieSuccesses !== oppTieSuccesses) {
      const passed = ownTieSuccesses > oppTieSuccesses;
      return { resolved: true, tied: false, outcome: passed ? "PASS" : "FAIL", passed, method: "tiebreaker", learningResult: null, margin: Math.abs(ownTieSuccesses - oppTieSuccesses), ownAbility: ownPool.label, oppAbility: oppPool.label, ownTieFaces, oppTieFaces, ownTieSuccesses, oppTieSuccesses, fateFaces, fateSpent };
    }

    const second = await this._secondTieDecision({ opponent, ownFaces: ownTieFaces, fateAlreadySpent: fateSpent });
    if (second?.action === "trait") {
      const currentChecks = Number(this.system.resources.checks.value ?? 0);
      const maxChecks = Number(this.system.resources.checks.max ?? 9);
      const earnedChecks = turnManagerEnabled() && currentTurnPhase() === "gm" ? Math.max(0, Math.min(2, maxChecks - currentChecks)) : 0;
      if (earnedChecks) await this.update({ "system.resources.checks.value": currentChecks + earnedChecks });
      return { resolved: true, tied: false, outcome: "FAIL", passed: false, method: "second-trait", earnedChecks, learningResult: null, margin: 0, ownAbility: ownPool.label, oppAbility: oppPool.label, ownTieFaces, oppTieFaces, ownTieSuccesses, oppTieSuccesses };
    }
    if (second?.action === "fate") {
      const extra = await this._explodeSixes(ownTieFaces);
      await this.spendTrackedResource("fate", 1, { reason: "Fate / Open 6s or Versus tie" });
      ownTieFaces = ownTieFaces.concat(extra);
      ownTieSuccesses = ownTieFaces.filter(v => v >= 4).length;
      if (ownTieSuccesses > oppTieSuccesses) {
        return { resolved: true, tied: false, outcome: "PASS", passed: true, method: "second-fate", learningResult: null, margin: ownTieSuccesses - oppTieSuccesses, ownAbility: ownPool.label, oppAbility: oppPool.label, ownTieFaces, oppTieFaces, ownTieSuccesses, oppTieSuccesses };
      }
    }

    // Mouse Guard 2E: if a second tie cannot be broken, the GM wins against a GM-controlled opponent.
    // Between two player-controlled characters the GM determines the winner; Foundry cannot infer that narrative call.
    if (opponent?.hasPlayerOwner) {
      return { resolved: false, tied: true, outcome: "TIE", passed: false, method: "gm-decision", learningResult: null, ownAbility: ownPool.label, oppAbility: oppPool.label, ownTieFaces, oppTieFaces, ownTieSuccesses, oppTieSuccesses };
    }
    return { resolved: true, tied: false, outcome: "FAIL", passed: false, method: "gm-wins", learningResult: null, margin: 0, ownAbility: ownPool.label, oppAbility: oppPool.label, ownTieFaces, oppTieFaces, ownTieSuccesses, oppTieSuccesses };
  }

  _resultData(successes, target, { versus = false } = {}) {
    const s = Number(successes ?? 0);
    const t = Number(target ?? 0);
    const delta = s - t;
    if (versus && delta === 0) {
      return { outcome: "TIE", tied: true, passed: false, margin: 0, marginType: null, display: "TIE · Tiebreaker pending", needsTiebreaker: true };
    }
    const passed = versus ? delta > 0 : delta >= 0;
    const margin = Math.abs(delta);
    const exactPass = !versus && passed && margin === 0;
    return {
      outcome: passed ? "PASS" : "FAIL",
      tied: false,
      passed,
      margin,
      marginType: exactPass ? null : (passed ? "success" : "failure"),
      display: exactPass ? "PASS" : `${passed ? "PASS · Margin of Success" : "FAIL · Margin of Failure"}: ${margin}`,
      needsTiebreaker: false
    };
  }

  _resultSummaryHTML(successes, target, { versus = false, targetLabel = "Obstacle" } = {}) {
    const r = this._resultData(successes, target, { versus });
    const cls = r.tied ? "tie" : (r.passed ? "pass" : "fail");
    const resultDetail = r.tied
      ? `<small class="rg-result-margin">Tiebreaker pending</small>`
      : `<small class="rg-result-margin">${r.passed ? "Success" : "Failed"}: ${Number(r.margin ?? 0)}</small>`;
    return `<div class="rg-result-summary"><span><b>Successes</b><strong>${Number(successes ?? 0)}</strong></span><span><b>${foundry.utils.escapeHTML(targetLabel)}</b><strong>${Number(target ?? 0)}</strong></span><span class="rg-result-final"><strong class="rg-roll-outcome ${cls}">${r.tied ? "TIE" : (r.passed ? "PASS" : "FAIL")}</strong>${resultDetail}</span></div>`;
  }

  _natureState() {
    const n = this.system.attributes?.nature ?? {};
    const current = Math.max(0, Number(n.value ?? 0));
    const maximum = Math.max(current, Number(n.maximum ?? current));
    return { current, maximum, tax: Math.max(0, maximum-current) };
  }

  async _applyNatureTax(amount, reason="Nature Tax") {
    const tax = Math.max(0, Number(amount ?? 0));
    if (!tax) return null;
    const before = this._natureState();
    let current = Math.max(0, before.current-tax), maximum=before.maximum, collapsed=false;
    if (current <= 0 && maximum > 0) { maximum=Math.max(0, maximum-1); current=maximum; collapsed=true; }
    await this.update({"system.attributes.nature.value":current,"system.attributes.nature.maximum":maximum});
    if (collapsed) ui.notifications.warn(maximum>0 ? `Realm Guard: Nature taxed to 0. Maximum Nature drops to ${maximum}; change an appropriate Trait for the event.` : "Realm Guard: Maximum Nature is 0. The character must retire at the end of the mission.");
    return {tax,current,maximum,collapsed,reason};
  }

  _natureTax(result,{tapped=false,scope="within",direct=false}={}) {
    if (!result || result.tied) return 0;
    const against=scope==="against";
    if (direct) return against && !result.passed ? Math.max(1,Number(result.margin||1)) : 0;
    if (!tapped) return 0;
    if (result.passed) return against ? 1 : 0;
    return Math.max(1,Number(result.margin||1));
  }

  async rollRole(role, { modifier = 0, extraDice = 0, help = [], obstacle = 1, versus = false, persona = 0, traitId = null, traitMode = "help", wiseId = null, tokenPowerId = null, ignoreConditions = false, tapNature = false, natureScope = "within" } = {}) {
    const personaDice = personaDiceCount(persona);
    const esc = foundry.utils.escapeHTML;
    const assist = this._rollAssist({ traitId, wiseId, traitMode, versus: false });
    const power = this._tokenPowerUse(tokenPowerId, role.name, { isSkill: true });
    if (tokenPowerId && !power) return ui.notifications.warn("Realm Guard: That Token of Power is no longer available or appropriate for this Skill.");
    const conditionData = ignoreConditions ? { active: [], dice: 0 } : this._activeConditionRollData(role.name, { isSkill: true });
    const base = Number(role.system.rating ?? 0);
    const natureTapDice = tapNature ? this._natureState().current : 0;
    const dice = Math.max(0, base + Number(modifier || 0) + Math.max(0, Number(extraDice || 0)) + (Array.isArray(help) ? help.reduce((n,h) => n + Math.max(0, Number(h.dice || 0)), 0) : 0) + personaDice + natureTapDice + assist.traitDice + Number(power?.diceBonus ?? 0) + conditionData.dice);
    if (dice === 0) return ui.notifications.warn("Realm Guard: Dice pool is 0.");
    const turnSpend = await claimPlayerTurnTest(this, { label: role.name });
    if (!turnSpend.ok) return ui.notifications.warn(`Realm Guard: ${turnSpend.reason}`);
    const earnedTraitChecks = await this._awardTraitChecks(assist);
    const roll = await new Roll(`${dice}d6`).evaluate();
    await this._commitTraitBenefit(assist);
    await this._commitTokenPowerUse(power);
    let baseFaces = roll.dice.flatMap(d => d.results.map(r => r.result));
    const wiseResult = await this._applyWiseReroll(baseFaces, assist.wise);
    baseFaces = wiseResult.faces;
    const tokenResult = await this._applyTokenPowerReroll(baseFaces, power, wiseResult.rerolledIndexes);
    baseFaces = tokenResult.faces;
    const baseSuccesses = baseFaces.filter(v => v >= 4).length;
    const baseSixes = baseFaces.filter(v => v === 6).length;
    const canAskFate = baseSixes > 0 && Number(this.system.resources.fate.value ?? 0) > 0;
    let pendingMessage = null;
    if (canAskFate) {
      const pending = `<div class="realm-guard chat-roll rg-roll-paused"><h3>${foundry.utils.escapeHTML(role.name)}</h3>${playerTurnSpendHtml(turnSpend)}<p><b>Pool:</b> ${dice}d6 · Base ${base}D ${Number(modifier || 0) ? `· Modifier ${Number(modifier || 0) > 0 ? "+" : ""}${Number(modifier || 0)}D` : ""} ${Number(extraDice || 0) ? `· Extra Dice +${Math.max(0, Number(extraDice || 0))}D` : ""} ${Array.isArray(help) && help.length ? `· Teamwork ${help.reduce((n,h)=>n+Number(h.dice||0),0)}D` : ""} ${personaDice ? `· Persona +${personaDice}D` : ""} ${tapNature ? `· Tap Nature +${natureTapDice}D (${natureScope})` : ""} ${conditionData.active.length ? `· Conditions ${conditionData.active.map(c => `${foundry.utils.escapeHTML(c.name)} ${Number(c.system.rollModifier ?? 0) >= 0 ? "+" : ""}${Number(c.system.rollModifier ?? 0)}D`).join(", ")}` : ""} ${this._traitChatText(assist, earnedTraitChecks)} ${this._tokenPowerChatText(power, tokenResult)} ${assist.wise ? `· Wise: ${foundry.utils.escapeHTML(assist.wise.name)}` : ""} ${versus ? "· <span class=\"rg-chat-versus\">VERSUS</span>" : ""}</p><p><b>Roll:</b> ${diceFacesHtml(baseFaces)}</p><p><b>Successes so far:</b> ${baseSuccesses} &nbsp; <b>6s:</b> ${baseSixes}</p><p><b>Obstacle:</b> ${obstacle}</p><div class="rg-paused-banner">⏸ ROLL PAUSED — Fate decision pending</div><p>A 6 was rolled. The player has been asked whether to spend 1 Fate to open sixes.</p><p><b>Final result:</b> Pending</p></div>`;
      pendingMessage = await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content: pending });
    }
    const spendFate = canAskFate ? await this._askFateAfterSixes({ roleName: role.name, sixCount: baseSixes }) : false;
    const bonusFaces = spendFate ? await this._explodeSixes(baseFaces) : [];
    if (spendFate) await this.spendTrackedResource("fate", 1, { reason: "Fate / Open 6s or Versus tie" });
    const faces = baseFaces.concat(bonusFaces);
    const rolledSuccesses = faces.filter(v => v >= 4).length;
    const traitSuccesses = this._traitSuccessBonus(assist, rolledSuccesses, obstacle);
    const successes = rolledSuccesses + traitSuccesses;
    const sixes = faces.filter(v => v === 6).length;
    const result = this._resultData(successes, obstacle);
    const passed = result.passed;
    const natureTax = this._natureTax(result,{tapped:tapNature,scope:natureScope});
    const natureTaxResult = natureTax ? await this._applyNatureTax(natureTax, `Tap Nature · ${role.name}`) : null;
    const natureTaxText = natureTaxResult ? `<p class="rg-nature-tax"><b>Nature Tax:</b> −${natureTaxResult.tax} → ${natureTaxResult.current}/${natureTaxResult.maximum}</p>` : "";
    const helpDice = Array.isArray(help) ? help.reduce((n,h)=>n+Number(h.dice||0),0) : 0;
    const poolBreakdown = rollBreakdownHtml(dice, [
      ["Base", `${base}D`],
      Number(modifier || 0) ? ["Modifier", signedDice(modifier)] : null,
      Number(extraDice || 0) ? ["Extra Dice", `+${Math.max(0, Number(extraDice || 0))}D`] : null,
      helpDice ? ["Teamwork", `+${helpDice}D`] : null,
      personaDice ? ["Persona", `+${personaDice}D`] : null,
      tapNature ? ["Tap Nature", `+${natureTapDice}D · ${natureScope}`] : null,
      conditionData.dice ? ["Conditions", signedDice(conditionData.dice)] : null,
      assist.traitDice ? ["Trait", signedDice(assist.traitDice)] : null,
      Number(power?.diceBonus ?? 0) ? ["Token of Power", signedDice(power.diceBonus)] : null
    ]);
    const specialNotes = [
      conditionData.active.length ? `Conditions: ${conditionData.active.map(c => `${foundry.utils.escapeHTML(c.name)} ${Number(c.system.rollModifier ?? 0) >= 0 ? "+" : ""}${Number(c.system.rollModifier ?? 0)}D`).join(", ")}` : "",
      this._traitChatText(assist, earnedTraitChecks).replace(/^\s*·\s*/, ""),
      this._tokenPowerChatText(power, tokenResult).replace(/^\s*·\s*/, ""),
      spendFate ? "Fate: Open 6s" : "",
      versus ? "Versus test" : ""
    ].filter(Boolean);
    const content = `<div class="realm-guard chat-roll rg-readable-roll"><h3>${foundry.utils.escapeHTML(role.name)}</h3>${playerTurnSpendHtml(turnSpend)}${poolBreakdown}${specialNotes.length ? `<div class="rg-roll-support-notes">${specialNotes.map(note => `<span>${note}</span>`).join("")}</div>` : ""}${(personaDice || tapNature || spendFate) ? `<p class="rg-resource-spend"><b>Resources spent:</b> ${[(persona || tapNature) ? `Persona −${personaDice+(tapNature?1:0)}` : "", spendFate ? "Fate −1" : ""].filter(Boolean).join(" · ")}</p>` : ""}${Array.isArray(help) && help.length ? `<p class="rg-teamwork-chat"><b>Teamwork:</b> ${help.map(h => `${esc(h.actorName)} — ${h.sourceKind === "Wise" ? "I Am Wise" : esc(h.sourceKind)}: ${esc(h.sourceName)} (+${Number(h.dice||1)}D${h.synergy ? " · Synergy" : ""})`).join(" · ")}</p>` : ""}${rollFacesRowsHtml([{label:"Base roll",faces:baseFaces},{label:"Wise reroll",faces:wiseResult.rerollFaces},{label:"Token reroll",faces:tokenResult.rerollFaces},{label:"Fate dice",faces:bonusFaces}])}<div class="rg-roll-final-count"><span><b>Final Successes</b><strong>${successes}</strong></span><span><b>6s</b><strong>${sixes}</strong></span></div>${natureTaxText}${this._resultSummaryHTML(successes, obstacle, { targetLabel: versus ? "Target / Obstacle" : "Obstacle" })}</div>`;
    if (pendingMessage) await pendingMessage.update({ content });
    else await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content });
    return { roll, successes, sixes, passed, margin: result.margin, outcome: result.outcome, fateSpent: spendFate, tokenPowerId: power?.token?.id ?? null, tokenPowerName: power?.token?.name ?? "", tokenPowerLevel: power?.level ?? 0 };
  }

  async rollAbility(abilityKey, { modifier = 0, extraDice = 0, help = [], obstacle = 1, persona = 0, traitId = null, traitMode = "help", wiseId = null, tokenPowerId = null, ignoreConditions = false, tapNature = false, natureScope = "within", natureUse = "within", doubleTapNature = false } = {}) {
    const personaDice=personaDiceCount(persona);
    const key=String(abilityKey??"").toLowerCase(); const stat=this.system.attributes?.[key];
    if(!stat) return ui.notifications.warn(`Realm Guard: Unknown ability ${abilityKey}.`);
    const label=this._abilityLabel(key), assist=this._rollAssist({traitId,wiseId,traitMode,versus:false});
    const power=this._tokenPowerUse(tokenPowerId,label,{isSkill:false}); if(tokenPowerId&&!power)return ui.notifications.warn("Realm Guard: That Token of Power is no longer available or appropriate for this roll.");
    const conditionData=ignoreConditions?{active:[],dice:0}:this._activeConditionRollData(label,{isSkill:false});
    const base=Number(stat.value??0), ns=this._natureState();
    const tapDice=tapNature?ns.current:0, doubleDice=(key==="nature"&&doubleTapNature)?ns.current:0;
    const helpDice=Array.isArray(help)?help.reduce((n,h)=>n+Math.max(0,Number(h.dice||0)),0):0;
    const dice=Math.max(0,base+Number(modifier||0)+Math.max(0,Number(extraDice||0))+helpDice+personaDice+tapDice+doubleDice+assist.traitDice+Number(power?.diceBonus??0)+conditionData.dice);
    if(!dice) return ui.notifications.warn("Realm Guard: Dice pool is 0.");
    const turnSpend=await claimPlayerTurnTest(this,{label}); if(!turnSpend.ok)return ui.notifications.warn(`Realm Guard: ${turnSpend.reason}`);
    const earnedTraitChecks=await this._awardTraitChecks(assist);
    const roll=await new Roll(`${dice}d6`).evaluate(); await this._commitTraitBenefit(assist); await this._commitTokenPowerUse(power); let faces=roll.dice.flatMap(d=>d.results.map(r=>r.result));
    const wiseResult=await this._applyWiseReroll(faces,assist.wise); faces=wiseResult.faces; const tokenResult=await this._applyTokenPowerReroll(faces,power,wiseResult.rerolledIndexes); faces=tokenResult.faces;
    const sixCount=faces.filter(v=>v===6).length; const spendFate=sixCount&&Number(this.system.resources.fate.value??0)>0?await this._askFateAfterSixes({roleName:label,sixCount}):false;
    const bonusFaces=spendFate?await this._explodeSixes(faces):[]; if(spendFate) await this.spendTrackedResource("fate", 1, { reason: "Fate / Open 6s" });
    const finalFaces=faces.concat(bonusFaces), rolledSuccesses=finalFaces.filter(v=>v>=4).length, traitSuccesses=this._traitSuccessBonus(assist,rolledSuccesses,obstacle), successes=rolledSuccesses+traitSuccesses, result=this._resultData(successes,obstacle);
    const direct=key==="nature"; let tax=direct?this._natureTax(result,{direct:true,scope:natureUse}):this._natureTax(result,{tapped:tapNature,scope:natureScope});
    if(direct&&doubleTapNature&&!result.passed&&!result.tied) tax=Math.max(tax,Math.max(1,Number(result.margin||1)));
    const taxResult=tax?await this._applyNatureTax(tax,direct?`Nature · ${natureUse}`:`Tap Nature · ${label}`):null;
    const esc=foundry.utils.escapeHTML, conditionText=conditionData.active.length?` · Conditions ${conditionData.active.map(c=>`${esc(c.name)} ${Number(c.system.rollModifier??0)>=0?"+":""}${Number(c.system.rollModifier??0)}D`).join(", ")}`:"";
    const modeText=direct?` · Nature ${natureUse==="against"?"AGAINST":"WITHIN"}${doubleTapNature?` · Double-Tap +${doubleDice}D`:""}`:(tapNature?` · Tap Nature +${tapDice}D (${natureScope})`:"");
    const taxText=taxResult?`<p class="rg-nature-tax"><b>Nature Tax:</b> −${taxResult.tax} → ${taxResult.current}/${taxResult.maximum}</p>`:"";
    const poolBreakdown=rollBreakdownHtml(dice,[
      ["Base",`${base}D`],
      Number(modifier||0)?["Modifier",signedDice(modifier)]:null,
      Number(extraDice||0)?["Extra Dice",`+${Number(extraDice)}D`]:null,
      helpDice?["Teamwork",`+${helpDice}D`]:null,
      personaDice?["Persona",`+${personaDice}D`]:null,
      tapNature?["Tap Nature",`+${tapDice}D · ${natureScope}`]:null,
      doubleTapNature?["Double-Tap Nature",`+${doubleDice}D · within`]:null,
      conditionData.dice?["Conditions",signedDice(conditionData.dice)]:null,
      assist.traitDice?["Trait",signedDice(assist.traitDice)]:null,
      Number(power?.diceBonus??0)?["Token of Power",signedDice(power.diceBonus)]:null
    ]);
    const specialNotes=[
      direct?`Nature: ${natureUse==="against"?"Against descriptors":"Within descriptors"}`:"",
      conditionText.replace(/^\s*·\s*/,""),
      this._traitChatText(assist,earnedTraitChecks).replace(/^\s*·\s*/,""),
      this._tokenPowerChatText(power,tokenResult).replace(/^\s*·\s*/,""),
      spendFate?"Fate: Open 6s":""
    ].filter(Boolean);
    const content=`<div class="realm-guard chat-roll rg-nature-aware rg-readable-roll"><h3>${esc(label)}</h3>${playerTurnSpendHtml(turnSpend)}${poolBreakdown}${specialNotes.length?`<div class="rg-roll-support-notes">${specialNotes.map(note=>`<span>${note}</span>`).join("")}</div>`:""}${(personaDice||tapNature||doubleTapNature||spendFate)?`<p class="rg-resource-spend"><b>Resources spent:</b> ${[(personaDice||tapNature||doubleTapNature)?`Persona −${personaDice+(tapNature?1:0)+(doubleTapNature?1:0)}`:"",spendFate?"Fate −1":""].filter(Boolean).join(" · ")}</p>`:""}${Array.isArray(help)&&help.length?`<p class="rg-teamwork-chat"><b>Teamwork:</b> ${help.map(h=>`${esc(h.actorName)} — ${h.sourceKind === "Wise" ? "I Am Wise" : esc(h.sourceKind)}: ${esc(h.sourceName)} (+${Number(h.dice||1)}D${h.synergy ? " · Synergy" : ""})`).join(" · ")}</p>`:""}${rollFacesRowsHtml([{label:"Roll",faces},{label:"Wise reroll",faces:wiseResult.rerollFaces},{label:"Token reroll",faces:tokenResult.rerollFaces},{label:"Fate dice",faces:bonusFaces}])}<div class="rg-roll-final-count"><span><b>Final Successes</b><strong>${successes}</strong></span><span><b>6s</b><strong>${finalFaces.filter(v=>v===6).length}</strong></span></div>${taxText}${this._resultSummaryHTML(successes,obstacle)}</div>`;
    await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this}),content});
    return {roll,successes,passed:result.passed,tied:result.tied,margin:result.margin,outcome:result.outcome,fateSpent:spendFate,natureTax:taxResult,tokenPowerId:power?.token?.id??null,tokenPowerName:power?.token?.name??"",tokenPowerLevel:power?.level??0};
  }

  async rollNatureVersus(opponent,{modifier=0,extraDice=0,help=[],persona=0,traitId=null,traitMode="help",wiseId=null,tokenPowerId=null,natureUse="within",doubleTapNature=false}={}) {
    const personaDice=personaDiceCount(persona);
    const ns=this._natureState(), oppN=opponent?.system?.attributes?.nature??{}, oppCurrent=Math.max(0,Number(oppN.value??0));
    const assist=this._rollAssist({traitId,wiseId,traitMode,versus:true}), power=this._tokenPowerUse(tokenPowerId,"Nature",{isSkill:false}); if(tokenPowerId&&!power)return ui.notifications.warn("Realm Guard: That Token of Power is no longer available or appropriate for Nature."); const cond=this._activeConditionRollData("Nature",{isSkill:false}), oppCond=conditionRollData(opponent,"Nature",{isSkill:false});
    const helpDice=Array.isArray(help)?help.reduce((n,h)=>n+Number(h.dice||0),0):0;
    const ownDice=Math.max(0,ns.current+Number(modifier||0)+Math.max(0,Number(extraDice||0))+helpDice+personaDice+(doubleTapNature?ns.current:0)+assist.traitDice+Number(power?.diceBonus??0)+cond.dice);
    const oppDice=Math.max(0,oppCurrent+Number(oppCond.dice||0)+Number(assist.opponentDice||0)); if(!ownDice||!oppDice)return ui.notifications.warn("Realm Guard: Nature Versus requires both pools to be at least 1D.");
    const turnSpend=await claimPlayerTurnTest(this,{label:"Nature Versus"}); if(!turnSpend.ok)return ui.notifications.warn(`Realm Guard: ${turnSpend.reason}`);
    const earnedTraitChecks=await this._awardTraitChecks(assist);
    const r1=await new Roll(`${ownDice}d6`).evaluate(), r2=await new Roll(`${oppDice}d6`).evaluate(); await this._commitTraitBenefit(assist); await this._commitTokenPowerUse(power); let f1=r1.dice.flatMap(d=>d.results.map(r=>r.result)); const wr=await this._applyWiseReroll(f1,assist.wise);f1=wr.faces; const tokenResult=await this._applyTokenPowerReroll(f1,power,wr.rerolledIndexes); f1=tokenResult.faces; const f2=r2.dice.flatMap(d=>d.results.map(r=>r.result));
    const sixes=f1.filter(v=>v===6).length, spendFate=sixes&&Number(this.system.resources.fate.value??0)>0?await this._askFateAfterSixes({roleName:"Nature Versus",sixCount:sixes}):false, bonus=spendFate?await this._explodeSixes(f1):[];
    if(spendFate)await this.spendTrackedResource("fate", 1, { reason: "Fate / Open 6s" }); f1=f1.concat(bonus);
    let a=f1.filter(v=>v>=4).length; const b=f2.filter(v=>v>=4).length; a+=this._traitSuccessBonus(assist,a,b,{versus:true}); const result=this._resultData(a,b,{versus:true}); let tax=this._natureTax(result,{direct:true,scope:natureUse}); if(doubleTapNature&&!result.passed&&!result.tied)tax=Math.max(tax,Math.max(1,Number(result.margin||1))); const tr=tax?await this._applyNatureTax(tax,`Nature Versus · ${natureUse}`):null;
    const esc=foundry.utils.escapeHTML,taxText=tr?`<p class="rg-nature-tax"><b>Nature Tax:</b> −${tr.tax} → ${tr.current}/${tr.maximum}</p>`:"";
    await ChatMessage.create({speaker:ChatMessage.getSpeaker({actor:this}),content:`<div class="realm-guard chat-roll rg-nature-chat"><h3>Nature <span class="rg-chat-versus">VERSUS</span></h3>${playerTurnSpendHtml(turnSpend)}<p><b>${esc(this.name)}:</b> ${ownDice}d6 · Nature ${ns.current}D${doubleTapNature?` · Double-Tap +${ns.current}D`:""}${this._traitChatText(assist,earnedTraitChecks)}${this._tokenPowerChatText(power,tokenResult)}${wr.rerollFaces.length?` · Wise reroll ${diceFacesHtml(wr.rerollFaces)}`:""}${tokenResult.rerollFaces.length?` · Token reroll ${diceFacesHtml(tokenResult.rerollFaces)}`:""} → ${diceFacesHtml(f1)} · <b>${a} successes</b></p><p><b>vs ${esc(opponent.name)}:</b> ${oppDice}d6 · Nature ${oppCurrent}D${assist.opponentDice?` · Trait Against +${assist.opponentDice}D`:""} → ${diceFacesHtml(f2)} · <b>${b} successes</b></p>${taxText}${this._resultSummaryHTML(a,b,{versus:true,targetLabel:"Nature"})}</div>`});
    return {roll:r1,opponentRoll:r2,successes:a,opponentSuccesses:b,passed:result.passed,tied:result.tied,margin:result.margin,outcome:result.outcome,fateSpent:spendFate,tokenPowerId:power?.token?.id??null,tokenPowerName:power?.token?.name??"",tokenPowerLevel:power?.level??0};
  }

  async rollBeginnerLuck(role, { abilityKey = "will", modifier = 0, extraDice = 0, help = [], obstacle = 1, persona = 0, traitId = null, traitMode = "help", wiseId = null, tokenPowerId = null, opponent = null, opposition = null, countLearning = true, tapNature = false, natureScope = "within" } = {}) {
    const personaDice = personaDiceCount(persona);
    if (hasActiveCondition(this, "Afraid")) return ui.notifications.warn("Realm Guard: Afraid Rangers cannot use Beginner's Luck. Use Nature when appropriate or recover first.");
    const abilityLabel = this._abilityLabel(abilityKey);
    const ability = this.system.attributes?.[abilityKey];
    const abilityBase = Number(ability?.value ?? 0);
    if (abilityBase <= 0) return ui.notifications.warn(`Realm Guard: ${abilityLabel} is 0; Beginner's Luck cannot be used.`);
    const assist = this._rollAssist({ traitId, wiseId, traitMode, versus: Boolean(opponent && opposition) });
    const power = this._tokenPowerUse(tokenPowerId, role.name, { isSkill: true });
    if (tokenPowerId && !power) return ui.notifications.warn("Realm Guard: That Token of Power is no longer available or appropriate for this Skill.");
    const conditionData = this._activeConditionRollData(role.name, { isSkill: true });
    const fresh = conditionData.active.find(c => String(c.name).trim().toLowerCase() === "fresh");
    const freshDice = fresh ? Math.max(0, Number(fresh.system.rollModifier ?? 1)) : 0;
    const preHalfConditionDice = Number(conditionData.dice ?? 0) - freshDice;
    // MG/Torchbearer-family ordering: ability + pre-halving bonuses are halved/rounded up; Persona and Fresh are added afterward.
    const preHalf = Math.max(0, abilityBase + Number(modifier || 0) + Math.max(0, Number(extraDice || 0)) + (Array.isArray(help) ? help.reduce((n,h) => n + Math.max(0, Number(h.dice || 0)), 0) : 0) + assist.traitDice + Number(power?.diceBonus ?? 0) + preHalfConditionDice);
    const beginnerDice = Math.ceil(preHalf / 2);
    const natureTapDice = tapNature ? this._natureState().current : 0;
    const dice = Math.max(0, beginnerDice + personaDice + freshDice + natureTapDice);
    if (!dice) return ui.notifications.warn("Realm Guard: Beginner's Luck dice pool is 0.");
    let preparedOpponentDice = 0;
    if (opponent && opposition) {
      const preparedConditions = conditionRollData(opponent, opposition.name, { isSkill: opposition.kind === "role" });
      preparedOpponentDice = Math.max(0, Number(opposition.rating ?? 0) + Number(preparedConditions.dice ?? 0) + Number(assist.opponentDice ?? 0));
      if (!preparedOpponentDice) return ui.notifications.warn("Realm Guard: Opponent pool is 0.");
    }
    const turnSpend = await claimPlayerTurnTest(this, { label: `${role.name} · Beginner's Luck` });
    if (!turnSpend.ok) return ui.notifications.warn(`Realm Guard: ${turnSpend.reason}`);
    const earnedTraitChecks = await this._awardTraitChecks(assist);
    const roll = await new Roll(`${dice}d6`).evaluate();
    await this._commitTraitBenefit(assist);
    await this._commitTokenPowerUse(power);
    let baseFaces = roll.dice.flatMap(d => d.results.map(r => r.result));
    const wiseResult = await this._applyWiseReroll(baseFaces, assist.wise); baseFaces = wiseResult.faces;
    const tokenResult = await this._applyTokenPowerReroll(baseFaces, power, wiseResult.rerolledIndexes); baseFaces = tokenResult.faces;
    const baseSixes = baseFaces.filter(v => v === 6).length;
    const canAskFate = baseSixes > 0 && Number(this.system.resources.fate.value ?? 0) > 0;
    const spendFate = canAskFate ? await this._askFateAfterSixes({ roleName: `${role.name} · Beginner's Luck`, sixCount: baseSixes }) : false;
    const bonusFaces = spendFate ? await this._explodeSixes(baseFaces) : [];
    if (spendFate) await this.spendTrackedResource("fate", 1, { reason: "Fate / Open 6s or Versus tie" });
    const faces = baseFaces.concat(bonusFaces); let successes = faces.filter(v => v >= 4).length;
    let target = Number(obstacle ?? 1), targetLabel = "Obstacle", result;
    let opponentFaces = [], opponentDice = 0;
    if (opponent && opposition) {
      const oppConditions = conditionRollData(opponent, opposition.name, { isSkill: opposition.kind === "role" });
      opponentDice = preparedOpponentDice || Math.max(0, Number(opposition.rating ?? 0) + Number(oppConditions.dice ?? 0) + Number(assist.opponentDice ?? 0));
      if (!opponentDice) return ui.notifications.warn("Realm Guard: Opponent pool is 0.");
      const oppRoll = await new Roll(`${opponentDice}d6`).evaluate(); opponentFaces = oppRoll.dice.flatMap(d => d.results.map(r => r.result));
      target = opponentFaces.filter(v => v >= 4).length; targetLabel = opposition.name; successes += this._traitSuccessBonus(assist, successes, target, { versus: true }); result = this._resultData(successes, target, { versus: true });
      if (result.tied) {
        const tie = await this._resolveAutomaticVersusTie({ role, opponent, opposition, ownFaces: faces, opponentFaces, fateAlreadySpent: spendFate });
        if (tie?.resolved) result = { outcome: tie.outcome, tied: false, passed: tie.passed, margin: Number(tie.margin ?? 0), needsTiebreaker: false };
      }
    } else { successes += this._traitSuccessBonus(assist, successes, target); result = this._resultData(successes, target); }
    const natureTax = result.tied ? 0 : this._natureTax(result, { tapped: tapNature, scope: natureScope });
    const natureTaxResult = natureTax ? await this._applyNatureTax(natureTax, `Tap Nature · ${role.name} · Beginner's Luck`) : null;
    const natureTaxText = natureTaxResult ? `<p class="rg-nature-tax"><b>Nature Tax:</b> −${natureTaxResult.tax} → ${natureTaxResult.current}/${natureTaxResult.maximum}</p>` : "";
    const esc = foundry.utils.escapeHTML;
    const needed = Math.max(1, Number(this.system.attributes?.nature?.maximum ?? this.system.attributes?.nature?.value ?? 1));
    const currentAttempts = Number(role.system.beginnerAttempts ?? 0);
    const beginnerHelpDice = Array.isArray(help) ? help.reduce((n,h)=>n+Number(h.dice||0),0) : 0;
    const poolBreakdown = rollBreakdownHtml(dice,[
      ["Ability Base",`${abilityLabel} ${abilityBase}D`],
      Number(modifier||0)?["Modifier",signedDice(modifier)]:null,
      Number(extraDice||0)?["Extra Dice",`+${Number(extraDice)}D`]:null,
      beginnerHelpDice?["Teamwork",`+${beginnerHelpDice}D`]:null,
      assist.traitDice?["Trait",signedDice(assist.traitDice)]:null,
      Number(power?.diceBonus??0)?["Token of Power",signedDice(power.diceBonus)]:null,
      preHalfConditionDice?["Conditions before half",signedDice(preHalfConditionDice)]:null,
      ["Pre-half pool",`${preHalf}D`],
      ["Beginner's Luck",`${preHalf}D → ${beginnerDice}D`],
      personaDice?["Persona after half",`+${personaDice}D`]:null,
      freshDice?["Fresh after half",`+${freshDice}D`]:null,
      tapNature?["Tap Nature after half",`+${natureTapDice}D · ${natureScope}`]:null
    ]);
    const content = `<div class="realm-guard chat-roll rg-beginner-chat rg-readable-roll"><h3>${esc(role.name)} <span class="rg-chat-versus">BEGINNER'S LUCK</span></h3>${playerTurnSpendHtml(turnSpend)}${poolBreakdown}${assist.blockedWise?`<div class="rg-roll-support-notes"><span>Wise blocked by Angry</span></div>`:""}${Array.isArray(help) && help.length ? `<p class="rg-teamwork-chat"><b>Teamwork:</b> ${help.map(h => `${esc(h.actorName)} — ${h.sourceKind === "Wise" ? "I Am Wise" : esc(h.sourceKind)}: ${esc(h.sourceName)} (+${Number(h.dice||1)}D${h.synergy ? " · Synergy" : ""})`).join(" · ")}</p>` : ""}${rollFacesRowsHtml([{label:"Roll",faces:baseFaces},{label:"Wise reroll",faces:wiseResult.rerollFaces},{label:"Token reroll",faces:tokenResult.rerollFaces},{label:"Fate dice",faces:bonusFaces}])}${opponent?`<div class="rg-roll-opponent"><header><b>Opponent</b><strong>${esc(opponent.name)} · ${esc(opposition.name)}</strong></header><div><span>${opponentDice}D</span>${diceFacesHtml(opponentFaces)}<b>${target} successes</b></div></div>`:""}${natureTaxText}${this._resultSummaryHTML(successes,target,{versus:Boolean(opponent),targetLabel})}<p class="rg-beginner-learning"><b>Learning:</b> ${Math.min(needed,currentAttempts+(countLearning && !result.tied ? 1 : 0))} / ${needed} Beginner's Luck attempts <small>(${countLearning ? (result.tied ? "unresolved tie — not recorded yet" : "pass/fail does not matter") : "not counted for learning"})</small></p></div>`;
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content });
    return { roll, successes, passed: result.passed, tied: result.tied, margin: result.margin, outcome: result.outcome, fateSpent: spendFate, tokenPowerId: power?.token?.id ?? null, tokenPowerName: power?.token?.name ?? "", tokenPowerLevel: power?.level ?? 0 };
  }

  async rollAutomaticVersus(role, opponent, opposition, { modifier = 0, extraDice = 0, help = [], persona = 0, traitId = null, traitMode = "help", wiseId = null, tokenPowerId = null, tapNature = false, natureScope = "within" } = {}) {
    const personaDice = personaDiceCount(persona);
    const assist = this._rollAssist({ traitId, wiseId, traitMode, versus: true });
    const power = this._tokenPowerUse(tokenPowerId, role.name, { isSkill: true });
    if (tokenPowerId && !power) return ui.notifications.warn("Realm Guard: That Token of Power is no longer available or appropriate for this Skill.");
    const conditionData = this._activeConditionRollData(role.name, { isSkill: true });
    const natureTapDice = tapNature ? this._natureState().current : 0;
    const ownDice = Math.max(0, Number(role.system.rating ?? 0) + Number(modifier || 0) + Math.max(0, Number(extraDice || 0)) + (Array.isArray(help) ? help.reduce((n,h) => n + Math.max(0, Number(h.dice || 0)), 0) : 0) + personaDice + natureTapDice + assist.traitDice + Number(power?.diceBonus ?? 0) + conditionData.dice);
    const opponentName = opposition.name;
    const opponentIsSkill = opposition.kind === "role";
    const opponentConditionData = conditionRollData(opponent, opponentName, { isSkill: opponentIsSkill });
    const opponentBase = Number(opposition.rating ?? 0);
    const opponentDice = Math.max(0, opponentBase + opponentConditionData.dice + Number(assist.opponentDice ?? 0));
    if (!ownDice || !opponentDice) return ui.notifications.warn("Realm Guard: Automatic Versus requires both dice pools to be at least 1D.");
    const turnSpend = await claimPlayerTurnTest(this, { label: `${role.name} Versus` });
    if (!turnSpend.ok) return ui.notifications.warn(`Realm Guard: ${turnSpend.reason}`);
    const earnedTraitChecks = await this._awardTraitChecks(assist);
    const ownRoll = await new Roll(`${ownDice}d6`).evaluate();
    await this._commitTraitBenefit(assist);
    await this._commitTokenPowerUse(power);
    const opponentRoll = await new Roll(`${opponentDice}d6`).evaluate();
    let baseFaces = ownRoll.dice.flatMap(d => d.results.map(r => r.result));
    const wiseResult = await this._applyWiseReroll(baseFaces, assist.wise);
    baseFaces = wiseResult.faces;
    const tokenResult = await this._applyTokenPowerReroll(baseFaces, power, wiseResult.rerolledIndexes);
    baseFaces = tokenResult.faces;
    const opponentFaces = opponentRoll.dice.flatMap(d => d.results.map(r => r.result));
    const baseSuccesses = baseFaces.filter(v => v >= 4).length;
    const baseSixes = baseFaces.filter(v => v === 6).length;
    const opponentSuccesses = opponentFaces.filter(v => v >= 4).length;
    const canAskFate = baseSixes > 0 && Number(this.system.resources.fate.value ?? 0) > 0;
    const esc = foundry.utils.escapeHTML;
    let pendingMessage = null;
    if (canAskFate) {
      const pending = `<div class="realm-guard chat-roll rg-auto-versus rg-roll-paused"><h3>${esc(role.name)} <span class="rg-chat-versus">AUTO VERSUS</span></h3>${playerTurnSpendHtml(turnSpend)}${Array.isArray(help) && help.length ? `<p class="rg-teamwork-chat"><b>Teamwork:</b> ${help.map(h => `${esc(h.actorName)} — ${h.sourceKind === "Wise" ? "I Am Wise" : esc(h.sourceKind)}: ${esc(h.sourceName)} (+${Number(h.dice||1)}D${h.synergy ? " · Synergy" : ""})`).join(" · ")}</p>` : ""}<p><b>${esc(this.name)} · ${esc(role.name)}:</b> ${ownDice}d6 · Base ${Number(role.system.rating ?? 0)}D ${Number(modifier || 0) ? `· Modifier ${Number(modifier || 0) > 0 ? "+" : ""}${Number(modifier || 0)}D` : ""} ${Number(extraDice || 0) ? `· Extra Dice +${Math.max(0, Number(extraDice || 0))}D` : ""} ${Array.isArray(help) && help.length ? `· Teamwork ${help.reduce((n,h)=>n+Number(h.dice||0),0)}D` : ""} ${personaDice ? `· Persona +${personaDice}D` : ""} → ${diceFacesHtml(baseFaces)} · <b>${baseSuccesses} successes so far</b></p><p><b>vs ${esc(opponent.name)} · ${esc(opponentName)}:</b> ${opponentDice}d6 → ${diceFacesHtml(opponentFaces)} · <b>${opponentSuccesses} successes</b></p><div class="rg-paused-banner">⏸ ROLL PAUSED — Fate decision pending</div><p>A 6 was rolled. The player has been asked whether to spend 1 Fate to open sixes.</p><p><b>Final result:</b> Pending</p></div>`;
      pendingMessage = await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content: pending });
    }
    const spendFate = canAskFate ? await this._askFateAfterSixes({ roleName: role.name, sixCount: baseSixes }) : false;
    const bonusFaces = spendFate ? await this._explodeSixes(baseFaces) : [];
    if (spendFate) await this.spendTrackedResource("fate", 1, { reason: "Fate / Open 6s or Versus tie" });
    const ownFaces = baseFaces.concat(bonusFaces);
    const rolledSuccesses = ownFaces.filter(v => v >= 4).length;
    const successes = rolledSuccesses + this._traitSuccessBonus(assist, rolledSuccesses, opponentSuccesses, { versus: true });
    const sixes = ownFaces.filter(v => v === 6).length;
    const opponentSixes = opponentFaces.filter(v => v === 6).length;
    let result = this._resultData(successes, opponentSuccesses, { versus: true });
    let tieResolution = null;
    if (result.tied) {
      tieResolution = await this._resolveAutomaticVersusTie({ role, opponent, opposition, ownFaces, opponentFaces, fateAlreadySpent: spendFate });
      if (tieResolution?.resolved) {
        result = { outcome: tieResolution.outcome, tied: false, passed: tieResolution.passed, margin: Number(tieResolution.margin ?? 0), needsTiebreaker: false };
      }
    }
    const finalOwnSuccesses = Number(tieResolution?.finalOwnSuccesses ?? successes);
    const tieDetail = tieResolution?.method === "trait"
      ? `<div class="rg-tiebreak-detail"><b>Tie resolved:</b> ${esc(tieResolution.traitName)} used against self → opponent wins${tieResolution.earnedChecks ? ` · +${tieResolution.earnedChecks} Checks` : !turnManagerEnabled() ? " · no Checks (Turn Manager disabled)" : " · no Checks in Players' Turn"}.</div>`
      : tieResolution?.method === "fate"
        ? `<div class="rg-tiebreak-detail"><b>Tie resolved with Fate:</b> ${tieResolution.fateFaces?.length ? diceFacesHtml(tieResolution.fateFaces) : "—"} → ${finalOwnSuccesses} successes.</div>`
        : tieResolution?.ownAbility
          ? `<div class="rg-tiebreak-detail"><b>Tiebreaker:</b> ${esc(tieResolution.ownAbility)} ${diceFacesHtml(tieResolution.ownTieFaces ?? [])} (${tieResolution.ownTieSuccesses ?? 0}s) vs ${esc(tieResolution.oppAbility)} ${diceFacesHtml(tieResolution.oppTieFaces ?? [])} (${tieResolution.oppTieSuccesses ?? 0}s)${tieResolution.method === "gm-wins" ? " · second tie → GM wins" : tieResolution.method === "gm-decision" ? " · second tie → GM decision required" : ""}.</div>`
          : "";
    const unresolvedTie = result.tied && (!tieResolution || !tieResolution.resolved);
    const natureTax = unresolvedTie ? 0 : this._natureTax(result,{tapped:tapNature,scope:natureScope});
    const natureTaxResult = natureTax ? await this._applyNatureTax(natureTax, `Tap Nature · ${role.name} Versus`) : null;
    const natureTaxText = natureTaxResult ? `<p class="rg-nature-tax"><b>Nature Tax:</b> −${natureTaxResult.tax} → ${natureTaxResult.current}/${natureTaxResult.maximum}</p>` : "";
    const summary = unresolvedTie
      ? this._resultSummaryHTML(successes, opponentSuccesses, { versus: true, targetLabel: esc(opponentName) })
      : `<div class="rg-result-summary"><span><b>Successes</b><strong>${finalOwnSuccesses}</strong></span><span><b>${esc(opponentName)}</b><strong>${opponentSuccesses}</strong></span><span class="rg-result-final"><strong class="rg-roll-outcome ${result.passed ? "pass" : "fail"}">${result.passed ? "PASS" : "FAIL"}</strong><small class="rg-result-margin">${result.passed ? "Success" : "Failed"}: ${Number(result.margin ?? 0)}</small></span></div>`;
    const content = `<div class="realm-guard chat-roll rg-auto-versus"><h3>${esc(role.name)} <span class="rg-chat-versus">AUTO VERSUS</span></h3>${playerTurnSpendHtml(turnSpend)}${Array.isArray(help) && help.length ? `<p class="rg-teamwork-chat"><b>Teamwork:</b> ${help.map(h => `${esc(h.actorName)} — ${h.sourceKind === "Wise" ? "I Am Wise" : esc(h.sourceKind)}: ${esc(h.sourceName)} (+${Number(h.dice||1)}D${h.synergy ? " · Synergy" : ""})`).join(" · ")}</p>` : ""}<p><b>${esc(this.name)} · ${esc(role.name)}:</b> ${ownDice}d6 · Base ${Number(role.system.rating ?? 0)}D ${Number(modifier || 0) ? `· Modifier ${Number(modifier || 0) > 0 ? "+" : ""}${Number(modifier || 0)}D` : ""} ${Number(extraDice || 0) ? `· Extra Dice +${Math.max(0, Number(extraDice || 0))}D` : ""} ${Array.isArray(help) && help.length ? `· Teamwork ${help.reduce((n,h)=>n+Number(h.dice||0),0)}D` : ""} ${personaDice ? `· Persona +${personaDice}D` : ""} ${tapNature ? `· Tap Nature +${natureTapDice}D (${natureScope})` : ""} ${conditionData.active.length ? `· Conditions ${conditionData.active.map(c => `${esc(c.name)} ${Number(c.system.rollModifier ?? 0) >= 0 ? "+" : ""}${Number(c.system.rollModifier ?? 0)}D`).join(", ")}` : ""} ${this._traitChatText(assist, earnedTraitChecks)} ${this._tokenPowerChatText(power, tokenResult)} ${assist.wise ? `· Wise: ${esc(assist.wise.name)}` : ""} → ${diceFacesHtml(baseFaces)} ${wiseResult.rerollFaces.length ? `· <b>Wise reroll:</b> ${diceFacesHtml(wiseResult.rerollFaces)}` : ""} ${tokenResult.rerollFaces.length ? `· <b>Token reroll:</b> ${diceFacesHtml(tokenResult.rerollFaces)}` : ""} ${bonusFaces.length ? `· <b>Fate dice:</b> ${diceFacesHtml(bonusFaces)}` : ""} · <b>${successes} successes</b> · ${sixes} sixes</p>${(personaDice || tapNature || spendFate || tieResolution?.fateSpent) ? `<p class="rg-resource-spend"><b>Resources spent:</b> ${[(personaDice||tapNature)?`Persona −${personaDice+(tapNature?1:0)}`:"", (spendFate || tieResolution?.fateSpent) ? "Fate −1" : ""].filter(Boolean).join(" · ")}</p>` : ""}<p><b>vs ${esc(opponent.name)} · ${esc(opponentName)}:</b> ${opponentDice}d6 · Base ${opponentBase}D ${assist.opponentDice ? `· Trait Against +${assist.opponentDice}D` : ""} ${opponentConditionData.active.length ? `· Conditions ${opponentConditionData.active.map(c => `${esc(c.name)} ${Number(c.system.rollModifier ?? 0) >= 0 ? "+" : ""}${Number(c.system.rollModifier ?? 0)}D`).join(", ")}` : ""} → ${diceFacesHtml(opponentFaces)} · <b>${opponentSuccesses} successes</b> · ${opponentSixes} sixes</p>${tieDetail}${natureTaxText}${summary}</div>`;
    if (pendingMessage) await pendingMessage.update({ content });
    else await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this }), content });
    return { roll: ownRoll, opponentRoll, successes: finalOwnSuccesses, opponentSuccesses, sixes, opponentSixes, passed: result.passed, tied: unresolvedTie, margin: result.margin, outcome: unresolvedTie ? "TIE" : result.outcome, needsTiebreaker: unresolvedTie, automaticVersus: true, opponentName, opponentKind: opposition.kind, fateSpent: Boolean(spendFate || tieResolution?.fateSpent), tokenPowerId: power?.token?.id ?? null, tokenPowerName: power?.token?.name ?? "", tokenPowerLevel: power?.level ?? 0, learningResult: tieResolution ? tieResolution.learningResult : result.passed, tieResolution };
  }

}
