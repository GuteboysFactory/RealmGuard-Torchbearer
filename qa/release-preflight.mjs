import fs from "node:fs";
import {
  assertManifestReleaseContract,
  assertNoHistoricalVersionPins,
  assertNoProfileManagementCopyPins,
  assertNoRetiredM10BBranchPins,
  readReleaseReady
} from "./lib/release-contract.mjs";
import { ProfileResolver } from "../module/core/rules-profile.mjs";
import { REALM_GUARD_LEGACY_MIXED_PROFILE } from "../module/profiles/realm-guard-legacy-mixed.mjs";
import { MG1E_FOUNDATION_PROFILE } from "../module/profiles/mg1e-foundation.mjs";
import { REALM_GUARD_STRICT_PROFILE } from "../module/profiles/realm-guard-strict.mjs";
import { buildProfileConversionPreview } from "../module/m10-profile-conversion-preview.mjs";

const manifest = JSON.parse(fs.readFileSync("system.json", "utf8"));
const readyVersion = readReleaseReady();
const release = assertManifestReleaseContract(manifest, { readyVersion });

for (const file of fs.readdirSync("qa").filter(name => name.endsWith("-smoke.mjs"))) {
  const source = fs.readFileSync(`qa/${file}`, "utf8");
  assertNoHistoricalVersionPins(source, file);
  assertNoProfileManagementCopyPins(source, file);
  assertNoRetiredM10BBranchPins(source, file);
}

const template = fs.readFileSync("templates/apps/profile-management.hbs", "utf8");
const requiredContracts = [
  "profile-management-root",
  "profile-preview-strict",
  "profile-preview-mg1e",
  "profile-switch-strict",
  "profile-switch-legacy",
  "profile-switch-reload-guidance"
];
for (const contract of requiredContracts) {
  if (!template.includes(`data-rg-contract="${contract}"`)) {
    throw new Error(`Profile Management is missing semantic UI contract marker: ${contract}`);
  }
}

const resolver = new ProfileResolver([
  MG1E_FOUNDATION_PROFILE,
  REALM_GUARD_LEGACY_MIXED_PROFILE,
  REALM_GUARD_STRICT_PROFILE
]);
const legacy = resolver.resolve("realm-guard-legacy-mixed");
const strict = resolver.resolve("realm-guard-strict");
const mg1e = resolver.resolve("mg1e");

for (const target of [strict, mg1e]) {
  const preview = buildProfileConversionPreview({ fromProfile: legacy, toProfile: target, actors: [], worldItems: [] });
  if (preview.mode !== "READ_ONLY" || preview.readOnly !== true) throw new Error(`${target.id} conversion preview is not READ_ONLY.`);
  if (preview.activationAllowed !== false) throw new Error(`${target.id} conversion preview must never activate a profile.`);
  if (preview.writesPlanned !== 0) throw new Error(`${target.id} conversion preview plans writes.`);
  for (const key of ["actorWrites", "itemWrites", "journalWrites", "settingWrites"]) {
    if (preview.safety?.[key] !== 0) throw new Error(`${target.id} conversion preview safety.${key} must be 0.`);
  }
  if (preview.safety?.destructiveConversion !== false) throw new Error(`${target.id} conversion preview must be non-destructive.`);
}

console.log(`PASS release preflight · ${release.version} · ${release.channel} · canonical version contract · semantic UI contracts · read-only previews`);
