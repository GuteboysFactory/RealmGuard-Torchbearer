export const RG_INVENTORY_ZONES = Object.freeze([
  { id: "head", label: "Head", mode: "worn", capacity: 1, hint: "Helmet / headwear" },
  { id: "neck", label: "Neck", mode: "worn", capacity: 1, hint: "Necklace / amulet / neckwear" },
  { id: "cloak", label: "Cloak", mode: "worn", capacity: 1, hint: "Cloak / cape / mantle" },
  { id: "left-hand", label: "Left Hand", mode: "hand", capacity: 1, hint: "One held item; a 2H item also locks the Right Hand" },
  { id: "right-hand", label: "Right Hand", mode: "hand", capacity: 1, hint: "One held item; a 2H item also locks the Left Hand" },
  { id: "torso", label: "Torso", mode: "worn", capacity: 3, hint: "Armor and worn containers" },
  { id: "belt", label: "Belt", mode: "belt", capacity: 3, hint: "3 × 1-slot items" },
  { id: "feet", label: "Feet", mode: "worn", capacity: 1, hint: "Boots / shoes" },
  { id: "pocket", label: "Pocket", mode: "pocket", capacity: 1, hint: "1 small item" }
]);

const RG_HAND_ZONES = Object.freeze(["left-hand", "right-hand"]);
const isHandZone = id => RG_HAND_ZONES.includes(String(id ?? ""));
const oppositeHand = id => id === "left-hand" ? "right-hand" : id === "right-hand" ? "left-hand" : "";
const isCloakLike = item => /(?:cloak|cape|mantle)/i.test(String(item?.name ?? ""));

export const RG_CONTAINER_PRESETS = Object.freeze({
  none: { label: "Not a container", capacity: 0, slots: null },
  backpack: { label: "Backpack", capacity: 6, slots: 2 },
  satchel: { label: "Satchel", capacity: 3, slots: 1 },
  custom: { label: "Custom container", capacity: null, slots: null }
});

export function inventoryData(item) {
  const data = item?.system?.inventory ?? {};
  return {
    mode: String(data.mode ?? "unassigned"),
    location: String(data.location ?? ""),
    containerId: String(data.containerId ?? ""),
    slots: Math.max(1, Number(data.slots ?? 1)),
    bundle: Math.max(1, Number(data.bundle ?? 1)),
    wieldHands: Math.max(0, Math.min(2, Number(data.wieldHands ?? 0))),
    containerType: String(data.containerType ?? "none"),
    capacity: Math.max(0, Number(data.capacity ?? 0))
  };
}

export function gearSlotCost(item, { forZone = null } = {}) {
  const data = inventoryData(item);
  const quantity = Math.max(0, Number(item?.system?.quantity ?? 1));
  if (quantity <= 0) return 0;
  const bundles = Math.max(1, Math.ceil(quantity / data.bundle));
  if (isHandZone(forZone)) return 1;
  return Math.max(1, data.slots) * bundles;
}

export function containerCapacity(item) {
  const data = inventoryData(item);
  const preset = RG_CONTAINER_PRESETS[data.containerType];
  if (!preset || data.containerType === "none") return 0;
  if (preset.capacity !== null && preset.capacity !== undefined) return preset.capacity;
  return Math.max(0, data.capacity);
}

export function isContainer(item) {
  return item?.type === "gear" && containerCapacity(item) > 0;
}

export function isContainerActive(item) {
  if (!isContainer(item)) return false;
  const data = inventoryData(item);
  if (data.containerType === "backpack" || data.containerType === "satchel") {
    return data.mode === "worn" && data.location === "torso" && !data.containerId;
  }
  return data.mode !== "unassigned" && !data.containerId;
}


function gearIconClass(item) {
  const name = String(item?.name ?? "").toLowerCase();
  const data = inventoryData(item);
  if (data.containerType === "backpack" || name.includes("backpack")) return "fa-solid fa-bag-shopping";
  if (data.containerType === "satchel" || data.containerType === "custom" || name.includes("satchel") || name.includes("pouch")) return "fa-solid fa-briefcase";
  if (name.includes("helmet") || name.includes("helm")) return "fa-solid fa-helmet-safety";
  if (name.includes("cloak") || name.includes("mail") || name.includes("shirt") || name.includes("armor") || name.includes("armour")) return "fa-solid fa-shirt";
  if (name.includes("shield")) return "fa-solid fa-shield-halved";
  if (name.includes("sword") || name.includes("dagger") || name.includes("knife")) return "fa-solid fa-khanda";
  if (name.includes("bow") || name.includes("arrow")) return "fa-solid fa-bullseye";
  if (name.includes("boot") || name.includes("shoe")) return "fa-solid fa-shoe-prints";
  if (name.includes("key")) return "fa-solid fa-key";
  if (name.includes("rope")) return "fa-solid fa-link";
  if (name.includes("ration") || name.includes("bread") || name.includes("food")) return "fa-solid fa-bread-slice";
  if (name.includes("torch") || name.includes("lantern") || name.includes("fire")) return "fa-solid fa-fire-flame-curved";
  if (name.includes("water") || name.includes("skin")) return "fa-solid fa-droplet";
  if (name.includes("herb") || name.includes("leaf")) return "fa-solid fa-leaf";
  return "fa-solid fa-box-open";
}

function itemView(item, { zoneId = null } = {}) {
  const data = inventoryData(item);
  return {
    id: item.id,
    name: item.name,
    iconClass: gearIconClass(item),
    system: item.system,
    quantity: Math.max(0, Number(item.system?.quantity ?? 1)),
    slotCost: gearSlotCost(item, { forZone: zoneId }),
    slotLabel: `${gearSlotCost(item, { forZone: zoneId })} slot${gearSlotCost(item, { forZone: zoneId }) === 1 ? "" : "s"}`,
    mode: data.mode,
    location: data.location,
    containerId: data.containerId,
    wieldHands: data.wieldHands,
    containerType: data.containerType,
    isContainer: isContainer(item),
    containerCapacity: containerCapacity(item)
  };
}

export function buildInventoryView(actor) {
  const gear = actor?.items?.filter?.(item => item.type === "gear") ?? [];
  const zoneViews = RG_INVENTORY_ZONES.map(zone => {
    const items = gear.filter(item => {
      const data = inventoryData(item);
      return !data.containerId && data.mode === zone.mode && data.location === zone.id;
    }).map(item => itemView(item, { zoneId: zone.id }));
    const used = items.reduce((sum, item) => sum + item.slotCost, 0);
    return { ...zone, items, used, remaining: Math.max(0, zone.capacity - used), over: used > zone.capacity };
  });

  const containers = gear.filter(isContainer).map(container => {
    const contents = gear.filter(item => inventoryData(item).containerId === container.id).map(item => itemView(item));
    const capacity = containerCapacity(container);
    const used = contents.reduce((sum, item) => sum + item.slotCost, 0);
    const active = isContainerActive(container);
    return {
      ...itemView(container),
      contents,
      capacity,
      used,
      remaining: Math.max(0, capacity - used),
      over: used > capacity,
      active,
      inactiveReason: active ? "" : (inventoryData(container).containerType === "backpack" || inventoryData(container).containerType === "satchel") ? "Equip on Torso to use pack slots." : "Place the container before using it."
    };
  });

  const knownContainers = new Set(containers.map(c => c.id));
  const unassigned = [];
  const orphaned = [];
  for (const item of gear) {
    const data = inventoryData(item);
    const assignedToZone = RG_INVENTORY_ZONES.some(zone => !data.containerId && data.mode === zone.mode && data.location === zone.id);
    const assignedToContainer = Boolean(data.containerId && knownContainers.has(data.containerId));
    if (data.containerId && !knownContainers.has(data.containerId)) orphaned.push(itemView(item));
    else if (!isContainer(item) && !assignedToZone && !assignedToContainer) unassigned.push(itemView(item));
  }

  const leftHand = zoneViews.find(zone => zone.id === "left-hand");
  const rightHand = zoneViews.find(zone => zone.id === "right-hand");
  const leftTwoHanded = leftHand?.items?.find(item => item.wieldHands >= 2);
  const rightTwoHanded = rightHand?.items?.find(item => item.wieldHands >= 2);
  if (leftTwoHanded && rightHand && !rightHand.items.length) {
    rightHand.blocked = true;
    rightHand.blockedByName = leftTwoHanded.name;
    rightHand.blockedReason = `${leftTwoHanded.name} requires both hands.`;
  }
  if (rightTwoHanded && leftHand && !leftHand.items.length) {
    leftHand.blocked = true;
    leftHand.blockedByName = rightTwoHanded.name;
    leftHand.blockedReason = `${rightTwoHanded.name} requires both hands.`;
  }

  const totalAssigned = zoneViews.reduce((sum, zone) => sum + zone.items.length, 0) + containers.reduce((sum, c) => sum + c.contents.length, 0);
  const warnings = [];
  if (leftTwoHanded && rightHand?.items?.length) warnings.push(`${leftTwoHanded.name} requires both hands, but Right Hand is also occupied.`);
  if (rightTwoHanded && leftHand?.items?.length) warnings.push(`${rightTwoHanded.name} requires both hands, but Left Hand is also occupied.`);
  for (const zone of zoneViews) if (zone.over) warnings.push(`${zone.label} is over capacity (${zone.used}/${zone.capacity}).`);
  for (const container of containers) if (container.over) warnings.push(`${container.name} is over capacity (${container.used}/${container.capacity}).`);
  if (orphaned.length) warnings.push(`${orphaned.length} item(s) reference a missing container and should be moved.`);

  return { zones: zoneViews, containers, unassigned, orphaned, warnings, totalAssigned, totalGear: gear.length };
}

function zoneById(id) {
  return RG_INVENTORY_ZONES.find(zone => zone.id === id) ?? null;
}

function otherZoneUse(actor, zone, movingItem) {
  return actor.items.filter(item => {
    if (item.type !== "gear" || item.id === movingItem.id) return false;
    const data = inventoryData(item);
    return !data.containerId && data.mode === zone.mode && data.location === zone.id;
  }).reduce((sum, item) => sum + gearSlotCost(item, { forZone: zone.id }), 0);
}

function validateZonePlacement(actor, item, zone) {
  const data = inventoryData(item);
  const cost = gearSlotCost(item, { forZone: zone.id });

  if (zone.id === "cloak" && !isCloakLike(item)) {
    return { ok: false, reason: "The Cloak slot accepts cloaks, capes or mantles." };
  }

  if (isHandZone(zone.id)) {
    const targetItems = actor.items.filter(other => {
      if (other.type !== "gear" || other.id === item.id) return false;
      const od = inventoryData(other);
      return !od.containerId && od.location === zone.id;
    });
    if (targetItems.length) return { ok: false, reason: `${zone.label} is already occupied by ${targetItems[0].name}.` };

    const otherId = oppositeHand(zone.id);
    const otherItems = actor.items.filter(other => {
      if (other.type !== "gear" || other.id === item.id) return false;
      const od = inventoryData(other);
      return !od.containerId && od.location === otherId;
    });
    const otherTwoHanded = otherItems.find(other => inventoryData(other).wieldHands >= 2);
    if (otherTwoHanded) return { ok: false, reason: `${oppositeHand(zone.id) === "left-hand" ? "Left Hand" : "Right Hand"} is using ${otherTwoHanded.name}, which requires both hands.` };
    if (data.wieldHands >= 2 && otherItems.length) return { ok: false, reason: `${item.name} requires both hands. Clear the other hand first.` };
    return { ok: true };
  }

  if (zone.id === "belt") {
    if (data.slots !== 1 || data.bundle !== 1 || cost !== 1) return { ok: false, reason: "Belt slots accept only single 1-slot items; bundled or oversized items must go elsewhere." };
  }
  if (zone.id === "pocket" && cost !== 1) return { ok: false, reason: "The pocket can hold only one small 1-slot item." };
  const used = otherZoneUse(actor, zone, item);
  if (used + cost > zone.capacity) return { ok: false, reason: `${zone.label} does not have enough space (${used}/${zone.capacity} already used; item needs ${cost}).` };

  if (zone.id === "torso" && ["backpack", "satchel"].includes(data.containerType)) {
    const otherPack = actor.items.find(other => {
      if (other.type !== "gear" || other.id === item.id) return false;
      const od = inventoryData(other);
      return ["backpack", "satchel"].includes(od.containerType) && od.mode === "worn" && od.location === "torso" && !od.containerId;
    });
    if (otherPack) return { ok: false, reason: `Only one backpack or satchel can be equipped at a time. ${otherPack.name} is already on the Torso.` };
  }
  return { ok: true };
}

export async function placeGearInZone(actor, itemId, zoneId) {
  const item = actor?.items?.get?.(itemId);
  const zone = zoneById(zoneId);
  if (!item || item.type !== "gear" || !zone) return { ok: false, reason: "Invalid gear or inventory zone." };
  const valid = validateZonePlacement(actor, item, zone);
  if (!valid.ok) return valid;
  await item.update({
    "system.inventory.mode": zone.mode,
    "system.inventory.location": zone.id,
    "system.inventory.containerId": ""
  });
  return { ok: true };
}

export async function placeGearInContainer(actor, itemId, containerId) {
  const item = actor?.items?.get?.(itemId);
  const container = actor?.items?.get?.(containerId);
  if (!item || item.type !== "gear" || !container || !isContainer(container)) return { ok: false, reason: "Invalid gear or container." };
  if (item.id === container.id) return { ok: false, reason: "A container cannot contain itself." };
  if (isContainer(item)) return { ok: false, reason: "Nested containers are deferred from this inventory layer." };
  if (!isContainerActive(container)) return { ok: false, reason: `${container.name} is not active. Equip the container first.` };

  const capacity = containerCapacity(container);
  const used = actor.items.filter(other => other.type === "gear" && other.id !== item.id && inventoryData(other).containerId === container.id)
    .reduce((sum, other) => sum + gearSlotCost(other), 0);
  const cost = gearSlotCost(item);
  if (used + cost > capacity) return { ok: false, reason: `${container.name} does not have enough pack space (${used}/${capacity} used; item needs ${cost}).` };
  await item.update({
    "system.inventory.mode": "pack",
    "system.inventory.location": "",
    "system.inventory.containerId": container.id
  });
  return { ok: true };
}

export async function unassignGear(actor, itemId) {
  const item = actor?.items?.get?.(itemId);
  if (!item || item.type !== "gear") return { ok: false, reason: "Invalid gear item." };
  await item.update({
    "system.inventory.mode": "unassigned",
    "system.inventory.location": "",
    "system.inventory.containerId": ""
  });
  return { ok: true };
}

export async function detachContainedGear(actor, containerId) {
  if (!actor || !containerId) return 0;
  const contents = actor.items.filter(item => item.type === "gear" && inventoryData(item).containerId === containerId);
  if (!contents.length) return 0;
  const updates = contents.map(item => ({ _id: item.id, "system.inventory.mode": "unassigned", "system.inventory.location": "", "system.inventory.containerId": "" }));
  await actor.updateEmbeddedDocuments("Item", updates);
  return contents.length;
}

async function migrateActorInventory0186(actor) {
  if (!actor || !["character", "npc"].includes(actor.type)) return 0;
  const gear = actor.items.filter(item => item.type === "gear");
  if (!gear.length) return 0;

  const updates = [];
  const leftExisting = gear.find(item => !inventoryData(item).containerId && inventoryData(item).location === "left-hand");
  const rightExisting = gear.find(item => !inventoryData(item).containerId && inventoryData(item).location === "right-hand");
  let leftBusy = Boolean(leftExisting);
  let rightBusy = Boolean(rightExisting);
  if (leftExisting && inventoryData(leftExisting).wieldHands >= 2) rightBusy = true;
  if (rightExisting && inventoryData(rightExisting).wieldHands >= 2) leftBusy = true;

  const legacyHands = gear.filter(item => {
    const data = inventoryData(item);
    return !data.containerId && ["hands-worn", "hands-carried"].includes(data.location);
  }).sort((a, b) => Number(inventoryData(b).wieldHands >= 2) - Number(inventoryData(a).wieldHands >= 2));

  for (const item of legacyHands) {
    const twoHanded = inventoryData(item).wieldHands >= 2;
    if (twoHanded && !leftBusy && !rightBusy) {
      updates.push({ _id: item.id, "system.inventory.mode": "hand", "system.inventory.location": "left-hand", "system.inventory.containerId": "" });
      leftBusy = true; rightBusy = true;
    } else if (!twoHanded && !leftBusy) {
      updates.push({ _id: item.id, "system.inventory.mode": "hand", "system.inventory.location": "left-hand", "system.inventory.containerId": "" });
      leftBusy = true;
    } else if (!twoHanded && !rightBusy) {
      updates.push({ _id: item.id, "system.inventory.mode": "hand", "system.inventory.location": "right-hand", "system.inventory.containerId": "" });
      rightBusy = true;
    } else {
      updates.push({ _id: item.id, "system.inventory.mode": "unassigned", "system.inventory.location": "", "system.inventory.containerId": "" });
    }
  }

  const cloakOccupied = gear.some(item => !inventoryData(item).containerId && inventoryData(item).location === "cloak");
  if (!cloakOccupied) {
    const oldCloak = gear.find(item => {
      const data = inventoryData(item);
      return !data.containerId && data.location === "torso" && isCloakLike(item);
    });
    if (oldCloak) updates.push({ _id: oldCloak.id, "system.inventory.mode": "worn", "system.inventory.location": "cloak", "system.inventory.containerId": "" });
  }

  if (!updates.length) return 0;
  await actor.updateEmbeddedDocuments("Item", updates);
  return updates.length;
}

export function installInventoryMigration() {
  Hooks.once("ready", async () => {
    if (!game.user?.isGM) return;
    let migrated = 0;
    for (const actor of game.actors ?? []) migrated += await migrateActorInventory0186(actor);
    if (migrated) console.log(`Realm Guard | v0.18.6 inventory migration updated ${migrated} Gear placement(s).`);
  });
}

export function normalizeContainerPreset(updateData, currentSystem = {}) {
  const clone = foundry.utils.deepClone(updateData ?? {});
  const containerType = String(foundry.utils.getProperty(clone, "system.inventory.containerType") ?? currentSystem?.inventory?.containerType ?? "none");
  const preset = RG_CONTAINER_PRESETS[containerType];
  if (preset && preset.capacity !== null && preset.capacity !== undefined) foundry.utils.setProperty(clone, "system.inventory.capacity", preset.capacity);
  if (preset && preset.slots !== null && preset.slots !== undefined) foundry.utils.setProperty(clone, "system.inventory.slots", preset.slots);
  if (containerType === "none") foundry.utils.setProperty(clone, "system.inventory.capacity", 0);
  return clone;
}
