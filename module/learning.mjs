export function learningRequirementsForRating(rating) {
  const r = Math.max(1, Number(rating ?? 1));
  return { passNeeded: r, failNeeded: Math.max(1, r - 1) };
}

export function learningState(role) {
  const learning = role.system.learning ?? {};
  const auto = learning.autoRequirements !== false;
  const req = auto ? learningRequirementsForRating(role.system.rating) : {
    passNeeded: Math.max(0, Number(learning.passNeeded ?? 0)),
    failNeeded: Math.max(0, Number(learning.failNeeded ?? 0))
  };
  const passed = Math.max(0, Number(learning.passed ?? 0));
  const failed = Math.max(0, Number(learning.failed ?? 0));
  return {
    auto,
    passed,
    failed,
    passNeeded: req.passNeeded,
    failNeeded: req.failNeeded,
    ready: passed >= req.passNeeded && failed >= req.failNeeded,
    passPct: req.passNeeded ? Math.min(100, Math.round((passed / req.passNeeded) * 100)) : 100,
    failPct: req.failNeeded ? Math.min(100, Math.round((failed / req.failNeeded) * 100)) : 100,
    totalTests: Math.max(0, Number(learning.totalTests ?? 0)),
    lastResult: String(learning.lastResult ?? "")
  };
}

export async function syncLearningRequirements(role) {
  if (role.type !== "role" || role.system.learning?.autoRequirements === false) return;
  const req = learningRequirementsForRating(role.system.rating);
  const currentPass = Number(role.system.learning?.passNeeded ?? 0);
  const currentFail = Number(role.system.learning?.failNeeded ?? 0);
  if (currentPass === req.passNeeded && currentFail === req.failNeeded) return;
  await role.update({
    "system.learning.passNeeded": req.passNeeded,
    "system.learning.failNeeded": req.failNeeded
  }, { realmGuardLearningSync: true });
}

export async function recordLearningTest(role, { passed, versus = false, resultLabel = "", count = true } = {}) {
  if (!role || role.type !== "role" || !count) return null;
  const state = learningState(role);
  const field = passed ? "passed" : "failed";
  const next = Number(state[field] ?? 0) + 1;
  const label = resultLabel || (passed ? "PASS" : "FAIL");
  await role.update({
    [`system.learning.${field}`]: next,
    "system.learning.totalTests": state.totalTests + 1,
    "system.learning.lastResult": `${versus ? "VERSUS · " : ""}${label}`
  });
  return learningState(role);
}
