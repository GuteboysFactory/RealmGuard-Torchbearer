const STYLE_ID = "rg-smart-select-scroll-hotfix";
let ready = false;

function ensureSmartSelectScrollStyles() {
  if (document.getElementById(STYLE_ID)) return false;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.rg-smart-select-menu {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  overscroll-behavior: contain !important;
  scrollbar-width: thin;
  scrollbar-color: #8d7447 #18151a;
}
.rg-smart-select-menu::-webkit-scrollbar { width: 10px; }
.rg-smart-select-menu::-webkit-scrollbar-track { background: #18151a; border-radius: 8px; }
.rg-smart-select-menu::-webkit-scrollbar-thumb { background: #8d7447; border-radius: 8px; border: 2px solid #18151a; }
`;
  document.head.append(style);
  return true;
}

function smartMenuForScrollEvent(event) {
  const target = event?.target;
  if (!(target instanceof Element)) return null;
  if (target.matches?.(".rg-smart-select-menu")) return target;
  return target.closest?.(".rg-smart-select-menu") ?? null;
}

function protectSmartMenuScroll(event) {
  const menu = smartMenuForScrollEvent(event);
  if (!menu?.classList?.contains("is-open")) return;

  // context-help.mjs historically closes every smart select on every captured
  // scroll event. A dropdown's own scroll must not be treated as an outside
  // viewport scroll. This listener is intentionally registered at module load,
  // before realm-guard.mjs installs Context Help, so it can stop that later
  // close handler only for scroll events originating inside the open menu.
  event.stopImmediatePropagation();
}

// Register immediately. system.json loads this module before realm-guard.mjs.
window.addEventListener("scroll", protectSmartMenuScroll, true);

Hooks.once("ready", () => {
  ensureSmartSelectScrollStyles();
  ready = true;
  game.realmGuard ??= {};
  game.realmGuard.smartSelectScroll = Object.freeze({
    getStatus: () => Object.freeze({
      scope: "SYSTEM_SMART_SELECT_SCROLL",
      authority: "RG_SMART_SELECT",
      installed: true,
      ready,
      menuSelector: ".rg-smart-select-menu",
      nativeOverflow: true,
      internalScrollCloseGuard: true
    })
  });
  console.log("realm-guard | Smart-select scroll guard ready", game.realmGuard.smartSelectScroll.getStatus());
});
