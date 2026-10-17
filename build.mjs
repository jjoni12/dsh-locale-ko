// Build lib/client.js from the template and the dictionaries, then copy the package to each target profile.
import { readFileSync, writeFileSync, cpSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = join(here, "dsh-plugin-locale-ko");
const ko = JSON.parse(readFileSync(join(here, "ko-dict.json"), "utf8"));
const staticPath = join(here, "ko-static.json");
const statics = existsSync(staticPath) ? JSON.parse(readFileSync(staticPath, "utf8")) : {};

const template = readFileSync(join(here, "client.template.js"), "utf8");
const debug = process.env.KO_DEBUG === "1";
const out = template
	.replace("/*__DEBUG__*/false", String(debug))
	.replace("/*__KO_DICT__*/{}", JSON.stringify(ko, null, "\t").replace(/\n/g, "\n\t\t"))
	.replace("/*__KO_STATIC__*/{}", JSON.stringify(statics, null, "\t").replace(/\n/g, "\n\t\t"));
mkdirSync(join(pkg, "lib"), { recursive: true });
writeFileSync(join(pkg, "lib", "client.js"), out);

for (const target of process.argv.slice(2)) {
	cpSync(pkg, join(target, "dsh-plugin-locale-ko"), { recursive: true });
	console.log("copied to", target);
}
console.log("namespaces:", Object.keys(ko).length, "static:", Object.keys(statics).length);
