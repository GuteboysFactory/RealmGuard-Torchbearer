import fs from "node:fs";

export const SYSTEM_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:\.\d+)*(?:-(?:alpha|beta|rc|qa)\.\d+)?$/;
export const QA_VERSION_PATTERN = /-qa\.\d+$/;

export function assertSupportedSystemVersion(version, label = "system version") {
  const value = String(version ?? "").trim();
  if (!SYSTEM_VERSION_PATTERN.test(value)) {
    throw new Error(`${label} '${value}' does not match the canonical Realm Guard release format.`);
  }
  return value;
}

export function releaseChannelForVersion(version) {
  const value = assertSupportedSystemVersion(version);
  return value.includes("-") ? "qa" : "stable";
}

export function expectedManifestUrl(version) {
  const channel = releaseChannelForVersion(version);
  return `https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels/${channel}/system.json`;
}

export function expectedDownloadUrl(version) {
  const value = assertSupportedSystemVersion(version);
  return `https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download/${value}/realm-guard.zip`;
}

export function readReleaseReady(path = "release/READY") {
  const raw = fs.readFileSync(path, "utf8");
  const version = raw.split(/\r?\n/).map(line => line.trim()).find(line => line && !line.startsWith("#")) ?? "";
  return assertSupportedSystemVersion(version, "release/READY version");
}

export function assertManifestReleaseContract(manifest, { readyVersion = null } = {}) {
  if (!manifest || typeof manifest !== "object") throw new Error("Manifest is missing.");
  const version = assertSupportedSystemVersion(manifest.version, "manifest version");
  if (manifest.manifest !== expectedManifestUrl(version)) {
    throw new Error(`Manifest channel URL mismatch for ${version}: ${manifest.manifest}`);
  }
  if (manifest.download !== expectedDownloadUrl(version)) {
    throw new Error(`Manifest download URL mismatch for ${version}: ${manifest.download}`);
  }
  if (readyVersion != null && version !== readyVersion) {
    throw new Error(`release/READY (${readyVersion}) does not match system.json (${version}).`);
  }
  return Object.freeze({ version, channel: releaseChannelForVersion(version) });
}

export function assertNoHistoricalVersionPins(source, file = "unknown") {
  const exactLiteral = /manifest\.version[\s\S]{0,160}(?:===|==|equal\s*\()[\s\S]{0,80}["'`]\d+\.\d+\.\d+(?:-qa\.\d+)?["'`]/;
  const exactQaRegex = /manifest\.version[^\n]{0,180}-qa\\\.\d+(?!\+|\\d)/;
  const closedMinor = source.split(/\r?\n/).some(line => {
    if (!line.includes("manifest.version")) return false;
    if (!line.includes("/^")) return false;
    const genericMajor = /\\d\+/.test(line);
    const closedList = /\(\?:[^)]*(?:\||\[\d)[^)]*\)/.test(line) || /1\[(?:0-9|01|12|23)\]/.test(line);
    const exactMinor = /\\\.\d+(?:\\\.|\$|\?)/.test(line) && !/\\\.\\d\+/.test(line);
    return !genericMajor && (closedList || exactMinor);
  });
  if (exactLiteral.test(source)) throw new Error(`${file} pins manifest.version to an exact release.`);
  if (exactQaRegex.test(source)) throw new Error(`${file} pins manifest.version to one exact QA number.`);
  if (closedMinor) throw new Error(`${file} pins manifest.version to a closed 1.x minor-version set.`);
}

export function assertNoProfileManagementCopyPins(source, file = "unknown") {
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/(?:profileTemplate|menuTemplate|profileMenu)\.includes\(/.test(line)) continue;
    const match = line.match(/\.includes\((["'`])(.+?)\1\)/);
    if (!match) continue;
    const literal = match[2];
    const semantic = /data-(?:action|rg-contract)=/.test(literal) || /templates\/apps\/profile-management\.hbs/.test(literal);
    if (!semantic && /\s/.test(literal)) {
      throw new Error(`${file}:${i + 1} asserts human-facing Profile Management copy instead of a semantic contract marker.`);
    }
  }
}
