window.__ModuleLoader__.load({
	id: "dsh-plugin-locale-ko",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;

		/** Korean dictionaries keyed like the shipped ones: namespace -> key -> text. */
		const KO = /*__KO_DICT__*/{};
		/** Hardcoded English UI text that bypasses the locale registry: exact text -> Korean. */
		const STATIC = /*__KO_STATIC__*/{};

		const DEBUG = /*__DEBUG__*/false;
		const KO_ID = "ko";
		const OPT_OUT_KEY = "dsh-locale-ko:other";

		function readOptOut() {
			try {
				return window.localStorage.getItem(OPT_OUT_KEY);
			} catch {
				return null;
			}
		}
		function writeOptOut(value) {
			try {
				if (value) window.localStorage.setItem(OPT_OUT_KEY, value);
				else window.localStorage.removeItem(OPT_OUT_KEY);
			} catch {}
		}

		// ── hardcoded-text fallback ───────────────────────────────────────────
		const ATTRS = ["placeholder", "title", "aria-label"];
		// Never rewrite conversation content: rendered markdown, user bubbles, reasoning, code, editors.
		const SKIP = "pre, code, textarea, [contenteditable]:not([contenteditable='false']), .md-code-block, [class*='_markdown_'], [class*='_bubble'], [class*='_thinkBody'], [class*='_fieldValue'], [class*='_filePath']";
		let staticOn = false;
		let observer;
		/** Rewritten text nodes and attributes: target -> key ("#text" or attribute name) -> [original, translated]. */
		const touched = new Map();
		const PRUNE_AT = 4000;

		function translateText(value) {
			if (!value) return undefined;
			const trimmed = value.trim();
			if (!trimmed) return undefined;
			const hit = STATIC[trimmed];
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
			const next = translateText(current);
			if (next === undefined || next === current) return;
			remember(node, "#text", current, next);
			node.nodeValue = next;
		}
		function patchAttrs(el) {
			for (const attr of ATTRS) {
				const current = el.getAttribute(attr);
				const next = translateText(current);
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

		/** Follow the active locale: the hardcoded-text fallback runs only while Korean is on screen. */
		function followActiveLocale(ctx, locale) {
			const sync = (snapshot) => {
				if (snapshot.active === KO_ID) startStatic();
				else stopStatic();
			};
			ctx.on("locale/change", sync);
			sync(locale.getLocale());
			ctx.effect(() => stopStatic, "locale-ko: hardcoded-text fallback");
		}

		/**
		 * DSH 0.2+: the locale service accepts external language packs, so Korean is an ordinary
		 * selectable language whose preference DSH persists itself.
		 */
		function applyOfficial(ctx, locale) {
			ctx.effect(() => locale.addLanguage({ id: KO_ID, label: "한국어", fallback: "en" }), "locale-ko: language");
			for (const [ns, dict] of Object.entries(KO)) {
				ctx.effect(() => locale.register(ns, KO_ID, dict), `locale-ko: ${ns} dictionary`);
			}
			followActiveLocale(ctx, locale);
		}

		function apply(ctx) {
			const locale = ctx.locale;
			if (DEBUG) window.__KO_LOCALE__ = locale;
			if (typeof locale.addLanguage === "function") return applyOfficial(ctx, locale);
			applyLegacy(ctx, locale);
		}

		/**
		 * DSH 0.1.x shipped only zh/en with no extension point, so Korean is spliced into the
		 * runtime's lookup and snapshot, with the choice kept in browser storage.
		 */
		function applyLegacy(ctx, locale) {
			const originalLookup = locale.lookup;
			const originalPublish = locale.publish;
			const originalSetLocale = locale.setLocale;
			const originalLocales = locale.snapshot.locales;

			locale.lookup = function (ns, key) {
				if (this.snapshot.active === KO_ID) {
					const hit = KO[ns]?.[key];
					if (hit !== undefined) return hit;
				}
				return originalLookup.call(this, ns, key);
			};
			// Korean stands unless the user explicitly picked another shipped language here.
			locale.publish = function (active, localeChanged) {
				const target = readOptOut() ? active : KO_ID;
				return originalPublish.call(this, target, localeChanged || target !== this.snapshot.active);
			};
			locale.setLocale = function (id) {
				if (id === KO_ID) {
					writeOptOut(null);
					if (this.snapshot.active !== KO_ID) originalPublish.call(this, KO_ID, true);
					return;
				}
				writeOptOut(id);
				if (this.snapshot.active === id) originalPublish.call(this, id, true);
				return originalSetLocale.call(this, id);
			};

			// 0.1.x maps only zh/en to a document tag, so set ours after its own listener runs.
			ctx.on("locale/change", (snapshot) => {
				if (snapshot.active === KO_ID) document.documentElement.lang = "ko";
			});

			locale.snapshot = Object.freeze({
				...locale.snapshot,
				locales: Object.freeze([{ id: KO_ID, label: "한국어" }, ...originalLocales])
			});
			const initial = readOptOut();
			if (initial && originalLocales.some((l) => l.id === initial)) originalPublish.call(locale, initial, true);
			else originalPublish.call(locale, KO_ID, true);
			if (locale.getLocale().active === KO_ID) document.documentElement.lang = "ko";
			followActiveLocale(ctx, locale);

			ctx.effect(() => () => {
				locale.lookup = originalLookup;
				locale.publish = originalPublish;
				locale.setLocale = originalSetLocale;
				locale.snapshot = Object.freeze({ ...locale.snapshot, locales: originalLocales });
				originalPublish.call(locale, locale.snapshot.active === KO_ID ? "en" : locale.snapshot.active, true);
			}, "locale-ko: restore locale runtime");
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.KO = KO;
		exports.STATIC = STATIC;
		return module.exports;
	}
});
