export const M6_ACTION_INTERACTION = Object.freeze({
  attack: Object.freeze({ attack: "independent", defend: "versus", feint: "independent", maneuver: "versus" }),
  defend: Object.freeze({ attack: "versus", defend: "independent", feint: "trumped", maneuver: "versus" }),
  feint: Object.freeze({ attack: "trumped", defend: "independent", feint: "versus", maneuver: "independent" }),
  maneuver: Object.freeze({ attack: "versus", defend: "versus", feint: "independent", maneuver: "independent" })
});

function num(value) { return Number(value ?? 0); }
function clamp0(value) { return Math.max(0, num(value)); }

export function m6InteractionMode(ownAction, opponentAction, { ownMissile = false, opponentMissile = false } = {}) {
  if (ownAction === "attack" && opponentAction === "attack" && (ownMissile || opponentMissile)) return "versus";
  return M6_ACTION_INTERACTION?.[ownAction]?.[opponentAction] ?? "independent";
}

export function m6IndependentObstacle(action, opponentAction) {
  if (action === "defend" && opponentAction === "defend") return 3;
  return 0;
}

export function m6RawSuccesses(roll) {
  return Math.max(0, num(roll?.successes) - Math.max(0, num(roll?.successPenalty)));
}

export function m6PositiveSuccessBonus(roll) {
  return Math.max(0, num(roll?.conditionalSuccess)) + (roll?.traitSuccessLevel3 ? 1 : 0);
}

export function m6EffectiveSuccesses(roll, threshold) {
  const raw = m6RawSuccesses(roll);
  return raw >= num(threshold) ? raw + m6PositiveSuccessBonus(roll) : raw;
}

function resolveIndependent(action, opponentAction, mode, roll) {
  if (mode === "trumped") return Object.freeze({ passed: false, margin: 0, failureMargin: 0, effectiveSuccesses: 0, obstacle: null, trumped: true });
  const obstacle = m6IndependentObstacle(action, opponentAction);
  const effectiveSuccesses = m6EffectiveSuccesses(roll, obstacle);
  const passed = effectiveSuccesses >= obstacle;
  return Object.freeze({
    passed,
    margin: passed ? Math.max(0, effectiveSuccesses - obstacle) : 0,
    failureMargin: passed ? 0 : Math.max(1, obstacle - effectiveSuccesses),
    effectiveSuccesses,
    obstacle,
    trumped: false
  });
}

export function resolveM6ConflictPair({ gmAction, rangerAction, gmMode, rangerMode, gmRoll, rangerRoll, tieResolution = null } = {}) {
  const versus = gmMode === "versus" || rangerMode === "versus";
  if (!versus) {
    return Object.freeze({
      kind: "INDEPENDENT",
      tiePending: false,
      gm: resolveIndependent(gmAction, rangerAction, gmMode, gmRoll),
      ranger: resolveIndependent(rangerAction, gmAction, rangerMode, rangerRoll)
    });
  }

  const gmBaseRaw = m6RawSuccesses(gmRoll);
  const rangerBaseRaw = m6RawSuccesses(rangerRoll);
  const gmEffective = gmBaseRaw + (gmBaseRaw >= rangerBaseRaw ? m6PositiveSuccessBonus(gmRoll) : 0);
  const rangerEffective = rangerBaseRaw + (rangerBaseRaw >= gmBaseRaw ? m6PositiveSuccessBonus(rangerRoll) : 0);

  if (gmEffective === rangerEffective && gmMode === "versus" && rangerMode === "versus") {
    if (tieResolution?.resolved) {
      const rangerPassed = Boolean(tieResolution.rangerPassed ?? tieResolution.passed);
      const gmPassed = !rangerPassed;
      const margin = Math.max(0, num(tieResolution.margin));
      return Object.freeze({
        kind: "VERSUS",
        tiePending: false,
        tieResolved: true,
        gm: Object.freeze({ passed: gmPassed, margin: gmPassed ? margin : 0, failureMargin: gmPassed ? 0 : margin, effectiveSuccesses: gmEffective, obstacle: null, trumped: false }),
        ranger: Object.freeze({ passed: rangerPassed, margin: rangerPassed ? margin : 0, failureMargin: rangerPassed ? 0 : margin, effectiveSuccesses: rangerEffective, obstacle: null, trumped: false })
      });
    }
    return Object.freeze({
      kind: "VERSUS",
      tiePending: true,
      tieResolved: false,
      gm: Object.freeze({ passed: false, margin: 0, failureMargin: 0, effectiveSuccesses: gmEffective, obstacle: null, trumped: false }),
      ranger: Object.freeze({ passed: false, margin: 0, failureMargin: 0, effectiveSuccesses: rangerEffective, obstacle: null, trumped: false })
    });
  }

  const gmPassed = gmMode !== "trumped" && gmEffective > rangerEffective;
  const rangerPassed = rangerMode !== "trumped" && rangerEffective > gmEffective;
  return Object.freeze({
    kind: "VERSUS",
    tiePending: false,
    gm: Object.freeze({
      passed: gmPassed,
      margin: gmPassed ? Math.max(0, gmEffective - rangerEffective) : 0,
      failureMargin: gmPassed ? 0 : Math.max(0, rangerEffective - gmEffective),
      effectiveSuccesses: gmEffective,
      obstacle: null,
      trumped: gmMode === "trumped"
    }),
    ranger: Object.freeze({
      passed: rangerPassed,
      margin: rangerPassed ? Math.max(0, rangerEffective - gmEffective) : 0,
      failureMargin: rangerPassed ? 0 : Math.max(0, gmEffective - rangerEffective),
      effectiveSuccesses: rangerEffective,
      obstacle: null,
      trumped: rangerMode === "trumped"
    })
  });
}

function capDisposition(value, start) {
  return Math.max(0, Math.min(Math.max(0, num(start)), num(value)));
}

function applyActionDisposition({ side, action, mode, result, roll, dispositions }) {
  if (mode === "trumped" || !result?.passed) return;
  const ownKey = side;
  const oppKey = side === "gm" ? "ranger" : "gm";
  if (["attack", "feint"].includes(action)) {
    const damage = mode === "independent" ? Math.max(0, num(result?.effectiveSuccesses ?? roll?.effectiveSuccesses)) : Math.max(0, num(result?.margin));
    dispositions[oppKey].current = Math.max(0, num(dispositions[oppKey].current) - damage);
  } else if (action === "defend") {
    dispositions[ownKey].current = capDisposition(num(dispositions[ownKey].current) + Math.max(0, num(result?.margin)), dispositions[ownKey].start);
  }
}

export function previewM6ConflictResolution({
  gmAction,
  rangerAction,
  gmMode,
  rangerMode,
  gmRoll,
  rangerRoll,
  tieResolution = null,
  gmDisposition,
  rangerDisposition
} = {}) {
  const pair = resolveM6ConflictPair({ gmAction, rangerAction, gmMode, rangerMode, gmRoll, rangerRoll, tieResolution });
  const dispositions = {
    gm: { start: clamp0(gmDisposition?.start), current: clamp0(gmDisposition?.current) },
    ranger: { start: clamp0(rangerDisposition?.start), current: clamp0(rangerDisposition?.current) }
  };
  if (!pair.tiePending) {
    applyActionDisposition({ side: "gm", action: gmAction, mode: gmMode, result: pair.gm, roll: gmRoll, dispositions });
    applyActionDisposition({ side: "ranger", action: rangerAction, mode: rangerMode, result: pair.ranger, roll: rangerRoll, dispositions });
  }
  const maneuvers = [];
  if (!pair.tiePending && gmAction === "maneuver" && gmMode !== "trumped" && pair.gm.passed && pair.gm.margin > 0) maneuvers.push(Object.freeze({ side: "gm", margin: pair.gm.margin }));
  if (!pair.tiePending && rangerAction === "maneuver" && rangerMode !== "trumped" && pair.ranger.passed && pair.ranger.margin > 0) maneuvers.push(Object.freeze({ side: "ranger", margin: pair.ranger.margin }));
  return Object.freeze({
    pair,
    disposition: Object.freeze({ gm: Object.freeze(dispositions.gm), ranger: Object.freeze(dispositions.ranger) }),
    maneuverQueue: Object.freeze(maneuvers)
  });
}
