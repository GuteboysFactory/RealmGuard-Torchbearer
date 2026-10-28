# 1.13.0 — Supported profiles stable release

Publishes the existing usable functionality for Realm Guard Legacy Mixed, Strict Realm Guard, Mouse Guard 1E and Mouse Guard 2E. No additional TB2E gameplay integration is included.

Mouse Guard 1E is promoted from QA-only selection to supported stable, using the recorded M10B.11 Foundry 13.351 Gates A–L FULL PASS on 1.12.0-qa.11 and current regression checks. Its gameplay rules are unchanged. GM-only confirmation, reversible settings-only switching, CORE M9 creation and existing-data preservation remain in place.

The release retains the existing supported-profile tools, Recruitment, roll/conflict/session tools and QA27 Overview fields. Profile-specific automation and manual boundaries remain those of each existing profile; this release does not promise complete automation of every source-book rule.

## TB2E deferred
Torchbearer 2E remains a read-only preview in stable. Its separate opt-in character creation QA cannot be enabled in stable, even if a world saved that QA flag previously. The QA setting is hidden in stable. The published QA channel remains 1.13.0-qa.29 for later TB2E work. Existing TB2E-created Actors retain their data and remain protected from legacy skill/Condition enrichment.

## Updating
Use the stable channel manifest:
https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels/stable/system.json

A system installed from the QA channel continues following that channel; use the stable manifest to move to stable. If a test world currently uses Torchbearer 2E, switch that world back to its previous supported profile before updating. Existing MG1E, MG2E, Strict and Legacy profile selections are preserved; no automatic Actor, Item, Wise, Condition, Gear or Journal conversion is performed by profile switching.

The release workflow runs syntax checks, all smoke tests and preflight, validates the Foundry ZIP, publishes and downloads back both assets, and only then promotes the stable channel. See TEST_PROTOCOL_v1.13.0.md for post-update checks.
