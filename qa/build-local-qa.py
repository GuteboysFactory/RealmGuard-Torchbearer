"""Build and independently verify an offline QA artifact; never publish."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import zipfile

root = Path(__file__).resolve().parent.parent
version = sys.argv[1] if len(sys.argv) > 1 else "1.14.0-qa.4"
import re
if not re.fullmatch(r"\d+\.\d+\.\d+-qa\.\d+", version):
    raise SystemExit("An explicit QA version is required")
out = root / "output" / "qa-builds" / version
out.mkdir(parents=True, exist_ok=True)
package = out / f"realm-guard-{version}.zip"
if package.exists():
    raise SystemExit(f"Artifact exists; refusing to overwrite: {package}")

manifest = json.loads((root / "system.json").read_text(encoding="utf-8"))
source_version = manifest["version"]
manifest["version"] = version
manifest["manifest"] = "https://raw.githubusercontent.com/GuteboysFactory/RealmGuard-Torchbearer/main/channels/qa/system.json"
manifest["download"] = f"https://github.com/GuteboysFactory/RealmGuard-Torchbearer/releases/download/{version}/realm-guard.zip"
manifest_bytes = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")

excluded_dirs = {".git", ".github", ".agents", ".codex", "node_modules", "output", "dist", "release", "channels", "__pycache__"}
expected = {}
for directory, dirs, filenames in os.walk(root):
    dirs[:] = sorted(d for d in dirs if d not in excluded_dirs)
    for name in sorted(filenames):
        path = Path(directory) / name
        rel = path.relative_to(root).as_posix()
        if name.endswith((".zip", ".pyc")) or name == ".gitignore":
            continue
        expected[rel] = manifest_bytes if rel == "system.json" else path.read_bytes()

required = ["system.json", "realm-guard.mjs", "LEGACY_PLAYTEST_FOLLOWUP_REVIEW.md", f"RELEASE_NOTES_v{version}.md", f"TEST_PROTOCOL_v{version}.md"]
required += manifest.get("esmodules", []) + manifest.get("styles", [])
required += ["module/legacy-item-drop.mjs", "module/legacy-npc-obstacle.mjs", "module/legacy-talent-catalog.mjs", "LEGACY_TALENT_SOURCE_REVIEW.md"]
required += ["module/legacy-talent-library.mjs", "module/legacy-conflict-setup-view.mjs", "module/legacy-chat-follow.mjs", "qa/legacy-talent-approved-names.json"]
required += ["module/legacy-trait-catalog.mjs", "module/legacy-traits-library.mjs", "module/legacy-free-roll.mjs", "module/legacy-token-hud.mjs", "LEGACY_CLEANUP_IMPLEMENTATION_REVIEW.md"]
required += [entry["path"] for entry in manifest.get("languages", [])]
required += [f"assets/ui/map-icons/{name}.svg" for name in ("village", "city", "ruin", "cave", "grave", "cairn", "castle", "tower", "camp", "bridge", "mine", "temple", "forest", "mountain", "harbour", "item")]
for name in required:
    if name not in expected:
        raise SystemExit(f"Missing required package file: {name}")

with zipfile.ZipFile(package, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for name in sorted(expected):
        z.writestr(name, expected[name])

# Reopen the actual artifact and compare every uncompressed byte to its source.
with zipfile.ZipFile(package) as z:
    if z.testzip() is not None:
        raise SystemExit("ZIP integrity failure")
    names = z.namelist()
    assert len(names) == len(set(names)) == len(expected)
    assert set(names) == set(expected)
    for name in names:
        assert not name.startswith(("/", "\\")) and ".." not in Path(name).parts
        assert not any(part in excluded_dirs for part in Path(name).parts)
        assert z.read(name) == expected[name], f"Byte mismatch: {name}"
    packed_manifest = json.loads(z.read("system.json"))
    assert packed_manifest["id"] == "realm-guard"
    assert packed_manifest["version"] == version
    assert packed_manifest["compatibility"]["verified"] == "13.351"

(out / "system.json").write_bytes(manifest_bytes)
digest = hashlib.sha256(package.read_bytes()).hexdigest()
(out / "SHA256SUMS.txt").write_text(f"{digest}  {package.name}\n", encoding="utf-8")
metadata = {
    "version": version, "sourceVersion": source_version,
    "baseCommit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip(),
    "sourceBranch": subprocess.check_output(["git", "branch", "--show-current"], cwd=root, text=True).strip(),
    "sourceContainsUncommittedDevelopment": True,
    "published": False, "onlineManifestAvailable": False,
    "package": package.name, "bytes": package.stat().st_size,
    "verifiedFiles": len(expected), "sha256": digest,
    "verification": "CRC and byte-for-byte comparison for every ZIP member; required manifest assets checked",
    "files": {name: hashlib.sha256(data).hexdigest() for name, data in sorted(expected.items())},
}
(out / "verification.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(out / "INSTALLERA-QA.txt").write_text(
    f"Realm Guard / Torchbearer {version} – lokalt QA-paket\n\n"
    "Installera manuellt i separat Foundry-testmiljö. Stäng Foundry, ersätt testmiljöns\n"
    "Data/systems/realm-guard med ZIP-innehållet och starta om. system.json ska ligga\n"
    "direkt i realm-guard-katalogen. Kontrollera versionen och Legacy Mixed-profilen.\n\n"
    "Ingen release eller onlineinstallation är publicerad. Den medföljande system.json\n"
    "är paketmetadata, inte en fungerande installationslänk. Stable- och QA-kanalerna\n"
    "på GitHub har inte ändrats. Se testprotokollet i paketet för acceptanstest.\n",
    encoding="utf-8",
)
print(json.dumps({key: value for key, value in metadata.items() if key != "files"}, ensure_ascii=False, indent=2))
