export function freezeTb2e(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freezeTb2e(child);
  return value;
}

export const TB2E_COVERAGE_CLASSES = Object.freeze(["VERIFIED", "PARTIAL", "MANUAL", "SOURCE_INCOMPLETE"]);
// Page references are one-based physical PDF pages, not the unavailable DG/SG books.
const rows = [
  ["tests","Tests / Dice","PARTIAL","QR 2, 4, 7; CC 5","d6 success 4+, dice/success modifiers, open sixes and Beginner's Luck summary","Full skill obstacle factors and all tie/exception procedures are not supplied."],
  ["abilities","Abilities / Skills","PARTIAL","QR 8-13, 19, 99; CC 7-14","Named abilities, skill list, ranges and learning summary","Full skill descriptions and factors are referenced to unavailable DG pages."],
  ["nature","Nature","PARTIAL","QR 14-18, 76; CC 26-30","Stock descriptors, Channel Nature, tax/recovery and questionnaire summaries","Boundary/retirement wording needs current-versus-maximum clarification; do not infer exceptions."],
  ["traits","Traits","SOURCE_INCOMPLETE","QR 21; CC 7-12, 15-22, 27-30","Benefit levels and against-self/check options are summarized","QR 21 says traits cannot be used against oneself in 'traits or camp phases'; do not silently correct that unclear phrase."],
  ["wises","Wises","VERIFIED","QR 20, 60, 75-76; CC 25","Bounded guide contract: unrated Wises, I Am Wise aid, paid rerolls, order/repeated-reroll restriction and cycle choices","Verified only for this guide-described contract, not a claim of complete TB2E book coverage."],
  ["help","Help / Teamwork","PARTIAL","QR 5, 7, 59-60, 99; CC 5, 45","Typed help/descriptor support, Wise aid separation and helper risk summaries","Town Resources/recovery restrictions and full suggested-help skill catalogue need source-bound context; no MG defaults."],
  ["resources","Fate / Persona / resources","PARTIAL","QR 12, 72-76, 97-98; CC 36","Fate/Persona effects, award summaries, Resources tax/treasure and lifestyle summary","Complete shopping/factor tables and all resource exceptions are unavailable."],
  ["conditions","Conditions","PARTIAL","QR 38, 40-46","Fresh, Hungry/Thirsty, Angry, Afraid, Exhausted, Injured, Sick and Dead summaries","Condition/disposition penalties differ from QR 51; distinguish Grind order from recovery order and defer unresolved details."],
  ["recovery","Recovery","PARTIAL","QR 10-11, 17, 41-47, 77, 83-88","Recovery tests/order, checks and accommodation summaries (including visual table)","QR 44 says Camp/Test; full treatment, accommodation and exception coverage is not established."],
  ["inventory","Inventory / Gear","PARTIAL","QR 23-26; CC 37-40 (visual tables)","Structured locations, containers, caches and starting-item placement tables","Starting lists are not the full gear catalogue; no inferred capacity/effect data or existing-item conversion."],
  ["armor","Armor","SOURCE_INCOMPLETE","CC 41, 47; QR 52","Starting armor/helmet placement, class permissions and direct-target absorption summary","Complete armor types, modifiers, absorption/repair rules are referenced to DG150, which is not supplied."],
  ["conflict","Conflict","SOURCE_INCOMPLETE","QR 48-68 (visual tables 53-54)","Three-action structure, action/skill matrices, distributed HP, actions and compromises","QR 41/44 describe -1s disposition while QR 51 describes -1D; complete weapon catalogue/exception and compromise rules are unavailable."],
  ["advancement","Advancement","PARTIAL","QR 18-19, 99-101 (visual level table); CC 47","Pass/fail formula, learning and cumulative level investment table","All class benefits beyond summarized level 1 and progression exceptions are not supplied."],
  ["session","Session / phases","PARTIAL","QR 3, 6, 22, 37-39, 72-82; CC 44-46","Adventure/Grind, Camp checks, Town/lifestyle, prologue and reward summaries","Complete camp/town event tables, phase exceptions and procedures are not established."],
  ["circles","Circles / relationships","PARTIAL","QR 13, 86; CC 3, 31-35","Contacts/allies, starting friend/parents/mentor/enemy questions and lodging","Complete Circles factors, relationship evolution and exceptions are unavailable; never create NPCs automatically."],
  ["creation","Character Creation","PARTIAL","CC 2-48; QR 8-26","Six stock/class choices, starting abilities/skills, home, specialty, Wises, Nature, relationships, gear and drives","Guide foundation only: spell/invocation descriptions and complete class/gear rules are missing; no executable creation grants."],
  ["magic","Magic / invocations","SOURCE_INCOMPLETE","QR 27-36; CC 42-43, 47","Memory palace, spell book, relic and burden summaries; starting-choice visual tables","Complete spell/invocation effects and required factors/descriptions are referenced to unavailable books."],
  ["scales","Might / Precedence","PARTIAL","QR 68-71","Scale entries and conflict eligibility summaries","Full exceptional interactions are not established; no stock/species-to-rank inference."],
  ["narrative","Narrative adjudication","MANUAL","QR 4, 42, 61-67, 102; Audit A8; Architecture 19","Fictional applicability, twists, compromises and GM-selected exceptions","Table interpretation stays manual; MANUAL is not a substitute for missing numeric rules."]
];

export const TB2E_SOURCE_COVERAGE_MATRIX = freezeTb2e(rows.map(([id,domain,status,evidence,verifiedScope,gaps]) => ({
  id,domain,status,evidence,verifiedScope,gaps,mode:"READ_ONLY",liveEnabled:false,automation:"DISABLED"
})));

export function tb2eSourceCoverageMatrix() { return TB2E_SOURCE_COVERAGE_MATRIX; }
