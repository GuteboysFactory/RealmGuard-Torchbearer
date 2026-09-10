export function diceFacesHtml(faces = [], { label = "" } = {}) {
  const values = Array.isArray(faces) ? faces : [];
  const title = label ? ` aria-label="${foundry.utils.escapeHTML(String(label))}"` : "";
  return `<span class="rg-dice-faces"${title}>${values.map(value => {
    const n = Number(value ?? 0);
    const cls = n >= 4 ? "success" : "failure";
    const six = n === 6 ? " six" : "";
    return `<span class="rg-die-face ${cls}${six}" title="${n === 6 ? "6 · success · eligible for Open 6s when Fate applies" : n >= 4 ? `${n} · success` : `${n} · failure`}"><span>${n}</span>${n === 6 ? `<i class="fa-solid fa-star" aria-hidden="true"></i>` : ""}</span>`;
  }).join("")}</span>`;
}

export function diceSuccesses(faces = []) {
  return (Array.isArray(faces) ? faces : []).filter(value => Number(value) >= 4).length;
}
