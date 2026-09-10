function tokenHoverName(token) {
  return String(token?.document?.name || token?.actor?.name || "").trim();
}

export function installTokenNameHover() {
  Hooks.on("hoverToken", (token, hovered) => {
    const nameplate = token?.nameplate;
    if (!nameplate) return;
    if (hovered) {
      if (!token._rgNameHoverState) {
        token._rgNameHoverState = {
          visible: Boolean(nameplate.visible),
          renderable: nameplate.renderable,
          text: typeof nameplate.text === "string" ? nameplate.text : null
        };
      }
      const name = tokenHoverName(token);
      if (name && "text" in nameplate) nameplate.text = name;
      nameplate.visible = true;
      if ("renderable" in nameplate) nameplate.renderable = true;
      return;
    }
    const previous = token._rgNameHoverState;
    if (!previous) return;
    nameplate.visible = previous.visible;
    if (previous.renderable !== undefined && "renderable" in nameplate) nameplate.renderable = previous.renderable;
    if (previous.text !== null && "text" in nameplate) nameplate.text = previous.text;
    delete token._rgNameHoverState;
  });
}
