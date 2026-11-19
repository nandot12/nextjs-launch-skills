#!/usr/bin/env node
/**
 * Next.js Launch Skills Lite — installer. Copies the skills into the folder your AI coding tool reads.
 * Zero dependencies, Node 18+, works on macOS, Linux and Windows.
 *
 *   node install.mjs --tool claude                 # Claude Code (and Cursor, which also reads .claude/skills)
 *   node install.mjs --tool codex                  # OpenAI Codex (and Cursor, which also reads .agents/skills)
 *   node install.mjs --tool cursor                 # Cursor only (.cursor/skills)
 *   node install.mjs --tool claude,codex           # several tools
 *
 * Options:
 *   --project <dir>   project to install into (default: current folder)
 *   --global          install for your user account instead of one project (~/.claude/skills, ~/.agents/skills, ~/.cursor/skills)
 *   --only a,b        install only some skills (names without or with the "launch-" prefix)
 *   --force           overwrite skills that are already installed
 *   --dry-run         show what would be copied
 *   --list            list the skills in this pack
 *   --uninstall       remove this pack's skills from the target folder(s)
 */
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillsDir = join(here, "skills");
const argv = process.argv.slice(2);
const opt = (n) => {
  const i = argv.indexOf(n);
  return i === -1 ? undefined : argv[i + 1];
};
const flag = (n) => argv.includes(n);

const TARGETS = {
  claude: { project: [".claude", "skills"], global: [".claude", "skills"], label: "Claude Code" },
  codex: { project: [".agents", "skills"], global: [".agents", "skills"], label: "OpenAI Codex" },
  cursor: { project: [".cursor", "skills"], global: [".cursor", "skills"], label: "Cursor" },
};

function readSkill(name) {
  const file = join(skillsDir, name, "SKILL.md");
  const text = readFileSync(file, "utf8");
  const description = text.match(/^description:\s*(.+)$/m)?.[1] ?? "";
  return { name, description };
}

if (!existsSync(skillsDir)) {
  console.error("install: the skills/ folder is missing next to install.mjs. Unzip the whole pack and try again.");
  process.exit(1);
}
const available = readdirSync(skillsDir).filter((d) => existsSync(join(skillsDir, d, "SKILL.md"))).sort();

if (flag("--list")) {
  for (const name of available) {
    const { description } = readSkill(name);
    console.log(`${name.padEnd(26)} ${description.split(". ")[0].slice(0, 110)}`);
  }
  process.exit(0);
}

if (flag("--help") || flag("-h") || !opt("--tool")) {
  console.log(`Next.js Launch Skills Lite installer (${available.length} skills)

Usage:
  node install.mjs --tool claude            Claude Code  → .claude/skills/
  node install.mjs --tool codex             OpenAI Codex → .agents/skills/
  node install.mjs --tool cursor            Cursor       → .cursor/skills/
  node install.mjs --tool claude,codex      several tools

Options: --project <dir>  --global  --only a,b  --force  --dry-run  --list  --uninstall

Tip: Cursor also reads .claude/skills and .agents/skills. If you use Cursor together with
Claude Code or Codex, install for that tool only, so Cursor doesn't list each skill twice.`);
  process.exit(opt("--tool") ? 0 : 1);
}

const tools = opt("--tool").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
for (const t of tools) {
  if (!TARGETS[t]) {
    console.error(`install: unknown tool "${t}". Use claude, codex or cursor.`);
    process.exit(1);
  }
}

const isGlobal = flag("--global");
const projectDir = resolve(opt("--project") ?? process.cwd());
if (!isGlobal) {
  if (resolve(projectDir) === resolve(here)) {
    console.error("install: run this from your project folder, or pass --project <path-to-your-project>.");
    process.exit(1);
  }
  if (!existsSync(join(projectDir, "package.json"))) {
    console.warn(`install: warning — no package.json in ${projectDir}. Is this your project folder?`);
  }
}

let selected = available;
const only = opt("--only");
if (only) {
  const wanted = only.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (s.startsWith("launch-") ? s : `launch-${s}`));
  const unknown = wanted.filter((w) => !available.includes(w));
  if (unknown.length) {
    console.error(`install: unknown skill(s): ${unknown.join(", ")}. Run with --list to see names.`);
    process.exit(1);
  }
  selected = wanted;
}

const dryRun = flag("--dry-run");
const force = flag("--force");
const uninstall = flag("--uninstall");

if (tools.includes("cursor") && (tools.includes("claude") || tools.includes("codex"))) {
  console.warn("install: note — Cursor also reads .claude/skills and .agents/skills, so it may show these skills twice.");
}

let copied = 0;
let skipped = 0;
for (const tool of tools) {
  const t = TARGETS[tool];
  const base = isGlobal ? join(homedir(), ...t.global) : join(projectDir, ...t.project);
  console.log(`\n${t.label}: ${base}`);
  for (const name of selected) {
    const dest = join(base, name);
    if (uninstall) {
      if (existsSync(dest)) {
        if (!dryRun) rmSync(dest, { recursive: true, force: true });
        console.log(`  removed  ${name}`);
      }
      continue;
    }
    if (existsSync(dest) && !force) {
      console.log(`  skipped  ${name} (already installed; use --force to update)`);
      skipped++;
      continue;
    }
    if (!dryRun) {
      if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
      cpSync(join(skillsDir, name), dest, { recursive: true });
    }
    console.log(`  ${dryRun ? "would copy" : "installed"} ${name}`);
    copied++;
  }
}

if (uninstall) process.exit(0);
console.log(`\nDone: ${copied} installed${skipped ? `, ${skipped} skipped` : ""}${dryRun ? " (dry run, nothing written)" : ""}.`);
if (!dryRun && copied) {
  console.log(`
Next steps
  1. Restart your coding tool (or start a new session) so it picks up the new skills.
  2. Ask in plain language, for example:
       "Is my site ready to launch?"               → launch-checklist
       "Add dark mode with a theme toggle"         → launch-dark-mode
       "Create an OG image and favicons"           → launch-social-images
  3. Or invoke one directly: /launch-checklist (Claude Code, Cursor) or $launch-checklist (Codex).`);
}
