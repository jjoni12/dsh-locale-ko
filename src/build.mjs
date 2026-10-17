// Build ../lib/client.js (the plugin's browser bundle) from the template and the dictionaries.
// Usage: node src/build.mjs   (KO_DEBUG=1 exposes the locale service as window.__KO_LOCALE__)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const ko = JSON.parse(readFileSync(join(here, "ko-dict.json"), "utf8"));
const statics = JSON.parse(readFileSync(join(here, "ko-static.json"), "utf8"));

const template = readFileSync(join(here, "client.template.js"), "utf8");
const debug = process.env.KO_DEBUG === "1";
const out = template
	.replace("/*__DEBUG__*/false", String(debug))
	.replace("/*__KO_DICT__*/{}", JSON.stringify(ko, null, "\t").replace(/\n/g, "\n\t\t"))
	.replace("/*__KO_STATIC__*/{}", JSON.stringify(statics, null, "\t").replace(/\n/g, "\n\t\t"));
mkdirSync(join(root, "lib"), { recursive: true });
writeFileSync(join(root, "lib", "client.js"), out);
console.log("namespaces:", Object.keys(ko).length, "static:", Object.fromEntries(Object.entries(statics).map(([g, v]) => [g, Object.keys(v).length])));
