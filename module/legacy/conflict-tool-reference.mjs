const normalize = value => String(value ?? "").trim().toLowerCase();

function normalizeSelection(selection) {
  if (!selection) return { kind: "unarmed", name: "Unarmed", id: null };
  if (typeof selection === "string") return { kind: "gear", name: selection, id: null };
  if (selection.kind === "tool") {
    const tool = selection.tool ?? selection;
    return {
      kind: "tool",
      id: selection.id ?? tool.id ?? null,
      name: selection.name ?? tool.name ?? "Conflict Tool",
      action: String(tool.action ?? "any"),
      effect: String(tool.effect ?? "none"),
      value: Number(tool.value ?? 0),
      requirement: String(tool.requirement ?? ""),
      special: String(tool.special ?? "")
    };
  }
  return {
    kind: "gear",
    id: selection.id ?? null,
    name: selection.name ?? "Gear"
  };
}

export function legacyConflictToolReference(selection, action, {
  swordAction = "",
  requirementMet = true
} = {}) {
  const selected = normalizeSelection(selection);
  const currentAction = normalize(action);
  let dice = 0;
  let conditionalSuccess = 0;
  let successPenalty = 0;
  const notes = [];

  if (selected.kind === "unarmed") {
    return {
      dice: -1,
      conditionalSuccess: 0,
      successPenalty: 0,
      notes: ["Unarmed / no valid Conflict Weapon or Tool -1D"],
      hasSword: false,
      swordAction: "",
      requirement: "",
      requirementMet: true,
      toolName: "Unarmed"
    };
  }

  if (selected.kind === "tool") {
    const applies = selected.action === "any" || normalize(selected.action) === currentAction;
    if (applies && selected.effect === "dice") dice += Number(selected.value ?? 0);
    if (applies && selected.effect === "success") {
      const value = Number(selected.value ?? 0);
      if (value > 0) conditionalSuccess += value;
      if (value < 0) successPenalty += Math.abs(value);
    }
    notes.push(`${selected.name}${applies && selected.effect !== "none" && Number(selected.value ?? 0) ? ` ${Number(selected.value) > 0 ? "+" : ""}${Number(selected.value)}${selected.effect === "dice" ? "D" : "s"}` : ""}${selected.special ? ` · ${selected.special}` : ""}`);
    if (selected.requirement && !requirementMet) {
      dice = 0;
      conditionalSuccess = 0;
      successPenalty = 0;
      return {
        dice,
        conditionalSuccess,
        successPenalty,
        notes: [`${selected.name}: requirement not met — no bonus`],
        hasSword: false,
        swordAction: "",
        requirement: selected.requirement,
        requirementMet: false,
        toolName: selected.name
      };
    }
    return {
      dice,
      conditionalSuccess,
      successPenalty,
      notes,
      hasSword: false,
      swordAction: "",
      requirement: selected.requirement,
      requirementMet: Boolean(requirementMet),
      toolName: selected.name
    };
  }

  const name = normalize(selected.name);
  if (name === "shield" && currentAction === "defend") {
    dice += 2;
    notes.push("Shield +2D Defend");
  }
  if (name === "halberd") {
    if (["attack", "defend"].includes(currentAction)) {
      dice += 1;
      notes.push("Halberd +1D");
    }
    if (["feint", "maneuver"].includes(currentAction)) {
      dice -= 1;
      notes.push("Halberd -1D");
    }
  }
  if (["whip", "hook and line"].includes(name)) {
    if (currentAction === "maneuver") {
      dice += 1;
      conditionalSuccess += 1;
      notes.push("Whip +1D / +1s successful Maneuver");
    }
    if (currentAction === "attack") {
      dice -= 1;
      notes.push("Whip -1D Attack");
    }
  }
  if (name === "spear") {
    if (currentAction === "defend") {
      dice += 1;
      notes.push("Spear +1D Defend");
    }
    if (currentAction === "feint") {
      conditionalSuccess += 1;
      notes.push("Spear +1s successful Feint");
    }
  }
  if (name === "staff" && currentAction === "feint") {
    dice += 1;
    notes.push("Staff +1D Feint");
  }
  if (name === "bow" && currentAction === "maneuver") {
    dice += 2;
    notes.push("Bow +2D Maneuver");
  }
  if (name === "sling" && currentAction === "maneuver") {
    dice += 1;
    notes.push("Sling +1D Maneuver");
  }
  if (name === "axe") {
    if (currentAction === "attack") {
      conditionalSuccess += 1;
      notes.push("Axe +1s successful Attack");
    }
    if (["defend", "feint"].includes(currentAction)) {
      dice -= 1;
      notes.push("Axe -1D");
    }
  }
  const lockedSwordAction = normalize(swordAction);
  if (name === "sword" && lockedSwordAction && lockedSwordAction === currentAction) {
    dice += 1;
    notes.push(`Sword Useful +1D ${currentAction}`);
  }

  return {
    dice,
    conditionalSuccess,
    successPenalty,
    notes,
    hasSword: name === "sword",
    swordAction: lockedSwordAction,
    requirement: "",
    requirementMet: true,
    toolName: selected.name
  };
}
