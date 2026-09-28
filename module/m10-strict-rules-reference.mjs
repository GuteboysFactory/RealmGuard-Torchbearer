import {
  openProfileRulesReference,
  profileRulesReferenceHtml,
  profileRulesReferenceSnapshot
} from "./m10b-rules-reference.mjs";

const PROFILE_ID = "realm-guard-strict";

export function strictRulesReferenceSnapshot() {
  const snapshot = profileRulesReferenceSnapshot(PROFILE_ID);
  return Object.freeze({
    ...snapshot,
    phase:"M10B.8_COMPAT_WRAPPER",
    mode:snapshot.liveAuthority ? "STRICT_ACTIVE_REFERENCE" : "STRICT_READ_ONLY_REFERENCE",
    compatibilityProvider:"M10B.8_GENERIC_PROFILE_RULES_REFERENCE"
  });
}

export function strictRulesReferenceHtml() {
  return profileRulesReferenceHtml(PROFILE_ID);
}

export async function openStrictRulesReferencePreview() {
  return openProfileRulesReference(PROFILE_ID);
}
