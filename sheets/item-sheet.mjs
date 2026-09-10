import { normalizeContainerPreset, detachContainedGear } from "../module/inventory.mjs";
const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class RealmGuardItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["realm-guard", "item-sheet"],
    position: { width: 520, height: 500 },
    window: { resizable: true },
    form: { closeOnSubmit: false, submitOnChange: true, handler: RealmGuardItemSheet._onSubmit }
  };
  static PARTS = { main: { template: "systems/realm-guard/templates/item/item.hbs" } };

  static async _onSubmit(event, form, formData) {
    if (!this.isEditable) return;
    let updateData = formData.object;
    if (this.item.type === "gear") {
      const previousType = String(this.item.system.inventory?.containerType ?? "none");
      updateData = normalizeContainerPreset(updateData, this.item.system);
      const nextType = String(foundry.utils.getProperty(updateData, "system.inventory.containerType") ?? previousType);
      if (previousType !== "none" && nextType === "none" && this.item.parent) await detachContainedGear(this.item.parent, this.item.id);
    }
    const gearRerender = this.item.type === "gear" && String(this.item.system.inventory?.containerType ?? "none") !== String(foundry.utils.getProperty(updateData, "system.inventory.containerType") ?? this.item.system.inventory?.containerType ?? "none");
    const tokenRerender = this.item.type === "tokenOfPower" && (
      String(this.item.system.linkType ?? "skill") !== String(foundry.utils.getProperty(updateData, "system.linkType") ?? this.item.system.linkType ?? "skill") ||
      String(this.item.system.effectMode ?? "level") !== String(foundry.utils.getProperty(updateData, "system.effectMode") ?? this.item.system.effectMode ?? "level") ||
      Number(this.item.system.level ?? 1) !== Number(foundry.utils.getProperty(updateData, "system.level") ?? this.item.system.level ?? 1)
    );
    const talentRerender = this.item.type === "talent" && (
      String(this.item.system.linkType ?? "skill") !== String(foundry.utils.getProperty(updateData, "system.linkType") ?? this.item.system.linkType ?? "skill") ||
      String(this.item.system.effectMode ?? "dice") !== String(foundry.utils.getProperty(updateData, "system.effectMode") ?? this.item.system.effectMode ?? "dice") ||
      String(this.item.system.frequency ?? "session") !== String(foundry.utils.getProperty(updateData, "system.frequency") ?? this.item.system.frequency ?? "session")
    );
    await this.item.update(updateData);
    if (gearRerender || tokenRerender || talentRerender) await this.render({ force: true });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return foundry.utils.mergeObject(context, {
      item: this.item,
      system: this.item.system,
      isRole: this.item.type === "role",
      isTrait: this.item.type === "trait",
      isWise: this.item.type === "wise",
      isTokenOfPower: this.item.type === "tokenOfPower",
      isTalent: this.item.type === "talent",
      talentFrequencyPassive: this.item.type === "talent" && String(this.item.system.frequency ?? "session") === "passive",
      talentFrequencySession: this.item.type === "talent" && String(this.item.system.frequency ?? "session") === "session",
      talentFrequencyConflict: this.item.type === "talent" && String(this.item.system.frequency ?? "session") === "conflict",
      talentLinkSkill: this.item.type === "talent" && String(this.item.system.linkType ?? "skill") === "skill",
      talentLinkAbility: this.item.type === "talent" && String(this.item.system.linkType ?? "skill") === "ability",
      talentLinkGeneral: this.item.type === "talent" && String(this.item.system.linkType ?? "skill") === "general",
      talentEffectDice: this.item.type === "talent" && String(this.item.system.effectMode ?? "dice") === "dice",
      talentEffectManual: this.item.type === "talent" && String(this.item.system.effectMode ?? "dice") === "manual",
      talentAbilityWill: this.item.type === "talent" && String(this.item.system.linkedAbility ?? "") === "will",
      talentAbilityHealth: this.item.type === "talent" && String(this.item.system.linkedAbility ?? "") === "health",
      talentAbilityNature: this.item.type === "talent" && String(this.item.system.linkedAbility ?? "") === "nature",
      talentAbilityResources: this.item.type === "talent" && String(this.item.system.linkedAbility ?? "") === "resources",
      talentAbilityCircles: this.item.type === "talent" && String(this.item.system.linkedAbility ?? "") === "circles",
      tokenLevel1: this.item.type === "tokenOfPower" && Number(this.item.system.level ?? 1) === 1,
      tokenLevel2: this.item.type === "tokenOfPower" && Number(this.item.system.level ?? 1) === 2,
      tokenLevel3: this.item.type === "tokenOfPower" && Number(this.item.system.level ?? 1) === 3,
      tokenLinkSkill: this.item.type === "tokenOfPower" && String(this.item.system.linkType ?? "skill") === "skill",
      tokenLinkSpecific: this.item.type === "tokenOfPower" && String(this.item.system.linkType ?? "skill") === "specific",
      tokenEffectLevel: this.item.type === "tokenOfPower" && String(this.item.system.effectMode ?? "level") === "level",
      tokenEffectManual: this.item.type === "tokenOfPower" && String(this.item.system.effectMode ?? "level") === "manual",
      tokenOriginElven: this.item.type === "tokenOfPower" && String(this.item.system.origin ?? "") === "elven",
      tokenOriginDwarven: this.item.type === "tokenOfPower" && String(this.item.system.origin ?? "") === "dwarven",
      tokenOriginAncient: this.item.type === "tokenOfPower" && String(this.item.system.origin ?? "") === "ancient",
      tokenOriginOther: this.item.type === "tokenOfPower" && !["elven","dwarven","ancient"].includes(String(this.item.system.origin ?? "")),
      isGear: this.item.type === "gear",
      gearContainerNone: this.item.type === "gear" && String(this.item.system.inventory?.containerType ?? "none") === "none",
      gearContainerBackpack: this.item.type === "gear" && String(this.item.system.inventory?.containerType ?? "none") === "backpack",
      gearContainerSatchel: this.item.type === "gear" && String(this.item.system.inventory?.containerType ?? "none") === "satchel",
      gearContainerCustom: this.item.type === "gear" && String(this.item.system.inventory?.containerType ?? "none") === "custom",
      isCondition: this.item.type === "condition",
      recoveryIsManual: this.item.type === "condition" && this.item.system.recoveryType === "manual",
      recoveryIsAbility: this.item.type === "condition" && this.item.system.recoveryType === "ability",
      recoveryIsRole: this.item.type === "condition" && this.item.system.recoveryType === "role",
      recoveryAbilityIsWill: this.item.type === "condition" && this.item.system.recoveryAbility === "will",
      recoveryAbilityIsHealth: this.item.type === "condition" && this.item.system.recoveryAbility === "health",
      recoveryAbilityIsNature: this.item.type === "condition" && this.item.system.recoveryAbility === "nature",
      recoveryAbilityIsResources: this.item.type === "condition" && this.item.system.recoveryAbility === "resources",
      recoveryAbilityIsCircles: this.item.type === "condition" && this.item.system.recoveryAbility === "circles"
    }, { inplace: false });
  }
}
