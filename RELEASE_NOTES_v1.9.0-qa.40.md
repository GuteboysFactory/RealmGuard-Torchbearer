# Realm Guard / Torchbearer v1.9.0-qa.40 — Circles GM Obstacle Authority

qa.40 is a focused hotfix on top of qa.39.

## Fixed
Circles had been classified as a rule-specific manual Obstacle roll. That caused the Circles Roll Dialog to open with an independently editable Obstacle (for example Ob 1) even while the GM's Obstacle Control baseline was set to another value.

## Locked behavior
Circles Obstacle is now always GM authority:

- **Automatic / Baseline** — Circles starts from the current Baseline Obstacle.
- **Change Open Rolls Live** — the GM can push a new Obstacle to an already open Circles dialog.
- **GM Approval** — Circles uses the existing GM approval request flow.
- **Manual mode** — Circles remains the exception: the player's Obstacle field is still read-only and the GM controls it through Obstacle Control.

The Circles Obstacle field is never directly editable by a player.

## Unchanged
- qa.39 Standard / Known Person / Find New Person Social Network flow
- Circles dice pool and Ability value
- Conditions
- Help / Teamwork
- Fate / Persona
- Learning / Advancement
- Social Network Contact creation
- Enmity remains deferred
