import { resolveM10BCharacterCreationPolicy } from "./m10b-character-creation.mjs";
import { profileRulesReferenceSnapshot } from "./m10b-rules-reference.mjs";
import { profileActivationAvailable, profileActivationStatus } from "./m10-profile-activation.mjs";
import { getM10C3Mg2eShadowStatus } from "./m10c-mg2e-shadow-adapters.mjs";
import { mg2eLiveParityFoundationStatus } from "./m10c-mg2e-live-parity.mjs";
import { resolveRulesProfile } from "./rules-profile-service.mjs";

const PROFILE_ID = "mg2e";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

function blocker(id, state, evidence, nextAction) {
  return freeze({
    id,
    state,
    closed: state === "CLOSED",
    evidence,
    nextAction
  });
}

export function mg2eActivationReadinessAudit() {
  const { profile } = resolveRulesProfile(PROFILE_ID);
  const shadow = getM10C3Mg2eShadowStatus();
  const creation = resolveM10BCharacterCreationPolicy(PROFILE_ID);
  const reference = profileRulesReferenceSnapshot(PROFILE_ID);
  const activation = profileActivationStatus();
  const parityFoundation = mg2eLiveParityFoundationStatus();

  const activationSurfaceRegistered = (activation.profiles ?? []).some(row => row.id === PROFILE_ID);
  const referenceProfileOwned = reference.mode !== "LEGACY_MIXED_REFERENCE_OWNED_EXTERNALLY";
  const referenceHasPages = Array.isArray(reference.pages) && reference.pages.length > 0;
  const referenceZeroWrite = reference.writesJournal === false
    && reference.writesActors === false
    && reference.writesItems === false
    && reference.writesWorldSettings === false;

  const recruitmentReady = creation.creationProfileAvailable === true
    && creation.readyWhenActive === true
    && ["CORE_M9", "CORE_M9_WHEN_ACTIVE"].includes(String(creation.liveAuthority ?? "").toUpperCase());

  const shadowReady = shadow?.activationReadiness?.shadowAdaptersReady === true
    && shadow?.liveApplication === false
    && Object.values(shadow?.writes ?? {}).every(value => Number(value) === 0);

  const blockers = [
    blocker(
      "FULL_RECRUITMENT_COMMIT_ADAPTER",
      recruitmentReady ? "CLOSED" : "OPEN",
      {
        creationProfileAvailable: creation.creationProfileAvailable === true,
        creationProfileId: creation.creationProfileId,
        creationProfileVersion: creation.creationProfileVersion,
        readyWhenActive: creation.readyWhenActive === true,
        liveAuthority: creation.liveAuthority,
        liveCommit: creation.liveCommit === true,
        coreEngine: creation.coreEngine,
        actorWritesOnResolve: creation.writes?.actorsOnResolve ?? 0,
        itemWritesOnResolve: creation.writes?.itemsOnResolve ?? 0,
        relationshipWritesOnResolve: creation.writes?.relationshipsOnResolve ?? 0
      },
      recruitmentReady
        ? "No implementation action required; keep live commit gated by active profile authority."
        : "Add a source-owned MG2E CharacterCreationProfile and CORE M9 transactional commit adapter that is READY_WHEN_ACTIVE while MG2E activation remains off."
    ),
    blocker(
      "DEDICATED_LIVE_RULES_REFERENCE",
      referenceProfileOwned && referenceHasPages && referenceZeroWrite ? "CLOSED" : "OPEN",
      {
        mode: reference.mode,
        profileId: reference.profileId,
        pageCount: Array.isArray(reference.pages) ? reference.pages.length : 0,
        liveAuthority: reference.liveAuthority === true,
        zeroWrite: referenceZeroWrite
      },
      referenceProfileOwned && referenceHasPages
        ? "No implementation action required; keep reference presentation-only."
        : "Extend the generic Rules Reference router with MG2E-specific pages/bullets and Natural Order ownership without writing Journals or campaign data."
    ),
    blocker(
      "LIVE_PARITY_QA",
      parityFoundation.foundationReady ? "FOUNDATION_READY_NOT_RUN" : "BLOCKED_FOUNDATION_INCOMPLETE",
      {
        shadowAdaptersReady: shadowReady,
        foundationReady: parityFoundation.foundationReady === true,
        readyDomainCount: parityFoundation.readyDomainCount,
        domainCount: parityFoundation.domainCount,
        handoffRequired: [...(parityFoundation.handoffRequired ?? [])],
        liveParityVerified: parityFoundation.liveParityVerified === true,
        liveApplication: shadow.liveApplication === true,
        activationAvailable: profileActivationAvailable(PROFILE_ID),
        reason: parityFoundation.foundationReady
          ? "The zero-write MG2E live-parity candidate matrix is complete. Controlled Foundry execution has not run yet."
          : "The MG2E live-parity candidate matrix still contains foundation mismatches."
      },
      parityFoundation.foundationReady
        ? "Run M10C.7 controlled live parity against the registered candidate handoffs while keeping profile activation locked."
        : "Close the M10C.6 parity-foundation mismatches before any controlled live handoff execution."
    ),
    blocker(
      "EXPLICIT_ACTIVATION_MILESTONE",
      "DEFERRED",
      {
        foundationOnly: profile.metadata?.foundationOnly === true,
        selectable: profile.metadata?.selectable !== false,
        supported: profile.metadata?.supported !== false,
        activationState: profile.metadata?.activationState ?? "",
        activationSurfaceRegistered,
        activationAvailable: profileActivationAvailable(PROFILE_ID),
        genericActivationRouterPresent: String(activation.mode ?? "") === "GENERIC_PROFILE_QA_ACTIVATION_GATE"
      },
      activationSurfaceRegistered
        ? "Activation surface is registered and locked. Keep MG2E foundation-only until live parity passes and an explicit activation milestone authorizes metadata changes."
        : "Register MG2E in generic activation status/Profile Management without enabling activation; activation remains a separate explicit QA milestone."
    )
  ];

  const openBlockers = blockers.filter(row => !row.closed).map(row => row.id);
  const technicalBlockers = blockers
    .filter(row => ["FULL_RECRUITMENT_COMMIT_ADAPTER", "DEDICATED_LIVE_RULES_REFERENCE"].includes(row.id) && !row.closed)
    .map(row => row.id);

  return freeze({
    phase: "M10C.4",
    mode: "MG2E_ACTIVATION_READINESS_CLOSURE_AUDIT",
    profileId: profile.id,
    profileVersion: profile.version,
    auditComplete: true,
    activationReady: blockers.every(row => row.closed),
    technicalReadinessComplete: technicalBlockers.length === 0,
    shadowReadinessVerified: shadowReady,
    sourceDomainComplete: String(profile.metadata?.sourceAuditStatus ?? "").includes("DOMAIN_COMPLETE"),
    independentSourceProfile: profile.lineage?.length === 1 && profile.lineage?.[0]?.id === PROFILE_ID,
    activationGateClosed: true,
    activationAvailable: profileActivationAvailable(PROFILE_ID),
    activationSurfaceRegistered,
    existingActorMigrationRequired: false,
    destructiveConversionRequired: false,
    blockers,
    openBlockers,
    technicalBlockers,
    writes: {
      actors: 0,
      items: 0,
      journals: 0,
      settings: 0
    },
    decision: technicalBlockers.length
      ? "NOT_READY_TECHNICAL_IMPLEMENTATION_REQUIRED"
      : parityFoundation.foundationReady
        ? "NOT_READY_CONTROLLED_LIVE_PARITY_AND_EXPLICIT_ACTIVATION_REMAIN"
        : "NOT_READY_LIVE_PARITY_FOUNDATION_INCOMPLETE",
    nextStep: technicalBlockers.length
      ? "M10C.5 MG2E Technical Live-Readiness Closure — Recruitment + Rules Reference + Activation Surface"
      : parityFoundation.foundationReady
        ? "M10C.7 MG2E Controlled Live Parity Execution"
        : "M10C.6 MG2E Live Parity QA Foundation"
  });
}

export function getM10C4Mg2eReadinessAuditStatus() {
  return mg2eActivationReadinessAudit();
}
