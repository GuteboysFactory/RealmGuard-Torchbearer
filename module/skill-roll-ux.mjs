import { baselineObstacle, obstacleMode } from "./obstacles.mjs";

function canonicalBeginnerAbility(actor, role) {
  const saved = String(role?.system?.beginnerAbility ?? "").trim().toLowerCase();
  if (["will", "health"].includes(saved)) return saved;
  const options = actor?._tiebreakOptions?.(role?.name, "role") ?? [];
  return options.length === 1 ? String(options[0]).toLowerCase() : "";
}

function quickObstacleOrNull() {
  const mode = obstacleMode();
  if (mode === "approval") return null;
  if (mode === "baseline") return Math.max(0, Number(baselineObstacle()) || 0);
  return 1;
}

async function chooseBeginnerAbility(actor, role) {
  let abilityKey = canonicalBeginnerAbility(actor, role);
  if (abilityKey) return abilityKey;

  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: `Realm Guard · Beginner's Luck · ${role.name}`, resizable: true },
    modal: false,
    rejectClose: false,
    content: `<div class="rg-beginner-choice"><p><b>${foundry.utils.escapeHTML(role.name)}</b> is a custom/unclassified Skill.</p><p>Choose its Beginner's Luck base ability. Physical Skills use Health; mental/social Skills use Will.</p></div>`,
    buttons: [
      { action: "will", label: "Will", icon: "fa-solid fa-brain", callback: () => "will" },
      { action: "health", label: "Health", icon: "fa-solid fa-heart-pulse", callback: () => "health" },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
  abilityKey = String(choice ?? "").toLowerCase();
  if (!["will", "health"].includes(abilityKey)) return "";
  await role.update({ "system.beginnerAbility": abilityKey });
  return abilityKey;
}

async function quickRollRole(event, target) {
  const id = target.closest("[data-item-id]")?.dataset.itemId;
  const role = this.actor?.items?.get(id);
  if (!role || Number(role.system.rating ?? 0) <= 0) return;

  const obstacle = quickObstacleOrNull();
  if (obstacle === null) {
    ui.notifications.info("Realm Guard: Obstacle approval is active. Opening Roll Window so the GM approval workflow is preserved.");
    return this.constructor._rollRole.call(this, event, target);
  }

  let result = null;
  if (Boolean(role.system.versus)) {
    const targets = Array.from(game.user.targets ?? []);
    const opponent = targets.length === 1 ? targets[0]?.actor : null;
    const options = opponent ? this.constructor._availableVersusOpposition(role.name, opponent) : [];
    if (!opponent || options.length !== 1) {
      ui.notifications.info("Realm Guard: This Versus test needs an explicit target/opposition choice. Opening Roll Window.");
      return this.constructor._rollRole.call(this, event, target);
    }
    const opposition = this.constructor._resolveVersusOpposition(opponent, options[0].id);
    if (!opposition || opposition.rating <= 0) return this.constructor._rollRole.call(this, event, target);
    result = await this.actor.rollAutomaticVersus(role, opponent, opposition, { modifier: 0, extraDice: 0, help: [], persona: 0 });
  } else {
    result = await this.actor.rollRole(role, { modifier: 0, extraDice: 0, help: [], obstacle, versus: false, persona: 0 });
  }

  if (!result) return;
  const learningResult = Object.prototype.hasOwnProperty.call(result, "learningResult") ? result.learningResult : result.passed;
  if (!result.tied && learningResult !== null && learningResult !== undefined) {
    await this.constructor._recordLearning.call(this, role, Boolean(learningResult));
  }
}

async function quickRollUntrained(event, target) {
  const id = target.closest("[data-item-id]")?.dataset.itemId;
  const role = this.actor?.items?.get(id);
  if (!role || Number(role.system.rating ?? 0) > 0) return;

  const obstacle = quickObstacleOrNull();
  if (obstacle === null) {
    ui.notifications.info("Realm Guard: Obstacle approval is active. Opening Roll Window so the GM approval workflow is preserved.");
    return this.constructor._rollUntrained.call(this, event, target);
  }

  const abilityKey = await chooseBeginnerAbility(this.actor, role);
  if (!abilityKey) return;

  let opponent = null;
  let opposition = null;
  if (Boolean(role.system.versus)) {
    const targets = Array.from(game.user.targets ?? []);
    opponent = targets.length === 1 ? targets[0]?.actor : null;
    const options = opponent ? this.constructor._availableVersusOpposition(role.name, opponent) : [];
    if (!opponent || options.length !== 1) {
      ui.notifications.info("Realm Guard: This Beginner's Luck Versus test needs an explicit target/opposition choice. Opening Roll Window.");
      return this.constructor._rollUntrained.call(this, event, target);
    }
    opposition = this.constructor._resolveVersusOpposition(opponent, options[0].id);
    if (!opposition || opposition.rating <= 0) return this.constructor._rollUntrained.call(this, event, target);
  }

  const result = await this.actor.rollBeginnerLuck(role, {
    abilityKey,
    modifier: 0,
    extraDice: 0,
    help: [],
    obstacle,
    persona: 0,
    opponent,
    opposition,
    countLearning: true
  });
  if (!result || result.tied) return;

  const current = this.actor.items.get(role.id);
  if (!current || Number(current.system.rating ?? 0) > 0) return;
  const needed = Math.max(1, Number(this.actor.system.attributes?.nature?.maximum ?? this.actor.system.attributes?.nature?.value ?? 1));
  const attempts = Math.min(needed, Number(current.system.beginnerAttempts ?? 0) + 1);
  const learningUpdate = { "system.beginnerAttempts": attempts };
  if (attempts >= needed) learningUpdate["flags.realm-guard.autoLearnRequestedBy"] = game.user.id;
  await current.update(learningUpdate);
  if (attempts >= needed) await this.constructor._autoLearnSkill.call(this, current);
  else await this.render({ force: true });
}

function makeActionButton(sheet, action, label, icon, title) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "rg-skill-roll-choice-button";
  button.dataset.action = action;
  button.title = title;
  button.innerHTML = `<i class="fa-solid ${icon}"></i><span>${label}</span>`;
  button.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    const handler = sheet.constructor.DEFAULT_OPTIONS?.actions?.[action];
    if (typeof handler === "function") void handler.call(sheet, event, button);
  });
  return button;
}

function makeStaticDisplay(button, extraClass = "") {
  const display = document.createElement("div");
  display.className = `${button.className} rg-skill-static-display ${extraClass}`.trim();
  display.innerHTML = button.innerHTML;
  button.replaceWith(display);
  return display;
}

function decorateTrained(sheet, root) {
  for (const article of root.querySelectorAll(".rg-trained-role[data-item-id]")) {
    if (article.querySelector(".rg-skill-roll-actions")) continue;
    const original = article.querySelector(".rg-role-roll");
    if (!original) continue;
    makeStaticDisplay(original, "rg-trained-static-display");
    const actions = document.createElement("div");
    actions.className = "rg-skill-roll-actions";
    actions.append(
      makeActionButton(sheet, "quickRollRole", "Quick Roll", "fa-bolt", "Roll immediately with the current automatic rules, no optional pre-roll choices."),
      makeActionButton(sheet, "rollRole", "Roll Window", "fa-sliders", "Open the full Roll Window with Teamwork, resources and optional effects.")
    );
    article.append(actions);
  }
}

function beginnerBucket(actor, role) {
  const ability = canonicalBeginnerAbility(actor, role);
  return ability === "will" || ability === "health" ? ability : "custom";
}

function untrainedSection(title, subtitle, cls, cards) {
  if (!cards.length) return null;
  const section = document.createElement("section");
  section.className = `rg-untrained-ability-group ${cls}`;
  const head = document.createElement("header");
  head.className = "rg-untrained-ability-head";
  head.innerHTML = `<div><strong>${title}</strong><small>${subtitle}</small></div><span>${cards.length}</span>`;
  const body = document.createElement("div");
  body.className = "rg-untrained-ability-grid";
  cards.forEach(card => body.append(card));
  section.append(head, body);
  return section;
}

function decorateUntrained(sheet, root) {
  const container = root.querySelector(".rg-untrained-skills .rg-untrained-grid");
  if (!container || container.dataset.rgAbilitySplit === "true") return;
  const cards = Array.from(container.querySelectorAll(":scope > .rg-untrained-skill[data-item-id]"));
  if (!cards.length) return;

  const buckets = { will: [], health: [], custom: [] };
  for (const card of cards) {
    const role = sheet.actor.items.get(card.dataset.itemId);
    if (!role) continue;
    const bucket = beginnerBucket(sheet.actor, role);
    buckets[bucket].push(card);

    const original = card.querySelector(".rg-untrained-roll");
    if (original) makeStaticDisplay(original, "rg-untrained-static-display");
    const base = card.querySelector(".rg-beginner-base");
    if (base) base.textContent = bucket === "will" ? "Will" : bucket === "health" ? "Health" : "Choose at roll";
    if (!card.querySelector(".rg-skill-roll-actions")) {
      const actions = document.createElement("div");
      actions.className = "rg-skill-roll-actions rg-untrained-roll-actions";
      actions.append(
        makeActionButton(sheet, "quickRollUntrained", "Quick Roll", "fa-bolt", `Quick Beginner's Luck roll for ${role.name}.`),
        makeActionButton(sheet, "rollUntrained", "Roll Window", "fa-sliders", `Open the full Beginner's Luck Roll Window for ${role.name}.`)
      );
      card.append(actions);
    }
  }

  container.replaceChildren();
  const will = untrainedSection("WILL-BASED", "Mental and social Skills · Beginner's Luck uses Will", "is-will", buckets.will);
  const health = untrainedSection("HEALTH-BASED", "Physical Skills · Beginner's Luck uses Health", "is-health", buckets.health);
  const custom = untrainedSection("CUSTOM / CHOOSE", "Custom Skills without a fixed base ability", "is-custom", buckets.custom);
  [will, health, custom].filter(Boolean).forEach(section => container.append(section));
  container.dataset.rgAbilitySplit = "true";
}

function decorateSheet(sheet) {
  const root = sheet.element;
  if (!root || sheet.actor?.type !== "character") return;
  decorateTrained(sheet, root);
  decorateUntrained(sheet, root);
}

export function installSkillRollUx(SheetClass, ActorClass) {
  if (!SheetClass || SheetClass.__rgSkillRollUxInstalled) return;
  SheetClass.__rgSkillRollUxInstalled = true;

  SheetClass.DEFAULT_OPTIONS.actions.quickRollRole = quickRollRole;
  SheetClass.DEFAULT_OPTIONS.actions.quickRollUntrained = quickRollUntrained;

  const originalRender = SheetClass.prototype._onRender;
  SheetClass.prototype._onRender = function(context, options) {
    const result = originalRender?.call(this, context, options);
    queueMicrotask(() => decorateSheet(this));
    return result;
  };

  if (ActorClass?.prototype?._tiebreakOptions && !ActorClass.prototype.__rgFarmerBeginnerLuckPatched) {
    const originalTiebreak = ActorClass.prototype._tiebreakOptions;
    ActorClass.prototype._tiebreakOptions = function(sourceName, sourceKind = "role") {
      if (sourceKind === "role" && String(sourceName ?? "").trim().toLowerCase() === "farmer") return ["health"];
      return originalTiebreak.call(this, sourceName, sourceKind);
    };
    ActorClass.prototype.__rgFarmerBeginnerLuckPatched = true;
  }

  console.log("Realm Guard | Skill Roll UX installed: Quick Roll / Roll Window + Will/Health Beginner's Luck grouping.");
}
