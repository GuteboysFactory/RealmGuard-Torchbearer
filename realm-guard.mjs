import { installDefaultSkillProvisioning } from "./module/default-skills.mjs";
import { RealmGuardCharacterData, RealmGuardNpcData, RealmGuardRoleData, RealmGuardTraitData, RealmGuardGearData, RealmGuardConditionData, RealmGuardWiseData, RealmGuardTokenOfPowerData, RealmGuardTalentData } from "./module/data-models.mjs";
import { RealmGuardActor } from "./module/documents.mjs";
import { RealmGuardActorSheet } from "./sheets/actor-sheet.mjs";
import { RealmGuardNpcSheet } from "./sheets/npc-sheet.mjs";
import { RealmGuardItemSheet } from "./sheets/item-sheet.mjs";
import { installTokenConditionHud, installConditionTokenHover, installGmMassConditionHud, installConditionRuleAlignment, syncConditionEffect } from "./module/conditions.mjs";
import { installEndSession } from "./module/end-session.mjs";
import { installGmDock } from "./module/gm-dock.mjs";
import { installTurnManager } from "./module/turns.mjs";
import { installRealmGuardArt } from "./module/theme-art.mjs";
import { installInventoryQaTools } from "./module/qa-tools.mjs";
import { installInventoryMigration } from "./module/inventory.mjs";
import { installEquipmentSilhouette } from "./module/equipment-silhouette.mjs";
import { installRecruitment } from "./module/recruitment.mjs";
import { installConflictEngine } from "./module/conflicts.mjs";
import { installGmTools } from "./module/gm-tools.mjs";
import { installProgression } from "./module/progression.mjs";
import { installStarterCompendiums } from "./module/compendiums.mjs";
import { installContentStudio } from "./module/content-studio.mjs";
import { installSystemAudit } from "./module/system-audit.mjs";
import { installRealmGuardManual } from "./module/manual.mjs";
import { installObstacleWorkflow } from "./module/obstacles.mjs";
import { installTeamworkWorkflow } from "./module/teamwork.mjs";
import { installNpcBuilder } from "./module/npc-builder.mjs";
import { installContextHelp } from "./module/context-help.mjs";
import { installTokenNameHover } from "./module/token-hover.mjs";
import { installCoreBaseline } from "./module/core-baseline.mjs";
import { installRulesProfileInfrastructure } from "./module/rules-profile-service.mjs";
import { installEffectEngineInfrastructure } from "./module/effect-engine-service.mjs";
import { installTalentEffectShadow } from "./module/talent-effect-shadow.mjs";
import { installTestEngineInfrastructure } from "./module/test-engine-service.mjs";
import { installTestParityShadow } from "./module/test-parity-service.mjs";
import { installUntrainedVersusUi } from "./module/untrained-versus-ui.mjs";
import { installCustomRollParityAction } from "./module/custom-roll-parity-ui.mjs";
import { installCustomContentCompatibilityQa } from "./module/custom-content-compatibility.mjs";
import { installM4CoreServices } from "./module/m4-core-service.mjs";
import { installM4AdvancementShadowBridge } from "./module/m4-advancement-shadow-bridge.mjs";
import { installM4NatureShadowParity } from "./module/m4-nature-shadow-parity.mjs";
import { installM4ConditionRecoveryShadowParity } from "./module/m4-condition-recovery-shadow-parity.mjs";
import { installM5CoreServices } from "./module/m5-core-service.mjs";
import { installM6ConflictShadow } from "./module/m6-conflict-shadow.mjs";
import { installM7SessionShadow } from "./module/m7-session-shadow.mjs";
import { installActorSheetScrollPersistence } from "./module/actor-sheet-scroll-state.mjs";
import { installWindowPositionPersistence } from "./module/window-position-service.mjs";
import { installSkillRollUx } from "./module/skill-roll-ux.mjs";

Hooks.once("init", () => {
  console.log(`Realm Guard / Torchbearer | Initializing v${game.system?.version ?? "1.9.0-qa.12"}`);

  CONFIG.Actor.documentClass = RealmGuardActor;
  CONFIG.Actor.dataModels = { character: RealmGuardCharacterData, npc: RealmGuardNpcData };
  CONFIG.Item.dataModels = {
    role: RealmGuardRoleData,
    trait: RealmGuardTraitData,
    gear: RealmGuardGearData,
    wise: RealmGuardWiseData,
    condition: RealmGuardConditionData,
    tokenOfPower: RealmGuardTokenOfPowerData,
    talent: RealmGuardTalentData
  };

  const { DocumentSheetConfig } = foundry.applications.apps;
  installUntrainedVersusUi(RealmGuardActorSheet);
  installCustomRollParityAction(RealmGuardActorSheet);
  installSkillRollUx(RealmGuardActorSheet, RealmGuardActor);
  installEquipmentSilhouette(RealmGuardActorSheet);
  installActorSheetScrollPersistence(RealmGuardActorSheet);
  installWindowPositionPersistence();
  DocumentSheetConfig.registerSheet(Actor, "realm-guard", RealmGuardActorSheet, { types: ["character"], makeDefault: true, label: "Realm Guard / Torchbearer Ranger Sheet" });

  installCoreBaseline();
  installRulesProfileInfrastructure();
  installEffectEngineInfrastructure();
  installTalentEffectShadow();
  installTestEngineInfrastructure();
  installTestParityShadow(RealmGuardActor);
  installCustomContentCompatibilityQa();
  installM4CoreServices();
  installM4AdvancementShadowBridge(RealmGuardActor, RealmGuardActorSheet);
  installM4NatureShadowParity(RealmGuardActor);
  installM4ConditionRecoveryShadowParity(RealmGuardActor, RealmGuardActorSheet);
  installM5CoreServices();
  installM6ConflictShadow();
  installM7SessionShadow();

  installTokenConditionHud();
  installConditionTokenHover();
  installGmMassConditionHud();
  installDefaultSkillProvisioning();
  installConditionRuleAlignment();
  installGmDock();
  installTurnManager();
  installEndSession();
  installRealmGuardArt();
  installInventoryQaTools();
  installInventoryMigration();
  installRecruitment();
  installObstacleWorkflow();
  installTeamworkWorkflow();
  installNpcBuilder();
  installContextHelp();
  installTokenNameHover();
  installConflictEngine();
  installGmTools();
  installProgression();
  installStarterCompendiums();
  installContentStudio();
  installSystemAudit();
  installRealmGuardManual();

  DocumentSheetConfig.registerSheet(Actor, "realm-guard", RealmGuardNpcSheet, { types: ["npc"], makeDefault: true, label: "Realm Guard / Torchbearer NPC Sheet" });
  DocumentSheetConfig.registerSheet(Item, "realm-guard", RealmGuardItemSheet, { types: ["role", "trait", "wise", "gear", "condition", "tokenOfPower", "talent"], makeDefault: true, label: "Realm Guard / Torchbearer Item Sheet" });
});

Hooks.on("updateItem", async (item, changes, options) => {
  if (options?.realmGuardSkipConditionSync) return;
  if (item.type !== "condition" || !item.parent) return;
  const flat = foundry.utils.flattenObject(changes);
  const relevant = ["name", "system.active", "system.icon"].some(k => k in flat);
  if (relevant) await syncConditionEffect(item.parent, item);
});

Hooks.on("deleteItem", async item => {
  if (item.type !== "condition" || !item.parent) return;
  const effect = item.parent.effects.find(e => e.getFlag("realm-guard", "conditionItemId") === item.id);
  if (effect) await effect.delete();
});

Hooks.on("deleteActiveEffect", async effect => {
  const itemId = effect.getFlag("realm-guard", "conditionItemId");
  const actor = effect.parent;
  if (!itemId || !(actor instanceof Actor)) return;
  const item = actor.items.get(itemId);
  if (item?.type === "condition" && item.system.active) await item.update({ "system.active": false }, { realmGuardSkipConditionSync: true });
});