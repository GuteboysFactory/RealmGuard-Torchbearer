# M10D.18 — TB2E Controlled Basic Test Handoff

**Candidate:** v1.13.0-qa.19  
**Baseline:** v1.13.0-qa.18  
**Foundry target:** 13.351  
**Roadmap location:** M10D.10 Controlled Live Parity, next bounded handoff after M10D.17 Wises  
**Status:** PASS — Foundry verification completed 2026-10-15; all six required cases and zero-write/reload boundaries passed.

## Purpose

Connect the existing TB2E read-only Tests/Dice shadow to the existing CORE M3 Test Engine for one deterministic, ordinary Ob Test. This verifies the source-owned route and M3 result contract without rebuilding either engine or enabling the TB2E profile.

The work reuses:
- module/m10d-tb2e-test-shadow.mjs for bounded TB2E Test coverage and pool validation.
- module/core/test-engine.mjs through the already-installed CORE M3 Test Engine service.
- The QA-only, GM-only, locked-profile boundary established for M10D.17.

## Source boundary

The supplied Torchbearer 2E Quick Rules Guide states that d6 results of 4+ are successes, dice/success modifiers are possible, and sixes open recursively (physical PDF page 2). It places normal Obstacles in the 2–5 range and points to unavailable skill descriptions for base Obstacles and factors (page 4). The Player Guide describes Tests, dice pools and Obstacle at page 5.

Therefore this handoff:
- accepts the source name, base pool, Obstacle and modifiers from the GM/tester;
- evaluates only the explicit ordinary Ob Test contract through M3;
- does not derive skill Obstacle factors, run Versus, apply Help, Beginner’s Luck, Nature, Wises, Fate, Traits, advancement or consequences;
- uses supplied deterministic d6 faces for QA. It does not generate random dice or create a chat message.

## QA handoff contract

- Runtime restricted to exactly 1.13.0-qa.19; GM-only.
- Torchbearer remains FOUNDATION_ONLY, READ_ONLY, unsupported, inactive and unavailable for activation or switching.
- The controlled route calls the existing CORE M3 Test Engine using a TB2E-owned request/provenance.
- The caller supplies all source-sensitive inputs, including Obstacle. No Legacy/MG fallback is permitted.
- Six required cases cover Obstacle PASS, Obstacle FAIL, positive dice modifier, positive success modifier and fail-closed invalid dice count/face.
- Evidence is memory-only and resets on reload.
- No random roll, ChatMessage, resource spend, Actor/Item/Journal/Setting write, activation, conversion or Character Creation commit occurs.

## Exit boundary

A pass closes only this deterministic controlled Test handoff slice. It does not prove ordinary TB2E playability, general Test live parity, any Test outcome/consequence mutations, M10D.10 completion, M10D.11 activation or M10D.12 Core Live / Stable. Follow-on domains require their own source-bounded handoff and QA.

## QA evidence

Candidate automation: qa/m10d18-tb2e-controlled-test-smoke.mjs  
Foundry protocol: [TEST_PROTOCOL_v1.13.0-qa.19.md](TEST_PROTOCOL_v1.13.0-qa.19.md)
