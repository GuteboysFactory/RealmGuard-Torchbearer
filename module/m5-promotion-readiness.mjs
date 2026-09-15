const REQUIRED_COVERAGE = Object.freeze([
  Object.freeze({ id: "inventoryAccepted", label: "Accepted Inventory write", test: event => event?.domain === "inventory" && event?.legacyAccepted === true && event?.source === "LIVE_INVENTORY_WRITE" }),
  Object.freeze({ id: "inventoryRejected", label: "Rejected Inventory decision", test: event => event?.domain === "inventory" && event?.legacyAccepted === false && event?.source === "LIVE_INVENTORY_REJECT" }),
  Object.freeze({ id: "conflictDeclaration", label: "Conflict Tool declaration", test: event => event?.domain === "conflict-tool" && event?.operation === "DECLARED_TOOL_PROVIDER" && event?.source === "LIVE_CONFLICT_DECLARATION" }),
  Object.freeze({ id: "conflictRoll", label: "Conflict Tool live roll", test: event => event?.domain === "conflict-tool" && event?.operation === "EVALUATE_TOOL" && event?.source === "LIVE_CONFLICT_ROLL" }),
  Object.freeze({ id: "conflictDisable", label: "Conflict Tool disable / Disarm", test: event => event?.domain === "conflict-tool" && event?.operation === "DISABLE_STATE" && event?.source === "LIVE_CONFLICT_DISABLE" })
]);

function frozenCoverage(events = []) {
  return Object.freeze(Object.fromEntries(REQUIRED_COVERAGE.map(requirement => {
    const matches = events.filter(requirement.test);
    return [requirement.id, Object.freeze({
      label: requirement.label,
      observed: matches.length > 0,
      count: matches.length,
      mismatches: matches.filter(event => event?.parity === "MISMATCH").length
    })];
  })));
}

export function evaluateM5PromotionReadiness(report = null) {
  const events = Array.isArray(report?.events) ? report.events : [];
  const summary = report?.summary ?? {};
  const coverage = frozenCoverage(events);
  const missing = Object.entries(coverage).filter(([, row]) => !row.observed).map(([id]) => id);
  const coverageMismatches = Object.entries(coverage).filter(([, row]) => row.mismatches > 0).map(([id]) => id);
  const totalMismatches = Number(summary?.mismatches ?? events.filter(event => event?.parity === "MISMATCH").length);
  const shadowSafe = report?.liveApplication === false && report?.authority === "LEGACY_MIXED";
  const ready = shadowSafe && totalMismatches === 0 && missing.length === 0 && coverageMismatches.length === 0;

  let status = "PARTIAL";
  if (!shadowSafe) status = "UNSAFE_STATE";
  else if (totalMismatches > 0 || coverageMismatches.length) status = "BLOCKED_MISMATCH";
  else if (ready) status = "READY_FOR_CONTROLLED_HANDOFF";

  return Object.freeze({
    phase: "M5",
    status,
    ready,
    authority: String(report?.authority ?? ""),
    liveApplication: Boolean(report?.liveApplication),
    totalObservations: Number(summary?.total ?? events.length),
    totalMismatches,
    coverage,
    missing: Object.freeze(missing),
    mismatchCoverage: Object.freeze(coverageMismatches),
    nextStep: ready
      ? "A bounded M5 live handoff may be considered in a later QA build; no takeover is performed by this gate."
      : totalMismatches > 0
        ? "Resolve all M5 parity mismatches before any live handoff."
        : "Exercise every required live path in one QA session, then re-run readiness()."
  });
}

export const M5_PROMOTION_REQUIREMENTS = Object.freeze(REQUIRED_COVERAGE.map(({ id, label }) => Object.freeze({ id, label })));
