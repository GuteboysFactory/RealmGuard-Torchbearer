function enhanceUntrainedVersusUi(sheet) {
  const root = sheet?.element;
  const actor = sheet?.actor;
  if (!root || !actor) return;

  for (const row of root.querySelectorAll(".rg-untrained-skill[data-item-id]")) {
    const actions = row.querySelector(".rg-untrained-actions");
    if (!actions || actions.querySelector("[data-rg-untrained-versus]")) continue;

    const role = actor.items?.get?.(row.dataset.itemId);
    if (!role || Number(role.system?.rating ?? 0) > 0) continue;

    const label = document.createElement("label");
    label.className = "rg-role-versus rg-untrained-versus";
    label.dataset.rgUntrainedVersus = "true";
    label.title = "Use this untrained Skill as a Versus Beginner's Luck test";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(role.system?.versus);
    input.setAttribute("aria-label", `${role.name} Versus Beginner's Luck`);

    const text = document.createElement("span");
    text.textContent = "VERSUS";

    input.addEventListener("change", async event => {
      event.preventDefault();
      event.stopPropagation();
      input.disabled = true;
      try {
        await role.update({ "system.versus": Boolean(input.checked) });
      } catch (error) {
        input.checked = Boolean(role.system?.versus);
        console.error("Realm Guard | Could not update untrained Versus mode", error);
        ui.notifications.error(`Realm Guard: Could not update Versus mode for ${role.name}.`);
      } finally {
        input.disabled = false;
      }
    });

    label.append(input, text);
    actions.prepend(label);
  }
}

export function installUntrainedVersusUi(ActorSheetClass) {
  const proto = ActorSheetClass?.prototype;
  if (!proto || proto._rgUntrainedVersusUiWrapped) return;

  const original = proto._onRender;
  if (typeof original !== "function") return;

  proto._onRender = function(...args) {
    const result = original.apply(this, args);
    enhanceUntrainedVersusUi(this);
    return result;
  };

  Object.defineProperty(proto, "_rgUntrainedVersusUiWrapped", {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });
}
