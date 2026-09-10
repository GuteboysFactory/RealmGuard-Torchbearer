export const RG_SYSTEM_NAME = "Realm Guard / Torchbearer";
export const RG_RELEASE_VERSION = "1.0.4";
export const RG_RULES_JOURNAL_NAME = "Realm Guard / Torchbearer - Rules Reference";
export const RG_RULES_FOLDER_NAME = "Realm Guard / Torchbearer";

const SYSTEM_ID = "realm-guard";
const JOURNAL_FLAG = "rulesReference";

const badge = (kind, label = kind) => `<span class="rg-rule-badge ${kind.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${label}</span>`;
const sourceLine = text => `<p class="rg-rule-source"><b>Rule basis:</b> ${text}</p>`;

export const RULES_REFERENCE_PAGES = Object.freeze([
  {
    name: "About the Rules Mix",
    source: "Project source hierarchy",
    html: `
      <p>${badge("RULE")} <b>Realm Guard / Torchbearer</b> is a private Foundry VTT implementation built from a deliberate mix of rule sources rather than a one-book conversion.</p>
      <ol>
        <li><b>Realm Guard: Rangers of the North</b> has priority where the hack defines or replaces a rule.</li>
        <li><b>Mouse Guard Roleplaying Game 2nd Edition</b> supplies inherited core procedures where Realm Guard does not replace them.</li>
        <li><b>Torchbearer 2nd Edition</b> is used only for selected compatible ideas that were deliberately adopted.</li>
        <li>${badge("RG/TB FOUNDRY", "RG/TB FOUNDRY")} marks project-specific digital expansions, convenience rules and automation.</li>
      </ol>
      <p>This reference summarizes the rules that the Foundry system actually uses. It is not intended to reproduce any source book verbatim.</p>
      ${sourceLine("Realm Guard first; Mouse Guard 2E inherited core; selected Torchbearer 2E ideas; explicit Foundry expansions.")}`
  },
  {
    name: "Core Tests and Versus",
    source: "Mouse Guard 2E inherited core",
    html: `
      <p>${badge("RULE")} Tests use pools of six-sided dice. A die showing <b>4, 5 or 6</b> is a success.</p>
      <p><b>Obstacle test:</b> the GM sets an Obstacle (Ob). The test passes when successes are equal to or greater than the Obstacle.</p>
      <p><b>Versus test:</b> both sides roll the appropriate Skill or Ability. Higher successes win. Equal successes are a tie and use the system's tie-resolution flow rather than being silently treated as a pass or fail.</p>
      <p>${badge("AUTOMATED")} The Roll Dialog starts at Ob 1 / Modifier 0, calculates pool additions and penalties, and reports successes and margin in chat.</p>
      <p>${badge("GM CALL")} The GM still decides when a test is required, which Skill/Ability fits, and the Obstacle when no explicit factor supplies it.</p>
      ${sourceLine("Mouse Guard 2E obstacle and versus procedures, retained where Realm Guard does not replace them.")}`
  },
  {
    name: "Skills, Learning and Beginner's Luck",
    source: "Mouse Guard 2E core + Realm Guard Skill list",
    html: `
      <p>${badge("RULE")} Trained Skills use their current rating as the base pool and record Pass/Fail advancement when the roll is eligible for Learning.</p>
      <p>When the displayed Pass/Fail requirements are satisfied, the Skill can advance by one rating. The current implementation caps normal trained Skill ratings at 6.</p>
      <p><b>Beginner's Luck:</b> an untrained Skill is Rating 0. It uses its linked Will or Health base, halves the pre-Persona support pool and rounds up. The system tracks attempts; when the requirement is met, the Skill can be learned at Rating 2.</p>
      <p>${badge("AUTOMATED")} Realm Guard / Torchbearer provisions the canonical Realm Guard Skill list, keeps untrained Skills visible, calculates advancement requirements, and prevents duplicate canonical Skill entries.</p>
      ${sourceLine("Realm Guard Skill vocabulary with Mouse Guard 2E Learning/Beginner's Luck procedures as implemented by the project.")}`
  },
  {
    name: "Nature",
    source: "Realm Guard Dúnadan Nature + Mouse Guard 2E inherited Nature procedures",
    html: `
      <p>${badge("RULE")} Dúnadan Rangers begin Recruitment from base Nature 3 and answer the Realm Guard Nature questions. A starting Ranger cannot begin at Nature 1 or 7.</p>
      <p>The current Ranger Nature descriptors are <b>Tradition, Family and Grief</b>. Nature may be rolled directly when the action genuinely falls within the character's Nature.</p>
      <p><b>Tap Nature</b> spends Persona to bring Nature into an appropriate test. <b>Double-Tap Nature</b> is only offered in the system when acting within Nature. Acting against Nature can Tax Nature according to the inherited procedure.</p>
      <p>${badge("GM CALL")} Whether a proposed action truly falls within a Dúnadan Nature descriptor remains a fictional/table judgement.</p>
      ${sourceLine("Realm Guard defines Dúnadan Nature and Recruitment; Mouse Guard 2E supplies inherited Tap/Tax/acting-with-or-against-Nature procedures.")}`
  },
  {
    name: "Traits, Wises, Help, Fate and Persona",
    source: "Mouse Guard 2E inherited core with project-safe Wise handling",
    html: `
      <p>${badge("RULE")} Traits may help their owner when relevant. Trait Against may be used in the intended GM Turn context to earn Checks. Traits are not a Teamwork source for helping another Ranger.</p>
      <p><b>Wises are intentionally unrated.</b> They remain knowledge tags used by the current Wise support/reroll flow. This project does not add numeric Wise ratings or Wises 2.0.</p>
      <p><b>Teamwork:</b> eligible patrol-mates may contribute with an appropriate Skill. A relevant Wise may instead grant +1D through <b>I Am Wise</b>; it is not Trait-based Help. Conflict action rolls limit Help according to the Conflict procedure.</p>
      <p><b>Persona</b> may be committed before a roll for +1D per point, up to +3D, and for supported Nature spends. <b>Fate</b> enables Open 6s after a qualifying roll; one Fate activation can continue through its open-ended six chain.</p>
      <p>${badge("AUTOMATED")} Current resources are deducted only when a spend is actually committed. Cancelling before the roll does not spend the resource.</p>
      ${sourceLine("Mouse Guard 2E resource, Trait and Teamwork procedures; project decision keeps Wises unrated.")}`
  },
  {
    name: "Turns, Checks, Conditions and Recovery",
    source: "Mouse Guard 2E turn/check economy + Realm Guard Strained override",
    html: `
      <p>${badge("RULE")} In <b>Structured Mode</b>, play uses GM Turn and Players' Turn. Each Ranger starts Players' Turn with one Free Test; additional tests cost Checks. The no-two-tests-in-a-row guard applies in group play, with solo play exempt.</p>
      <p>Checks can be passed between Rangers under the implemented rules. Trait Against earns Checks only in the intended GM Turn context.</p>
      <p><b>Recovery order:</b> Hungry &amp; Thirsty -> Angry -> Tired -> Injured -> Strained. Players' Turn recovery uses the Free Test first, then Checks. Supported GM Turn recovery costs two Checks.</p>
      <p>Canonical recovery examples used by the system include Angry: Will Ob 2, Tired: Health Ob 3, Injured: Health Ob 4 and Realm Guard <b>Strained</b>: Will Ob 4. Afraid and Fresh have their own implemented handling.</p>
      <p>${badge("RG/TB FOUNDRY", "RG/TB FOUNDRY")} <b>Free Play</b> is an optional mode that disables the Turn/Check test economy while preserving the underlying Actor data and Recovery rules.</p>
      ${sourceLine("Mouse Guard 2E Players' Turn/Checks and recovery framework; Realm Guard replaces Sick with Strained; Free Play is a Foundry option.")}`
  },
  {
    name: "Inventory, Gear and Tokens of Power",
    source: "Realm Guard Tokens of Power + Foundry inventory expansion",
    html: `
      <p>${badge("RG/TB FOUNDRY", "RG/TB FOUNDRY")} The paper-doll Inventory &amp; Gear layout is a Foundry expansion. It provides Head, Neck, Cloak, Left Hand, Right Hand, Torso, Belt, Pocket and Feet, plus Containers and Unassigned Gear. Two-handed items lock the opposite hand.</p>
      <p>${badge("RULE")} A <b>Token of Power</b> is a named significant item with a Level and a specific linked Skill/use. Level 1 grants +1D once per session; Level 2 grants +1D on every appropriate check; Level 3 grants a failed-dice reroll once per session.</p>
      <p>Elven- and Dwarven-crafted items are at least Level 1 in Realm Guard. Merely naming ordinary Gear does not turn it into a Token of Power.</p>
      <p>${badge("GM CALL")} Specific-use Tokens and Scale of Might relevance require table judgement where no safe universal automation exists.</p>
      ${sourceLine("Realm Guard defines Tokens of Power; slot inventory/container handling is a Foundry expansion.")}`
  },
  {
    name: "Conflict",
    source: "Realm Guard conflict mapping + Mouse Guard 2E inherited conflict structure",
    html: `
      <p>${badge("RULE")} A Conflict begins with goals and Starting Disposition. Each side secretly scripts three actions from <b>Attack, Defend, Feint and Maneuver</b>. Actions are revealed and resolved one pair at a time.</p>
      <p>The interaction matrix uses <b>Independent</b>, <b>Versus</b> and <b>Trumped</b> outcomes. Realm Guard's own conflict Skill mappings take precedence; inherited Mouse Guard cells are used where Realm Guard says to do so.</p>
      <p>The Conflict Captain assigns Ranger actions while respecting action rotation. Weapon qualities, Teamwork, Maneuvers, Disposition changes, ties, Learning and Compromise are resolved through the Conflict Engine.</p>
      <p>${badge("AUTOMATED")} GM and Ranger cards have different faces and backs. Unrevealed opposing card identities remain hidden until reveal.</p>
      <p>${badge("GM CALL")} Complex weapon edge cases, fictional positioning and the exact terms of a final Compromise remain table decisions.</p>
      ${sourceLine("Realm Guard conflict Skills/overrides with Mouse Guard 2E three-action scripting, interaction matrix, Disposition and Compromise structure.")}`
  },
  {
    name: "Recruitment",
    source: "Realm Guard Recruitment",
    html: `
      <p>${badge("RULE")} Create Ranger implements Realm Guard Recruitment: Concept, Station/Age, Dúnadan Nature, Homeland, Natural Talent, Life Experience, Service, Specialty, Wises, Resources/Circles, Traits, relationships, Belief/Goal/Instinct and starting Gear.</p>
      <p>Stations are Recruit, Scout, Veteran, Captain and Lord. Station determines starting age range, Will/Health and several Recruitment budgets.</p>
      <p><b>Natural Talent</b> is not a separate Talent subsystem: it is a Recruitment Skill check. Recruit and Lord choose two; Scout, Veteran and Captain choose one.</p>
      <p>${badge("AUTOMATED")} GUIDED and QUICK modes use the same validation. Finished player characters are placed in the <b>PC</b> Actor folder, which is created on demand.</p>
      ${sourceLine("Realm Guard: Rangers of the North Recruitment chapter; project UI automates the bookkeeping.")}`
  },
  {
    name: "End of Session",
    source: "Mouse Guard 2E inherited End of Session rewards",
    html: `
      <p>${badge("RULE")} End of Session reviews each participating Ranger's Belief, Goal and Instinct and proposes Fate/Persona awards.</p>
      <p>Implemented Fate criteria include acting on Belief, working toward an uncompleted Goal and playing Instinct. Persona criteria include accomplishing Goal, playing against Belief, MVP, Workhorse and Embodiment.</p>
      <p>There is one MVP and one Workhorse, and they cannot be the same Ranger. Embodiment represents character portrayal and may apply to more than one Ranger, but not the entire group. For a one-Ranger session, the Foundry workflow allows the sole Ranger to receive Embodiment as a solo-play exception.</p>
      <p>${badge("AUTOMATED")} GM approval is required before awards are applied; duplicate-session protection prevents the same cycle from paying twice. Start Next Session resets supported once/session state.</p>
      ${sourceLine("Mouse Guard 2E End of Session / Fate / Persona procedures, implemented with a GM approval workflow.")}`
  },
  {
    name: "Levels and Talents",
    source: "Selected Torchbearer 2E inspiration + Realm Guard Foundry expansion",
    html: `
      <p>${badge("RG/TB FOUNDRY", "RG/TB FOUNDRY")} Level progression is a project expansion. It uses <b>lifetime Fate and Persona actually spent in play</b> as the advancement currency; earned rewards and manual resource corrections do not count.</p>
      <p>Both cumulative thresholds must be met. Rangers begin at Level 1 and, from Level 2 onward, gain one Talent slot per Level through Level 10.</p>
      <p>Talents can be Passive, Once per Session or Once per Conflict and may link to a Skill, Ability or an explicit general/table-approved use.</p>
      <p>This layer is inspired by the Torchbearer 2E idea that spent Fate/Persona drives level advancement, but it does <b>not</b> import Torchbearer classes, Town/Camp/Grind, spell systems or other unrelated subsystems.</p>
      ${sourceLine("Selected Torchbearer 2E progression inspiration, adapted as an explicit Realm Guard / Torchbearer Foundry expansion.")}`
  },
  {
    name: "Foundry Automation and GM Calls",
    source: "Project implementation policy",
    html: `
      <p>${badge("AUTOMATED")} The system automates bookkeeping that is safe to determine mechanically: dice pools, resource spends, Learning marks, Inventory placement, Condition state, hidden Conflict plans, session recharge, progression counters and non-destructive starter content seeding.</p>
      <p>${badge("GM CALL")} Fictional applicability is never fully replaced by automation. The GM/table still decides when a test is warranted, which fictional advantage applies, whether a descriptor or specific-use relic fits, what an unusual conflict action means and the terms of compromise/consequences.</p>
      <p>${badge("RG/TB FOUNDRY", "RG/TB FOUNDRY")} Quick NPC loadouts, the paper-doll inventory, Free Play, Levels/Talents, Content Studio, World Health Audit and similar quality-of-life tools are project additions rather than claims about the printed source rules.</p>
      <p><b>World safety:</b> the system package and a Foundry World are separate. Updating/installing the system does not move a campaign to another server. Back up and transfer/restore the actual World data separately.</p>
      ${sourceLine("Realm Guard / Torchbearer Foundry project policy and the v1.0 automation boundary.")}`
  }
]);

export function rulesReferenceDetailsHtml() {
  return RULES_REFERENCE_PAGES.map((page, index) => `
    <details class="rg-rules-detail" ${index === 0 ? "open" : ""}>
      <summary><i class="fa-solid fa-book-bookmark"></i> ${page.name}</summary>
      <div class="rg-manual-body">${page.html}</div>
    </details>`).join("");
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function existingReferenceJournal() {
  return (game.journal?.contents ?? []).find(entry =>
    entry.getFlag?.(SYSTEM_ID, JOURNAL_FLAG) === true || normalize(entry.name) === normalize(RG_RULES_JOURNAL_NAME)
  ) ?? null;
}

async function ensureReferenceFolder() {
  let folder = (game.folders?.contents ?? []).find(f => f.type === "JournalEntry" && !f.folder && normalize(f.name) === normalize(RG_RULES_FOLDER_NAME));
  if (!folder) folder = await Folder.create({ name: RG_RULES_FOLDER_NAME, type: "JournalEntry", sorting: "a" });
  return folder;
}

function journalPages() {
  return RULES_REFERENCE_PAGES.map((page, index) => ({
    name: page.name,
    type: "text",
    sort: (index + 1) * 100000,
    title: { show: true, level: 1 },
    text: {
      content: `<div class="realm-guard rg-rules-journal-page"><p class="rg-rules-journal-kicker">${RG_SYSTEM_NAME} · Rules Reference · v${RG_RELEASE_VERSION}</p>${page.html}</div>`,
      format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML
    }
  }));
}

export async function ensureRulesReferenceJournal() {
  if (!game.user?.isGM) return existingReferenceJournal();
  const existing = existingReferenceJournal();
  if (existing) return existing;
  const folder = await ensureReferenceFolder();
  const ownership = { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER };
  const entry = await JournalEntry.create({
    name: RG_RULES_JOURNAL_NAME,
    folder: folder?.id ?? null,
    ownership,
    pages: journalPages(),
    flags: { [SYSTEM_ID]: { [JOURNAL_FLAG]: true, rulesReferenceVersion: RG_RELEASE_VERSION } }
  });
  ui.notifications?.info?.(`${RG_SYSTEM_NAME}: Rules Reference Journal created.`);
  return entry;
}

export async function openRulesReferenceJournal() {
  const entry = existingReferenceJournal() ?? (game.user?.isGM ? await ensureRulesReferenceJournal() : null);
  if (!entry) {
    ui.notifications?.warn?.(`${RG_SYSTEM_NAME}: Rules Reference Journal is not available yet. Ask the GM to load the world once, or use the integrated Manual.`);
    return null;
  }
  entry.sheet?.render?.(true);
  return entry;
}

export function installRulesReferenceJournal() {
  Hooks.once("ready", async () => {
    if (!game.user?.isGM) return;
    try { await ensureRulesReferenceJournal(); }
    catch (error) {
      console.error(`${RG_SYSTEM_NAME} | Could not create Rules Reference Journal`, error);
      ui.notifications?.warn?.(`${RG_SYSTEM_NAME}: Could not create the Rules Reference Journal. Check F12 Console.`);
    }
  });
}
