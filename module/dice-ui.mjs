export function diceFacesHtml(faces = [], { label = "", openSixes = true, crossedIndexes = [], keepSlots = false } = {}) {
  const values = Array.isArray(faces) ? faces : [];
  const title = label ? ` aria-label="${foundry.utils.escapeHTML(String(label))}"` : "";
  return `<span class="rg-dice-faces"${title}>${values.map((value, index) => {
    if (keepSlots && value === null) return '<span class="rg-die-face rg-die-slot" aria-hidden="true">—</span>';
    const n = Number(value ?? 0);
    if (crossedIndexes.includes(index)) {
      return `<span class="rg-die-face rg-die-crossed" title="${n} · rerolled"><span>${n}</span></span>`;
    }
    const cls = n >= 4 ? "success" : "failure";
    const six = n === 6 && openSixes;
    return `<span class="rg-die-face ${cls}${six ? " six" : ""}" title="${six ? "6 · success · eligible for Open 6s when Fate applies" : n >= 4 ? `${n} · success` : `${n} · failure`}"><span>${n}</span>${six ? `<i class="fa-solid fa-star" aria-hidden="true"></i>` : ""}</span>`;
  }).join("")}</span>`;
}

export function diceSuccesses(faces = []) {
  return (Array.isArray(faces) ? faces : []).filter(value => Number(value) >= 4).length;
}
