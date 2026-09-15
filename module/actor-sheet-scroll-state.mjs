function scrollKey(root, target) {
  if (!root || !target) return "";
  if (target === root) return "__root__";

  const explicit = target.getAttribute?.("data-rg-scroll-key");
  if (explicit) return `data:${explicit}`;
  if (target.classList?.contains?.("window-content")) return "class:window-content";

  const path = [];
  let node = target;
  while (node && node !== root) {
    const parent = node.parentElement;
    if (!parent) break;
    const index = Array.prototype.indexOf.call(parent.children, node) + 1;
    path.unshift(`${String(node.tagName || "div").toLowerCase()}:nth-child(${index})`);
    node = parent;
  }
  return node === root ? `path:${path.join(">")}` : "";
}

function scrollTarget(root, key) {
  if (!root || !key) return null;
  if (key === "__root__") return root;
  if (key === "class:window-content") return root.querySelector?.(".window-content") ?? null;
  if (key.startsWith("data:")) {
    const value = key.slice(5).replaceAll('"', '\\"');
    return root.querySelector?.(`[data-rg-scroll-key="${value}"]`) ?? null;
  }
  if (key.startsWith("path:")) {
    try { return root.querySelector?.(`:scope>${key.slice(5)}`) ?? null; }
    catch (_error) { return null; }
  }
  return null;
}

function remember(sheet, root, target) {
  if (!sheet || !root || !target) return;
  const key = scrollKey(root, target);
  if (!key) return;
  sheet._rgScrollState ??= new Map();
  sheet._rgScrollState.set(key, {
    top: Number(target.scrollTop ?? 0),
    left: Number(target.scrollLeft ?? 0)
  });
}

function snapshotScrollableTargets(sheet, root) {
  if (!sheet || !root) return;
  remember(sheet, root, root);
  for (const node of root.querySelectorAll?.(".window-content, [data-rg-scroll-key], [data-rg-page], .scrollable") ?? []) {
    if (Number(node.scrollHeight ?? 0) > Number(node.clientHeight ?? 0) || Number(node.scrollTop ?? 0) > 0) {
      remember(sheet, root, node);
    }
  }
}

function restore(sheet, root) {
  if (!sheet?._rgScrollState?.size || !root) return;
  for (const [key, state] of sheet._rgScrollState.entries()) {
    const target = scrollTarget(root, key);
    if (!target) continue;
    const maxTop = Math.max(0, Number(target.scrollHeight ?? 0) - Number(target.clientHeight ?? 0));
    const maxLeft = Math.max(0, Number(target.scrollWidth ?? 0) - Number(target.clientWidth ?? 0));
    target.scrollTop = Math.max(0, Math.min(Number(state?.top ?? 0), maxTop));
    target.scrollLeft = Math.max(0, Math.min(Number(state?.left ?? 0), maxLeft));
  }
}

const boundRoots = new WeakSet();

export function installActorSheetScrollPersistence(SheetClass) {
  if (!SheetClass?.prototype || SheetClass.prototype._rgScrollPersistenceInstalled) return false;
  SheetClass.prototype._rgScrollPersistenceInstalled = true;

  const originalOnRender = SheetClass.prototype._onRender;
  SheetClass.prototype._onRender = function(context, options) {
    const result = originalOnRender?.call(this, context, options);
    const root = this.element;
    if (!root) return result;

    if (!boundRoots.has(root)) {
      boundRoots.add(root);
      root.addEventListener("scroll", event => remember(this, root, event.target), true);
      root.addEventListener("pointerdown", () => snapshotScrollableTargets(this, root), true);
      root.addEventListener("change", () => snapshotScrollableTargets(this, root), true);
      root.addEventListener("submit", () => snapshotScrollableTargets(this, root), true);
    }

    const schedule = globalThis.requestAnimationFrame ?? (fn => setTimeout(fn, 0));
    schedule(() => schedule(() => restore(this, this.element ?? root)));
    return result;
  };

  return true;
}
