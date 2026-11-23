import { primaryActiveGm } from "./turn-authority-bridge.mjs";

const SYSTEM = "realm-guard";
const REQUEST = "rangerRecruitment";
const REQUEST_ID = "recruitmentRequestId";
const queued = new Set();
let queue = Promise.resolve();

export async function submitRangerRecruitment(draft, profileHash, kind = "ranger") {
  const whisper = game.users.filter(user => user.isGM).map(user => user.id);
  if (!whisper.length) throw new Error("This world has no GM account to process Recruitment.");
  const request = await ChatMessage.create({
    whisper,
    content: "<p>Character creation submitted. Realm Guard creates the character automatically when a GM is connected.</p>",
    flags: { [SYSTEM]: { [REQUEST]: { status: "pending", draft, profileHash, kind } } }
  });
  if (!request) throw new Error("Recruitment could not be submitted.");
}

function requestAuthor(message) {
  const author = message.author;
  if (!author || author.isGM || !author.hasRole("PLAYER")) return null;
  return message.whisper.some(id => game.users.get(id)?.isGM) ? author : null;
}

async function processRequest(message, commit) {
  if (primaryActiveGm()?.id !== game.user.id) return;
  const current = game.messages.get(message.id);
  const author = current && requestAuthor(current);
  const request = current?.getFlag(SYSTEM, REQUEST);
  if (!author || request?.status !== "pending") return;

  let actor = game.actors.find(doc => doc.type === "character"
    && doc.getFlag(SYSTEM, REQUEST_ID) === current.id && doc.testUserPermission(author, "OWNER"));
  let error = "";
  try {
    if (actor && !actor.getFlag(SYSTEM, "creationProvenance")) {
      throw new Error("An interrupted Recruitment left a partial Actor.");
    }
    actor ??= await commit(request, author, current.id);
  } catch (cause) {
    console.error("Realm Guard | Player Recruitment failed", cause);
    error = "Recruitment could not be completed. Review your choices in a new Recruitment or contact the GM.";
  }

  if (!error && !author.character) {
    try { await author.update({ character: actor.id }); }
    catch (cause) { console.warn("Realm Guard | Could not select the player's new Ranger", cause); }
  }

  const content = error || `${foundry.utils.escapeHTML(actor.name)} was created in Actors → PC.`;
  await current.update({
    content: `<p>${content}</p>`,
    [`flags.${SYSTEM}.${REQUEST}`]: {
      status: error ? "failed" : "created",
      draft: null,
      actorId: error ? null : actor.id,
      openSheet: request.draft?.openSheet === true
    }
  });
}

export function installRecruitmentAuthority(commit) {
  const enqueue = (message, authorId = message.author?.id) => {
    if (!game.user.isGM || primaryActiveGm()?.id !== game.user.id || authorId !== message.author?.id
      || message.getFlag(SYSTEM, REQUEST)?.status !== "pending" || queued.has(message.id)) return;
    queued.add(message.id);
    queue = queue.then(() => processRequest(message, commit))
      .catch(error => console.error("Realm Guard | Could not finish the Recruitment request", error))
      .finally(() => queued.delete(message.id));
  };
  const scan = () => {
    if (game.ready && game.user.isGM && primaryActiveGm()?.id === game.user.id) {
      for (const message of game.messages) enqueue(message);
    }
  };
  Hooks.on("createChatMessage", (message, _options, userId) => enqueue(message, userId));
  Hooks.once("ready", scan);
  Hooks.on("userConnected", user => { if (user.isGM) scan(); });
  Hooks.on("updateChatMessage", (message, change, _options, userId) => {
    if (message.author?.id !== game.user.id || !game.users.get(userId)?.isGM) return;
    const result = change.flags?.[SYSTEM]?.[REQUEST];
    if (result?.status === "failed") ui.notifications.warn("Realm Guard: Recruitment failed. See the Recruitment message in chat.");
    if (result?.status !== "created") return;
    const actor = game.actors.get(result.actorId);
    if (!actor?.isOwner || actor.getFlag(SYSTEM, REQUEST_ID) !== message.id) return;
    ui.notifications.info(`Realm Guard: ${actor.name} was created in Actors → PC.`);
    if (result.openSheet) actor.sheet?.render(true);
  });
}
