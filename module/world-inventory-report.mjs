import { registerGmDockTool } from "./gm-dock.mjs";
import { getRulesProfileRuntime } from "./rules-profile-service.mjs";

const NS = "realm-guard";
const TOOL_ID = "world-inventory-report";
const WORLD_COLLECTIONS = Object.freeze([
  ["actors", "Actors"], ["items", "Items"], ["scenes", "Scenes"],
  ["journal", "Journal Entries"], ["tables", "Roll Tables"], ["playlists", "Playlists"],
  ["cards", "Cards"], ["combats", "Combats"], ["messages", "Chat Messages"],
  ["macros", "Macros"], ["folders", "Folders"]
]);
const M10D_DOMAINS = Object.freeze([
  "wises", "controlledWises", "controlledTests", "controlledBlNature",
  "controlledConditionsRecoveryGrind", "help", "tests", "nature", "abilities",
  "resources", "conditions", "recovery", "inventory", "advancement", "session",
  "circles", "scales", "creation"
]);

function collectionValues(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (Array.isArray(collection.contents)) return collection.contents;
  if (typeof collection.values === "function") return [...collection.values()];
  return [];
}

function copyData(value) {
  if (value === undefined) return null;
  try { return JSON.parse(JSON.stringify(value)); }
  catch (error) { return { reportSerializationError: String(error?.message ?? error) }; }
}

function snapshotDocument(doc) {
  try { return copyData(typeof doc?.toObject === "function" ? doc.toObject() : doc); }
  catch (error) { return { id: String(doc?.id ?? ""), reportReadError: String(error?.message ?? error) }; }
}

function safeCall(callback) {
  try { return copyData(callback()); }
  catch (error) { return { reportReadError: String(error?.message ?? error) }; }
}

function snapshotCollection(collection) {
  const documents = collectionValues(collection);
  return { count: documents.length, documents: documents.map(snapshotDocument) };
}

function moduleInventory(modules) {
  return collectionValues(modules).map(module => {
    const manifest = module?.manifest ?? {};
    return {
      id: String(module?.id ?? manifest.id ?? ""),
      title: String(module?.title ?? manifest.title ?? ""),
      version: String(module?.version ?? manifest.version ?? ""),
      active: Boolean(module?.active),
      compatibility: copyData(manifest.compatibility ?? {}),
      relationships: copyData(manifest.relationships ?? {})
    };
  }).sort((a, b) => a.id.localeCompare(b.id));
}

function userInventory(users) {
  return collectionValues(users).map(user => ({
    id: String(user?.id ?? ""),
    name: String(user?.name ?? ""),
    role: Number(user?.role ?? 0),
    isGM: Boolean(user?.isGM),
    active: Boolean(user?.active),
    characterId: String(user?.character?.id ?? user?.character ?? "")
  })).sort((a, b) => a.name.localeCompare(b.name));
}

function settingRegistry(settings) {
  const entries = settings?.settings;
  const rows = entries instanceof Map ? [...entries.entries()] : Object.entries(entries ?? {});
  return rows.map(([qualifiedKey, definition]) => {
    const [namespace = "", ...keyParts] = String(qualifiedKey).split(".");
    return {
      namespace,
      key: keyParts.join("."),
      scope: String(definition?.scope ?? ""),
      type: String(definition?.type?.name ?? definition?.type ?? ""),
      config: Boolean(definition?.config),
      name: String(definition?.name ?? "")
    };
  }).sort((a, b) => (a.namespace + "." + a.key).localeCompare(b.namespace + "." + b.key));
}

function rulesStatus(runtime) {
  const core = runtime?.realmGuard?.core ?? {};
  const out = { coreNamespaces: Object.keys(core).sort(), statusProviders: {}, m10dDomains: {} };
  for (const [namespace, api] of Object.entries(core)) {
    if (!api || typeof api !== "object") continue;
    if (typeof api.getStatus === "function") {
      out.statusProviders[namespace] = safeCall(() => api.getStatus());
    }
    for (const [name, nested] of Object.entries(api)) {
      if (nested && typeof nested === "object" && typeof nested.getStatus === "function") {
        out.statusProviders[namespace + "." + name] = safeCall(() => nested.getStatus());
      }
    }
  }
  const m10d = core.m10d;
  if (m10d && typeof m10d === "object") {
    for (const name of M10D_DOMAINS) {
      const api = m10d[name];
      if (api && typeof api.getStatus === "function") out.m10dDomains[name] = safeCall(() => api.getStatus());
    }
  }
  try {
    const active = getRulesProfileRuntime();
    out.activeProfile = {
      id: String(active?.profile?.id ?? ""),
      label: String(active?.profile?.label ?? active?.profile?.name ?? ""),
      snapshot: copyData(active?.snapshot ?? {})
    };
  } catch (error) {
    out.activeProfile = { reportReadError: String(error?.message ?? error) };
  }
  return out;
}

async function compendiumInventory(packs) {
  const result = [];
  for (const pack of collectionValues(packs)) {
    const entry = {
      collection: String(pack?.collection ?? ""),
      label: String(pack?.metadata?.label ?? pack?.title ?? ""),
      package: String(pack?.metadata?.package ?? ""),
      packageType: String(pack?.metadata?.packageType ?? ""),
      documentName: String(pack?.documentName ?? pack?.metadata?.type ?? ""),
      locked: Boolean(pack?.locked),
      count: null,
      documents: [],
      readErrors: []
    };
    try {
      const docs = await pack.getDocuments();
      entry.count = docs.length;
      entry.documents = docs.map(snapshotDocument);
    } catch (error) {
      entry.readErrors.push(String(error?.message ?? error));
      try {
        const index = await pack.getIndex();
        entry.count = index.size ?? index.contents?.length ?? null;
        entry.documents = collectionValues(index).map(snapshotDocument);
      } catch (indexError) {
        entry.readErrors.push("Index: " + String(indexError?.message ?? indexError));
      }
    }
    result.push(entry);
  }
  return result.sort((a, b) => a.collection.localeCompare(b.collection));
}

export async function buildWorldInventoryReport(runtime = globalThis.game) {
  if (!runtime?.user?.isGM) throw new Error("World inventory report is restricted to an active GM.");
  const worldCollections = {};
  for (const [key, label] of WORLD_COLLECTIONS) {
    const collection = runtime[key];
    worldCollections[key] = { label, ...snapshotCollection(collection) };
  }

  const packs = await compendiumInventory(runtime.packs);
  const world = runtime.world ?? {};
  const system = runtime.system ?? {};
  const report = {
    report: {
      id: "realm-guard-world-inventory",
      version: 1,
      createdAt: new Date().toISOString(),
      generatedBy: "Realm Guard / Torchbearer QA",
      readOnly: true,
      automaticUpload: false,
      exclusions: [
        "Foundry and module setting VALUES are omitted; only the registered setting names/metadata are listed.",
        "Authentication credentials are not collected."
      ],
      writes: { actors: 0, items: 0, scenes: 0, journals: 0, settings: 0, chatMessages: 0, compendiums: 0 }
    },
    environment: {
      foundry: {
        release: copyData(runtime.version ?? runtime.release ?? {}),
        world: {
          id: String(world.id ?? ""),
          title: String(world.title ?? ""),
          system: String(world.system ?? ""),
          coreVersion: String(world.coreVersion ?? ""),
          lastModified: world.lastModified ?? null
        },
        system: {
          id: String(system.id ?? ""),
          title: String(system.title ?? ""),
          version: String(system.version ?? "")
        },
        currentUser: {
          id: String(runtime.user.id ?? ""),
          name: String(runtime.user.name ?? ""),
          isGM: Boolean(runtime.user.isGM)
        },
        users: userInventory(runtime.users),
        modules: moduleInventory(runtime.modules),
        registeredSettings: settingRegistry(runtime.settings)
      },
      rules: rulesStatus(runtime)
    },
    worldCollections,
    compendiums: { count: packs.length, packs }
  };

  report.summary = {
    worldCollections: Object.fromEntries(Object.entries(worldCollections).map(([key, value]) => [key, value.count])),
    compendiumPacks: packs.length,
    compendiumDocuments: packs.reduce((sum, pack) => sum + (Number(pack.count) || 0), 0),
    activeModules: report.environment.foundry.modules.filter(module => module.active).length,
    registeredSettingDefinitions: report.environment.foundry.registeredSettings.length,
    activeRulesProfile: report.environment.rules.activeProfile?.id ?? "unavailable"
  };
  return report;
}

function escapeHtml(value) {
  return globalThis.foundry?.utils?.escapeHTML
    ? foundry.utils.escapeHTML(String(value ?? ""))
    : String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function downloadReport(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `realm-guard-foundry-inventory-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

async function openInventoryReport() {
  if (!globalThis.game?.user?.isGM) throw new Error("Only a GM can generate the report.");
  ui.notifications?.info?.("Realm Guard: collecting the Foundry world and compendium inventory. No data will be changed or uploaded.");
  const report = await buildWorldInventoryReport();
  const counts = report.summary.worldCollections;
  const rows = Object.entries(counts).map(([name, count]) => `<li><b>${escapeHtml(name)}</b>: ${count}</li>`).join("");
  const result = await foundry.applications.api.DialogV2.wait({
    window: { title: "Foundry World Inventory Report", resizable: true },
    content: `<section><p>Complete read-only inventory of this world and all readable compendium entries.</p><ul>${rows}</ul><p><b>${report.summary.compendiumPacks}</b> packs · <b>${report.summary.compendiumDocuments}</b> compendium documents · <b>${report.summary.activeModules}</b> active modules.</p><p>Setting values and authentication credentials are excluded. The JSON is downloaded locally and is not uploaded.</p></section>`,
    modal: true,
    rejectClose: false,
    buttons: [
      { action: "download", label: "Download JSON", icon: "fa-solid fa-download", default: true, callback: () => "download" },
      { action: "cancel", label: "Cancel", icon: "fa-solid fa-xmark", callback: () => null }
    ]
  });
  if (result === "download") downloadReport(report);
}

export function installWorldInventoryReport() {
  registerGmDockTool({
    id: TOOL_ID,
    icon: "fa-solid fa-clipboard-list",
    tooltip: "Foundry World Inventory Report",
    order: 95,
    visible: () => Boolean(globalThis.game?.user?.isGM),
    onClick: openInventoryReport
  });
  Hooks.once("ready", () => {
    game.realmGuard ??= {};
    game.realmGuard.core ??= {};
    game.realmGuard.core.worldInventoryReport = Object.freeze({
      build: buildWorldInventoryReport
    });
  });
}
