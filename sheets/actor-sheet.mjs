import { isDefaultSkill } from "../module/default-skills.mjs";
import { toggleConditionActive, ensureDefaultConditions, isDefaultCondition, setConditionActive, conditionRollData, hasActiveCondition, validateRecoveryAttempt, recoveryMethods, beginRecoveryAttempt, finishRecoveryAttempt } from "../module/conditions.mjs";
import { playerTurnStatus, openDonateDialog, confirmFinishPlayer, currentTurnPhase, turnLabel, turnManagerEnabled } from "../module/turns.mjs";
import { buildInventoryView, placeGearInZone, placeGearInContainer, unassignGear, detachContainedGear } from "../module/inventory.mjs";
import { createInventoryTestGear } from "../module/qa-tools.mjs";
import { chooseRealmGuardArt } from "../module/theme-art.mjs";
import { openQuickTokenBuilder, openRangerPortraitEditor, rangerPortraitState, setRangerOriginalPortrait } from "../module/token-builder.mjs";
import { traitPositiveStatus } from "../module/traits.mjs";
import { tokenPowerOptionViews, tokenPowerEffectSummary, tokenPowerLinkSummary, tokenPowerLevel, tokenPowerUsed } from "../module/tokens-of-power.mjs";
import { progressionView, setProgressionTotals, spendTrackedResource } from "../module/progression.mjs";
import { abilityLearning, adjustAbilityLearning, recordAbilityTest, recordHelperSkillTest, abilityLabel } from "../module/advancement.mjs";
import { baselineObstacle, obstacleMode, obstacleDifficultyText, beginObstacleReview, obstacleReviewValue, finishObstacleReview } from "../module/obstacles.mjs";
import { diceFacesHtml } from "../module/dice-ui.mjs";
import { createTeamworkSession, teamworkEntries, finishTeamworkSession } from "../module/teamwork.mjs";
import { chooseTalentForActor, talentEffectSummary, talentLinkSummary, talentOptionViews, talentStateLabel, resolveTalentUse, commitTalentUse, postTalentUseChat } from "../module/talents.mjs";
const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

const RG_STATIONS = {
  recruit: { label: "Recruit", ageMin: 20, ageMax: 25, will: 2, health: 6, resources: 1, circles: 1 },
  scout: { label: "Scout", ageMin: 25, ageMax: 45, will: 3, health: 5, resources: 2, circles: 2 },
  veteran: { label: "Veteran", ageMin: 40, ageMax: 75, will: 4, health: 4, resources: 3, circles: 3 },
  captain: { label: "Captain", ageMin: 50, ageMax: 90, will: 5, health: 4, resources: 4, circles: 3 },
  lord: { label: "Lord", ageMin: 80, ageMax: 150, will: 6, health: 3, resources: 5, circles: 4 }
};

const RG_NS = "realm-guard";
const rgAutoLearningInFlight = new Set();


async function ensureRangerArtDirectory(picker) {
  const nested = "realm-guard/ranger-art";
  const fallback = "realm-guard-ranger-art";
  for (const dir of ["realm-guard", nested]) {
    try { await picker.createDirectory?.("data", dir, {}, { notify: false }); }
    catch (_error) { /* already exists */ }
  }
  if (picker.browse) {
    try { await picker.browse("data", nested, {}); return nested; }
    catch (_error) { /* fallback below */ }
  } else return nested;
  try { await picker.createDirectory?.("data", fallback, {}, { notify: false }); }
  catch (_error) { /* already exists */ }
  if (picker.browse) {
    try { await picker.browse("data", fallback, {}); return fallback; }
    catch (_error) { /* handled below */ }
  } else return fallback;
  throw new Error("Could not create a Ranger art upload folder in Foundry Data.");
}

async function uploadRangerPortrait(file) {
  if (!file || !String(file.type || "").startsWith("image/")) throw new Error("Drop an image file (PNG, JPG, WEBP, SVG, etc.).");
  const picker = globalThis.FilePicker ?? foundry.applications?.apps?.FilePicker?.implementation;
  if (!picker?.upload) throw new Error("Foundry FilePicker upload API is unavailable in this client.");
  const dir = await ensureRangerArtDirectory(picker);
  const response = await picker.upload("data", dir, file, {}, { notify: false });
  const path = response?.path ?? response?.paths?.[0];
  if (!path) throw new Error("Portrait upload did not return a usable path.");
  return path;
}

function isAutoLearningAuthority(actor) {
  const users = Array.from(game.users ?? []).filter(user => Boolean(user?.active));
  const ownerLevel = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
  const playerOwners = users
    .filter(user => !user.isGM && actor.testUserPermission?.(user, ownerLevel))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const gms = users.filter(user => user.isGM).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const authority = playerOwners[0] ?? gms[0] ?? game.user;
  return authority?.id === game.user?.id;
}

function skillAdvanceRequirements(rating) {
  const r = Number(rating ?? 0);
  if (r <= 0) return { passNeeded: null, failNeeded: null };
  if (r === 1) return { passNeeded: 1, failNeeded: 0 };
  return { passNeeded: r, failNeeded: r - 1 };
}

export class RealmGuardActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["realm-guard", "actor-sheet"],
    position: { width: 820, height: 760 },
    window: { resizable: true },
    form: { closeOnSubmit: false, submitOnChange: true, handler: RealmGuardActorSheet._onSubmit },
    actions: {
      createRole: RealmGuardActorSheet._createRole,
      createTrait: RealmGuardActorSheet._createTrait,
      createWise: RealmGuardActorSheet._createWise,
      createGear: RealmGuardActorSheet._createGear,
      createTokenOfPower: RealmGuardActorSheet._createTokenOfPower,
      createTalent: RealmGuardActorSheet._createTalent,
      chooseTalent: RealmGuardActorSheet._chooseTalent,
      manageProgression: RealmGuardActorSheet._manageProgression,
      createCondition: RealmGuardActorSheet._createCondition,
      addDefaultConditions: RealmGuardActorSheet._addDefaultConditions,
      deleteItem: RealmGuardActorSheet._deleteItem,
      rollRole: RealmGuardActorSheet._rollRole,
      rollUntrained: RealmGuardActorSheet._rollUntrained,
      rollAbility: RealmGuardActorSheet._rollAbility,
      toggleRoleVersus: RealmGuardActorSheet._toggleRoleVersus,
      learnPass: RealmGuardActorSheet._learnPass,
      unlearnPass: RealmGuardActorSheet._unlearnPass,
      learnFail: RealmGuardActorSheet._learnFail,
      unlearnFail: RealmGuardActorSheet._unlearnFail,
      abilityPassUp: RealmGuardActorSheet._abilityPassUp,
      abilityPassDown: RealmGuardActorSheet._abilityPassDown,
      abilityFailUp: RealmGuardActorSheet._abilityFailUp,
      abilityFailDown: RealmGuardActorSheet._abilityFailDown,
      editItem: RealmGuardActorSheet._editItem,
      toggleCondition: RealmGuardActorSheet._toggleCondition,
      recoverCondition: RealmGuardActorSheet._recoverCondition,
      fateDown: RealmGuardActorSheet._fateDown,
      fateUp: RealmGuardActorSheet._fateUp,
      personaDown: RealmGuardActorSheet._personaDown,
      personaUp: RealmGuardActorSheet._personaUp,
      checksDown: RealmGuardActorSheet._checksDown,
      checksUp: RealmGuardActorSheet._checksUp,
      manageNature: RealmGuardActorSheet._manageNature,
      turnDonate: RealmGuardActorSheet._turnDonate,
      turnDone: RealmGuardActorSheet._turnDone,
      gearUnassign: RealmGuardActorSheet._gearUnassign,
      createTestGear: RealmGuardActorSheet._createTestGear,
      chooseArt: RealmGuardActorSheet._chooseArt,
      tokenBuilder: RealmGuardActorSheet._tokenBuilder,
      portraitSettings: RealmGuardActorSheet._portraitSettings,
      customRoll: RealmGuardActorSheet._customRoll
    }
  };

  static PARTS = {
    main: { template: "systems/realm-guard/templates/actor/character.hbs" }
  };



  _rgActiveTab = "character";
  _rgConditionsOpen = false;

  _onRender(context, options) {
    super._onRender(context, options);
    const root = this.element;
    if (!root) return;

    const portraitWrap = root.querySelector(".rg-portrait-wrap");
    if (portraitWrap && this.isEditable && this.actor?.isOwner) {
      portraitWrap.addEventListener("dragover", event => {
        if (!event.dataTransfer?.types?.includes?.("Files")) return;
        event.preventDefault();
        portraitWrap.classList.add("rg-portrait-file-drop");
      });
      portraitWrap.addEventListener("dragleave", event => {
        if (!portraitWrap.contains(event.relatedTarget)) portraitWrap.classList.remove("rg-portrait-file-drop");
      });
      portraitWrap.addEventListener("drop", async event => {
        const file = event.dataTransfer?.files?.[0];
        if (!file) return;
        event.preventDefault(); event.stopPropagation();
        portraitWrap.classList.remove("rg-portrait-file-drop");
        try {
          const path = await uploadRangerPortrait(file);
          await setRangerOriginalPortrait(this.actor, path, { switchToOriginal: true });
          ui.notifications.info(`Realm Guard: Original Portrait loaded for ${this.actor.name}. Click the portrait to frame it, or open Token Builder when you are ready to create the token.`);
          await this.render({ force: true });
        } catch (error) {
          console.error("Realm Guard | Ranger portrait image drop failed", error);
          ui.notifications.error(`Realm Guard: ${error.message || "Could not upload the Ranger portrait."}`);
        }
      });
    }
    const portraitStage = root.querySelector("[data-rg-portrait-stage]");
    const portraitImage = root.querySelector("[data-rg-portrait-image]");
    const refreshPortrait = () => {
      if (!portraitStage || !portraitImage) return;
      const stageW = Math.max(1, portraitStage.clientWidth || 104);
      const stageH = Math.max(1, portraitStage.clientHeight || stageW);
      const iw = Math.max(1, Number(portraitImage.naturalWidth || stageW));
      const ih = Math.max(1, Number(portraitImage.naturalHeight || stageH));
      const fit = String(portraitStage.dataset.rgPortraitFit || "cover") === "contain" ? "contain" : "cover";
      const ratio = fit === "contain" ? Math.min(stageW / iw, stageH / ih) : Math.max(stageW / iw, stageH / ih);
      const zoom = Math.max(0.25, Math.min(5, Number(portraitStage.dataset.rgPortraitZoom || 1)));
      const offsetX = Math.max(-150, Math.min(150, Number(portraitStage.dataset.rgPortraitX || 0)));
      const offsetY = Math.max(-150, Math.min(150, Number(portraitStage.dataset.rgPortraitY || 0)));
      portraitImage.style.width = `${iw * ratio * zoom}px`;
      portraitImage.style.height = `${ih * ratio * zoom}px`;
      portraitImage.style.left = `${stageW / 2 + stageW * offsetX / 100}px`;
      portraitImage.style.top = `${stageH / 2 + stageH * offsetY / 100}px`;
      portraitImage.style.transform = "translate(-50%, -50%)";
    };
    portraitImage?.addEventListener("load", refreshPortrait);
    if (portraitStage && globalThis.ResizeObserver) new ResizeObserver(() => refreshPortrait()).observe(portraitStage);
    refreshPortrait();

    const activate = (tab) => {
      this._rgActiveTab = tab;
      for (const b of root.querySelectorAll("[data-rg-tab]")) b.classList.toggle("active", b.dataset.rgTab === tab);
      for (const p of root.querySelectorAll("[data-rg-page]")) p.classList.toggle("active", p.dataset.rgPage === tab);
    };
    activate(this._rgActiveTab);

    const conditionToggle = root.querySelector("[data-rg-conditions-toggle]");
    const conditionDropdown = root.querySelector("[data-rg-conditions-dropdown]");
    const setConditionsOpen = (open) => {
      this._rgConditionsOpen = Boolean(open);
      conditionDropdown?.classList.toggle("is-open", this._rgConditionsOpen);
      conditionToggle?.setAttribute("aria-expanded", String(this._rgConditionsOpen));
    };
    setConditionsOpen(this._rgConditionsOpen);
    conditionToggle?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      setConditionsOpen(!this._rgConditionsOpen);
    });
    root.querySelector("[data-rg-conditions-close]")?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      setConditionsOpen(false);
    });
    root.addEventListener("pointerdown", event => {
      if (!this._rgConditionsOpen) return;
      if (event.target?.closest?.(".rg-condition-launch")) return;
      setConditionsOpen(false);
    });

    for (const button of root.querySelectorAll("[data-rg-tab]")) {
      button.addEventListener("click", event => {
        event.preventDefault();
        activate(button.dataset.rgTab);
      });
    }

    const stationSelect = root.querySelector("[data-rg-station-select]");
    stationSelect?.addEventListener("change", async event => {
      event.preventDefault();
      const previous = String(this.actor.system.rank ?? "").toLowerCase();
      const next = String(stationSelect.value ?? "").toLowerCase();
      if (previous === next) return;
      if (!next || !RG_STATIONS[next]) {
        await this.actor.update({ "system.rank": next });
        return;
      }

      const station = RG_STATIONS[next];
      let applyDefaults = !previous;
      if (previous) {
        const DialogV2 = foundry.applications.api.DialogV2;
        const result = await DialogV2.wait({
          window: { title: `Realm Guard · Change Station to ${station.label}`, resizable: true },
          content: `<div class="rg-station-confirm"><p>Apply ${station.label} starting values?</p><p><b>Will ${station.will} · Health ${station.health} · Resources ${station.resources} · Circles ${station.circles}</b></p><p>Age range: ${station.ageMin}–${station.ageMax}. Nature is not changed.</p></div>`,
          modal: false, rejectClose: false,
          buttons: [
            { action: "apply", label: "Apply Starting Values", default: true, callback: () => "apply" },
            { action: "keep", label: "Keep Current Values", callback: () => "keep" },
            { action: "cancel", label: "Cancel", callback: () => "cancel" }
          ]
        });
        if (!result || result === "cancel") { stationSelect.value = previous; return; }
        applyDefaults = result === "apply";
      }

      const update = { "system.rank": next };
      if (applyDefaults) {
        update["system.attributes.will.value"] = station.will;
        update["system.attributes.health.value"] = station.health;
        update["system.attributes.resources.value"] = station.resources;
        update["system.attributes.circles.value"] = station.circles;
      }
      await this.actor.update(update);
      const age = Number(this.actor.system.age || 0);
      if (age && (age < station.ageMin || age > station.ageMax)) {
        ui.notifications.warn(`Realm Guard: ${station.label} age should be ${station.ageMin}–${station.ageMax}. Current age was kept.`);
      }
    });

    const readDraggedGearId = event => {
      const direct = event.dataTransfer?.getData("application/x-realm-guard-gear");
      if (direct) return direct;
      const plain = event.dataTransfer?.getData("text/plain") || "";
      return plain.startsWith("rg-gear:") ? plain.slice(8) : "";
    };
    for (const item of root.querySelectorAll("[data-rg-gear-id]")) {
      item.draggable = Boolean(this.isEditable);
      item.addEventListener("dragstart", event => {
        if (!this.isEditable) return event.preventDefault();
        const id = item.dataset.rgGearId;
        event.dataTransfer?.setData("application/x-realm-guard-gear", id);
        event.dataTransfer?.setData("text/plain", `rg-gear:${id}`);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        item.classList.add("is-dragging");
      });
      item.addEventListener("dragend", () => item.classList.remove("is-dragging"));
    }
    const bindDrop = (element, handler) => {
      element.addEventListener("dragover", event => { if (readDraggedGearId(event)) { event.preventDefault(); element.classList.add("is-dragover"); } });
      element.addEventListener("dragleave", () => element.classList.remove("is-dragover"));
      element.addEventListener("drop", async event => {
        const id = readDraggedGearId(event);
        if (!id || !this.isEditable) return;
        event.preventDefault();
        element.classList.remove("is-dragover");
        const result = await handler(id);
        if (!result?.ok) return ui.notifications.warn(`Realm Guard: ${result?.reason ?? "Inventory move failed."}`);
        await this.render({ force: true });
      });
    };
    for (const zone of root.querySelectorAll("[data-rg-inventory-zone]")) {
      bindDrop(zone, id => placeGearInZone(this.actor, id, zone.dataset.rgInventoryZone));
    }
    for (const container of root.querySelectorAll("[data-rg-inventory-container]")) {
      bindDrop(container, id => placeGearInContainer(this.actor, id, container.dataset.rgInventoryContainer));
    }
    for (const loose of root.querySelectorAll("[data-rg-inventory-unassigned]")) {
      bindDrop(loose, id => unassignGear(this.actor, id));
    }
  }

  static async _onSubmit(event, form, formData) {
    if (!this.isEditable) return;
    await this.actor.update(formData.object);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.actor;
    const storedNatureCurrent = Number(actor.system.attributes?.nature?.value ?? 0);
    const storedNatureMaximum = Number(actor.system.attributes?.nature?.maximum ?? 0);
    if (storedNatureMaximum < storedNatureCurrent) await actor.update({ "system.attributes.nature.maximum": storedNatureCurrent });
    // v1.0.5: resolve any READY Skill carried in from the manual-advance era before rendering.
    if (this.isEditable) {
      for (const role of actor.roles) {
        const rating = Number(role.system.rating ?? 0);
        if (rating <= 0 || rating >= 6) continue;
        const req = skillAdvanceRequirements(rating);
        const learning = role.system.learning ?? {};
        if (Number(learning.passed ?? 0) >= req.passNeeded && Number(learning.failed ?? 0) >= req.failNeeded) {
          await RealmGuardActorSheet._autoAdvanceRole.call(this, role);
        }
      }
      const beginnerNeeded = Math.max(1, Number(actor.system.attributes?.nature?.maximum ?? actor.system.attributes?.nature?.value ?? 1));
      for (const role of actor.roles) {
        if (Number(role.system.rating ?? 0) <= 0 && Number(role.system.beginnerAttempts ?? 0) >= beginnerNeeded) {
          await RealmGuardActorSheet._autoLearnSkill.call(this, role, { render: false });
        }
      }
    }
    const roleViews = actor.roles.map(role => {
      const rating = Number(role.system.rating ?? 0);
      const requirements = skillAdvanceRequirements(rating);
      const passed = Number(role.system.learning?.passed ?? 0);
      const failed = Number(role.system.learning?.failed ?? 0);
      return {
        document: role, id: role.id, name: role.name, system: role.system, rating,
        untrained: rating <= 0,
        beginnerAbility: String(role.system.beginnerAbility ?? ""),
        beginnerAttempts: Number(role.system.beginnerAttempts ?? 0),
        beginnerNeeded: Math.max(1, Number(actor.system.attributes?.nature?.maximum ?? actor.system.attributes?.nature?.value ?? 1)),
        beginnerReady: rating <= 0 && Number(role.system.beginnerAttempts ?? 0) >= Math.max(1, Number(actor.system.attributes?.nature?.maximum ?? actor.system.attributes?.nature?.value ?? 1)),
        passNeeded: requirements.passNeeded,
        failNeeded: requirements.failNeeded,
        advancementReady: rating > 0 && rating < 6 && passed >= requirements.passNeeded && failed >= requirements.failNeeded,
        maxRating: rating >= 6,
        passProgress: requirements.passNeeded ? Math.min(100, Math.round((passed / requirements.passNeeded) * 100)) : 100,
        failProgress: requirements.failNeeded ? Math.min(100, Math.round((failed / requirements.failNeeded) * 100)) : 100
      };
    });
    const trainedRoles = roleViews
      .filter(role => !role.untrained)
      .sort((a, b) => (b.rating - a.rating) || a.name.localeCompare(b.name));
    const untrainedRoles = roleViews
      .filter(role => role.untrained)
      .sort((a, b) => a.name.localeCompare(b.name));
    const tokenPowers = actor.tokensOfPower.map(token => {
      const level = tokenPowerLevel(token);
      const used = tokenPowerUsed(token);
      const oncePerSession = level === 1 || level === 3;
      return {
        document: token, id: token.id, name: token.name, system: token.system, level, used, oncePerSession,
        stateLabel: level === 2 ? "ALWAYS" : used ? "USED" : "READY",
        linkSummary: tokenPowerLinkSummary(token),
        effectSummary: tokenPowerEffectSummary(token),
        specific: String(token.system?.linkType ?? "skill") === "specific",
        manual: String(token.system?.effectMode ?? "level") === "manual",
        canManage: Boolean(game.user?.isGM)
      };
    }).sort((a, b) => (b.level - a.level) || a.name.localeCompare(b.name));
    const progression = progressionView(actor);
    const portrait = rangerPortraitState(actor);
    const talents = actor.talents.map(talent => ({
      document: talent,
      id: talent.id,
      name: talent.name,
      system: talent.system,
      effectSummary: talentEffectSummary(talent),
      linkSummary: talentLinkSummary(talent),
      stateLabel: talentStateLabel(talent),
      descriptionText: String(talent.system?.description ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
      used: Boolean(talent.system?.session?.used),
      canManage: Boolean(game.user?.isGM)
    })).sort((a, b) => a.name.localeCompare(b.name));

    return foundry.utils.mergeObject(context, {
      actor,
      system: actor.system,
      roles: roleViews,
      trainedRoles,
      untrainedRoles,
      trainedRoleCount: trainedRoles.length,
      untrainedRoleCount: untrainedRoles.length,
      stationOptions: Object.fromEntries(Object.entries(RG_STATIONS).map(([key, value]) => [key, value.label])),
      stationSelected: String(actor.system.rank ?? "").toLowerCase(),
      station: RG_STATIONS[String(actor.system.rank ?? "").toLowerCase()] ?? null,
      traits: actor.traits,
      wises: actor.wises,
      gear: actor.gear,
      tokenPowers,
      talents,
      progression,
      portrait,
      inventory: buildInventoryView(actor),
      conditions: actor.conditions,
      activeConditionCount: actor.conditions.filter(condition => Boolean(condition.system?.active)).length,
      natureCurrent: Number(actor.system.attributes?.nature?.value ?? 0),
      natureMaximum: Math.max(Number(actor.system.attributes?.nature?.value ?? 0), Number(actor.system.attributes?.nature?.maximum ?? actor.system.attributes?.nature?.value ?? 0)),
      natureTax: Math.max(0, Number(actor.system.attributes?.nature?.maximum ?? actor.system.attributes?.nature?.value ?? 0) - Number(actor.system.attributes?.nature?.value ?? 0)),
      abilityAdvancement: Object.fromEntries(["nature", "will", "health", "resources", "circles"].map(key => [key, abilityLearning(actor, key)])),
      editable: this.isEditable,
      isGM: Boolean(game.user?.isGM),
      canChooseTalent: Boolean(game.user?.isGM || actor.testUserPermission?.(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)),
      turn: actor.type === "character" ? playerTurnStatus(actor) : null
    }, { inplace: false });
  }

  static async _createItem(event, target, type, name) {
    await this.actor.createEmbeddedDocuments("Item", [{ name, type }]);
  }
  static _createRole(e,t){ return RealmGuardActorSheet._createItem.call(this,e,t,"role","New Role"); }
  static _createTrait(e,t){ return RealmGuardActorSheet._createItem.call(this,e,t,"trait","New Trait"); }
  static _createWise(e,t){ return RealmGuardActorSheet._createItem.call(this,e,t,"wise","New Wise"); }
  static _createGear(e,t){ return RealmGuardActorSheet._createItem.call(this,e,t,"gear","New Gear"); }
  static _createTokenOfPower(e,t){
    if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Tokens of Power are created and assigned by the GM.");
    return RealmGuardActorSheet._createItem.call(this,e,t,"tokenOfPower","New Token of Power");
  }
  static _createTalent(e,t){
    if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Custom Talent definitions are GM-managed.");
    return RealmGuardActorSheet._createItem.call(this,e,t,"talent","New Talent");
  }
  static async _chooseTalent(){
    const created = await chooseTalentForActor(this.actor);
    if (created) await this.render({ force: true });
  }
  static async _manageProgression(){
    if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Lifetime progression counters are GM-managed.");
    const view = progressionView(this.actor);
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: `Realm Guard · Progression · ${foundry.utils.escapeHTML(this.actor.name)}`, resizable: true },
      content: `<div class="rg-progression-admin"><p>Use this only to credit historical spend from sessions played before v0.23. Normal committed Fate/Persona spending is tracked automatically.</p><div class="rg-grid-4 compact"><label>Lifetime Fate spent <input type="number" name="spentFate" min="0" value="${view.spentFate}"></label><label>Lifetime Persona spent <input type="number" name="spentPersona" min="0" value="${view.spentPersona}"></label></div><p><b>Level is derived automatically from both totals.</b></p></div>`,
      modal: false, rejectClose: false,
      buttons: [
        { action: "save", label: "Save Progression", icon: "fa-solid fa-floppy-disk", default: true, callback: (_e,b) => ({ fate: Number(b.form?.elements?.spentFate?.value ?? 0), persona: Number(b.form?.elements?.spentPersona?.value ?? 0) }) },
        { action: "cancel", label: "Cancel", callback: () => null }
      ]
    });
    if (!result) return;
    const updated = await setProgressionTotals(this.actor, result.fate, result.persona);
    if (updated?.ok) { ui.notifications.info(`Realm Guard: Progression updated · Level ${updated.level}.`); await this.render({ force: true }); }
  }
  static _talentUse(talentId, sourceName, { isSkill = true } = {}) {
    return resolveTalentUse(this.actor, talentId, sourceName, { isSkill });
  }
  static async _commitTalentAfterRoll(use, label) {
    if (!use?.talent) return;
    await commitTalentUse(use);
    await postTalentUseChat(this.actor, use, { label });
  }
  static _createCondition(e,t){ return RealmGuardActorSheet._createItem.call(this,e,t,"condition","New Condition"); }
  static async _addDefaultConditions(){
    const created = await ensureDefaultConditions(this.actor);
    ui.notifications.info(created.length ? `Realm Guard: Added ${created.length} default Conditions.` : "Realm Guard: Default Conditions are already present.");
  }

  static async _editItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    if (["tokenOfPower", "talent"].includes(item?.type) && !game.user?.isGM) return ui.notifications.warn("Realm Guard: Token of Power and Talent definitions are GM-managed.");
    if (item) item.sheet.render(true);
  }

  static async _deleteItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    if (["tokenOfPower", "talent"].includes(item.type) && !game.user?.isGM) return ui.notifications.warn("Realm Guard: Tokens of Power and Talents are GM-managed and cannot be deleted by players.");
    if (item.type === "condition" && isDefaultCondition(item)) return ui.notifications.warn("Realm Guard: Default Conditions cannot be deleted.");
    if (item.type === "role" && isDefaultSkill(item)) return ui.notifications.warn("Realm Guard: Default Skills cannot be deleted. Set Rating to 0 if the character is untrained.");
    if (item.type === "gear") await detachContainedGear(this.actor, item.id);
    await this.actor.deleteEmbeddedDocuments("Item", [id]);
  }


  static async _createTestGear() {
    const created = await createInventoryTestGear(this.actor);
    if (created?.length) await this.render({ force: true });
  }

  static async _chooseArt() {
    await chooseRealmGuardArt(this.actor);
    await this.render({ force: true });
  }

  static async _tokenBuilder() {
    await openQuickTokenBuilder(this.actor);
  }

  static async _portraitSettings() {
    await openRangerPortraitEditor(this.actor);
    await this.render({ force: true });
  }

  static async _gearUnassign(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    if (!id) return;
    const result = await unassignGear(this.actor, id);
    if (!result.ok) return ui.notifications.warn(`Realm Guard: ${result.reason}`);
    await this.render({ force: true });
  }

  static _versusRuleOptions(skillName) {
    const key = String(skillName ?? "").trim().toLowerCase();
    const rules = {
      "fighter": [
        { kind: "role", name: "Fighter", basis: "Fighter vs Fighter" },
        { kind: "ability", name: "Nature", key: "nature", basis: "Fighter vs Nature" }
      ],
      "scout": [
        { kind: "role", name: "Scout", basis: "Scout vs Scout" },
        { kind: "ability", name: "Nature", key: "nature", basis: "Scout vs Nature" }
      ],
      "persuader": [
        { kind: "ability", name: "Will", key: "will", basis: "Persuader vs Will" },
        { kind: "role", name: "Persuader", basis: "Persuader vs Persuader" },
        { kind: "role", name: "Deceiver", basis: "Persuader vs Deceiver" }
      ],
      "deceiver": [
        { kind: "ability", name: "Will", key: "will", basis: "Deceiver vs Will" },
        { kind: "role", name: "Deceiver", basis: "Deceiver vs Deceiver" },
        { kind: "role", name: "Persuader", basis: "Deceiver vs Persuader" }
      ],
      "orator": [
        { kind: "ability", name: "Will", key: "will", basis: "Orator vs Will" },
        { kind: "role", name: "Orator", basis: "Orator vs Orator" }
      ],
      "haggler": [
        { kind: "ability", name: "Will", key: "will", basis: "Haggler vs Will" },
        { kind: "role", name: "Haggler", basis: "Haggler vs Haggler" }
      ],
      "hunter": [
        { kind: "ability", name: "Nature", key: "nature", basis: "Hunter vs Nature" }
      ],
      "lore master": [
        { kind: "ability", name: "Nature", key: "nature", basis: "Lore Master vs Nature" }
      ],
      "pathfinder": [
        { kind: "role", name: "Pathfinder", basis: "Pathfinder vs Pathfinder" }
      ]
    };
    return rules[key] ?? [];
  }

  static _availableVersusOpposition(skillName, opponent) {
    if (!opponent) return [];
    const configured = RealmGuardActorSheet._versusRuleOptions(skillName);
    const candidates = [];
    for (const option of configured) {
      if (option.kind === "ability") {
        const stat = opponent.system.attributes?.[option.key];
        const rating = Number(stat?.value ?? 0);
        if (rating > 0) candidates.push({ ...option, id: `ability:${option.key}`, rating, ruleAware: true });
      } else {
        const item = opponent.items.find(i => i.type === "role" && i.name.toLowerCase() === option.name.toLowerCase());
        const rating = Number(item?.system.rating ?? 0);
        if (item && rating > 0) candidates.push({ ...option, id: `role:${item.id}`, itemId: item.id, rating, ruleAware: true });
      }
    }

    // For skills without an explicit simple-versus mapping in the source rules, keep only
    // a same-skill opposition when the target actually possesses that trained skill.
    // Never fall back to the target's highest unrelated skill.
    if (!configured.length) {
      const same = opponent.items.find(i => i.type === "role" && i.name.toLowerCase() === String(skillName).toLowerCase() && Number(i.system.rating ?? 0) > 0);
      if (same) candidates.push({ kind: "role", name: same.name, id: `role:${same.id}`, itemId: same.id, rating: Number(same.system.rating ?? 0), basis: "Same-skill opposed test", ruleAware: false });
    }
    return candidates;
  }

  static _resolveVersusOpposition(opponent, oppositionId) {
    const raw = String(oppositionId ?? "");
    if (raw.startsWith("ability:")) {
      const key = raw.slice(8);
      const stat = opponent?.system.attributes?.[key];
      if (!stat) return null;
      return { kind: "ability", key, name: key.charAt(0).toUpperCase() + key.slice(1), rating: Number(stat.value ?? 0) };
    }
    if (raw.startsWith("role:")) {
      const item = opponent?.items.get(raw.slice(5));
      if (!item || item.type !== "role") return null;
      return { kind: "role", item, name: item.name, rating: Number(item.system.rating ?? 0) };
    }
    return null;
  }

  static async _rollUntrained(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const role = this.actor.items.get(id);
    if (!role || Number(role.system.rating ?? 0) > 0) return;
    let abilityKey = String(role.system.beginnerAbility ?? "").toLowerCase();
    if (!abilityKey) {
      const suggested = this.actor._tiebreakOptions(role.name, "role");
      if (suggested.length === 1) abilityKey = suggested[0];
      else {
        const choice = await foundry.applications.api.DialogV2.wait({
          window: { title: `Realm Guard · Beginner's Luck · ${role.name}`, resizable: true }, modal: false, rejectClose: false,
          content: `<div class="rg-beginner-choice"><p><b>${foundry.utils.escapeHTML(role.name)}</b> is untrained.</p><p>Choose the base ability for this Skill. Physical Skills use Health; mental/social Skills use Will.</p><label>Base ability <select name="ability"><option value="will">Will</option><option value="health">Health</option></select></label></div>`,
          buttons: [
            { action: "use", label: "Use Beginner's Luck", default: true, callback: (_e,b) => b.form?.elements?.ability?.value || "will" },
            { action: "cancel", label: "Cancel", callback: () => null }
          ]
        });
        if (!choice) return;
        abilityKey = choice;
      }
      await role.update({ "system.beginnerAbility": abilityKey });
    }
    if (hasActiveCondition(this.actor, "Afraid")) return ui.notifications.warn("Realm Guard: Afraid Rangers cannot use Beginner's Luck. Use Nature when appropriate or recover first.");
    const ability = this.actor.system.attributes?.[abilityKey];
    const abilityValue = Number(ability?.value ?? 0);
    if (abilityValue <= 0) return ui.notifications.warn(`Realm Guard: ${abilityKey === "health" ? "Health" : "Will"} is 0. Beginner's Luck cannot be used; recover first or use Nature.`);
    const versus = Boolean(role.system.versus);
    const defaults = { obstacle: 1, modifier: 0 };
    const options = await RealmGuardActorSheet._openRollDialog.call(this, role, { versus, ...defaults, beginnerLuck: true, beginnerAbility: abilityKey });
    if (!options) return;
    const { obstacle, modifier, extraDice: rawExtraDice, help, persona, countLearning, traitId, traitMode, wiseId, tokenPowerId, talentId, oppositionId, tapNature, natureScope } = options;
    const talentUse = RealmGuardActorSheet._talentUse.call(this, talentId, role.name, { isSkill: true });
    if (talentId && !talentUse) return ui.notifications.warn("Realm Guard: That Talent is used, unavailable, or does not match this Skill.");
    const extraDice = Math.max(0, Number(rawExtraDice ?? 0)) + Number(talentUse?.diceBonus ?? 0);
    const personaCost = Number(persona || 0) + (tapNature ? 1 : 0);
    if (personaCost > Number(this.actor.system.resources.persona.value ?? 0)) return ui.notifications.warn(`Realm Guard: This roll requires ${personaCost} Persona.`);
    let opposition = null, opponent = null;
    if (versus && game.user.targets.size === 1) {
      opponent = [...game.user.targets][0]?.actor ?? null;
      opposition = opponent ? RealmGuardActorSheet._resolveVersusOpposition(opponent, oppositionId) : null;
      if (!opposition || opposition.rating <= 0) return ui.notifications.warn("Realm Guard: Choose a valid Versus opposition.");
    }
    const result = await this.actor.rollBeginnerLuck(role, { abilityKey, modifier, extraDice, help, obstacle, persona, traitId, traitMode, wiseId, tokenPowerId, opponent, opposition, countLearning, tapNature, natureScope });
    if (!result) return;
    await RealmGuardActorSheet._commitTalentAfterRoll.call(this, talentUse, `${role.name} · Beginner's Luck`);
    await RealmGuardActorSheet._commitSynergy.call(this, help, result, `${role.name} · Beginner's Luck`);
    if (personaCost) await spendTrackedResource(this.actor, "persona", personaCost, { reason: `Beginner's Luck · ${role.name}${tapNature ? " · Tap Nature" : ""}` });
    if (countLearning && !result.tied) {
      const current = this.actor.items.get(role.id);
      const needed = Math.max(1, Number(this.actor.system.attributes?.nature?.maximum ?? this.actor.system.attributes?.nature?.value ?? 1));
      const attempts = Math.min(needed, Number(current.system.beginnerAttempts ?? 0) + 1);
      const learningUpdate = { "system.beginnerAttempts": attempts };
      if (attempts >= needed) learningUpdate["flags.realm-guard.autoLearnRequestedBy"] = game.user.id;
      await current.update(learningUpdate);
      if (attempts >= needed) await RealmGuardActorSheet._autoLearnSkill.call(this, current);
      else await this.render({ force: true });
    }
  }

  static async _autoLearnSkill(role, { render = true } = {}) {
    const roleId = role?.id ?? role;
    const lockKey = `${this.actor.id}:${roleId}`;
    if (rgAutoLearningInFlight.has(lockKey)) return false;
    rgAutoLearningInFlight.add(lockKey);
    try {
      const current = this.actor.items.get(roleId);
      if (!current || Number(current.system.rating ?? 0) > 0) return false;
      const requestedBy = String(current.getFlag?.(RG_NS, "autoLearnRequestedBy") ?? "");
      if (requestedBy && requestedBy !== String(game.user?.id ?? "")) return false;
      if (!requestedBy && !isAutoLearningAuthority(this.actor)) return false;
      const needed = Math.max(1, Number(this.actor.system.attributes?.nature?.maximum ?? this.actor.system.attributes?.nature?.value ?? 1));
      if (Number(current.system.beginnerAttempts ?? 0) < needed) return false;
      await current.update({
        "system.rating": 2,
        "system.beginnerAttempts": 0,
        "system.learning.passed": 0,
        "system.learning.failed": 0,
        "system.learning.passNeeded": 2,
        "system.learning.failNeeded": 1,
        "flags.realm-guard.autoLearnedAt": Date.now(),
        "flags.realm-guard.-=autoLearnRequestedBy": null
      });
      const refreshed = this.actor.items.get(roleId);
      if (!refreshed || Number(refreshed.system.rating ?? 0) !== 2) return false;
      const esc = foundry.utils.escapeHTML;
      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: `<div class="realm-guard rg-advancement-chat rg-celebration-chat rg-skill-learned-chat"><div class="rg-celebration-kicker">✦ NEW SKILL LEARNED! ✦</div><h2>Congratulations, ${esc(this.actor.name)}!</h2><h3>${esc(refreshed.name)} is now Rating 2</h3><p>Practice, setbacks and persistence have paid off. <b>${esc(refreshed.name)}</b> is now a trained Skill.</p><p class="rg-celebration-foot">Normal advancement begins now: 2 Pass / 1 Fail.</p></div>` });
      ui.notifications.info(`Realm Guard: ${refreshed.name} learned automatically at Rating 2.`);
      if (render) await this.render({ force: true });
      return true;
    } finally {
      rgAutoLearningInFlight.delete(lockKey);
    }
  }

  static async _learnSkill(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    return RealmGuardActorSheet._autoLearnSkill.call(this, this.actor.items.get(id));
  }

  static async _rollRole(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const role = this.actor.items.get(id);
    if (!role) return;
    if (Number(role.system.rating ?? 0) <= 0) {
      return ui.notifications.warn(`Realm Guard: ${role.name} is UNTRAINED. Beginner's Luck / skill-learning is introduced in the later Learning layer.`);
    }
    const versus = Boolean(role.system.versus);
    const defaults = { obstacle: 1, modifier: 0 };
    const options = await RealmGuardActorSheet._openRollDialog.call(this, role, { versus, ...defaults });
    if (!options) return;
    const { obstacle, modifier, extraDice: rawExtraDice, help, persona, countLearning, traitId, traitMode, wiseId, tokenPowerId, talentId, oppositionId, tapNature, natureScope } = options;
    const talentUse = RealmGuardActorSheet._talentUse.call(this, talentId, role.name, { isSkill: true });
    if (talentId && !talentUse) return ui.notifications.warn("Realm Guard: That Talent is used, unavailable, or does not match this Skill.");
    const extraDice = Math.max(0, Number(rawExtraDice ?? 0)) + Number(talentUse?.diceBonus ?? 0);
    const personaCost = Number(persona || 0) + (tapNature ? 1 : 0);
    if (personaCost && Number(this.actor.system.resources.persona.value ?? 0) < personaCost) return ui.notifications.warn(`Realm Guard: This roll requires ${personaCost} Persona.`);
    let result;
    if (versus && game.user.targets.size === 1) {
      const targetToken = [...game.user.targets][0];
      const opponent = targetToken?.actor;
      if (!opponent) return ui.notifications.warn("Realm Guard: Target has no Actor.");
      const opposition = RealmGuardActorSheet._resolveVersusOpposition(opponent, oppositionId);
      if (!opposition || opposition.rating <= 0) {
        return ui.notifications.warn(`Realm Guard: Choose a valid Versus opposition for ${opponent.name}.`);
      }
      result = await this.actor.rollAutomaticVersus(role, opponent, opposition, { modifier, extraDice, help, persona, traitId, traitMode, wiseId, tokenPowerId, tapNature, natureScope });
    } else {
      if (versus && game.user.targets.size > 1) ui.notifications.warn("Realm Guard: Automatic Versus needs exactly one target; using manual Obstacle instead.");
      result = await this.actor.rollRole(role, { modifier, extraDice, help, obstacle, versus, persona, traitId, traitMode, wiseId, tokenPowerId, tapNature, natureScope });
    }
    if (result) {
      await RealmGuardActorSheet._commitTalentAfterRoll.call(this, talentUse, role.name);
      await RealmGuardActorSheet._commitSynergy.call(this, help, result, `${role.name} Help`);
      if (personaCost) await spendTrackedResource(this.actor, "persona", personaCost, { reason: `${role.name}${tapNature ? " · Tap Nature" : ""}` });
      const learningResult = Object.prototype.hasOwnProperty.call(result, "learningResult") ? result.learningResult : result.passed;
      if (countLearning && !result.tied && learningResult !== null && learningResult !== undefined) {
        await RealmGuardActorSheet._recordLearning.call(this, role, Boolean(learningResult));
      }
    }
  }

  static async _rollAbility(event, target) {
    const key = String(target.dataset.ability || "").toLowerCase();
    if (!key || !this.actor.system.attributes?.[key]) return;
    const ability = { name: abilityLabel(key), system: { rating: Number(this.actor.system.attributes[key].value ?? 0) } };
    const defaults = { obstacle: 1, modifier: 0 };
    const targets = Array.from(game.user.targets ?? []);
    const natureTarget = key === "nature" && targets.length === 1 ? targets[0].actor : null;
    const options = await RealmGuardActorSheet._openRollDialog.call(this, ability, { versus: false, ...defaults, isSkill: false, abilityKey: key, natureTarget });
    if (!options) return;
    const { obstacle, modifier, extraDice: rawExtraDice, help, persona, countLearning, traitId, traitMode, wiseId, tokenPowerId, talentId, tapNature, natureScope, natureUse, doubleTapNature, natureVersus } = options;
    const talentUse = RealmGuardActorSheet._talentUse.call(this, talentId, ability.name, { isSkill: false });
    if (talentId && !talentUse) return ui.notifications.warn("Realm Guard: That Talent is used, unavailable, or does not match this Ability.");
    const extraDice = Math.max(0, Number(rawExtraDice ?? 0)) + Number(talentUse?.diceBonus ?? 0);
    const personaCost = Number(persona || 0) + (tapNature ? 1 : 0) + (doubleTapNature ? 1 : 0);
    if (personaCost && Number(this.actor.system.resources.persona.value ?? 0) < personaCost) return ui.notifications.warn(`Realm Guard: This roll requires ${personaCost} Persona.`);
    if (doubleTapNature && natureUse !== "within") return ui.notifications.warn("Realm Guard: Double-Tapping Nature is only available while acting within Nature.");
    const result = key === "nature" && natureVersus && natureTarget
      ? await this.actor.rollNatureVersus(natureTarget, { modifier, extraDice, help, persona, traitId, traitMode, wiseId, tokenPowerId, natureUse, doubleTapNature })
      : await this.actor.rollAbility(key, { modifier, extraDice, help, obstacle, persona, traitId, traitMode, wiseId, tokenPowerId, tapNature, natureScope, natureUse, doubleTapNature });
    if (!result) return;
    await RealmGuardActorSheet._commitTalentAfterRoll.call(this, talentUse, ability.name);
    if (personaCost) await spendTrackedResource(this.actor, "persona", personaCost, { reason: `${ability.name} roll` });
    await RealmGuardActorSheet._commitSynergy.call(this, help, result, `${ability.name} Help`);
    if (countLearning && !result.tied && result.passed !== null && result.passed !== undefined) {
      await recordAbilityTest(this.actor, key, Boolean(result.passed));
      await this.render({ force: true });
    }
  }

  static async _openRollDialog(role, { versus = false, obstacle = 1, modifier = 0, isSkill = true, tokenSourceIsSkill = null, beginnerLuck = false, beginnerAbility = "", abilityKey = "", natureTarget = null, fixedObstacle = false } = {}) {
    const personaValue = Number(this.actor.system.resources.persona.value ?? 0);
    const target = game.user.targets.size === 1 ? [...game.user.targets][0] : null;
    const opponent = target?.actor ?? null;
    const oppositionOptions = versus && opponent ? RealmGuardActorSheet._availableVersusOpposition(role.name, opponent) : [];
    const targetText = versus
      ? (opponent ? `Target: ${foundry.utils.escapeHTML(opponent.name)}` : "No single target selected — manual Obstacle will be used.")
      : "Standard test";
    const versusChoice = versus && opponent
      ? (oppositionOptions.length
        ? `<fieldset class="rg-versus-opposition"><legend>Versus Opposition <span class="rg-help-tip" title="Versus tests use the opponent's roll instead of a normal Obstacle.">?</span></legend><label>Target rolls
            <select name="oppositionId">${oppositionOptions.map((o, index) => `<option value="${o.id}" ${index === 0 ? "selected" : ""}>${foundry.utils.escapeHTML(o.name)} ${o.rating}D · ${foundry.utils.escapeHTML(o.basis)}</option>`).join("")}</select>
          </label><small>Only rule-supported options that this target can actually roll are offered.</small></fieldset>`
        : `<div class="rg-versus-warning"><b>No valid automatic opposition found.</b><br><small>This target lacks a rule-supported opposition for ${foundry.utils.escapeHTML(role.name)}. Cancel and use an appropriate manual test instead.</small></div>`)
      : "";
    const conditionData = conditionRollData(this.actor, role.name, { isSkill });
    const conditionPreview = conditionData.active.length
      ? conditionData.active.map(c => `<span class="rg-chat-condition">${foundry.utils.escapeHTML(c.name)} ${Number(c.system.rollModifier ?? 0) >= 0 ? "+" : ""}${Number(c.system.rollModifier ?? 0)}D</span>`).join(" ")
      : `<span class="rg-muted">No active Conditions affect this roll.</span>`;
    const angryActive = hasActiveCondition(this.actor, "Angry");
    const afraidActive = hasActiveCondition(this.actor, "Afraid");
    const hardConditionNotes = [
      angryActive ? "Angry: beneficial Trait/Wise effects are blocked." : "",
      afraidActive ? "Afraid: this Ranger cannot Help or use Beginner's Luck." : "",
      beginnerLuck && hasActiveCondition(this.actor, "Fresh") ? "Fresh +1D is applied after Beginner's Luck halving." : ""
    ].filter(Boolean);

    const teamworkSessionId = createTeamworkSession({ requesterActorId: this.actor.id, testName: role.name, excludedActorIds: [opponent?.id].filter(Boolean) });
    const teamworkBlock = `<fieldset class="rg-teamwork"><legend>Help / Teamwork <span class="rg-help-tip" title="Ask active Ranger players for Help. Accepted Help is added to this roll automatically. Helper Traits are not allowed.">?</span></legend><div class="rg-teamwork-requester"><button type="button" class="rg-teamwork-ask" data-rg-teamwork-ask="${teamworkSessionId}"><i class="fa-solid fa-handshake-angle"></i> Ask for Help</button><span data-rg-help-request-status>Help is optional. Ask active Rangers only when you want it.</span></div><div class="rg-teamwork-accepted-list" data-rg-help-summary><span class="rg-muted">No Help accepted yet.</span></div><small><b>Normal Help:</b> a Ranger answers with an appropriate trained Skill or Ability for +1D. <b>I Am Wise:</b> a relevant Wise can instead give +1D. <b>Synergy:</b> the helper chooses it in their own Help request and spends their own Fate if the roll resolves. You can keep preparing the roll while Help replies arrive.</small></fieldset>`;

    const n = this.actor.system.attributes?.nature ?? {}, natureCurrent = Math.max(0, Number(n.value ?? 0)), natureMaximum = Math.max(natureCurrent, Number(n.maximum ?? natureCurrent));
    const isNatureRoll = String(abilityKey) === "nature", canTapNature = !isNatureRoll && !["resources", "circles"].includes(String(abilityKey)) && natureCurrent > 0;
    const noPersona = personaValue < 1 ? ` <b class="rg-disabled-reason">Unavailable — requires 1 Persona.</b>` : "";
    const natureBlock = isNatureRoll
      ? `<fieldset class="rg-nature-roll"><legend>Nature · ${natureCurrent}/${natureMaximum} <span class="rg-help-tip" title="Nature is special: acting against its descriptors can Tax it. Advancement uses Maximum Nature.">?</span></legend><p><b>Dúnadan descriptors:</b> Tradition · Family · Grief</p><label>Test is <select name="natureUse"><option value="within">Within Nature descriptors</option><option value="against">Against Nature descriptors</option></select></label>${natureTarget ? `<label><input type="checkbox" name="natureVersus"> Versus target: ${foundry.utils.escapeHTML(natureTarget.name)} · Nature</label>` : ""}<label><input type="checkbox" name="doubleTapNature" ${personaValue < 1 ? "disabled" : ""}> Double-Tap Nature (+${natureCurrent}D, costs 1 Persona)${noPersona}</label><small>Double-Tap is within Nature only. Against Nature failures tax by Margin of Failure.</small></fieldset>`
      : (canTapNature ? `<fieldset class="rg-nature-roll"><legend>Tap Nature · ${natureCurrent}/${natureMaximum} <span class="rg-help-tip" title="Spend 1 Persona to add current Nature to this test. Acting against Nature can Tax it.">?</span></legend><label><input type="checkbox" name="tapNature" ${personaValue < 1 ? "disabled" : ""}> Tap Nature (+${natureCurrent}D, costs 1 Persona)${noPersona}</label><label>Test is <select name="natureScope"><option value="within">Within Nature descriptors</option><option value="against">Against Nature descriptors</option></select></label><small>${beginnerLuck ? `Beginner's Luck: Tap Nature dice are added after halving. ` : ""}Within + PASS: no tax. Against + PASS: tax 1. Failed tapped test: tax by Margin of Failure. Not available for Resources/Circles.</small></fieldset>` : "");
    const tokenRollIsSkill = tokenSourceIsSkill === null || tokenSourceIsSkill === undefined ? isSkill : Boolean(tokenSourceIsSkill);
    const tokenOptions = tokenPowerOptionViews(this.actor, role.name, { isSkill: tokenRollIsSkill });
    const tokenPowerBlock = tokenOptions.length ? `<fieldset class="rg-token-roll-choice"><legend><i class="fa-solid fa-gem"></i> Token of Power</legend><label>Invoke Token <select name="tokenPowerId"><option value="">None</option>${tokenOptions.map(t => `<option value="${t.id}" ${t.disabled ? "disabled" : ""}>${foundry.utils.escapeHTML(t.label)}</option>`).join("")}</select></label><small>Skill-linked Tokens are filtered to this roll. Specific-use Tokens are marked TABLE CHECK.</small></fieldset>` : "";
    const talentOptions = talentOptionViews(this.actor, role.name, { isSkill: tokenRollIsSkill });
    const talentBlock = talentOptions.length ? `<fieldset class="rg-talent-roll-choice"><legend><i class="fa-solid fa-sparkles"></i> Talent</legend><label>Use Talent <select name="talentId"><option value="">None</option>${talentOptions.map(t => `<option value="${t.id}" ${t.disabled ? "disabled" : ""}>${foundry.utils.escapeHTML(t.label)}</option>`).join("")}</select></label><small>Once/session Talents are consumed only after a committed roll.</small></fieldset>` : "";

    const ruleSpecific = fixedObstacle || Boolean(versus && opponent) || ["resources", "circles"].includes(String(abilityKey));
    const workflow = ruleSpecific ? "manual" : obstacleMode();
    const initialObstacle = workflow === "baseline" || workflow === "approval" ? baselineObstacle() : Math.max(0, Number(obstacle) || 0);
    const review = !ruleSpecific && workflow === "approval" ? beginObstacleReview({ actorName: this.actor.name, testName: role.name, obstacle: initialObstacle }) : null;
    const requestAttr = review ? ` data-rg-obstacle-request="${review.requestId}"` : "";
    const liveLinked = workflow === "baseline" && !ruleSpecific;
    const liveAttr = liveLinked ? ` data-rg-obstacle-live-linked="true" data-rg-obstacle-source="baseline"` : "";
    const obReadonly = versus && opponent ? "disabled" : review ? "readonly" : "";
    const obStatus = review
      ? `<div class="rg-obstacle-live-status" data-rg-obstacle-status><i class="fa-solid fa-hourglass-half"></i> Awaiting GM approval · current Ob ${review.initial}</div>`
      : workflow === "baseline" && !ruleSpecific ? `<div class="rg-obstacle-live-status approved" data-rg-obstacle-live-status><i class="fa-solid fa-link"></i> Ob ${initialObstacle} · Baseline</div>` : "";
    const canCountLearning = Boolean(isSkill || abilityKey);

    const automaticModifier = Number(modifier || 0) + Number(conditionData.dice || 0);
    const modifierBreakdown = conditionData.active.length ? conditionData.active.map(c => `${foundry.utils.escapeHTML(c.name)} ${Number(c.system.rollModifier ?? 0) >= 0 ? "+" : ""}${Number(c.system.rollModifier ?? 0)}D`).join(" · ") : "No automatic Condition modifier.";
    const traitOptionsHtml = this.actor.traits.map(trait => {
      const status = traitPositiveStatus(this.actor, trait);
      const level = Number(trait.system.rating ?? 0);
      const state = level === 3 ? "+1s · always when relevant" : status.available ? `+1D · ${status.remaining}/${status.limit} left` : "+1D · USED this session";
      return `<option value="${trait.id}">${foundry.utils.escapeHTML(trait.name)} (L${level} · ${state})</option>`;
    }).join("");
    const content = `<div class="rg-roll-dialog"${requestAttr}${liveAttr} data-rg-teamwork-session="${teamworkSessionId}">
        <div class="rg-roll-dialog-head"><strong>${foundry.utils.escapeHTML(role.name)}</strong><span>${beginnerLuck ? `BEGINNER'S LUCK · ${String(beginnerAbility).toUpperCase()}` : (versus ? "VERSUS" : "TEST")} · ${targetText}</span></div>
        ${versusChoice}
        <div class="rg-obstacle-panel"><div class="rg-roll-dialog-grid rg-roll-core-fields">
          <div class="rg-roll-field rg-roll-field-obstacle"><div class="rg-roll-field-head"><span>Obstacle <span class="rg-help-tip" title="Obstacle (Ob) is the number of successes required. Skill factors can set the exact value; the GM may always adjust it.">?</span></span><input type="number" name="obstacle" min="0" max="10" value="${initialObstacle}" ${obReadonly}></div>${obStatus}<small class="rg-obstacle-guide" data-rg-obstacle-guide>${foundry.utils.escapeHTML(obstacleDifficultyText(initialObstacle))}</small></div>
          <div class="rg-roll-field rg-roll-field-modifier"><div class="rg-roll-field-head"><span>Modifier (automatic) <span class="rg-help-tip" title="Read-only. Automatic dice changes from active Conditions and other system effects. Custom Conditions are included when configured for this roll.">?</span></span><input type="number" name="automaticModifier" value="${automaticModifier}" readonly></div><small class="rg-auto-modifier-breakdown">${modifierBreakdown}</small><input type="hidden" name="modifier" value="${Number(modifier) || 0}"></div>
          <div class="rg-roll-field rg-roll-field-extra"><div class="rg-roll-field-head"><span>Extra Dice <span class="rg-help-tip" title="Manual or situational bonus dice. Use this only when a GM ruling, gear effect or special circumstance grants extra dice. Conditions belong under Modifier; accepted Help is tracked in Teamwork.">?</span></span><input type="number" name="extraDice" min="0" value="0"></div><small>Manual / situational bonus dice only.</small></div>
        </div></div>
        ${teamworkBlock}${natureBlock}
        <div class="rg-condition-roll-preview"><span>ACTIVE CONDITIONS${conditionData.dice ? ` · ${conditionData.dice > 0 ? "+" : ""}${conditionData.dice}D` : ""}</span><div>${conditionPreview}</div>${hardConditionNotes.length ? `<small>${hardConditionNotes.map(foundry.utils.escapeHTML).join(" · ")}</small>` : ""}</div>
        ${canCountLearning ? `<fieldset class="rg-learning-choice"><legend>Learning & Advancement <span class="rg-help-tip" title="Pass and Fail results are tracked automatically. When both requirements are met, the Skill or Ability advances immediately.">?</span></legend><label><input type="checkbox" name="countLearning" ${this.actor.type === "npc" ? "" : "checked"}> Count this test for Learning</label><small>${beginnerLuck ? "This marks one Beginner's Luck attempt only. It does not advance the Will/Health base Ability." : "Turn this off only when this test should not earn an advancement mark."}</small></fieldset>` : ""}
        <fieldset><legend>Spend before roll</legend><label>Persona dice <select name="persona" ${personaValue < 1 ? "disabled" : ""}>${[0,1,2,3].filter(n => n <= Math.max(0, personaValue)).map(n => `<option value="${n}">${n} Persona · +${n}D</option>`).join("") || `<option value="0">0 Persona · +0D</option>`}</select> <small>(${personaValue} available; max +3D)${personaValue < 1 ? ` <b class="rg-disabled-reason">No Persona available.</b>` : ""}</small></label></fieldset>
        ${tokenPowerBlock}${talentBlock}
        <fieldset><legend>Traits & Wises</legend><label>Trait <select name="traitId"><option value="">None</option>${traitOptionsHtml}</select></label><label>Trait use <select name="traitMode"><option value="help">Help yourself (rule-based Trait benefit)</option><option value="against">Against yourself (-1D; earns 1 Check in GM Turn)</option>${((versus && opponent) || (isNatureRoll && natureTarget)) ? `<option value="hurt">Against yourself in Versus (opponent +2D; earns 2 Checks in GM Turn)</option>` : ""}</select></label><small><b>Beneficial Traits:</b> Level 1 = +1D once/session; Level 2 = +1D twice/session; Level 3 = +1s on relevant passed/tied tests. Used Level 1/2 benefits are enforced automatically and reset when End Session is finalized. Trait Against is separate. Helper Traits are not Teamwork.</small><label>Wise <select name="wiseId"><option value="">None</option>${this.actor.wises.map(w => `<option value="${w.id}">${foundry.utils.escapeHTML(w.name)} (reroll failed dice)</option>`).join("")}</select></label></fieldset>
      </div>`;

    const DialogV2 = foundry.applications.api.DialogV2;
    const result = await DialogV2.wait({
      window: { title: `Realm Guard · Roll ${role.name}`, resizable: true }, content, modal: false, rejectClose: false,
      buttons: [{ action: "roll", label: review ? "Roll when Ob is approved" : "Roll", icon: "fa-solid fa-dice", default: true, callback: async (_event, button) => {
        const form = button.form; if (!form) return null;
        if (review) await review.promise;
        const elements = form.elements;
        const help = teamworkEntries(teamworkSessionId);
        return {
          obstacle: review ? obstacleReviewValue(review.requestId, initialObstacle) : Math.max(0, Number(elements.obstacle?.value ?? initialObstacle)),
          modifier: Number(elements.modifier?.value ?? 0), extraDice: Math.max(0, Number(elements.extraDice?.value ?? 0)), help,
          persona: Math.max(0, Math.min(3, Number(elements.persona?.value ?? 0))), countLearning: canCountLearning ? Boolean(elements.countLearning?.checked) : false,
          traitId: elements.traitId?.value || null, traitMode: elements.traitMode?.value || "help", wiseId: elements.wiseId?.value || null,
          tokenPowerId: elements.tokenPowerId?.value || null, talentId: elements.talentId?.value || null, oppositionId: elements.oppositionId?.value || null,
          tapNature: Boolean(elements.tapNature?.checked), natureScope: elements.natureScope?.value || "within", natureUse: elements.natureUse?.value || "within",
          doubleTapNature: Boolean(elements.doubleTapNature?.checked), natureVersus: Boolean(elements.natureVersus?.checked)
        };
      }}, { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => ({ cancelled: true }) }]
    });
    finishTeamworkSession(teamworkSessionId);
    if (review) finishObstacleReview(review.requestId);
    if (!result || result.cancelled === true || result === "cancel") return null;
    return result;
  }

  static async _customRoll() {
    const esc = foundry.utils.escapeHTML;
    const fate = Number(this.actor.system.resources?.fate?.value ?? 0);
    const persona = Number(this.actor.system.resources?.persona?.value ?? 0);
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard · Custom Roll · Free Dice Pool", resizable: true }, modal: false, rejectClose: false,
      content: `<div class="rg-free-custom-roll"><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>Custom Roll · Free Dice Pool</h2><p>Custom Roll is intentionally freeform. Use the normal Skill or Ability buttons on the sheet whenever standard rules automation and Learning should apply.</p><label>Label<input name="label" value="Improvised Test" maxlength="80"></label><div class="rg-roll-dialog-grid"><label>Base Dice<input type="number" name="dice" min="0" max="30" value="3"></label><label>Obstacle<input type="number" name="obstacle" min="0" max="20" value="${baselineObstacle()}"></label><label>Extra Dice<input type="number" name="extra" min="0" max="20" value="0"></label><label>Persona dice<select name="persona">${[0,1,2,3].filter(n=>n<=persona).map(n=>`<option value="${n}">${n} Persona · +${n}D</option>`).join("")}</select></label></div><p class="rg-custom-roll-warning"><i class="fa-solid fa-circle-info"></i> Free Dice Pool does not infer Conditions, Nature, Help or Learning/Advancement. Set the pool and Obstacle manually for improvised or table-adjudicated tests.</p></div>`,
      buttons: [
        { action: "roll", label: "Roll", icon: "fa-solid fa-dice", default: true, callback: (_e,b) => ({ label: b.form?.elements?.label?.value || "Improvised Test", dice: Math.max(0, Number(b.form?.elements?.dice?.value||0)), obstacle: Math.max(0, Number(b.form?.elements?.obstacle?.value||0)), extra: Math.max(0, Number(b.form?.elements?.extra?.value||0)), persona: Math.max(0, Math.min(3, Number(b.form?.elements?.persona?.value||0))) }) },
        { action: "cancel", label: "Cancel", callback: () => null }
      ]
    });
    if (!result) return;
    if (result.persona > persona) return ui.notifications.warn("Realm Guard: Not enough Persona.");
    const pool = Math.max(0, result.dice + result.extra + result.persona);
    if (!pool) return ui.notifications.warn("Realm Guard: Custom Roll dice pool is 0.");
    const roll = await new Roll(`${pool}d6`).evaluate();
    const faces = roll.dice.flatMap(d => d.results.map(r => r.result));
    let bonusFaces = [];
    const sixes = faces.filter(v=>v===6).length;
    let spendFate = false;
    if (sixes && fate > 0) {
      spendFate = await this.actor._askFateAfterSixes({ roleName: result.label, sixCount: sixes });
      if (spendFate) { bonusFaces = await this.actor._explodeSixes(faces); await spendTrackedResource(this.actor, "fate", 1, { reason: `Custom Roll · ${result.label}` }); }
    }
    if (result.persona) await spendTrackedResource(this.actor, "persona", result.persona, { reason: `Custom Roll · ${result.label}` });
    const all = faces.concat(bonusFaces); const successes = all.filter(v=>v>=4).length; const passed = successes >= result.obstacle;
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: `<div class="realm-guard chat-roll rg-custom-roll-chat"><div class="rg-custom-chat-tag">CUSTOM ROLL · FREE POOL</div><h3>${esc(result.label)}</h3><p><b>Pool:</b> ${pool}D · Base ${result.dice}D${result.extra?` · Extra +${result.extra}D`:""}${result.persona?` · Persona +${result.persona}D`:""}</p><p><b>Roll:</b> ${diceFacesHtml(faces, {label:"Base roll"})}</p>${bonusFaces.length?`<p><b>Fate / Open 6s:</b> ${diceFacesHtml(bonusFaces,{label:"Fate dice"})}</p>`:""}<p><b>Successes:</b> ${successes} · <b>Ob ${result.obstacle}</b></p><div class="rg-result-summary"><span class="rg-result-final"><b>Result</b><strong class="rg-roll-outcome ${passed?"pass":"fail"}">${passed?"PASS":"FAIL"}</strong></span></div><small>No Learning/Advancement is recorded for an unlinked free pool.</small></div>` });
  }

  static async _toggleRoleVersus(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const role = this.actor.items.get(id);
    if (!role) return;
    await role.update({ "system.versus": !role.system.versus });
  }

  static async _autoAdvanceRole(role) {
    const currentRole = this.actor.items.get(role?.id ?? role);
    if (!currentRole) return false;
    const rating = Number(currentRole.system.rating ?? 0);
    if (rating <= 0 || rating >= 6) return false;
    const learning = currentRole.system.learning ?? {};
    const requirements = skillAdvanceRequirements(rating);
    const ready = Number(learning.passed ?? 0) >= requirements.passNeeded && Number(learning.failed ?? 0) >= requirements.failNeeded;
    if (!ready) return false;
    const nextRating = rating + 1;
    const nextRequirements = skillAdvanceRequirements(nextRating);
    await currentRole.update({
      "system.rating": nextRating,
      "system.learning.passed": 0,
      "system.learning.failed": 0,
      "system.learning.passNeeded": nextRequirements.passNeeded,
      "system.learning.failNeeded": nextRequirements.failNeeded
    });
    const esc = foundry.utils.escapeHTML;
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `<div class="realm-guard rg-advancement-chat rg-celebration-chat"><div class="rg-celebration-kicker">✦ SKILL ADVANCEMENT ✦</div><h2>Congratulations, ${esc(this.actor.name)}!</h2><h3>${esc(currentRole.name)} ${rating} → ${nextRating}</h3><p>Your Ranger's experience has paid off. <b>${esc(currentRole.name)}</b> advances automatically to Rating <b>${nextRating}</b>.</p><p class="rg-celebration-foot">A new advancement track begins now: ${nextRequirements.passNeeded} Pass / ${nextRequirements.failNeeded} Fail.</p></div>`
    });
    ui.notifications.info(`Realm Guard: ${currentRole.name} automatically advanced to ${nextRating}.`);
    return true;
  }

  static async _recordLearning(role, passed) {
    let currentRole = this.actor.items.get(role.id);
    if (!currentRole) return;
    // A v1.0.4-or-earlier READY Skill must advance before this new roll is recorded,
    // otherwise the new Pass/Fail would be silently lost at the old cap.
    await RealmGuardActorSheet._autoAdvanceRole.call(this, currentRole);
    currentRole = this.actor.items.get(role.id);
    const rating = Number(currentRole?.system.rating ?? 0);
    if (!currentRole || rating <= 0 || rating >= 6) { await this.render({ force: true }); return; }
    const field = passed ? "passed" : "failed";
    const requirements = skillAdvanceRequirements(rating);
    const limit = passed ? requirements.passNeeded : requirements.failNeeded;
    const current = Number(currentRole.system.learning?.[field] ?? 0);
    if (current >= limit) { await this.render({ force: true }); return; }
    const next = Math.min(limit, current + 1);
    await this.actor.updateEmbeddedDocuments("Item", [{ _id: currentRole.id, [`system.learning.${field}`]: next }]);
    const advanced = await RealmGuardActorSheet._autoAdvanceRole.call(this, currentRole);
    await this.render({ force: true });
    return advanced;
  }

  static _learnPass(event, target) { return RealmGuardActorSheet._adjustLearn.call(this,target,"passed",1); }
  static _unlearnPass(event, target) { return RealmGuardActorSheet._adjustLearn.call(this,target,"passed",-1); }
  static _learnFail(event, target) { return RealmGuardActorSheet._adjustLearn.call(this,target,"failed",1); }
  static _unlearnFail(event, target) { return RealmGuardActorSheet._adjustLearn.call(this,target,"failed",-1); }
  static async _adjustLearn(target, field, delta) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    const current = Number(item.system.learning?.[field] ?? 0);
    await item.update({ [`system.learning.${field}`]: Math.max(0, current + delta) });
    if (delta > 0) await RealmGuardActorSheet._autoAdvanceRole.call(this, item);
    await this.render({ force: true });
  }

  static _abilityPassUp(event, target) { return RealmGuardActorSheet._adjustAbilityLearn.call(this, target, "passed", 1); }
  static _abilityPassDown(event, target) { return RealmGuardActorSheet._adjustAbilityLearn.call(this, target, "passed", -1); }
  static _abilityFailUp(event, target) { return RealmGuardActorSheet._adjustAbilityLearn.call(this, target, "failed", 1); }
  static _abilityFailDown(event, target) { return RealmGuardActorSheet._adjustAbilityLearn.call(this, target, "failed", -1); }
  static async _adjustAbilityLearn(target, field, delta) {
    const key = String(target.closest("[data-ability-learning]")?.dataset.abilityLearning ?? "");
    if (!key) return;
    await adjustAbilityLearning(this.actor, key, field, delta);
    await this.render({ force: true });
  }

  static async _commitSynergy(help, result, reason = "Help") {
    if (!Array.isArray(help) || !result || result.tied) return;
    const eligible = help.filter(entry => entry?.synergy && ["Skill", "Ability"].includes(entry.sourceKind));
    const synergyPassed = result.learningResult ?? result.tieResolution?.passed ?? result.passed;
    if (synergyPassed === null || synergyPassed === undefined) return;
    for (const entry of eligible) {
      const helper = game.actors.get(entry.actorId);
      if (!helper) continue;
      if (Number(helper.system?.resources?.fate?.value ?? 0) < 1) {
        ui.notifications.warn(`Realm Guard: ${helper.name} could not use Synergy — requires 1 Fate.`);
        continue;
      }
      const spent = await spendTrackedResource(helper, "fate", 1, { reason: `Synergy · ${reason}` });
      if (!spent.ok) continue;
      if (entry.sourceKind === "Skill") await recordHelperSkillTest(helper, entry.sourceId, Boolean(synergyPassed));
      if (entry.sourceKind === "Ability") await recordAbilityTest(helper, String(entry.sourceId).replace("ability:", ""), Boolean(synergyPassed));
      const mark = synergyPassed ? "Pass" : "Fail";
      await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: helper }), content: `<div class="realm-guard rg-synergy-chat"><div class="rg-custom-chat-tag">SYNERGY · 1 FATE</div><h3>${foundry.utils.escapeHTML(helper.name)} learns by helping</h3><p><b>${foundry.utils.escapeHTML(entry.sourceName)}</b> marks a <b>${mark}</b> for advancement.</p></div>` });
    }
  }

  static async _toggleCondition(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    if (item) await toggleConditionActive(this.actor, item);
  }

  static async _recoverCondition(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item || !item.system.active) return;

    if (String(item.name).toLowerCase() === "fresh") {
      await setConditionActive(this.actor, item, false);
      return ui.notifications.info("Realm Guard: Fresh cleared.");
    }
    if (String(item.system.recoveryType ?? "manual") === "manual") {
      await setConditionActive(this.actor, item, false);
      return ui.notifications.info(`Realm Guard: ${item.name} cleared manually.`);
    }

    const valid = validateRecoveryAttempt(this.actor, item);
    if (!valid.ok) return ui.notifications.warn(`Realm Guard: ${valid.reason}`);
    const methods = recoveryMethods(this.actor, item);
    if (!methods.length) return ui.notifications.warn(`Realm Guard: No usable recovery method is available for ${item.name}.`);

    let method = methods[0];
    if (!methods.some(m => Number(m.dice ?? 0) > 0)) return ui.notifications.warn(`Realm Guard: No recovery method for ${item.name} has a usable dice pool.`);
    if (methods.length > 1) {
      const choice = await foundry.applications.api.DialogV2.wait({
        window: { title: `Realm Guard · Recover ${item.name}`, resizable: true },
        content: `<div class="rg-recovery-choice"><div class="rg-brand">REALM GUARD / TORCHBEARER</div><h2>${foundry.utils.escapeHTML(item.name)}</h2><p>Choose a recovery method.</p><label>Method <select name="methodIndex">${methods.map((m,i)=>`<option value="${i}">${foundry.utils.escapeHTML(m.name)} · ${m.dice}D · Ob ${m.obstacle}</option>`).join("")}</select></label><p><small>${turnManagerEnabled() ? `${turnLabel()}: ${currentTurnPhase()==="gm" ? "the attempt costs 2 Checks" : "the attempt uses the Free Test first, then 1 Check"}. One attempt per Condition per Turn.` : "Free Play: no Free Test/Check cost and no turn-scoped recovery-attempt limit."}</small></p></div>`,
        modal: false, rejectClose: false,
        buttons: [
          { action: "choose", label: "Continue", icon: "fa-solid fa-kit-medical", default: true, callback: (_e,b) => Number(b.form?.elements?.methodIndex?.value ?? 0) },
          { action: "cancel", label: "Cancel", callback: () => null }
        ]
      });
      if (choice === null || choice === undefined) return;
      method = methods[Math.max(0, Math.min(methods.length - 1, Number(choice)))] ?? methods[0];
    }
    if (Number(method.dice ?? 0) <= 0) return ui.notifications.warn(`Realm Guard: ${method.name} has a 0D recovery pool.`);

    const subject = method.kind === "role" ? method.item : { name: `Recovery · ${item.name} · ${method.name}`, system: { rating: method.dice } };
    const options = await RealmGuardActorSheet._openRollDialog.call(this, subject, { versus: false, obstacle: method.obstacle, modifier: 0, isSkill: method.kind === "role", tokenSourceIsSkill: method.kind === "role", abilityKey: method.kind === "ability" ? method.key : "", fixedObstacle: true });
    if (!options) return;
    const { modifier, extraDice: rawExtraDice, help, persona, countLearning, traitId, traitMode, wiseId, tokenPowerId, talentId } = options;
    const talentUse = RealmGuardActorSheet._talentUse.call(this, talentId, subject.name, { isSkill: method.kind === "role" });
    if (talentId && !talentUse) return ui.notifications.warn("Realm Guard: That Talent is used, unavailable, or does not match this recovery test.");
    const extraDice = Math.max(0, Number(rawExtraDice ?? 0)) + Number(talentUse?.diceBonus ?? 0);
    if (persona > Number(this.actor.system.resources.persona.value ?? 0)) return ui.notifications.warn(`Realm Guard: This roll requires ${persona} Persona.`);

    // Revalidate after the dialog in case phase/state changed while it was open. GM Turn spends 2 Checks here.
    const spent = await beginRecoveryAttempt(this.actor, item);
    if (!spent.ok) return ui.notifications.warn(`Realm Guard: ${spent.reason}`);

    const result = method.kind === "role"
      ? await this.actor.rollRole(method.item, { modifier, extraDice, help, obstacle: method.obstacle, versus: false, persona, traitId, traitMode, wiseId, tokenPowerId, ignoreConditions: true })
      : await this.actor.rollAbility(method.key, { modifier, extraDice, help, obstacle: method.obstacle, persona, traitId, traitMode, wiseId, tokenPowerId, ignoreConditions: true });

    // A Players' Turn roll may still be blocked by alternation or lack of Free Test/Checks. In that case no recovery attempt is recorded.
    if (!result) {
      if (spent.phase === "gm" && spent.cost === 2) {
        await this.actor.update({ "system.resources.checks.value": spent.before });
      }
      return;
    }
    await finishRecoveryAttempt(this.actor, item, { spent, result });
    await RealmGuardActorSheet._commitTalentAfterRoll.call(this, talentUse, `${item.name} Recovery`);
    await RealmGuardActorSheet._commitSynergy.call(this, help, result, `${item.name} Recovery`);
    if (persona) await spendTrackedResource(this.actor, "persona", persona, { reason: `${item.name} Recovery` });
    if (countLearning && !result.tied) {
      if (method.kind === "ability") await recordAbilityTest(this.actor, method.key, Boolean(result.passed));
      if (method.kind === "role") await RealmGuardActorSheet._recordLearning.call(this, method.item, Boolean(result.passed));
    }
    if (result.passed) await setConditionActive(this.actor, item, false);

    const esc = foundry.utils.escapeHTML;
    const economy = spent.phase === "free" ? "Free Play · no Turn/Check cost" : spent.phase === "gm" ? `2 Checks · ${spent.before} → ${spent.after}` : "Players' Turn Free Test/Check economy (see roll card)";
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: `<div class="realm-guard chat-roll rg-recovery-roll"><div class="rg-custom-chat-tag">RECOVERY · ${turnLabel()}</div><h3>${esc(item.name)}</h3><p><b>Method:</b> ${esc(method.name)} · Ob ${method.obstacle}</p><p><b>Recovery economy:</b> ${economy}</p><p><strong class="rg-roll-outcome ${result.passed ? "pass" : "fail"}">${result.passed ? "RECOVERED" : "NOT RECOVERED"}</strong></p>${result.passed ? "" : `<p><small>The Condition remains active. Recovery failure does not create an additional twist or Condition.</small></p>`}</div>` });
    ui.notifications.info(`Realm Guard: ${item.name} ${result.passed ? "recovered" : "remains active"}.`);
  }

  static async _manageNature() {
    const n=this.actor.system.attributes?.nature??{}, current=Math.max(0,Number(n.value??0)), maximum=Math.max(current,Number(n.maximum??current)), tax=Math.max(0,maximum-current);
    const result=await foundry.applications.api.DialogV2.wait({window: { title: "Realm Guard · Manage Nature", resizable: true },content:`<div class="rg-nature-manage"><h3>Nature ${current}/${maximum}</h3><p><b>Tax:</b> ${tax}</p><p><b>Dúnadan descriptors:</b> Tradition · Family · Grief</p><p><small>Recover +1 only when the rules allow recovery. Deplete Maximum trades one point of maximum Nature to recover one point of tax.</small></p></div>`,modal:false,rejectClose:false,buttons:[{action:"recover",label:"Recover +1",icon:"fa-solid fa-leaf",callback:()=>"recover"},{action:"deplete",label:"Deplete Maximum",icon:"fa-solid fa-arrow-down",callback:()=>"deplete"},{action:"close",label:"Close",default:true,callback:()=>"close"}]});
    if(result==="recover"&&tax>0)await this.actor.update({"system.attributes.nature.value":Math.min(maximum,current+1)});
    if(result==="deplete"&&tax>0&&maximum>0){const nm=Math.max(0,maximum-1),nc=Math.min(nm,current+1);await this.actor.update({"system.attributes.nature.maximum":nm,"system.attributes.nature.value":nc});if(nm===0)ui.notifications.warn("Realm Guard: Maximum Nature is 0. The character must retire at the end of the mission.");}
  }

  static async _turnDonate() {
    await openDonateDialog(this.actor);
    await this.render({ force: true });
  }

  static async _turnDone() {
    await confirmFinishPlayer(this.actor);
    await this.render({ force: true });
  }

  static _fateDown(){ return RealmGuardActorSheet._adjustResource.call(this,"fate",-1); }
  static _fateUp(){ return RealmGuardActorSheet._adjustResource.call(this,"fate",1); }
  static _personaDown(){ return RealmGuardActorSheet._adjustResource.call(this,"persona",-1); }
  static _personaUp(){ return RealmGuardActorSheet._adjustResource.call(this,"persona",1); }
  static _checksDown(){ return RealmGuardActorSheet._adjustResource.call(this,"checks",-1); }
  static _checksUp(){ return RealmGuardActorSheet._adjustResource.call(this,"checks",1); }
  static async _adjustResource(name, delta) {
    const resource = this.actor.system.resources[name];
    const next = Math.max(0, Math.min(resource.max, resource.value + delta));
    await this.actor.update({ [`system.resources.${name}.value`]: next });
  }
}
