window.__ModuleLoader__.load({
	id: "dsh-plugin-locale-ko",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;

		/** Korean dictionaries keyed like the shipped ones: namespace -> key -> text. */
		const KO = /*__KO_DICT__*/{};
		/**
		 * English UI text that bypasses the locale registry, as exact text -> Korean, in two scopes:
		 * `global` sentences apply anywhere outside conversation content; `plugins` (package titles and
		 * descriptions) apply only inside plugin screens, because the same short phrases could be a
		 * user's file or session name elsewhere.
		 */
		const STATIC = /*__KO_STATIC__*/{};
		const STATIC_GLOBAL = STATIC.global ?? {};
		const STATIC_PLUGINS = STATIC.plugins ?? {};
		const PLUGIN_SCOPE = "[data-plugin-panel], [data-plugin-scope], [data-plugin-package], [data-plugin-entry]";

		const DEBUG = /*__DEBUG__*/false;
		const KO_ID = "ko";

		// ── hardcoded-text fallback ───────────────────────────────────────────
		const ATTRS = ["placeholder", "title", "aria-label"];
		// Never rewrite conversation content: rendered markdown, user bubbles, reasoning, code, editors.
		const SKIP = "pre, code, textarea, [contenteditable]:not([contenteditable='false']), .md-code-block, [class*='_markdown_'], [class*='_bubble'], [class*='_thinkBody'], [class*='_fieldValue'], [class*='_filePath']";
		let staticOn = false;
		let observer;
		/** Rewritten text nodes and attributes: target -> key ("#text" or attribute name) -> [original, translated]. */
		const touched = new Map();
		const PRUNE_AT = 4000;

		/**
		 * @param value - text node value or attribute value.
		 * @param el - the element showing it (text node parent, or the attribute's owner).
		 */
		function translateText(value, el) {
			if (!value) return undefined;
			const trimmed = value.trim();
			if (!trimmed) return undefined;
			let hit = STATIC_GLOBAL[trimmed];
			if (hit === undefined && STATIC_PLUGINS[trimmed] !== undefined && el.closest(PLUGIN_SCOPE)) hit = STATIC_PLUGINS[trimmed];
			if (hit === undefined) return undefined;
			return value.replace(trimmed, hit);
		}
		function inSkipped(el) {
			return !!(el && el.closest && el.closest(SKIP));
		}
		function remember(target, key, original, translated) {
			let entry = touched.get(target);
			if (!entry) {
				if (touched.size >= PRUNE_AT) for (const t of touched.keys()) if (!t.isConnected) touched.delete(t);
				entry = new Map();
				touched.set(target, entry);
			}
			entry.set(key, [original, translated]);
		}
		function patchText(node) {
			const parent = node.parentElement;
			if (!parent || inSkipped(parent)) return;
			const current = node.nodeValue;
			const next = translateText(current, parent);
			if (next === undefined || next === current) return;
			remember(node, "#text", current, next);
			node.nodeValue = next;
		}
		function patchAttrs(el) {
			for (const attr of ATTRS) {
				const current = el.getAttribute(attr);
				const next = translateText(current, el);
				if (next === undefined || next === current) continue;
				remember(el, attr, current, next);
				el.setAttribute(attr, next);
			}
		}
		function patchNode(node) {
			if (node.nodeType === 3) return patchText(node);
			if (node.nodeType !== 1 || inSkipped(node)) return;
			patchAttrs(node);
			const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
			let n = walker.nextNode();
			while (n) {
				if (n.nodeType === 3) patchText(n);
				else if (!inSkipped(n)) patchAttrs(n);
				n = walker.nextNode();
			}
		}
		/** Put back the English wherever the page still shows our translation. */
		function restoreAll() {
			for (const [target, entry] of touched) {
				if (!target.isConnected) continue;
				for (const [key, [original, translated]] of entry) {
					if (key === "#text") {
						if (target.nodeValue === translated) target.nodeValue = original;
					} else if (target.getAttribute(key) === translated) target.setAttribute(key, original);
				}
			}
			touched.clear();
		}
		function startStatic() {
			if (staticOn || typeof document === "undefined") return;
			staticOn = true;
			patchNode(document.body);
			observer = new MutationObserver((records) => {
				for (const r of records) {
					if (r.type === "characterData") patchNode(r.target);
					else if (r.type === "attributes") patchNode(r.target);
					else for (const added of r.addedNodes) patchNode(added);
				}
			});
			observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
		}
		function stopStatic() {
			if (!staticOn) return;
			staticOn = false;
			observer?.disconnect();
			observer = undefined;
			restoreAll();
		}

		// ── locale registry integration ───────────────────────────────────────
		const inject = ["locale"];

		/**
		 * The locale service accepts external language packs (DSH 0.2+), so Korean is an ordinary
		 * selectable language whose preference DSH persists itself. The hardcoded-text fallback runs
		 * only while Korean is on screen.
		 */
		function apply(ctx) {
			const locale = ctx.locale;
			if (DEBUG) window.__KO_LOCALE__ = locale;
			if (typeof locale.addLanguage !== "function") {
				console.warn("dsh-plugin-locale-ko: this DSH build has no language-pack API (needs DeepSeek Harness 0.2 or later); Korean is not available.");
				return;
			}
			ctx.effect(() => locale.addLanguage({ id: KO_ID, label: "한국어", fallback: "en" }), "locale-ko: language");
			for (const [ns, dict] of Object.entries(KO)) {
				ctx.effect(() => locale.register(ns, KO_ID, dict), `locale-ko: ${ns} dictionary`);
			}
			const sync = (snapshot) => {
				if (snapshot.active === KO_ID) startStatic();
				else stopStatic();
			};
			ctx.on("locale/change", sync);
			sync(locale.getLocale());
			ctx.effect(() => stopStatic, "locale-ko: hardcoded-text fallback");
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.KO = KO;
		exports.STATIC = STATIC;
		return module.exports;
	}
});
