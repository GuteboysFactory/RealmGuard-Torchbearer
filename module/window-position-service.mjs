const NS = "realm-guard";
const FLAG = "windowPositionsV1";
const EDGE = 8;
const saveTimers = new Map();
const observed = new WeakSet();
let resizeObserver = null;
let mutationObserver = null;

function safeKey(value) {
  return String(value ?? "window").trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "").slice(0, 96) || "window";
}

function store() {
  const value = game.user?.getFlag?.(NS, FLAG);
  return value && typeof value === "object" ? foundry.utils.deepClone(value) : {};
}

function classify(shell) {
  if (!(shell instanceof HTMLElement)) return null;
  if (shell.id === "rg-conflict-window" || shell.matches?.(".rg-conflict-window")) return "conflict.main";
  const exact = [
    [".rg-conflict-roll-dialog", "conflict.roll"],
    [".rg-conflict-setup", "conflict.setup"],
    [".rg-conflict-goal-editor", "conflict.goal"],
    [".rg-disposition-method", "conflict.disposition-method"],
    [".rg-disarm-dialog", "conflict.disarm"],
    [".rg-conflict-tool-editor", "conflict.custom-tool"],
    [".rg-teamwork-request", "conflict.help"],
    [".rg-teamwork-review", "conflict.help-review"],
    [".rg-gm-story-modifier", "conflict.story-modifier"]
  ];
  for (const [selector, key] of exact) if (shell.querySelector?.(selector)) return key;

  // Fallback for RG/TB-owned ApplicationV2 windows which do not yet expose a dedicated class.
  const ownsRealmGuardContent = Boolean(shell.querySelector?.(".realm-guard, [class^='rg-'], [class*=' rg-']"));
  const title = String(shell.querySelector?.(".window-title")?.textContent ?? shell.getAttribute?.("aria-label") ?? "").trim();
  if (ownsRealmGuardContent || /^Realm Guard\b/i.test(title)) return `dialog.${safeKey(title || "realm-guard")}`;
  return null;
}

function clampGeometry(saved, element) {
  const current = element.getBoundingClientRect();
  const maxWidth = Math.max(320, window.innerWidth - EDGE * 2);
  const maxHeight = Math.max(220, window.innerHeight - EDGE * 2);
  const width = Math.min(Math.max(320, Number(saved?.width) || current.width || 640), maxWidth);
  const height = Math.min(Math.max(220, Number(saved?.height) || current.height || 420), maxHeight);
  const maxLeft = Math.max(EDGE, window.innerWidth - width - EDGE);
  const maxTop = Math.max(EDGE, window.innerHeight - height - EDGE);
  return {
    left: Math.min(Math.max(EDGE, Number(saved?.left) || EDGE), maxLeft),
    top: Math.min(Math.max(EDGE, Number(saved?.top) || EDGE), maxTop),
    width,
    height
  };
}

function applySaved(element, key) {
  const saved = store()?.[key];
  if (!saved) return;
  const geometry = clampGeometry(saved, element);
  element.style.width = `${Math.round(geometry.width)}px`;
  element.style.height = `${Math.round(geometry.height)}px`;
  element.style.left = `${Math.round(geometry.left)}px`;
  element.style.top = `${Math.round(geometry.top)}px`;
  element.style.right = "auto";
  element.style.bottom = "auto";
  element.style.transform = "none";
}

async function saveNow(element, key) {
  if (!(element instanceof HTMLElement) || !document.body.contains(element)) return;
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const geometry = clampGeometry({ left: rect.left, top: rect.top, width: rect.width, height: rect.height }, element);
  const next = store();
  next[key] = {
    left: Math.round(geometry.left), top: Math.round(geometry.top),
    width: Math.round(geometry.width), height: Math.round(geometry.height)
  };
  try { await game.user?.setFlag?.(NS, FLAG, next); }
  catch (error) { console.warn(`${NS} | could not save window position`, key, error); }
}

function scheduleSave(element, key, delay = 180) {
  clearTimeout(saveTimers.get(key));
  saveTimers.set(key, setTimeout(() => {
    saveTimers.delete(key);
    void saveNow(element, key);
  }, delay));
}

function manage(element) {
  if (!(element instanceof HTMLElement)) return;
  const key = classify(element);
  if (!key) return;
  element.dataset.rgWindowPositionKey = key;
  if (!observed.has(element)) {
    observed.add(element);
    resizeObserver?.observe(element);
  }
  requestAnimationFrame(() => applySaved(element, key));
}

function scan(root = document) {
  const candidates = [];
  if (root instanceof HTMLElement && (root.matches?.(".application") || root.matches?.(".rg-conflict-window"))) candidates.push(root);
  root.querySelectorAll?.(".application, .rg-conflict-window").forEach(el => candidates.push(el));
  for (const element of candidates) manage(element);
}

function clampManagedWindows() {
  document.querySelectorAll("[data-rg-window-position-key]").forEach(element => {
    const key = element.dataset.rgWindowPositionKey;
    const rect = element.getBoundingClientRect();
    const geometry = clampGeometry({ left: rect.left, top: rect.top, width: rect.width, height: rect.height }, element);
    element.style.width = `${Math.round(geometry.width)}px`;
    element.style.height = `${Math.round(geometry.height)}px`;
    element.style.left = `${Math.round(geometry.left)}px`;
    element.style.top = `${Math.round(geometry.top)}px`;
    element.style.right = "auto";
    element.style.bottom = "auto";
    element.style.transform = "none";
    scheduleSave(element, key, 300);
  });
}

export function installWindowPositionPersistence() {
  Hooks.once("ready", () => {
    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const element = entry.target;
        const key = element?.dataset?.rgWindowPositionKey;
        if (key) scheduleSave(element, key, 260);
      }
    });

    mutationObserver = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) if (node instanceof HTMLElement) scan(node);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("pointerup", event => {
      const shell = event.target?.closest?.("[data-rg-window-position-key], .application, .rg-conflict-window");
      if (!shell) return;
      manage(shell);
      const key = shell.dataset.rgWindowPositionKey;
      if (key) scheduleSave(shell, key, 40);
    }, true);

    document.addEventListener("mouseup", event => {
      const shell = event.target?.closest?.("[data-rg-window-position-key]");
      if (shell?.dataset?.rgWindowPositionKey) scheduleSave(shell, shell.dataset.rgWindowPositionKey, 40);
    }, true);

    window.addEventListener("resize", clampManagedWindows, { passive: true });
    scan(document);
  });
}
