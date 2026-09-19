# Realm Guard / Torchbearer v1.9.0-qa.18 — Character Parchment Surface Harmony QA

## Scope

Visual-only Character sheet surface pass.

No rules, Actor data, Recruitment, CORE authority, M7 behavior or M8 Social Network behavior changes.

## Gate A — Character visual hierarchy

Open a Ranger Character sheet.

Expected:
- parchment background remains visible and continuous
- information panels no longer read as detached black rectangles
- Character information uses parchment / ink styling
- controls and navigation remain dark forest/brass
- Level medallion and Talent cards remain readable focal elements

## Gate B — editing readability

Check:
- Belief / Goal / Instinct
- Biography
- Lineage / House
- House Insignia
- Parents / Senior Artisan / Mentor / Friend / Enemy
- Character Notes

Expected:
- dark text on light paper-like fields
- placeholders remain readable
- normal editing and persistence

## Gate C — Wises / Traits / progression

Expected:
- Wises and Traits read clearly as ink-on-paper rows
- edit/delete/add buttons remain visually distinct controls
- progression tracks remain readable
- Talent cards still retain their dark interactive identity

## Gate D — resize

Resize wide / narrow / tall / short.

Expected:
- no new clipping
- parchment panels remain coherent
- background still fills the Character window

## Gate E — regression isolation

Switch to Skills and Inventory & Gear, and open NPC / Item / Conflict windows.

Expected:
- no functional regression
- approved Gear / Conflict styling is unchanged
- no Character parchment panel styling leaks outside the intended Character page/shell

## PASS criteria

qa.18 passes when the Character sheet reads as one coherent parchment document, controls remain clearly interactive, and no functional or cross-window regression is introduced.
