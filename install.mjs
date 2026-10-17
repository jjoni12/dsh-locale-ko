// Install (or remove with --uninstall) the Korean language pack into a DSH profile directory.
// Usage: node install.mjs [profileDir] [--uninstall]
// Without profileDir, the first existing profile among PROFILE_CANDIDATES is used.
import { readFileSync, writeFileSync, cpSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const NAME = "dsh-plugin-locale-ko";
const DSH_HOME = process.env.DSH_HOME || join(homedir(), ".dsh");
const PROFILE_CANDIDATES = [
	// Official DeepSeek Harness desktop app (0.2+).
	join(DSH_HOME, "profiles", "desktop"),
	// `dsh web` from the command line.
	join(DSH_HOME, "profiles", "web"),
	// Community "DSH Desktop" from the Microsoft Store (0.1.x).
	join(
		process.env.LOCALAPPDATA ?? "",
		"Packages",
		"53660AlanM.DSHDesktopCommunity_909n0052ampem",
		"LocalCache",
		"Roaming",
		"com.yeagoo.dsh-desktop",
		"harness",
		"profiles",
		"web"
	)
];
const here = dirname(fileURLToPath(import.meta.url));
const uninstall = process.argv.includes("--uninstall");
const explicit = process.argv.slice(2).find((a) => !a.startsWith("--"));
const profile = explicit ?? PROFILE_CANDIDATES.find((dir) => existsSync(join(dir, "package.json")));
if (!profile || !existsSync(join(profile, "package.json"))) {
	console.error(
		`DSH profile not found: ${profile ?? PROFILE_CANDIDATES.join(", ")}\n` +
			"Run DeepSeek Harness once first, or pass the profile directory explicitly."
	);
	process.exit(1);
}

const pkgPath = join(profile, "package.json");
const patchPath = join(profile, "cordis.patch.yml");
const BEGIN = "# >>> dsh-plugin-locale-ko";
const END = "# <<< dsh-plugin-locale-ko";
let patch = existsSync(patchPath) ? readFileSync(patchPath, "utf8") : "[]\n";

// Our block is appended as a YAML block-sequence item, which only parses when the user's own rows are
// absent, a bare `[]`, or themselves block-sequence items. Refuse anything else rather than break the file.
const userRows = patch
	.replace(new RegExp(`${BEGIN}[\\s\\S]*?${END}`), "")
	.split(/\r?\n/)
	.filter((line) => line.trim() !== "" && !line.trimStart().startsWith("#"));
if (!uninstall && userRows.length > 0 && !/^\[\]\s*$/.test(userRows[0]) && !userRows[0].startsWith("-")) {
	console.error(
		`${patchPath} uses a YAML layout this installer cannot extend safely.\n` +
			"Nothing was changed. Rewrite its rows as a block list (lines starting with '- '), or add this row by hand:\n\n" +
			`- insert:\n    - id: locale-ko\n      name: ${NAME}\n`
	);
	process.exit(1);
}

// Back up the user's files only before the first install, so the backup is always the original.
if (!uninstall && !patch.includes(BEGIN)) {
	const stamp = new Date().toISOString().replace(/[:.]/g, "-");
	for (const f of [pkgPath, patchPath]) if (existsSync(f)) copyFileSync(f, `${f}.bak-${stamp}`);
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.dependencies ??= {};
patch = patch.replace(new RegExp(`\\n?${BEGIN}[\\s\\S]*?${END}\\n?`), "\n");

if (uninstall) {
	delete pkg.dependencies[NAME];
	rmSync(join(profile, "local-plugins", NAME), { recursive: true, force: true });
	rmSync(join(profile, "node_modules", NAME), { recursive: true, force: true });
	if (/^\s*(#.*\n|\s)*$/.test(patch)) patch += "[]\n";
} else {
	const src = join(here, NAME);
	cpSync(src, join(profile, "local-plugins", NAME), { recursive: true });
	cpSync(src, join(profile, "node_modules", NAME), { recursive: true });
	pkg.dependencies[NAME] = `file:local-plugins/${NAME}`;
	// The shipped file is a bare `[]`; turn it into a block list so our entry can sit beside the user's own rows.
	patch = patch.replace(/^\[\]\s*$/m, "");
	patch = `${patch.trimEnd()}\n${BEGIN}\n- insert:\n    - id: locale-ko\n      name: ${NAME}\n${END}\n`;
}
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
writeFileSync(patchPath, patch.replace(/^\n+/, ""));
console.log(uninstall ? "uninstalled" : "installed", "->", profile);
console.log(readFileSync(patchPath, "utf8"));
