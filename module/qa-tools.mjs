const QA_GEAR = Object.freeze([
  { name: "Helmet", slots: 1 },
  { name: "Cloak", slots: 1 },
  { name: "Sword", slots: 1, wieldHands: 1 },
  { name: "Greatsword", slots: 1, wieldHands: 2 },
  { name: "Shield", slots: 1, wieldHands: 1 },
  { name: "Dagger", slots: 1, wieldHands: 1 },
  { name: "Mail Shirt", slots: 1 },
  { name: "Boots", slots: 1 },
  { name: "Silver Key", slots: 1 },
  { name: "Backpack", slots: 2, containerType: "backpack", capacity: 6 },
  { name: "Satchel", slots: 1, containerType: "satchel", capacity: 3 },
  { name: "Pouch", slots: 1, containerType: "custom", capacity: 2 },
  { name: "Rope", slots: 2 },
  { name: "Rations", quantity: 3, slots: 1, bundle: 3 },
  { name: "Torches", quantity: 3, slots: 1, bundle: 3 },
  { name: "Waterskin", slots: 1 },
  { name: "Healing Herbs", slots: 1 }
]);

const QA_FOLDER_NAME = "Realm Guard - QA Test Gear";
const QA_GEAR_ICON = "systems/realm-guard/assets/gear/test-gear.svg";

function gearData(entry, { worldTemplate = false, folderId = null } = {}) {
  return {
    name: entry.name,
    type: "gear",
    img: QA_GEAR_ICON,
    ...(folderId ? { folder: folderId } : {}),
    flags: {
      "realm-guard": {
        qaInventoryGear: !worldTemplate,
        qaInventoryGearTemplate: worldTemplate
      }
    },
    system: {
      quantity: Number(entry.quantity ?? 1),
      description: worldTemplate
        ? "Realm Guard Inventory QA template. Copy or drag this item to a Ranger for testing."
        : "QA test gear created by Realm Guard v0.18.6. Safe to delete after Inventory testing.",
      inventory: {
        mode: "unassigned",
        location: "",
        containerId: "",
        slots: Number(entry.slots ?? 1),
        bundle: Number(entry.bundle ?? 1),
        wieldHands: Number(entry.wieldHands ?? 0),
        containerType: String(entry.containerType ?? "none"),
        capacity: Number(entry.capacity ?? 0)
      }
    }
  };
}

async function qaFolder() {
  let folder = game.folders?.find?.(f => f.type === "Item" && f.getFlag?.("realm-guard", "qaInventoryGearFolder"));
  if (!folder) folder = game.folders?.find?.(f => f.type === "Item" && f.name === QA_FOLDER_NAME);
  if (!folder) {
    folder = await Folder.create({
      name: QA_FOLDER_NAME,
      type: "Item",
      color: "#6f5a2f",
      flags: { "realm-guard": { qaInventoryGearFolder: true } }
    });
  } else if (!folder.getFlag?.("realm-guard", "qaInventoryGearFolder")) {
    await folder.setFlag?.("realm-guard", "qaInventoryGearFolder", true);
  }
  return folder;
}

export async function ensureInventoryTestGearLibrary({ notify = false } = {}) {
  if (!game.user?.isGM) return [];
  const folder = await qaFolder();
  if (!folder) return [];

  const existing = new Map(
    (game.items ?? [])
      .filter(item => item.folder?.id === folder.id && item.getFlag?.("realm-guard", "qaInventoryGearTemplate"))
      .map(item => [String(item.name).toLowerCase(), item])
  );

  const created = [];
  for (const entry of QA_GEAR) {
    if (existing.has(entry.name.toLowerCase())) continue;
    const item = await Item.create(gearData(entry, { worldTemplate: true, folderId: folder.id }));
    if (item) created.push(item);
  }

  if (notify && created.length) {
    ui.notifications.info(`Realm Guard: Added ${created.length} QA Gear template(s) to Items > ${QA_FOLDER_NAME}.`);
  }
  return created;
}

export async function createInventoryTestGear(actor) {
  if (!game.user?.isGM) return ui.notifications.warn("Realm Guard: Inventory QA gear can only be created by the GM.");
  if (!actor || actor.type !== "character") return ui.notifications.warn("Realm Guard: Open a Ranger character before creating Inventory QA gear.");

  // Keep a visible world-level QA library as well as Actor-embedded copies.
  await ensureInventoryTestGearLibrary();

  const existing = actor.items.filter(item => item.type === "gear" && item.getFlag("realm-guard", "qaInventoryGear"));
  if (existing.length) {
    const DialogV2 = foundry.applications.api.DialogV2;
    const again = await DialogV2.confirm({
      window: { title: "Realm Guard · Inventory QA Gear", resizable: true },
      content: `<p>${foundry.utils.escapeHTML(actor.name)} already has ${existing.length} QA test gear item(s).</p><p>Create another complete set?</p>`,
      rejectClose: false
    });
    if (!again) return [];
  }

  const created = await actor.createEmbeddedDocuments("Item", QA_GEAR.map(entry => gearData(entry)));
  ui.notifications.info(`Realm Guard: Loaded ${created.length} QA Gear items onto ${actor.name}. Templates are also available in Items > ${QA_FOLDER_NAME}.`);
  return created;
}

export function installInventoryQaTools() {
  Hooks.once("ready", async () => {
    if (!game.user?.isGM) return;
    try {
      await ensureInventoryTestGearLibrary({ notify: true });
    } catch (error) {
      console.error("Realm Guard | Failed to seed Inventory QA Gear library", error);
      ui.notifications.warn("Realm Guard: Could not create the QA Test Gear library. Check F12 Console.");
    }
  });
}
