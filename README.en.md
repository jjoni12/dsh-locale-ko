# dsh-locale-ko

[한국어](README.md) | **English**

**Unofficial Korean (한국어) UI language pack for DeepSeek Harness (DSH)**

A plugin that switches the DeepSeek Harness interface (chat, sidebar, settings, plugins, automations, file preview, dialogs and more) to Korean.
It installs as a regular DSH plugin and does not modify the app's program files, so you can turn it off or remove it from the Plugins page at any time.

| Before | After |
|---|---|
| ![Before: English UI](docs/before-main.png) | ![After: Korean UI](docs/after-main.png) |

<details>
<summary>More screenshots (Settings, Plugins)</summary>

![Settings → General](docs/settings.png)

![Language pack details on the Plugins page](docs/plugins.png)

</details>

## Target app

This language pack is built against the **official desktop app** (Download for Windows) distributed on DeepSeek's [DeepSeek Harness page](https://www.deepseek.com/en/harness/). It also works with `npx @deepseek-ai/dsh web` (Web UI) described on the same page.

This is an unofficial community translation and is not made, affiliated with or endorsed by DeepSeek.

## Supported versions

| App | Version |
|---|---|
| [DeepSeek Harness official desktop app](https://www.deepseek.com/en/harness/) (Windows 64-bit) | 0.2.1-rc.2 |
| `npx @deepseek-ai/dsh web` (Web UI) | 0.2.1-rc.2 |

On other versions some text may stay in English or the pack may not work.

## Install

No Node.js or terminal needed.

1. Open **Plugins** in the left sidebar of DeepSeek Harness.
2. Click **Add plugin** in the top right, enter the address below and click **Install**.

   ```
   https://github.com/jjoni12/dsh-locale-ko
   ```

3. When installation finishes, click **Enable now**. It applies immediately without a restart.

You can then pick `한국어` in Settings → General → Language. If your OS language is Korean and you haven't chosen a language yet, Korean is selected automatically.

### Turn off / Remove / Update

- **Turn off**: Plugins → Installed plugins → switch off the Korean language pack (한국어 언어팩).
- **Remove**: click the Korean language pack and press **Uninstall** on its detail page.
- **Update**: remove it, then install again from the same address.

Installing, turning off and removing are all handled by the **Plugins page** of the DSH app; the language pack never edits **your own settings file** (`cordis.patch.yml`) directly.

## Contents

| File | Purpose |
|---|---|
| `package.json` | DSH plugin declaration (bundle + client plugin) |
| `cordis.patch.yml` | Loads the language pack plugin when the bundle is turned on |
| `lib/client.js` | The built language pack |
| `locale/*.json` | Name and description shown on the Plugins page (English, Chinese, Korean) |
| `icon.svg` | Plugin icon |
| `src/ko-dict.json` | Korean translations of strings registered in the app's i18n system (56 namespaces, 2,566 keys as of 0.2.1) |
| `src/ko-static.json` | Korean translations of strings that bypass the i18n system, in two groups: `global` (anywhere) and `plugins` (only inside the Plugins page) |
| `src/client.template.js`, `src/build.mjs` | Template and build script that produce `lib/client.js` from the files above |

## Editing translations

Edit `src/ko-dict.json` or `src/ko-static.json`, then build.

```bash
node src/build.mjs
```

Please report mistranslations or missing strings through an Issue or Pull Request.

## How it works

- Adds a `ko` language (fallback `en`) through DSH's language pack API and registers a Korean dictionary per namespace. DSH itself saves the language choice in its settings.
- Some strings that bypass the i18n system are replaced with Korean only when the displayed text matches exactly. Switching to another language restores the original text immediately.
  - Plugin names and descriptions are replaced only inside the Plugins page.
  - Short words such as "Status" or "Tools" are never replaced, so files, folders or session titles with the same name are not changed by mistake.
  - Conversation content (AI replies, user messages, reasoning, code) is never touched.

## Limitations

- Screens built into the app shell itself cannot be translated. This includes the official desktop app's window menu (Application, Edit, etc.).
- Package descriptions in Settings → Built-in plugins are developer-facing descriptions of each package; they stay in English even in the official Chinese UI, and this pack does not translate them either.
- Some text from external plugins or the server (tool names, raw error messages, etc.) may remain in English.
- New strings may appear in English after an app update.

## License

[MIT](LICENSE)

The source text of the translations is the UI text of [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (Copyright (c) 2026 DeepSeek), distributed under the MIT License. See [NOTICE](NOTICE) for details.
