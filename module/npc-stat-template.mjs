import { fitWindowToViewport } from "./window-position-service.mjs";

const abilities = { nature: "Nature", will: "Will", health: "Health", resources: "Resources", circles: "Circles" };
const skillKey = name => String(name).trim().toLowerCase();
const pending = new Set();

export function statsTemplateTarget(actor) {
  const worldActor = actor?.isToken ? game.actors.get(actor.token?.actorId) : game.actors.get(actor?.id);
  if (game.user?.isGM && !actor?.pack && worldActor?.type === "npc" && worldActor.isOwner) return worldActor;
  return null;
}

function planStats(actor, template) {
  const changes = [];
  const update = {};
  for (const [key, label] of Object.entries(abilities)) {
    const limit = key === "nature" ? "maximum" : "max";
    const current = actor.system.attributes[key];
    const next = template.system.attributes[key];
    if (current.value === next.value && current[limit] === next[limit]) continue;
    update[`system.attributes.${key}.value`] = next.value;
    update[`system.attributes.${key}.${limit}`] = next[limit];
    changes.push({ label, before: `${current.value}/${current[limit]}`, after: `${next.value}/${next[limit]}` });
  }
  const incoming = new Map(template.items.filter(item => item.type === "role").map(item => [skillKey(item.name), item]));
  const existing = actor.items.filter(item => item.type === "role");
  const existingNames = new Set(existing.map(item => skillKey(item.name)));
  const ratings = new Map();
  const additions = [];
  for (const item of existing) {
    const nextRating = incoming.get(skillKey(item.name))?.system.rating ?? 0;
    if (item.system.rating === nextRating) continue;
    ratings.set(item.id, nextRating);
    changes.push({ label: item.name, before: `${item.system.rating}D`, after: `${nextRating}D` });
  }
  for (const [name, item] of incoming) {
    if (existingNames.has(name) || !item.system.rating) continue;
    additions.push({ name: item.name, rating: item.system.rating });
    changes.push({ label: item.name, before: "—", after: `${item.system.rating}D` });
  }
  return { changes, update, ratings, additions };
}

export async function reviewNpcStatsTemplate(actor, template) {
  if (statsTemplateTarget(actor) !== actor || template?.type !== "npc" || template === actor || pending.has(actor.id)) return;
  pending.add(actor.id);
  try {
    const preview = planStats(actor, template);
    if (!preview.changes.length) return ui.notifications.info("Realm Guard: This NPC already matches the template stats.");
    const esc = foundry.utils.escapeHTML;
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Realm Guard · Review NPC Stats", resizable: true },
      position: fitWindowToViewport(620, 560),
      content: `<div class="rg-npc-stats-review">
        <p>Apply stats from <strong>${esc(template.name)}</strong> to <strong>${esc(actor.name)}</strong>?</p>
        <p>Skills absent from the template become 0D. The NPC keeps its name, artwork, token, notes and gear.</p>
        <table><thead><tr><th>Stat</th><th>Current</th><th>Template</th></tr></thead><tbody>
        ${preview.changes.map(({label, before, after}) => `<tr><td>${esc(label)}</td><td>${before}</td><td>${after}</td></tr>`).join("")}
        </tbody></table></div>`,
      yes: { label: "Apply Stats" },
      no: { label: "Cancel" },
      rejectClose: false
    });
    if (!confirmed || statsTemplateTarget(actor) !== actor) return;
    if (!template.pack && game.actors.get(template.id) !== template) {
      return ui.notifications.warn("Realm Guard: The source NPC is no longer available.");
    }
    const reviewedSource = template.toObject();
    const current = planStats(actor, reviewedSource);
    if (JSON.stringify(current.changes) !== JSON.stringify(preview.changes)) {
      return ui.notifications.warn("Realm Guard: The NPC's stats changed. Review the template again.");
    }
    if (current.ratings.size || current.additions.length) {
      current.update.items = actor.toObject().items.map(item => {
        if (current.ratings.has(item._id)) item.system.rating = current.ratings.get(item._id);
        return item;
      });
      for (const { name, rating } of current.additions) {
        current.update.items.push({ _id: foundry.utils.randomID(), name, type: "role", system: { rating } });
      }
    }
    const saved = await actor.update(current.update);
    if (!saved || planStats(actor, reviewedSource).changes.length) throw new Error("The saved NPC stats did not match the template.");
    ui.notifications.info(`Realm Guard: Stats from ${template.name} applied to ${actor.name}.`);
  } catch (error) {
    ui.notifications.error(`Realm Guard: ${error.message}`);
  } finally {
    pending.delete(actor.id);
  }
}
