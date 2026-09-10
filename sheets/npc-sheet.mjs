import { RealmGuardActorSheet } from "./actor-sheet.mjs";
import { isDefaultSkill } from "../module/default-skills.mjs";

const rgNpcDropBoundRoots = new WeakSet();

async function chooseNpcSkillRating(item, existing = null) {
  const esc = foundry.utils.escapeHTML;
  const current = Number(existing?.system?.rating ?? 0);
  const sourceRating = Number(item?.system?.rating ?? 0);
  const suggested = Math.max(1, Math.min(6, current > 0 ? current : sourceRating > 0 ? sourceRating : 2));
  return foundry.applications.api.DialogV2.wait({
    window: { title: "Realm Guard · Set NPC Skill", resizable: true },
    modal: false,
    rejectClose: false,
    content: `<div class="rg-npc-skill-drop-dialog"><h3>${esc(item.name)}</h3><p>Choose the trained rating this NPC should use for this Skill.</p><label><span>Skill Rating</span><div class="rg-npc-skill-rating"><input type="number" name="rating" min="1" max="6" step="1" value="${suggested}"><b>D</b></div></label><p><small>Canonical NPC Skills already exist at 0D and stay hidden until trained. Dropping a Skill here activates or updates that Skill; it does not create duplicates.</small></p></div>`,
    buttons: [
      { action: "save", label: current > 0 ? "Update Skill" : "Add Skill", icon: "fa-solid fa-check", default: true, callback: (_event, button) => Math.max(1, Math.min(6, Number(button.form?.elements?.rating?.value ?? suggested))) },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
}

export class RealmGuardNpcSheet extends RealmGuardActorSheet {
  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["realm-guard", "actor-sheet", "npc-sheet"],
    position: { width: 900, height: 720 },
    actions: {
      ...super.DEFAULT_OPTIONS.actions,
      clearNpcSkill: RealmGuardNpcSheet._clearNpcSkill
    }
  };

  static PARTS = {
    main: { template: "systems/realm-guard/templates/actor/npc.hbs" }
  };

  _onRender(context, options) {
    super._onRender(context, options);
    const root = this.element;
    if (!root || !this.isEditable) return;

    // ApplicationV2 can reuse the same root element across force-renders. Binding the
    // drop listeners on every render caused one physical drop to fire N handlers,
    // opening N identical dialogs and stacking N notifications. Bind once per root.
    if (rgNpcDropBoundRoots.has(root)) return;
    rgNpcDropBoundRoots.add(root);

    const allowed = new Set(["role", "wise", "trait", "gear", "condition", "talent", "tokenOfPower"]);
    const sectionFor = type => ({ role: ".rg-npc-skills", wise: ".rg-npc-wises", trait: ".rg-npc-side", gear: ".rg-npc-side", condition: ".rg-npc-side", talent: ".rg-npc-talents", tokenOfPower: ".rg-npc-token-panel" }[type] || ".rg-npc-sheet");
    const dragData = event => { try { return globalThis.TextEditor?.getDragEventData?.(event) ?? {}; } catch (_e) { return {}; } };
    const resolveItem = async data => {
      if (data?.type !== "Item") return null;
      const impl = Item.implementation ?? Item;
      if (typeof impl.fromDropData === "function") return await impl.fromDropData(data);
      if (data.uuid) return await fromUuid(data.uuid);
      return null;
    };

    let highlighted = null;
    root.addEventListener("dragover", event => {
      const data = dragData(event);
      if (data?.type !== "Item") return;
      event.preventDefault();
      root.classList.add("rg-npc-drop-active");
    });
    root.addEventListener("dragleave", event => {
      if (!root.contains(event.relatedTarget)) {
        root.classList.remove("rg-npc-drop-active");
        highlighted?.classList.remove("rg-npc-drop-target");
        highlighted = null;
      }
    });
    root.addEventListener("drop", async event => {
      const data = dragData(event);
      if (data?.type !== "Item") return;
      event.preventDefault();
      event.stopPropagation();

      // Guard against rapid/double drop delivery while a non-modal confirmation is open.
      if (this._rgNpcDropInProgress) return;
      this._rgNpcDropInProgress = true;
      try {
        const item = await resolveItem(data);
        if (!item || !allowed.has(item.type)) return;

        root.classList.remove("rg-npc-drop-active");
        const targetSection = root.querySelector(sectionFor(item.type));
        targetSection?.classList.add("rg-npc-drop-target");
        setTimeout(() => targetSection?.classList.remove("rg-npc-drop-target"), 500);

        const duplicate = this.actor.items.find(existing => existing.type === item.type && existing.name.toLowerCase() === item.name.toLowerCase());
        const source = item.toObject();
        delete source._id; delete source.folder; delete source.pack; delete source.ownership;
        source.flags = foundry.utils.deepClone(source.flags ?? {});

        // NPCs already carry the canonical Skill list at 0D. A Starter Skill drop is
        // therefore an ACTIVATE/SET-RATING action, not a destructive Replace action.
        // This also makes dropping a Skill from a compendium immediately useful.
        if (item.type === "role") {
          const rating = await chooseNpcSkillRating(item, duplicate);
          if (rating == null) return;

          if (duplicate) {
            const update = { "system.rating": rating };
            if (isDefaultSkill(duplicate)) update["flags.realm-guard.defaultSkill"] = true;
            await duplicate.update(update);
          } else {
            source.system = foundry.utils.deepClone(source.system ?? {});
            source.system.rating = rating;
            await this.actor.createEmbeddedDocuments("Item", [source]);
          }

          // No global success banner: the Skill becoming visible in Quick Skills is the
          // confirmation. Error/warning notifications remain available for failures.
          await this.render({ force: true });
          return;
        }

        if (duplicate) {
          const choice = await foundry.applications.api.DialogV2.wait({
            window: { title: "Realm Guard · NPC Drop", resizable: true },
            modal: false,
            rejectClose: false,
            content: `<div class="rg-npc-drop-confirm"><h3>${foundry.utils.escapeHTML(item.name)}</h3><p>This NPC already has a ${foundry.utils.escapeHTML(item.type)} with the same name.</p><p><small>Replace updates the existing embedded Item in place and avoids duplicate entries.</small></p></div>`,
            buttons: [
              { action: "replace", label: "Replace", icon: "fa-solid fa-arrows-rotate", default: true, callback: () => "replace" },
              { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
            ]
          });
          if (choice !== "replace") return;
          const update = foundry.utils.deepClone(source);
          delete update.name; delete update.type;
          await duplicate.update(update);
        } else {
          await this.actor.createEmbeddedDocuments("Item", [source]);
        }

        await this.render({ force: true });
      } catch (error) {
        console.error("Realm Guard | NPC drop failed", error);
        ui.notifications.error(`Realm Guard: ${error?.message || "NPC drop failed."}`);
      } finally {
        this._rgNpcDropInProgress = false;
        root.classList.remove("rg-npc-drop-active");
      }
    });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const iconForGear = name => {
      const value = String(name ?? "").toLowerCase();
      if (value.includes("shield")) return "fa-solid fa-shield-halved";
      if (value.includes("bow") || value.includes("sling")) return "fa-solid fa-bullseye";
      if (value.includes("sword") || value.includes("axe") || value.includes("dagger") || value.includes("knife") || value.includes("spear") || value.includes("halberd")) return "fa-solid fa-khanda";
      if (value.includes("mail") || value.includes("armor") || value.includes("armour") || value.includes("cloak")) return "fa-solid fa-shirt";
      if (value.includes("helmet") || value.includes("helm")) return "fa-solid fa-helmet-safety";
      return "fa-solid fa-box-open";
    };
    const locationLabel = item => {
      const inv = item.system?.inventory ?? {};
      const location = String(inv.location ?? "");
      const labels = {
        "left-hand": "Left Hand", "right-hand": "Right Hand", torso: "Torso", head: "Head", cloak: "Cloak", belt: "Belt", neck: "Neck", feet: "Feet", pocket: "Pocket"
      };
      if (labels[location]) return labels[location];
      if (inv.containerId) return "Packed";
      return "Unassigned";
    };
    return foundry.utils.mergeObject(context, {
      npcGear: (this.actor.gear ?? []).map(item => ({
        id: item.id,
        name: item.name,
        iconClass: iconForGear(item.name),
        locationLabel: locationLabel(item),
        quantityLabel: Number(item.system?.quantity ?? 1) > 1 ? `x${Number(item.system.quantity)}` : "",
        system: item.system
      }))
    }, { inplace: false });
  }

  static async _clearNpcSkill(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const role = this.actor.items.get(id);
    if (!role || role.type !== "role") return;
    if (isDefaultSkill(role)) {
      await role.update({
        "system.rating": 0,
        "system.learning.passed": 0,
        "system.learning.failed": 0,
        "system.beginnerAttempts": 0
      });
    } else {
      await this.actor.deleteEmbeddedDocuments("Item", [role.id]);
    }
    await this.render({ force: true });
  }
}
