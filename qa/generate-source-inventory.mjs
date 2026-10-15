import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tb2eSourceCoverageMatrix } from "../module/m10d-tb2e-source-coverage.mjs";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "data", "source-inventory.json");
const SKIP_DIRS = new Set([".git", "node_modules", "dist"]);
const TEXT_EXTENSIONS = new Set([".mjs", ".js", ".cjs", ".json", ".md", ".hbs", ".css", ".html", ".yml", ".yaml", ".txt", ".sh"]);
const CODE_EXTENSIONS = new Set([".mjs", ".js", ".cjs"]);
function walk(directory, relative = "") {
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const rel = relative ? path.posix.join(relative, entry.name) : entry.name;
    if (rel === "data/source-inventory.json") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...walk(absolute, rel));
    else if (entry.isFile()) output.push({ path: rel, absolute, size: fs.statSync(absolute).size });
  }
  return output;
}
function lineNumber(source, offset) {
  let line = 1;
  for (let i = 0; i < offset; i += 1) if (source.charCodeAt(i) === 10) line += 1;
  return line;
}
function leadingDoc(source, offset) {
  const prior = source.slice(Math.max(0, offset - 1200), offset);
  const match = prior.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
  return match ? match[1].replace(/^\s*\* ?/gm, "").trim().slice(0, 500) : "";
}
function collect(source, pattern, make) {
  const out = [];
  for (const match of source.matchAll(pattern)) out.push(make(match, lineNumber(source, match.index ?? 0)));
  return out;
}
function symbols(source) {
  const found = [];
  const patterns = [
    ["function", /(^|\n)\s*(export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g],
    ["class", /(^|\n)\s*(export\s+)?(?:default\s+)?class\s+([A-Za-z_$][\w$]*)\b/g],
    ["method", /(^|\n)\s*(export\s+)?(?:static\s+|async\s+|get\s+|set\s+)*(#?[A-Za-z_$][\w$]*)\s*\([^()\n]*\)\s*\{/g],
    ["property-arrow", /(^|\n)\s*(export\s+)?([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?(?:function\b|(?:\([^()\n]*\)|[A-Za-z_$][\w$]*)\s*=>)/g],
    ["arrow", /(^|\n)\s*(export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\b|(?:\([^\n)]*\)|[A-Za-z_$][\w$]*)\s*=>)/g]
  ];
  for (const [kind, pattern] of patterns) for (const match of source.matchAll(pattern)) {
    if (kind === "method" && ["if", "for", "while", "switch", "catch", "with"].includes(match[3])) continue;
    const offset = (match.index ?? 0) + match[1].length;
    found.push({ name: match[3], kind, exported: Boolean(match[2]), line: lineNumber(source, offset), description: leadingDoc(source, offset) });
  }
  const seen = new Set();
  return found.filter(item => {
    const key = item.kind + ":" + item.name + ":" + item.line;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.line - b.line || a.name.localeCompare(b.name));
}
function category(file) {
  const ext = path.posix.extname(file).toLowerCase();
  if (/^(TEST_PROTOCOL|RELEASE_NOTES)_v/.test(path.posix.basename(file))) return "release-history";
  if (file.startsWith("module/profiles/")) return "rules-profile";
  if (file.startsWith("module/core/")) return "shared-core";
  if (/^module\/m10d/.test(file)) return "m10d-rules";
  if (file.startsWith("module/")) return "runtime-module";
  if (file.startsWith("sheets/")) return "sheet";
  if (file.startsWith("templates/")) return "template";
  if (file.startsWith("styles/")) return "style";
  if (file.startsWith("packs/")) return "compendium-source";
  if (file.startsWith("qa/")) return "qa-evidence-or-tooling";
  if (file.startsWith("assets/")) return "asset";
  if (file.startsWith("lang/")) return "localization";
  if (ext === ".md") return "project-document";
  if (file.startsWith(".github/")) return "build-and-release";
  return "system-file";
}
function oldQaRecord(file) {
  const match = path.posix.basename(file).match(/^(?:TEST_PROTOCOL|RELEASE_NOTES)_v(\d+\.\d+\.\d+)-qa\.(\d+)\.md$/);
  return match && (match[1] !== "1.13.0" || Number(match[2]) < 17);
}
function mjsInventory(file, source) {
  const exportedBindings = collect(source, /^\s*export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm, (m, line) => ({ name: m[1], line }));
  const exportLists = collect(source, /^\s*export\s*\{([^}]+)\}(?:\s*from\s*["']([^"']+)["'])?/gm, (m, line) => ({ names: m[1].split(",").map(value => value.trim()).filter(Boolean), from: m[2] ?? null, line }));
  const imports = collect(source, /\bimport(?:\s+[^;]*?\s+from\s*)?["']([^"']+)["']/g, (m, line) => ({ specifier: m[1], line }));
  const hookRegistrations = collect(source, /Hooks\.(on|once|call|callAll)\(\s*["']([^"']+)["']/g, (m, line) => ({ method: m[1], event: m[2], line }));
  const settingRegistrations = collect(source, /(?:game\.)?settings\.register\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g, (m, line) => ({ namespace: m[1], key: m[2], line }));
  const gmDockTools = collect(source, /registerGmDockTool\(\s*\{[^}]{0,1800}?\bid:\s*["']([^"']+)["']/gs, (m, line) => ({ id: m[1], line }));
  const sheetRegistrations = collect(source, /(?:DocumentSheetConfig\.)?registerSheet\(\s*[^,]+,\s*["']([^"']+)["']\s*,\s*([^,]+),/g, (m, line) => ({ namespace: m[1], sheet: m[2].trim(), line }));
  const apiNamespaces = [...new Set([...source.matchAll(/game\.realmGuard(?:\.core)?\.([A-Za-z_$][\w$]*)/g)].map(m => m[1]))].sort();
  const writeCalls = collect(source, /(settings\.set|\.update|\.updateEmbeddedDocuments|\.create|\.createEmbeddedDocuments|\.delete|\.deleteEmbeddedDocuments|\.setFlag|\.unsetFlag)\s*\(/g, (m, line) => ({ operation: m[1], line }));
  const readCalls = collect(source, /\.(getDocuments|getIndex|find|filter|map|toObject)\s*\(/g, (m, line) => ({ operation: m[1], line }));
  return { path: file, lines: source.split("\n").length, imports, exportedBindings, exportLists, hasDefaultExport: /\bexport\s+default\b/.test(source), symbols: symbols(source), hookRegistrations, settingRegistrations, gmDockTools, sheetRegistrations, apiNamespaces, writeCallSites: writeCalls, readCallSites: readCalls };
}
export function buildSourceInventory({ root = ROOT, version = null, commit = null } = {}) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "system.json"), "utf8"));
  const allFiles = walk(root);
  const files = allFiles.map(({ path: file, size }) => ({ path: file, category: category(file), extension: path.posix.extname(file).toLowerCase(), bytes: size }));
  files.push({ path: "data/source-inventory.json", category: "generated-source-index", extension: ".json", bytes: null });
  const codeFiles = [];
  const docs = [];
  for (const file of allFiles) {
    const ext = path.posix.extname(file.path).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext) || file.size > 2000000) continue;
    const source = fs.readFileSync(file.absolute, "utf8");
    if (CODE_EXTENSIONS.has(ext)) codeFiles.push(mjsInventory(file.path, source));
    if (ext === ".md" && !oldQaRecord(file.path)) {
      const headings = collect(source, /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/gm, (m, line) => ({ level: m[1].length, title: m[2], line }));
      docs.push({ path: file.path, category: category(file.path), headings });
    }
  }
  const allSymbols = codeFiles.flatMap(file => file.symbols);
  const hookRegistrations = codeFiles.flatMap(file => file.hookRegistrations.map(row => ({ file: file.path, ...row })));
  const settingRegistrations = codeFiles.flatMap(file => file.settingRegistrations.map(row => ({ file: file.path, ...row })));
  const gmDockTools = codeFiles.flatMap(file => file.gmDockTools.map(row => ({ file: file.path, ...row })));
  const sheetRegistrations = codeFiles.flatMap(file => file.sheetRegistrations.map(row => ({ file: file.path, ...row })));
  const qaFiles = files.filter(file => file.path.startsWith("qa/") && (file.path.endsWith("-smoke.mjs") || file.path.startsWith("qa/m10d")));
  return {
    formatVersion: 1, version: version ?? manifest.version, sourceCommit: commit ?? null,
    scope: {
      completeness: "Complete file tree with a pattern-based static index of discovered declarations and registrations.",
      includes: ["All packaged/runtime files", "All code modules and declared functions, object/class methods and classes", "Imports, Hook and setting registrations, GM Dock tools, sheet registrations, read/write call sites", "Project document headings except archived versioned QA records", "M10D source coverage matrix"],
      m10dAuthority: "M10D source/planning boundary is v1.13.0-qa.17; older QA documents are archived records and do not define the current M10D scope.",
      limitations: ["Pattern-based scanning may miss multiline, computed, anonymous or data-driven declarations and cannot infer every runtime branch or undocumented rule.", "Computed/dynamic registrations may not be discoverable by literal source scanning.", "Runtime profile registries and current world state are added by the Foundry report."]
    },
    summary: {
      fileCount: files.length, codeFileCount: codeFiles.length, symbolCount: allSymbols.length,
      exportedSymbolCount: allSymbols.filter(symbol => symbol.exported).length,
      exportedBindingCount: codeFiles.reduce((sum, file) => sum + file.exportedBindings.length + file.exportLists.reduce((n, entry) => n + entry.names.length, 0) + Number(file.hasDefaultExport), 0),
      functionCount: allSymbols.filter(symbol => ["function", "arrow", "method", "property-arrow"].includes(symbol.kind)).length,
      classCount: allSymbols.filter(symbol => symbol.kind === "class").length,
      hookRegistrationCount: hookRegistrations.length, settingRegistrationCount: settingRegistrations.length,
      gmDockToolRegistrationCount: gmDockTools.length, sheetRegistrationCount: sheetRegistrations.length,
      projectDocumentCount: docs.length, qaScriptCount: qaFiles.length
    },
    manifest: { id: manifest.id, version: manifest.version, esmodules: manifest.esmodules ?? [], styles: manifest.styles ?? [], languages: manifest.languages ?? [], documentTypes: manifest.documentTypes ?? {}, compatibility: manifest.compatibility ?? {} },
    files, codeFiles, hookRegistrations, settingRegistrations, gmDockTools, sheetRegistrations, projectDocuments: docs,
    qaEvidenceFiles: qaFiles.map(file => ({ path: file.path, category: file.category })),
    m10dSourceCoverage: tb2eSourceCoverageMatrix()
  };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, "system.json"), "utf8")).version;
  const inventory = buildSourceInventory({ version, commit: process.env.GITHUB_SHA ?? null });
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(inventory, null, 2) + "\n");
  console.log("PASS source inventory generated · " + inventory.summary.fileCount + " files · " + inventory.summary.codeFileCount + " code files · " + inventory.summary.symbolCount + " symbols · " + inventory.m10dSourceCoverage.length + " M10D domains");
}
