# TEST PROTOCOL — v1.12.0-qa.19

## M10C.8 — MG2E Explicit QA Activation

Target: Foundry VTT 13.351. M10C.7 / qa.18 has user-confirmed FULL PASS. This protocol verifies the new selectable activation release. Use a QA world and record failures with the active profile and action.

### Gate A — Boot and status

- Install/update qa.19 and reload: no boot errors.
- game.realmGuard.core.m10.getStatus().phase = M10C.8.
- game.realmGuard.core.m10.switchToMg2e exists.
- MG2E readinessAudit(): activationAuthorized=true, liveParityVerified=true, verifiedRelease=1.12.0-qa.18, openBlockers=[], decision=READY_EXPLICIT_QA_ACTIVATION.
- MG2E liveParityStatus(): verifiedRelease=1.12.0-qa.18, runtimeParityVerified=false in a fresh runtime. The stored qa.18 result must not be erased on reload or diagnostic reset.
- The 13-domain liveParityFoundationStatus() remains read-only, foundationReady=true, with liveParityVerified=false.

### Gate B — Profile Management / gates

- MG2E Rules Profile and Character Creation Profile both remain v3.
- MG2E is QA_ACTIVE and explicitly selectable for the GM.
- Preview MG2E Conversion opens MG2E-owned information and makes no writes.
- Cancel activation: no profile settings or document changes.
- A player cannot switch profiles through the API.
- Stable-runtime rejection is covered by the simulated stable smoke; Stable channel remains v1.11.0.

### Gate C — Activation, reload and preservation

- Snapshot representative Actors/Items, Journal IDs, Wise ratings, Conditions, inventory metadata, progression, Natural Order ranks and Creation provenance before switching.
- Activate MG2E: only the two active profile settings change; no document migration.
- Reload: active profile remains mg2e v3; Registry and Manual reference route to MG2E.
- Repeated activation is idempotent.
- Existing actors retain their recorded species/rank; no inference or rewriting occurs.

### Gate D — Tests / Traits / Nature

- Representative ordinary, Versus and Beginner's Luck tests use MG2E capabilities.
- Trait L1: +1D once/session; L2: +1D twice/session; L3: +1 success on an applicable test.
- Angry does not silently apply the Legacy block to beneficial MG2E Traits/Wises.
- Nature (Mouse): Escaping, Climbing, Hiding, Foraging; Tap/Double-Tap respect descriptors and excluded Resources/Circles.
- Progression remains levels/talents disabled without deleting stored values; advancement and learning use MG2E source ownership.

### Gate E — Wise effects

- Select a Wise on an eligible Skill/Ability/Conflict test and roll failed dice.
- Keep roll: no reroll or resource spend.
- Deeper Understanding: select one failed die, spend exactly 1 Fate, reroll exactly that die.
- Of Course: spend exactly 1 Persona, reroll all failed dice before Fate/open sixes.
- No free Legacy reroll and no rated self-Wise +1D.
- No failed dice or insufficient resources: no reroll/spend.
- Existing Wise rating fields remain unchanged. Wise cycle marks/perks remain explicit table guidance; no automatic conversion.

### Gate F — Help / I Am Wise

- Ability Help routes typed Ability or ally Wise sources; Skill Help routes Skill or ally Wise.
- A helper contributes one accepted source per test; no simultaneous normal Help and I Am Wise from that helper.
- I Am Wise is ally +1D, no helper condition risk, with twist risk; normal Help retains its consequence contract.
- No Synergy or helper Trait bonus leaks into MG2E Help.

### Gate G — Inventory / Gear / armor guidance

- LOOSE inventory and carry guidance are retained; placement metadata remains presentation-only.
- Relevant Gear +1D requires GM relevance approval.
- Source armor plans: light absorbs 1 once/conflict; heavy absorbs 1 per hit; mace exception blocks absorption.
- Apply these guided decisions at the table; the planner does not silently edit disposition or rewrite existing Gear.

### Gate H — Conflict routes

- Fight Defend uses Nature; starting disposition uses Fighter with Health/Nature base choice.
- Halberd uses MG2E action modifiers without MG1E Axe/Spear mode selection.
- Axe: +1s after successful Attack and -1D Defend/Feint; Sword selected fight action +1D; representative Bow/Spear/Hook and Line plans match MG2E adapters.
- An existing Realm Guard Whip must not acquire an inferred MG2E Hook and Line identity.
- Explicit narrative weapon exceptions remain GM decisions; source planners make their contracts available.

### Gate I — Recovery / Session / Circles

- MG2E Conditions and recovery order are correct, including Sick failed recovery -> Healer Ob4.
- Players' Turn free test, check costs and alternation remain correct.
- End Session rewards and Circles known-contact/Enmity routing remain source-owned MG2E; no automatic NPC migration or creation from profile switching.
- Natural Order remains guidance with no species-to-rank Actor write.

### Gate J — CORE M9 Recruitment

- While MG2E is active, valid guided/quick Recruitment uses MG2E Creation Profile v3 and transactional CORE M9 commit.
- Wises are unrated source choices; Conditions, relationships and provenance on the explicitly created character belong to MG2E.
- Back/Cancel/validation failure: no partial actor or relationship commit.
- Inactive MG2E creation is preview-only after switching away.

### Gate K — Rollback / existing profiles

- MG2E -> Legacy -> Strict -> MG1E -> MG2E -> Legacy, with reload after each switch.
- Compare the Gate C snapshots: existing document data is unchanged by switching.
- Representative Legacy, Strict and MG1E tests, Traits/Wises, Conflict, Recovery and Recruitment still work.
- Dormant Conditions, inventory metadata, rated Wises, progression and provenance reappear unchanged in their owning profiles.

### Gate L — Release / channels

- qa.19 GitHub prerelease and realm-guard.zip/system.json assets exist.
- QA channel points to 1.12.0-qa.19; Stable remains 1.11.0.
- Release workflow and published-package verification are green.

## Closure

Only after Gates A-L PASS: M10C.8 FULL PASS / VERIFIED / CLOSED. Until then qa.19 activation live QA remains pending. Stable MG2E promotion requires a subsequent explicit decision.
