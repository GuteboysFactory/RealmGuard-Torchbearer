# M10D.1 — Torchbearer 2E Source Coverage Matrix + Profile Foundation

Release: v1.13.0-qa.1. Date: 2026-10-04. Baseline: verified v1.12.0 STABLE.

## Authority and lineage

Only the five supplied project sources below are authorized. QR means 538386649-Torchbearer-2E-Quick-Rules-Guide.pdf (internal title A Guide For Game Masters); CC means 538386285-Torchbearer-2E-Character-Creation-Guide.pdf (internal title A Guide for Players). References use one-based physical PDF pages. The scanned visual tables in CC 38, 40-43 and QR 53-54, 83, 90, 101 were inspected, not treated as missing merely because text extraction omitted them.

The guides are summaries, not complete TB2E rulebooks. DG/SG citations inside them identify unavailable source material; they are not permission to invent or import those rules. The audit/architecture/roadmap govern source constraints and engine boundaries, not replacement numeric rules. No internet, MG1E, MG2E or Realm Guard rulebook supplies TB2E defaults.

- 538386285-Torchbearer-2E-Character-Creation-Guide.pdf — RULE_GUIDE; local reference 538386285-Torchbearer-2E-Character-Creation-Guide.pdf; SHA-256 1fffcfca9739a76ca1d2cdfdb618fafbe764599db0273124cdcc0f91a1a9fc6e; 48 PDF pages.
- 538386649-Torchbearer-2E-Quick-Rules-Guide.pdf — RULE_GUIDE; local reference 538386649-Torchbearer-2E-Quick-Rules-Guide.pdf; SHA-256 2389aaac039428632ed9aaac7f71489406213057a7893f6a5be810d934f570cb; 102 PDF pages.
- MG_FAMILY_CORE_RULE_AUDIT_v0.2 — CORE_AUDIT; local reference MG_FAMILY_CORE_RULE_AUDIT_v0.2(1).md; SHA-256 21bacebd16573a452ab7e5e21eb873cf212b01f010199671b2d7dd86a7eb420b.
- MG_FAMILY_CORE_ARCHITECTURE_v0.1 — ARCHITECTURE; local reference MG_FAMILY_CORE_ARCHITECTURE_v0.1(1).md; SHA-256 83bc92589fe31dee326328b8eeaeecf2a428a0e210ba94c3ef105a6f43879e8e.
- MG_FAMILY_CORE_IMPLEMENTATION_ROADMAP_v0.1 — IMPLEMENTATION_POLICY; local reference MG_FAMILY_CORE_IMPLEMENTATION_ROADMAP_v0.1(1).md; SHA-256 2beea7db73d6015fbe78cdb2274c4991d64712a8b764a829929cf822f71411e8.

## Classification meaning

- VERIFIED: the explicitly bounded guide contract is established; this does not certify the entire game domain or enable live play.
- PARTIAL: usable source-backed statements exist, but full domain coverage is missing.
- MANUAL: source-backed fictional judgment stays with the table. This label never hides missing numeric rules.
- SOURCE_INCOMPLETE: missing/ambiguous/conflicting authority prevents a confident domain contract.

All 19 rows have mode READ_ONLY, liveEnabled=false and automation DISABLED in qa.1. Rules Registry presentation uses MANUAL to signal no automatic execution; it preserves each separate source classification.

## Exact matrix

| Domain | Classification | Evidence | Verified scope | Gap / boundary |
|---|---|---|---|---|
| Tests / Dice | PARTIAL | QR 2, 4, 7; CC 5 | d6 success 4+, dice/success modifiers, open sixes and Beginner's Luck summary | Full skill obstacle factors and all tie/exception procedures are not supplied. |
| Abilities / Skills | PARTIAL | QR 8-13, 19, 99; CC 7-14 | Named abilities, skill list, ranges and learning summary | Full skill descriptions and factors are referenced to unavailable DG pages. |
| Nature | PARTIAL | QR 14-18, 76; CC 26-30 | Stock descriptors, Channel Nature, tax/recovery and questionnaire summaries | Boundary/retirement wording needs current-versus-maximum clarification; do not infer exceptions. |
| Traits | SOURCE_INCOMPLETE | QR 21; CC 7-12, 15-22, 27-30 | Benefit levels and against-self/check options are summarized | QR 21 says traits cannot be used against oneself in 'traits or camp phases'; do not silently correct that unclear phrase. |
| Wises | VERIFIED | QR 20, 60, 75-76; CC 25 | Bounded guide contract: unrated Wises, I Am Wise aid, paid rerolls, order/repeated-reroll restriction and cycle choices | Verified only for this guide-described contract, not a claim of complete TB2E book coverage. |
| Help / Teamwork | PARTIAL | QR 5, 7, 59-60, 99; CC 5, 45 | Typed help/descriptor support, Wise aid separation and helper risk summaries | Town Resources/recovery restrictions and full suggested-help skill catalogue need source-bound context; no MG defaults. |
| Fate / Persona / resources | PARTIAL | QR 12, 72-76, 97-98; CC 36 | Fate/Persona effects, award summaries, Resources tax/treasure and lifestyle summary | Complete shopping/factor tables and all resource exceptions are unavailable. |
| Conditions | PARTIAL | QR 38, 40-46 | Fresh, Hungry/Thirsty, Angry, Afraid, Exhausted, Injured, Sick and Dead summaries | Condition/disposition penalties differ from QR 51; distinguish Grind order from recovery order and defer unresolved details. |
| Recovery | PARTIAL | QR 10-11, 17, 41-47, 77, 83-88 | Recovery tests/order, checks and accommodation summaries (including visual table) | QR 44 says Camp/Test; full treatment, accommodation and exception coverage is not established. |
| Inventory / Gear | PARTIAL | QR 23-26; CC 37-40 (visual tables) | Structured locations, containers, caches and starting-item placement tables | Starting lists are not the full gear catalogue; no inferred capacity/effect data or existing-item conversion. |
| Armor | SOURCE_INCOMPLETE | CC 41, 47; QR 52 | Starting armor/helmet placement, class permissions and direct-target absorption summary | Complete armor types, modifiers, absorption/repair rules are referenced to DG150, which is not supplied. |
| Conflict | SOURCE_INCOMPLETE | QR 48-68 (visual tables 53-54) | Three-action structure, action/skill matrices, distributed HP, actions and compromises | QR 41/44 describe -1s disposition while QR 51 describes -1D; complete weapon catalogue/exception and compromise rules are unavailable. |
| Advancement | PARTIAL | QR 18-19, 99-101 (visual level table); CC 47 | Pass/fail formula, learning and cumulative level investment table | All class benefits beyond summarized level 1 and progression exceptions are not supplied. |
| Session / phases | PARTIAL | QR 3, 6, 22, 37-39, 72-82; CC 44-46 | Adventure/Grind, Camp checks, Town/lifestyle, prologue and reward summaries | Complete camp/town event tables, phase exceptions and procedures are not established. |
| Circles / relationships | PARTIAL | QR 13, 86; CC 3, 31-35 | Contacts/allies, starting friend/parents/mentor/enemy questions and lodging | Complete Circles factors, relationship evolution and exceptions are unavailable; never create NPCs automatically. |
| Character Creation | PARTIAL | CC 2-48; QR 8-26 | Six stock/class choices, starting abilities/skills, home, specialty, Wises, Nature, relationships, gear and drives | Guide foundation only: spell/invocation descriptions and complete class/gear rules are missing; no executable creation grants. |
| Magic / invocations | SOURCE_INCOMPLETE | QR 27-36; CC 42-43, 47 | Memory palace, spell book, relic and burden summaries; starting-choice visual tables | Complete spell/invocation effects and required factors/descriptions are referenced to unavailable books. |
| Might / Precedence | PARTIAL | QR 68-71 | Scale entries and conflict eligibility summaries | Full exceptional interactions are not established; no stock/species-to-rank inference. |
| Narrative adjudication | MANUAL | QR 4, 42, 61-67, 102; Audit A8; Architecture 19 | Fictional applicability, twists, compromises and GM-selected exceptions | Table interpretation stays manual; MANUAL is not a substitute for missing numeric rules. |

## Foundation / safety contract

- Standalone torchbearer2e Rules Profile v1, parent=null; no inherited rule providers.
- Standalone torchbearer2e Character Creation Profile v1. Steps reference the guide; no stats, grants or document creation are derived. Commit-spec generation throws even when called through the generic creation engine.
- FOUNDATION_ONLY / READ_ONLY, selectable=false, supported=false, liveRuleAuthority=false, activationAllowed=false, liveParityVerified=false.
- Generic activation rejects TB2E before any setting writes. There is no switchToTorchbearer2e surface.
- Preview compares source classifications and performs a world impact scan with zero writes; only Close is available.
- No migration, Actor/Item/Journal/setting writes, destructive conversions, automatic Wise conversion or stock/species-to-rank inference.
- Legacy Mixed, Strict RG, MG1E and MG2E definitions and existing resolved profile snapshots remain unchanged.

## Runtime API

`game.realmGuard.core.m10d`: getStatus(), readinessAudit(), sourceCoverageMatrix(), getRulesProfile(), getCreationProfile(), previewConversion(), showConversionPreview(). Existing m10 API is retained. Readiness decision: FOUNDATION_ONLY_NOT_READY_FOR_LIVE. No later M10D domains are authorized.

## Release gate

Full syntax/smoke and existing release pipeline must pass before QA promotion. Stable stays at 1.12.0. First Foundry source-review gate follows TEST_PROTOCOL_v1.13.0-qa.1.md; runtime verification of this foundation remains pending until the user reports that gate.
