import { isDefaultSkill } from "../module/default-skills.mjs";
import { modernFilePickerImplementation } from "../module/foundry-compat.mjs";
import { toggleConditionActive, ensureDefaultConditions, isDefaultCondition, setConditionActive, conditionRollData, hasActiveCondition, validateRecoveryAttempt, recoveryMethods, beginRecoveryAttempt, finishRecoveryAttempt } from "../module/conditions.mjs";
import { playerTurnStatus, openDonateDialog, confirmFinishPlayer, currentTurnPhase, turnLabel, turnManagerEnabled, refundRecoveryChecks } from "../module/turns.mjs";
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
import { getActiveM10BFamilyRulePolicy, natureDescriptorText, natureProfileLabel } from "../module/m10b-family-rules.mjs";
import { getActiveM10BConditionRecoveryPolicy, familyRecoveryState } from "../module/m10b-conditions-recovery.mjs";
import { getActiveM10BSessionCirclesProgressionPolicy, familyCirclesContactPlan } from "../module/m10b-session-circles-progression.mjs";
import { buildM8RelationshipSheetView, linkM8PersonActor, updateM8RelationshipStatus, createM8DynamicContact, createM8CirclesContact, requestM8EnmityDecision, updateM8Person, M8_RELATIONSHIP_STATUS_OPTIONS } from "../module/m8-social-network-service.mjs";
import { openNpcTemplateLibrary } from "../module/npc-builder.mjs";
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
  const picker = modernFilePickerImplementation();
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

function relationshipQuickNpcQuery(person = {}) {
  let profession = String(person.profession ?? "").trim();
  // Preserve the user's data, but make the known legacy spelling useful for search.
  if (/^inkeeper$/i.test(profession)) profession = "innkeeper";

  const context = `${String(person.people ?? "")} ${String(person.location ?? "")}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const cultureHints = [
    [/\bbree\b/, "bree"],
    [/\bdunadan|dunedain\b/, "dunadan"],
    [/\bgondor|gondorian\b/, "gondor"],
    [/\brohan|rohirrim|rohirric\b/, "rohan"],
    [/\bdwarf|dwarves|dwarven\b/, "dwarf"],
    [/\belf|elves|elven\b/, "elf"],
    [/\bhobbit|shire\b/, "hobbit"],
    [/\bdunland|dunlending\b/, "dunland"],
    [/\bnorthman|northmen\b/, "northman"],
    [/\bharad|haradrim\b/, "harad"],
    [/\beasterling\b/, "easterling"],
    [/\borc|orcs\b/, "orc"],
    [/\bundead|wight|shade\b/, "undead"]
  ];
  const culture = cultureHints.find(([pattern]) => pattern.test(context))?.[1] ?? "";
  return [profession, culture].filter(Boolean).join(" ").trim();
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
      rollWise: RealmGuardActorSheet._rollWise,
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
      customRoll: RealmGuardActorSheet._customRoll,
      linkRelationshipActor: RealmGuardActorSheet._linkRelationshipActor,
      createRelationshipNpc: RealmGuardActorSheet._createRelationshipNpc,
      openRelationshipActor: RealmGuardActorSheet._openRelationshipActor,
      unlinkRelationshipActor: RealmGuardActorSheet._unlinkRelationshipActor,
      changeRelationshipStatus: RealmGuardActorSheet._changeRelationshipStatus,
      createDynamicContact: RealmGuardActorSheet._createDynamicContact,
      editDynamicContact: RealmGuardActorSheet._editDynamicContact
    }
  };

  static PARTS = {
    main: { template: "systems/realm-guard/templates/actor/character.hbs" }
  };



  _rgActiveTab = "character";
  _rgCharacterTab = "overview";
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

    const characterTabs = new Set(["overview", "background", "relationships", "notes"]);
    const activateCharacter = (tab) => {
      const next = characterTabs.has(tab) ? tab : "overview";
      this._rgCharacterTab = next;
      for (const b of root.querySelectorAll("[data-rg-character-tab]")) b.classList.toggle("active", b.dataset.rgCharacterTab === next);
      for (const p of root.querySelectorAll("[data-rg-character-page]")) p.classList.toggle("active", p.dataset.rgCharacterPage === next);
    };
    activateCharacter(this._rgCharacterTab);

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

    for (const button of root.querySelectorAll("[data-rg-character-tab]")) {
      button.addEventListener("click", event => {
        event.preventDefault();
        activateCharacter(button.dataset.rgCharacterTab);
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
    const sessionPolicy = getActiveM10BSessionCirclesProgressionPolicy();
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
    const relationshipView = buildM8RelationshipSheetView(actor);
    const relationshipCards = relationshipView.relationships.map(relationship => ({
      ...relationship,
      person: relationship.person ?? null,
      linkedActor: relationship.person?.actorLink ?? { linked: false, resolved: false, uuid: "", name: "", type: "", img: "" },
      details: [
        relationship.person?.profession ? `Profession: ${relationship.person.profession}` : "",
        relationship.person?.people ? `People: ${relationship.person.people}` : "",
        relationship.person?.location ? `Location: ${relationship.person.location}` : ""
      ].filter(Boolean).join(" · "),
      historyCount: Array.isArray(relationship.history) ? relationship.history.length : 0,
      recentHistory: Array.isArray(relationship.history) ? [...relationship.history].slice(-3).reverse().map(entry => ({
        ...entry,
        fromLabel: String(entry.from || "UNKNOWN").toLowerCase().replaceAll("_", " ").replace(/\b\w/g, value => value.toUpperCase()),
        toLabel: String(entry.to || "UNKNOWN").toLowerCase().replaceAll("_", " ").replace(/\b\w/g, value => value.toUpperCase())
      })) : [],
      isDynamicContact: relationship.role === "CONTACT" && ["PLAY", "GM", "CIRCLES"].includes(String(relationship.origin || ""))

    }));
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
      relationshipView,
      relationshipCards,
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
      turn: actor.type === "character" ? playerTurnStatus(actor) : null,
      isStrictProfile: sessionPolicy.familySemantics,
      showLevels: sessionPolicy.progression.levelsEnabled,
      showTalents: sessionPolicy.progression.talentsEnabled,
      progressionTrackingEnabled: sessionPolicy.progression.lifetimeSpendLevelTrackingEnabled
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
    if (!getActiveM10BSessionCirclesProgressionPolicy().progression.talentsEnabled) return ui.notifications.warn("Realm Guard: Talents are disabled by the active Rules Profile. Existing Talent data is preserved.");
    if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Custom Talent definitions are GM-managed.");
    return RealmGuardActorSheet._createItem.call(this,e,t,"talent","New Talent");
  }
  static async _chooseTalent(){
    if (!getActiveM10BSessionCirclesProgressionPolicy().progression.talentsEnabled) return ui.notifications.warn("Realm Guard: Talent choices are disabled by the active Rules Profile.");
    const created = await chooseTalentForActor(this.actor);
    if (created) await this.render({ force: true });
  }
  static async _manageProgression(){
    if (!getActiveM10BSessionCirclesProgressionPolicy().progression.lifetimeSpendLevelTrackingEnabled) return ui.notifications.warn("Realm Guard: Lifetime Fate/Persona Level progression is disabled by the active Rules Profile. Preserved counters are read-only rule data.");
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
    if (!getActiveM10BSessionCirclesProgressionPolicy().progression.talentsEnabled) return null;
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
    if (!getActiveM10BConditionRecoveryPolicy().familySemantics && hasActiveCondition(this.actor, "Afraid")) return ui.notifications.warn("Realm Guard: Afraid Rangers cannot use Beginner's Luck. Use Nature when appropriate or recover first.");
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

  static async _rollWise(event, target) {
    const policy = getActiveM10BFamilyRulePolicy();
    if (!policy.ratedWises) return ui.notifications.warn("Realm Guard: Wises are unrated in the active compatibility profile and cannot be rolled as Skills.");
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const wise = this.actor.items.get(id);
    if (!wise || wise.type !== "wise") return;
    const rating = Number(wise.system?.rating ?? 0);
    if (rating <= 0) return ui.notifications.warn(`Realm Guard: ${wise.name} is preserved but needs an explicit rating before it can be tested under this profile.`);
    return RealmGuardActorSheet._rollRole.call(this, event, target);
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
    const circlesContext = key === "circles" ? await RealmGuardActorSheet._prepareCirclesSocialContext.call(this) : null;
    if (key === "circles" && !circlesContext) return;
    const circlesPolicy = getActiveM10BSessionCirclesProgressionPolicy();
    const contactPlan = key === "circles" && circlesContext?.mode === "known"
      ? familyCirclesContactPlan({
          knownContact: true,
          successful: false,
          relationshipRole: circlesContext.role || "CONTACT"
        }, circlesPolicy)
      : null;
    const profileModifier = Number(defaults.modifier ?? 0) + Number(contactPlan?.futureCirclesDice ?? 0);
    const options = await RealmGuardActorSheet._openRollDialog.call(this, ability, { versus: false, ...defaults, modifier: profileModifier, isSkill: false, abilityKey: key, natureTarget, circlesContext });
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
    }
    if (key === "circles") {
      await RealmGuardActorSheet._commitCirclesSocialContext.call(this, circlesContext, result);
    }
    if (countLearning || key === "circles") await this.render({ force: true });
  }

  static async _prepareCirclesSocialContext() {
    const esc = foundry.utils.escapeHTML;
    const view = buildM8RelationshipSheetView(this.actor);
    const known = view.relationships
      .filter(relationship => relationship.person?.id && relationship.person?.name)
      .map(relationship => ({
        relationshipId: relationship.id,
        personId: relationship.person.id,
        name: relationship.person.name,
        profession: relationship.person.profession || "",
        people: relationship.person.people || "",
        location: relationship.person.location || "",
        role: relationship.role || "CONTACT",
        status: relationship.status || "UNKNOWN",
        roleLabel: relationship.roleLabel || "Contact",
        statusLabel: relationship.statusLabel || "Unknown"
      }))
      .sort((a,b) => a.name.localeCompare(b.name));

    const purpose = await foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard · Circles", resizable: true },
      position: { width: 590 },
      content: `<div class="realm-guard rg-m8-circles-dialog">
        <div class="rg-brand">REALM GUARD / TORCHBEARER · CIRCLES</div>
        <h2>Who are you trying to find?</h2>
        <p>Choose how this test relates to the Social Network. Under MG1E-family profiles, a recorded Contact grants the source-backed +1D on later Circles tests for that same Contact.</p>
        <div class="rg-m8-circles-mode-help">
          <p><b>Standard Test</b> — roll Circles exactly as before; no Social Network change.</p>
          <p><b>Known Person</b> — reference someone already recorded for this Ranger.</p>
          <p><b>Find New Person</b> — a successful test records a Neutral Contact; no NPC is created automatically.</p>
        </div>
        ${known.length ? "" : '<p class="rg-m8-circles-note">No known Social Network people are available yet, so Known Person will fall back safely.</p>'}
      </div>`,
      modal: false,
      rejectClose: false,
      buttons: [
        { action: "standard", label: "Standard Test", callback: () => "standard" },
        { action: "known", label: "Known Person", callback: () => "known" },
        { action: "new", label: "Find New Person", callback: () => "new" },
        { action: "cancel", label: "Cancel", callback: () => "" }
      ]
    });

    if (!purpose) return null;
    if (purpose === "standard") return Object.freeze({ mode: "standard", label: "Standard Circles Test" });

    if (purpose === "known") {
      if (!known.length) return Object.freeze({ mode: "standard", label: "Standard Circles Test" });
      const options = known.map((entry,index) => {
        const meta = [entry.roleLabel, entry.profession, entry.location, entry.statusLabel].filter(Boolean).join(" · ");
        return `<option value="${index}">${esc(entry.name)}${meta ? ` · ${esc(meta)}` : ""}</option>`;
      }).join("");
      const selectedIndex = await foundry.applications.api.DialogV2.wait({
        window: { title: "Realm Guard · Circles · Known Person", resizable: true },
        position: { width: 560 },
        content: `<form class="realm-guard rg-m8-circles-dialog">
          <div class="rg-brand">REALM GUARD / TORCHBEARER · CIRCLES</div>
          <h2>Known Person / Contact</h2>
          <p>Select the person this Circles test concerns. This does not automatically change their status or create an NPC.</p>
          <label><span>Known person</span><select name="knownIndex">${options}</select></label>
        </form>`,
        modal: false,
        rejectClose: false,
        buttons: [
          { action: "continue", label: "Continue to Circles Test", icon: "fa-solid fa-dice", default: true, callback: (_event,button) => Number(button.form?.elements?.knownIndex?.value ?? -1) },
          { action: "cancel", label: "Cancel", callback: () => -1 }
        ]
      });
      const selected = known[Number(selectedIndex)];
      if (!selected) return null;
      return Object.freeze({ mode: "known", ...selected, label: `Known: ${selected.name}` });
    }

    const newPerson = await foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard · Circles · Find New Person", resizable: true },
      position: { width: 620 },
      content: `<form class="realm-guard rg-m8-circles-dialog">
        <div class="rg-brand">REALM GUARD / TORCHBEARER · CIRCLES</div>
        <h2>Find New Person</h2>
        <p>Describe who the Ranger is trying to find. The record is committed only if the Circles test passes. Initial relationship status is Neutral and can be changed later.</p>
        <div class="rg-m8-contact-grid">
          <label><span>Name *</span><input type="text" name="name" required placeholder="Person name"></label>
          <label><span>Profession / Role</span><input type="text" name="profession" placeholder="Guide, Smith, Healer..."></label>
          <label><span>People / Culture</span><input type="text" name="people" placeholder="Man, Dwarf, Elf..."></label>
          <label><span>Location</span><input type="text" name="location" placeholder="Settlement or region"></label>
          <label class="rg-contact-wide"><span>Notes</span><textarea name="notes" rows="3" placeholder="Why is the Ranger looking for this person?"></textarea></label>
        </div>
        <p class="rg-m8-circles-note"><b>On PASS:</b> creates a Neutral Contact in Social Network. <b>On FAIL:</b> the GM chooses normal failure or may invoke the Enmity Clause.</p>
      </form>`,
      modal: false,
      rejectClose: false,
      buttons: [
        {
          action: "continue",
          label: "Continue to Circles Test",
          icon: "fa-solid fa-dice",
          default: true,
          callback: (_event,button) => ({
            name: String(button.form?.elements?.name?.value || "").trim(),
            profession: String(button.form?.elements?.profession?.value || "").trim(),
            people: String(button.form?.elements?.people?.value || "").trim(),
            location: String(button.form?.elements?.location?.value || "").trim(),
            notes: String(button.form?.elements?.notes?.value || "").trim()
          })
        },
        { action: "cancel", label: "Cancel", callback: () => null }
      ]
    });
    if (!newPerson) return null;
    if (!newPerson.name) {
      ui.notifications.warn("Realm Guard: Name is required for a new Circles person.");
      return null;
    }
    return Object.freeze({ mode: "new", ...newPerson, label: `New: ${newPerson.name}` });
  }

  static async _commitCirclesSocialContext(context, result) {
    if (!context || context.mode === "standard" || !result || result.tied) return;

    if (context.mode === "known") {
      const outcome = result.passed ? "PASS" : "FAIL";
      ui.notifications.info(`Realm Guard: Circles ${outcome} for known person ${context.name}. Social Network data was not changed automatically.`);
      return;
    }

    if (context.mode !== "new") return;
    if (!result.passed) {
      await requestM8EnmityDecision(this.actor, context);
      return;
    }

    try {
      const created = await createM8CirclesContact(this.actor, {
        name: context.name,
        profession: context.profession,
        people: context.people,
        location: context.location,
        notes: context.notes,
      });
      if (created.duplicate) {
        ui.notifications.info(`Realm Guard: Circles found ${created.person.name}; that person already exists in the Social Network, so no duplicate was created.`);
      } else {
        ui.notifications.info(`Realm Guard: Circles found ${created.person.name}. Added as a Neutral Contact; no NPC Actor was created.`);
      }
    } catch (error) {
      console.error("Realm Guard | Circles Social Network commit failed", error);
      ui.notifications.error(`Realm Guard: ${error?.message || "Could not record the Circles Contact."}`);
    }
  }

  static async _openRollDialog(role, { versus = false, obstacle = 1, modifier = 0, isSkill = true, tokenSourceIsSkill = null, beginnerLuck = false, beginnerAbility = "", abilityKey = "", natureTarget = null, fixedObstacle = false, circlesContext = null, allowHelp = true } = {}) {
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
    const family = getActiveM10BFamilyRulePolicy();
    const angryActive = !family.mg1eTraits && hasActiveCondition(this.actor, "Angry");
    const afraidActive = family.afraidBlocksHelp && hasActiveCondition(this.actor, "Afraid");
    const hardConditionNotes = [
      angryActive ? "Angry: beneficial Trait/Wise effects are blocked." : "",
      afraidActive ? "Afraid: this Ranger cannot Help or use Beginner's Luck." : "",
      beginnerLuck && hasActiveCondition(this.actor, "Fresh") ? "Fresh +1D is applied after Beginner's Luck halving." : ""
    ].filter(Boolean);

    const teamworkTestKind = role?.type === "wise" ? "Wise" : (isSkill ? "Skill" : "Ability");
    const teamworkSessionId = allowHelp
      ? createTeamworkSession({ requesterActorId: this.actor.id, testName: role.name, testKind: teamworkTestKind, excludedActorIds: [opponent?.id].filter(Boolean) })
      : null;
    const teamworkHelp = family.helperSourcePolicy === "MG1E_TYPED"
      ? (teamworkTestKind === "Ability"
        ? "<b>Teamwork:</b> an Ability test is helped by another Ranger with an appropriate Ability for +1D. <b>I Am Wise</b> is the acting Ranger's own relevant rated Wise. Synergy is disabled."
        : "<b>Teamwork:</b> a Skill or Wise test is helped by another Ranger with an appropriate Skill or rated Wise for +1D. <b>I Am Wise</b> is the acting Ranger's own relevant rated Wise. Synergy is disabled.")
      : "<b>Normal Help:</b> a Ranger answers with an appropriate trained Skill or Ability for +1D. <b>I Am Wise:</b> a relevant Wise can instead give +1D. <b>Synergy:</b> the helper chooses it in their own Help request and spends their own Fate if the roll resolves.";
    const teamworkBlock = allowHelp
      ? `<fieldset class="rg-teamwork"><legend>Help / Teamwork <span class="rg-help-tip" title="Ask active Ranger players for Help. Accepted Help is added to this roll automatically. Helper Traits are not allowed.">?</span></legend><div class="rg-teamwork-requester"><button type="button" class="rg-teamwork-ask" data-rg-teamwork-ask="${teamworkSessionId}"><i class="fa-solid fa-handshake-angle"></i> Ask for Help</button><span data-rg-help-request-status>Help is optional. Ask active Rangers only when you want it.</span></div><div class="rg-teamwork-accepted-list" data-rg-help-summary><span class="rg-muted">No Help accepted yet.</span></div><small>${teamworkHelp} You can keep preparing the roll while Help replies arrive.</small></fieldset>`
      : `<fieldset class="rg-teamwork"><legend>Help / Teamwork</legend><div class="rg-teamwork-accepted-list"><span class="rg-muted">Help is unavailable for this test under the active rules profile.</span></div><small>Mouse Guard family recovery: another character cannot Help a Will or Health recovery test.</small></fieldset>`;

    const n = this.actor.system.attributes?.nature ?? {}, natureCurrent = Math.max(0, Number(n.value ?? 0)), natureMaximum = Math.max(natureCurrent, Number(n.maximum ?? natureCurrent));
    const isNatureRoll = String(abilityKey) === "nature";
    const natureExcluded = new Set(family.nature.tapExcludedAbilities.map(value => String(value).toLowerCase()));
    const canTapNature = family.nature.tapNature && !isNatureRoll && !natureExcluded.has(String(abilityKey).toLowerCase()) && natureCurrent > 0;
    const natureDescriptors = natureDescriptorText(family);
    const natureLabel = natureProfileLabel(family);
    const noPersona = personaValue < 1 ? ` <b class="rg-disabled-reason">Unavailable — requires 1 Persona.</b>` : "";
    const natureBlock = isNatureRoll
      ? `<fieldset class="rg-nature-roll"><legend>${foundry.utils.escapeHTML(natureLabel)} · ${natureCurrent}/${natureMaximum} <span class="rg-help-tip" title="Nature is special: acting against its descriptors can Tax it. Advancement uses Maximum Nature.">?</span></legend><p><b>Descriptors:</b> ${foundry.utils.escapeHTML(natureDescriptors || "Profile-defined")}</p><label>Test is <select name="natureUse"><option value="within">Within Nature descriptors</option><option value="against">Against Nature descriptors</option></select></label>${natureTarget ? `<label><input type="checkbox" name="natureVersus"> Versus target: ${foundry.utils.escapeHTML(natureTarget.name)} · Nature</label>` : ""}${family.nature.doubleTapNature ? `<label><input type="checkbox" name="doubleTapNature" ${personaValue < 1 ? "disabled" : ""}> Double-Tap Nature (+${natureCurrent}D, costs 1 Persona)${noPersona}</label>` : ""}<small>${family.nature.doubleTapNature ? "Double-Tap is within Nature only. " : ""}Against Nature failures tax by Margin of Failure.</small></fieldset>`
      : (canTapNature ? `<fieldset class="rg-nature-roll"><legend>Tap Nature · ${natureCurrent}/${natureMaximum} <span class="rg-help-tip" title="Spend 1 Persona to add current Nature to this test. Acting against Nature can Tax it.">?</span></legend><p><b>Descriptors:</b> ${foundry.utils.escapeHTML(natureDescriptors || "Profile-defined")}</p><label><input type="checkbox" name="tapNature" ${personaValue < 1 ? "disabled" : ""}> Tap Nature (+${natureCurrent}D, costs 1 Persona)${noPersona}</label><label>Test is <select name="natureScope"><option value="within">Within Nature descriptors</option><option value="against">Against Nature descriptors</option></select></label><small>${beginnerLuck ? `Beginner's Luck: Tap Nature dice are added after halving. ` : ""}Within + PASS: no tax. Against + PASS: tax 1. Failed tapped test: tax by Margin of Failure. Not available for ${family.nature.tapExcludedAbilities.join("/") || "profile-excluded abilities"}.</small></fieldset>` : "");
    const tokenRollIsSkill = tokenSourceIsSkill === null || tokenSourceIsSkill === undefined ? isSkill : Boolean(tokenSourceIsSkill);
    const tokenOptions = tokenPowerOptionViews(this.actor, role.name, { isSkill: tokenRollIsSkill });
    const tokenPowerBlock = tokenOptions.length ? `<fieldset class="rg-token-roll-choice"><legend><i class="fa-solid fa-gem"></i> Token of Power</legend><label>Invoke Token <select name="tokenPowerId"><option value="">None</option>${tokenOptions.map(t => `<option value="${t.id}" ${t.disabled ? "disabled" : ""}>${foundry.utils.escapeHTML(t.label)}</option>`).join("")}</select></label><small>Skill-linked Tokens are filtered to this roll. Specific-use Tokens are marked TABLE CHECK.</small></fieldset>` : "";
    const talentOptions = getActiveM10BSessionCirclesProgressionPolicy().progression.talentsEnabled ? talentOptionViews(this.actor, role.name, { isSkill: tokenRollIsSkill }) : [];
    const talentBlock = talentOptions.length ? `<fieldset class="rg-talent-roll-choice"><legend><i class="fa-solid fa-sparkles"></i> Talent</legend><label>Use Talent <select name="talentId"><option value="">None</option>${talentOptions.map(t => `<option value="${t.id}" ${t.disabled ? "disabled" : ""}>${foundry.utils.escapeHTML(t.label)}</option>`).join("")}</select></label><small>Once/session Talents are consumed only after a committed roll.</small></fieldset>` : "";

    const circlesBlock = String(abilityKey) === "circles" && circlesContext
      ? `<fieldset class="rg-m8-circles-roll-context"><legend><i class="fa-solid fa-address-book"></i> Circles · Social Network</legend><p><b>${foundry.utils.escapeHTML(circlesContext.label || "Circles Test")}</b></p><small>${circlesContext.mode === "new" ? "A successful result records this person as a Neutral Contact. Failure creates no Contact in qa.39." : circlesContext.mode === "known" ? "This roll references an existing Social Network person. Status/history are not changed automatically." : "Standard Circles roll. No Social Network data will be changed."}</small></fieldset>`
      : "";

    const isCirclesObstacle = String(abilityKey) === "circles";
    const ruleSpecific = fixedObstacle || Boolean(versus && opponent) || String(abilityKey) === "resources";
    const workflow = ruleSpecific ? "manual" : obstacleMode();

    // Circles Obstacle is always GM authority. It starts from the table Baseline,
    // can be pushed live from Obstacle Control, and is never editable by the player.
    const initialObstacle = isCirclesObstacle
      ? baselineObstacle()
      : (workflow === "baseline" || workflow === "approval" ? baselineObstacle() : Math.max(0, Number(obstacle) || 0));

    const review = !ruleSpecific && workflow === "approval"
      ? beginObstacleReview({ actorName: this.actor.name, testName: role.name, obstacle: initialObstacle })
      : null;
    const requestAttr = review ? ` data-rg-obstacle-request="${review.requestId}"` : "";

    // Circles stays linked to GM live Obstacle control whenever it is not waiting
    // on the explicit GM Approval request. This also makes Manual mode GM-controlled.
    const liveLinked = !review && (isCirclesObstacle || (workflow === "baseline" && !ruleSpecific));
    const liveAttr = liveLinked
      ? ` data-rg-obstacle-live-linked="true" data-rg-obstacle-source="${isCirclesObstacle ? "gm-control" : "baseline"}"`
      : "";

    const obReadonly = versus && opponent ? "disabled" : (review || isCirclesObstacle) ? "readonly" : "";
    const obStatus = review
      ? `<div class="rg-obstacle-live-status" data-rg-obstacle-status><i class="fa-solid fa-hourglass-half"></i> Awaiting GM approval · current Ob ${review.initial}</div>`
      : isCirclesObstacle
        ? `<div class="rg-obstacle-live-status approved" data-rg-obstacle-live-status><i class="fa-solid fa-lock"></i> Ob ${initialObstacle} · GM controlled</div>`
        : workflow === "baseline" && !ruleSpecific
          ? `<div class="rg-obstacle-live-status approved" data-rg-obstacle-live-status><i class="fa-solid fa-link"></i> Ob ${initialObstacle} · Baseline</div>`
          : "";
    const canCountLearning = Boolean(isSkill || abilityKey);

    const automaticModifier = Number(modifier || 0) + Number(conditionData.dice || 0);
    const modifierBreakdown = conditionData.active.length ? conditionData.active.map(c => `${foundry.utils.escapeHTML(c.name)} ${Number(c.system.rollModifier ?? 0) >= 0 ? "+" : ""}${Number(c.system.rollModifier ?? 0)}D`).join(" · ") : "No automatic Condition modifier.";
    const traitOptionsHtml = this.actor.traits.map(trait => {
      const status = traitPositiveStatus(this.actor, trait);
      const level = Number(trait.system.rating ?? 0);
      const state = family.mg1eTraits
        ? (level === 3
          ? (status.available ? "reroll failures · 1/session" : "reroll · USED")
          : level === 2
            ? "+1D · every applicable test"
            : status.available ? "+1D · 1/session" : "+1D · USED")
        : (level === 3 ? "+1s · always when relevant" : status.available ? `+1D · ${status.remaining}/${status.limit} left` : "+1D · USED this session");
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
        ${circlesBlock}${teamworkBlock}${natureBlock}
        <div class="rg-condition-roll-preview"><span>ACTIVE CONDITIONS${conditionData.dice ? ` · ${conditionData.dice > 0 ? "+" : ""}${conditionData.dice}D` : ""}</span><div>${conditionPreview}</div>${hardConditionNotes.length ? `<small>${hardConditionNotes.map(foundry.utils.escapeHTML).join(" · ")}</small>` : ""}</div>
        ${canCountLearning ? `<fieldset class="rg-learning-choice"><legend>Learning & Advancement <span class="rg-help-tip" title="Pass and Fail results are tracked automatically. When both requirements are met, the Skill or Ability advances immediately.">?</span></legend><label><input type="checkbox" name="countLearning" ${this.actor.type === "npc" ? "" : "checked"}> Count this test for Learning</label><small>${beginnerLuck ? "This marks one Beginner's Luck attempt only. It does not advance the Will/Health base Ability." : "Turn this off only when this test should not earn an advancement mark."}</small></fieldset>` : ""}
        <fieldset><legend>Spend before roll</legend><label>Persona dice <select name="persona" ${personaValue < 1 ? "disabled" : ""}>${[0,1,2,3].filter(n => n <= Math.max(0, personaValue)).map(n => `<option value="${n}">${n} Persona · +${n}D</option>`).join("") || `<option value="0">0 Persona · +0D</option>`}</select> <small>(${personaValue} available; max +3D)${personaValue < 1 ? ` <b class="rg-disabled-reason">No Persona available.</b>` : ""}</small></label></fieldset>
        ${tokenPowerBlock}${talentBlock}
        <fieldset><legend>Traits & Wises</legend><label>Trait <select name="traitId"><option value="">None</option>${traitOptionsHtml}</select></label><label>Trait use <select name="traitMode"><option value="help">Help yourself (rule-based Trait benefit)</option><option value="against">Against yourself (-1D; earns 1 Check in GM Turn)</option>${((versus && opponent) || (isNatureRoll && natureTarget)) ? `<option value="hurt">Against yourself in Versus (opponent +2D; earns 2 Checks in GM Turn)</option>` : ""}</select></label><small>${family.mg1eTraits ? "<b>Beneficial Traits:</b> Level 1 = +1D once/session; Level 2 = +1D on every applicable test; Level 3 = reroll all failed dice once/session. Fate/Open 6s is resolved after the Level 3 reroll. Trait Against is separate." : "<b>Beneficial Traits:</b> Level 1 = +1D once/session; Level 2 = +1D twice/session; Level 3 = +1s on relevant passed/tied tests. Used Level 1/2 benefits are enforced automatically and reset when End Session is finalized. Trait Against is separate. Helper Traits are not Teamwork."}</small><label>${family.ratedWises ? "I Am Wise" : "Wise"} <select name="wiseId"><option value="">None</option>${this.actor.wises.filter(w => !family.ratedWises || (Number(w.system?.rating ?? 0) > 0 && w.id !== role.id)).map(w => `<option value="${w.id}">${foundry.utils.escapeHTML(w.name)}${family.ratedWises ? ` (${Number(w.system?.rating ?? 0)} · +1D)` : " (reroll failed dice)"}</option>`).join("")}</select></label>${family.ratedWises && this.actor.wises.some(w => Number(w.system?.rating ?? 0) <= 0) ? `<small class="rg-wise-unrated-note"><b>Preserved unrated Wises are not listed here.</b> Assign an explicit rating only when your table has established one; Realm Guard will never guess or auto-convert it.</small>` : ""}</fieldset>
      </div>`;

    const DialogV2 = foundry.applications.api.DialogV2;
    const result = await DialogV2.wait({
      window: { title: `Realm Guard · Roll ${role.name}`, resizable: true }, content, modal: false, rejectClose: false,
      buttons: [{ action: "roll", label: review ? "Roll when Ob is approved" : "Roll", icon: "fa-solid fa-dice", default: true, callback: async (_event, button) => {
        const form = button.form; if (!form) return null;
        if (review) await review.promise;
        const elements = form.elements;
        const help = allowHelp && teamworkSessionId ? teamworkEntries(teamworkSessionId) : [];
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
    if (teamworkSessionId) finishTeamworkSession(teamworkSessionId);
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
    const options = await RealmGuardActorSheet._openRollDialog.call(this, subject, { versus: false, obstacle: method.obstacle, modifier: 0, isSkill: method.kind === "role", tokenSourceIsSkill: method.kind === "role", abilityKey: method.kind === "ability" ? method.key : "", fixedObstacle: true, allowHelp: method.helpAllowed !== false });
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
        const refund = await refundRecoveryChecks(this.actor, spent);
        if (!refund?.ok && refund?.reason) ui.notifications.warn(`Realm Guard: ${refund.reason}`);
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
    const recoveryPolicy = getActiveM10BConditionRecoveryPolicy();
    let profileRecovery = null;
    if (recoveryPolicy.familySemantics) {
      profileRecovery = familyRecoveryState(item.name, {
        passed: Boolean(result.passed),
        phase: spent.phase,
        turnManagerEnabled: turnManagerEnabled(),
        checks: Number(this.actor.system?.resources?.checks?.value ?? 0)
      }, recoveryPolicy);
      if (result.passed) {
        await item.unsetFlag("realm-guard", "profileRecoveryState");
        await item.unsetFlag("realm-guard", "strictRecoveryState");
        await setConditionActive(this.actor, item, false);
      } else {
        await item.setFlag("realm-guard", "profileRecoveryState", {
          profileId: recoveryPolicy.profileId,
          state: profileRecovery.state,
          nextAction: profileRecovery.nextAction,
          updatedAt: Date.now()
        });
      }
    } else if (result.passed) {
      await setConditionActive(this.actor, item, false);
    }

    const esc = foundry.utils.escapeHTML;
    const economy = spent.phase === "free" ? "Free Play · no Turn/Check cost" : spent.phase === "gm" ? `2 Checks · ${spent.before} → ${spent.after}` : "Players' Turn Free Test/Check economy (see roll card)";
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: `<div class="realm-guard chat-roll rg-recovery-roll"><div class="rg-custom-chat-tag">RECOVERY · ${turnLabel()}</div><h3>${esc(item.name)}</h3><p><b>Method:</b> ${esc(method.name)} · Ob ${method.obstacle}</p><p><b>Recovery economy:</b> ${economy}</p><p><strong class="rg-roll-outcome ${result.passed ? "pass" : "fail"}">${result.passed ? "RECOVERED" : "NOT RECOVERED"}</strong></p>${result.passed ? "" : `<p><small>${profileRecovery?.nextAction && profileRecovery.nextAction !== "RETRY_WHEN_ALLOWED" ? `Profile recovery route: ${esc(profileRecovery.nextAction.replaceAll("_"," "))}.` : "The Condition remains active. Recovery failure does not create an additional twist or Condition."}</small></p>`}</div>` });
    ui.notifications.info(`Realm Guard: ${item.name} ${result.passed ? "recovered" : "remains active"}.`);
  }

  static async _manageNature() {
    const n=this.actor.system.attributes?.nature??{}, current=Math.max(0,Number(n.value??0)), maximum=Math.max(current,Number(n.maximum??current)), tax=Math.max(0,maximum-current);
    const family=getActiveM10BFamilyRulePolicy(), descriptors=natureDescriptorText(family), natureLabel=natureProfileLabel(family);
    const result=await foundry.applications.api.DialogV2.wait({window: { title: `Realm Guard · Manage ${natureLabel}`, resizable: true },content:`<div class="rg-nature-manage"><h3>${foundry.utils.escapeHTML(natureLabel)} ${current}/${maximum}</h3><p><b>Tax:</b> ${tax}</p><p><b>Descriptors:</b> ${foundry.utils.escapeHTML(descriptors || "Profile-defined")}</p><p><small>Recover +1 only when the rules allow recovery. Deplete Maximum trades one point of maximum Nature to recover one point of tax.</small></p></div>`,modal:false,rejectClose:false,buttons:[{action:"recover",label:"Recover +1",icon:"fa-solid fa-leaf",callback:()=>"recover"},{action:"deplete",label:"Deplete Maximum",icon:"fa-solid fa-arrow-down",callback:()=>"deplete"},{action:"close",label:"Close",default:true,callback:()=>"close"}]});
    if(result==="recover"&&tax>0)await this.actor.update({"system.attributes.nature.value":Math.min(maximum,current+1)});
    if(result==="deplete"&&tax>0&&maximum>0){const nm=Math.max(0,maximum-1),nc=Math.min(nm,current+1);await this.actor.update({"system.attributes.nature.maximum":nm,"system.attributes.nature.value":nc});if(nm===0)ui.notifications.warn("Realm Guard: Maximum Nature is 0. The character must retire at the end of the mission.");}
  }

  static async _createDynamicContact() {
    if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Dynamic Contact creation is GM-only during M8 migration.");
    const esc = foundry.utils.escapeHTML;
    const statusOptions = M8_RELATIONSHIP_STATUS_OPTIONS
      .filter(option => option.value !== "UNKNOWN")
      .map(option => `<option value="${esc(option.value)}" ${option.value === "NEUTRAL" ? "selected" : ""}>${esc(option.label)}</option>`)
      .join("");

    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard · New Contact", resizable: true },
      position: { width: 620 },
      content: `<form class="realm-guard rg-m8-contact-dialog">
        <div class="rg-brand">REALM GUARD / TORCHBEARER · SOCIAL NETWORK</div>
        <h2>New Contact</h2>
        <p>Add a person met during play. This creates Social Network data only; it does <b>not</b> create an NPC Actor automatically.</p>
        <div class="rg-m8-contact-grid">
          <label><span>Name *</span><input type="text" name="name" required placeholder="Contact name"></label>
          <label><span>Profession / Role</span><input type="text" name="profession" placeholder="Smith, Guide, Healer..."></label>
          <label><span>People / Culture</span><input type="text" name="people" placeholder="Man, Dwarf, Elf..."></label>
          <label><span>Location</span><input type="text" name="location" placeholder="Settlement or region"></label>
          <label class="rg-contact-wide"><span>Status</span><select name="status">${statusOptions}</select></label>
          <label class="rg-contact-wide"><span>Notes</span><textarea name="notes" rows="4" placeholder="Why does this person matter?"></textarea></label>
        </div>
      </form>`,
      modal: false,
      rejectClose: false,
      buttons: [
        {
          action: "create",
          label: "Add Contact",
          icon: "fa-solid fa-address-book",
          default: true,
          callback: (_event, button) => ({
            name: String(button.form?.elements?.name?.value || "").trim(),
            profession: String(button.form?.elements?.profession?.value || "").trim(),
            people: String(button.form?.elements?.people?.value || "").trim(),
            location: String(button.form?.elements?.location?.value || "").trim(),
            status: String(button.form?.elements?.status?.value || "NEUTRAL"),
            notes: String(button.form?.elements?.notes?.value || "").trim()
          })
        },
        { action: "cancel", label: "Cancel", callback: () => null }
      ]
    });

    if (!result) return;
    if (!result.name) return ui.notifications.warn("Realm Guard: Contact Name is required.");

    try {
      const created = await createM8DynamicContact(this.actor, {
        ...result,
        origin: "PLAY"
      });
      if (created.duplicate) {
        ui.notifications.warn(`Realm Guard: ${created.person.name} already exists in this Ranger's Social Network with the same identity details.`);
        return;
      }
      ui.notifications.info(`Realm Guard: Added ${created.person.name} as a Contact. No NPC Actor was created.`);
      await this.render({ force: true });
    } catch (error) {
      console.error("Realm Guard | Dynamic Contact creation failed", error);
      ui.notifications.error(`Realm Guard: ${error?.message || "Could not create Contact."}`);
    }
  }

  static async _editDynamicContact(event, target) {
    if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Dynamic Contact editing is GM-only during M8 migration.");
    const card = target.closest("[data-rg-person-id]");
    const personId = String(card?.dataset.rgPersonId ?? "");
    if (!personId) return ui.notifications.warn("Realm Guard: Could not resolve the Contact.");

    const view = buildM8RelationshipSheetView(this.actor);
    const person = view.people.find(entry => entry.id === personId);
    if (!person) return ui.notifications.warn("Realm Guard: Contact person is unavailable.");

    const esc = foundry.utils.escapeHTML;
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: `Realm Guard · Edit ${person.name}`, resizable: true },
      position: { width: 620 },
      content: `<form class="realm-guard rg-m8-contact-dialog">
        <div class="rg-brand">REALM GUARD / TORCHBEARER · SOCIAL NETWORK</div>
        <h2>Edit Contact</h2>
        <p>Edit identity details for this Contact. Actor links and Relationship history are preserved.</p>
        <div class="rg-m8-contact-grid">
          <label><span>Name *</span><input type="text" name="name" required value="${esc(person.name || "")}"></label>
          <label><span>Profession / Role</span><input type="text" name="profession" value="${esc(person.profession || "")}"></label>
          <label><span>People / Culture</span><input type="text" name="people" value="${esc(person.people || "")}"></label>
          <label><span>Location</span><input type="text" name="location" value="${esc(person.location || "")}"></label>
          <label class="rg-contact-wide"><span>Notes</span><textarea name="notes" rows="4">${esc(person.notes || "")}</textarea></label>
        </div>
      </form>`,
      modal: false,
      rejectClose: false,
      buttons: [
        {
          action: "save",
          label: "Save Contact",
          icon: "fa-solid fa-floppy-disk",
          default: true,
          callback: (_event, button) => ({
            name: String(button.form?.elements?.name?.value || "").trim(),
            profession: String(button.form?.elements?.profession?.value || "").trim(),
            people: String(button.form?.elements?.people?.value || "").trim(),
            location: String(button.form?.elements?.location?.value || "").trim(),
            notes: String(button.form?.elements?.notes?.value || "").trim()
          })
        },
        { action: "cancel", label: "Cancel", callback: () => null }
      ]
    });

    if (!result) return;
    if (!result.name) return ui.notifications.warn("Realm Guard: Contact Name is required.");
    try {
      await updateM8Person(this.actor, personId, result);
      ui.notifications.info(`Realm Guard: Updated Contact ${result.name}.`);
      await this.render({ force: true });
    } catch (error) {
      console.error("Realm Guard | Dynamic Contact edit failed", error);
      ui.notifications.error(`Realm Guard: ${error?.message || "Could not update Contact."}`);
    }
  }

  static async _changeRelationshipStatus(event, target) {
    if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Relationship status changes are GM-only during M8 migration.");

    const card = target.closest("[data-rg-relationship-id]");
    const relationshipId = String(card?.dataset.rgRelationshipId ?? "");
    if (!relationshipId) return ui.notifications.warn("Realm Guard: Could not resolve the relationship.");

    const view = buildM8RelationshipSheetView(this.actor);
    const relationship = view.relationships.find(entry => entry.id === relationshipId);
    if (!relationship) return ui.notifications.warn("Realm Guard: Relationship record is unavailable.");

    const esc = foundry.utils.escapeHTML;
    const currentStatus = String(relationship.status || "UNKNOWN");
    const options = M8_RELATIONSHIP_STATUS_OPTIONS.map(option =>
      `<option value="${esc(option.value)}" ${option.value === currentStatus ? "selected" : ""}>${esc(option.label)}</option>`
    ).join("");
    const personName = relationship.person?.name || "this person";

    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: `Realm Guard · Relationship with ${personName}`, resizable: true },
      position: { width: 560 },
      content: `<form class="realm-guard rg-m8-status-dialog">
        <div class="rg-brand">REALM GUARD / TORCHBEARER · SOCIAL NETWORK</div>
        <h2>${esc(personName)}</h2>
        <p>Change how this relationship currently stands. The previous state is preserved in Relationship History.</p>
        <label><span>Status</span><select name="status">${options}</select></label>
        <label><span>Reason / event <small>optional</small></span><textarea name="reason" rows="3" placeholder="What changed between them?"></textarea></label>
        <label><span>Session / reference <small>optional</small></span><input type="text" name="sessionId" placeholder="e.g. Session 8"></label>
        <div class="rg-m8-status-current"><b>Current:</b> ${esc(String(relationship.statusLabel || currentStatus))}</div>
      </form>`,
      modal: false,
      rejectClose: false,
      buttons: [
        {
          action: "save",
          label: "Save Relationship",
          icon: "fa-solid fa-heart-crack",
          default: true,
          callback: (_event, button) => ({
            status: String(button.form?.elements?.status?.value || currentStatus),
            reason: String(button.form?.elements?.reason?.value || "").trim(),
            sessionId: String(button.form?.elements?.sessionId?.value || "").trim()
          })
        },
        { action: "cancel", label: "Cancel", callback: () => null }
      ]
    });

    if (!result) return;
    if (result.status === currentStatus) {
      ui.notifications.info("Realm Guard: Relationship status was unchanged.");
      return;
    }

    await updateM8RelationshipStatus(this.actor, relationshipId, result.status, {
      reason: result.reason,
      sessionId: result.sessionId,
      source: "GM"
    });
    ui.notifications.info(`Realm Guard: Relationship with ${personName} changed to ${M8_RELATIONSHIP_STATUS_OPTIONS.find(option => option.value === result.status)?.label || result.status}.`);
    await this.render({ force: true });
  }

  static async _createRelationshipNpc(event, target) {
    if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Relationship NPC creation is GM-only.");

    const personId = String(target.closest("[data-rg-person-id]")?.dataset.rgPersonId ?? "");
    if (!personId) return ui.notifications.warn("Realm Guard: Could not resolve the Social Network person.");

    const view = buildM8RelationshipSheetView(this.actor);
    const person = view.people.find(entry => entry.id === personId);
    if (!person) return ui.notifications.warn("Realm Guard: Could not resolve the relationship person.");

    const existingUuid = String(person.actorUuid ?? "").trim();
    if (existingUuid) {
      const existingId = existingUuid.startsWith("Actor.") ? existingUuid.slice(6) : "";
      const existingActor = existingId ? game.actors?.get?.(existingId) : null;
      if (existingActor) return ui.notifications.warn(`Realm Guard: ${person.name} is already linked to ${existingActor.name}.`);
    }

    const initialQuery = relationshipQuickNpcQuery(person);
    const rangerActor = this.actor;

    await openNpcTemplateLibrary({
      initialQuery,
      actorName: person.name,
      folderName: "NPC - PC Relations",
      folderFlag: "relationshipNpcFolder",
      closeAfterCreate: true,
      onCreated: async createdActor => {
        await linkM8PersonActor(rangerActor, personId, createdActor.uuid);
        createdActor.setFlag?.("realm-guard", "relationshipOrigin", {
          ownerActorUuid: rangerActor.uuid,
          ownerActorName: rangerActor.name,
          personId,
          personName: person.name
        }).catch?.(() => {});
        ui.notifications.info(`Realm Guard: ${createdActor.name} created and linked to ${rangerActor.name}.`);
        await this.render({ force: true });
      }
    });
  }

  static async _linkRelationshipActor(event, target) {
    const personId = String(target.closest("[data-rg-person-id]")?.dataset.rgPersonId ?? "");
    if (!personId) return ui.notifications.warn("Realm Guard: Could not resolve the Social Network person.");

    const candidates = (game.actors?.contents ?? [])
      .filter(actor => actor.id !== this.actor.id && ["character", "npc"].includes(actor.type))
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));

    if (!candidates.length) return ui.notifications.warn("Realm Guard: There are no other Character/NPC Actors available to link.");

    const esc = foundry.utils.escapeHTML;
    const options = candidates.map(actor => {
      const label = `${actor.name} · ${actor.type === "npc" ? "NPC" : "Character"}`;
      return `<option value="${esc(actor.uuid)}">${esc(label)}</option>`;
    }).join("");

    const actorUuid = await foundry.applications.api.DialogV2.wait({
      window: { title: "Realm Guard · Link Existing Actor", resizable: true },
      content: `<div class="realm-guard rg-m8-link-dialog">
        <p>Link this relationship person to an existing Foundry Actor. This does <b>not</b> create or delete an NPC.</p>
        <label>Existing Actor<select name="actorUuid">${options}</select></label>
      </div>`,
      modal: false,
      rejectClose: false,
      buttons: [
        { action: "link", label: "Link Actor", icon: "fa-solid fa-link", default: true, callback: (_event, button) => String(button.form?.elements?.actorUuid?.value ?? "") },
        { action: "cancel", label: "Cancel", callback: () => "" }
      ]
    });

    if (!actorUuid) return;
    await linkM8PersonActor(this.actor, personId, actorUuid);
    ui.notifications.info("Realm Guard: Relationship linked to existing Actor.");
    await this.render({ force: true });
  }

  static async _openRelationshipActor(event, target) {
    const actorUuid = String(target.closest("[data-rg-person-id]")?.dataset.rgActorUuid ?? "");
    if (!actorUuid) return ui.notifications.warn("Realm Guard: This relationship is not linked to an Actor.");
    const id = actorUuid.startsWith("Actor.") ? actorUuid.slice(6) : "";
    const actor = id ? game.actors?.get?.(id) : null;
    if (!actor) return ui.notifications.warn("Realm Guard: The linked Actor could not be resolved.");
    actor.sheet?.render(true);
  }

  static async _unlinkRelationshipActor(event, target) {
    const personId = String(target.closest("[data-rg-person-id]")?.dataset.rgPersonId ?? "");
    if (!personId) return;
    await linkM8PersonActor(this.actor, personId, "");
    ui.notifications.info("Realm Guard: Actor link removed. The Actor itself was not deleted.");
    await this.render({ force: true });
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
