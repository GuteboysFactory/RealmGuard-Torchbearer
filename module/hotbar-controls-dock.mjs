export function installHotbarControlsDock() {
  let frame = null;
  let observed = [];
  const observer = new ResizeObserver(queuePlacement);

  function queuePlacement() {
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      placeControls();
    });
  }

  function placeControls() {
    const players = document.querySelector("#players #players-active");
    const hotbar = document.getElementById("hotbar");
    const controls = hotbar?.querySelector("#hotbar-controls-left");
    const targets = [players, hotbar, document.getElementById("ui-middle")];
    if (targets.some((target, index) => target !== observed[index])) {
      observer.disconnect();
      targets.filter(Boolean).forEach(target => observer.observe(target));
      observed = targets;
    }

    const docked = Boolean(players?.offsetWidth && hotbar?.offsetHeight && controls?.offsetWidth);
    if (!docked) {
      hotbar?.classList.remove("rg-hotbar-controls-docked");
      return;
    }

    // Keep the buttons in Foundry's Hotbar DOM so its native actions keep working.
    // Both UI columns are scaled, so convert the viewport position to Hotbar coordinates.
    hotbar.classList.add("rg-hotbar-controls-docked");
    const barBox = hotbar.getBoundingClientRect();
    const playersBox = players.getBoundingClientRect();
    const scale = barBox.height / hotbar.offsetHeight;
    const gap = 8 * scale;
    const controlWidth = controls.offsetWidth * scale;
    const controlHeight = controls.offsetHeight * scale;
    const left = Math.min(playersBox.right + gap, innerWidth - controlWidth - gap);
    let bottom = playersBox.bottom;

    // When the slots are visible in a narrow window, keep both controls clickable.
    const slots = hotbar.querySelector("#action-bar")?.getBoundingClientRect();
    if (slots?.width && left < barBox.right && left + controlWidth > slots.left
      && bottom > slots.top && bottom - controlHeight < slots.bottom) {
      bottom = slots.top - gap;
    }

    hotbar.style.setProperty("--rg-hotbar-controls-left", `${(left - barBox.left) / scale}px`);
    hotbar.style.setProperty("--rg-hotbar-controls-bottom", `${(barBox.bottom - bottom) / scale}px`);
  }

  Hooks.on("renderHotbar", queuePlacement);
  Hooks.on("renderPlayers", queuePlacement);
  Hooks.once("ready", queuePlacement);
  window.addEventListener("resize", queuePlacement);
  document.addEventListener("transitionend", event => {
    if (event.target.id === "hotbar" && event.propertyName === "transform") queuePlacement();
  });
}
