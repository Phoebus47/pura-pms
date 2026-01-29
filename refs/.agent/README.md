# Antigravity IDE – Workspace Rules

This folder holds **workspace rules** for [Antigravity IDE](https://antigravity.codes/) so the AI follows the same coding standards as in Cursor.

## How to use

### Option A: Rules already in repo (if Antigravity loads `.agent/rules/`)

If your Antigravity version loads workspace rules from `.agent/rules/`, the files in `rules/` (coding-standards, commit-format, context-api, context-test, context-ui) are used when you open this project. No extra step.

### Option B: Add rule via Antigravity UI

1. In Antigravity, click the **three dots (•••)** in the top-right of the Agent Manager.
2. Choose **Additional options** → **Customizations**.
3. Open the **Rules** tab and click **+ Workspace**.
4. Paste the contents of **`rules/coding-standards.md`** into the new workspace rule.

### Option C: Project root file

Antigravity may also read a rules file in the project root (e.g. `.cursorrules`). This repo includes **`.cursorrules`** in the root with the same checklist, so opening the project may apply the rules automatically if your setup reads that file.

## Syncing with Cursor

The same checklist is kept in:

- **Cursor:** `.cursor/rules/coding-standards.mdc`, `.cursor/rules/commit-format.mdc`, `.cursor/rules/context-api.mdc`, `.cursor/rules/context-test.mdc`, `.cursor/rules/context-ui.mdc`
- **Antigravity / root:** `.agent/rules/coding-standards.md`, `.agent/rules/commit-format.md`, `.agent/rules/context-api.md`, `.agent/rules/context-test.md`, `.agent/rules/context-ui.md`, and `.cursorrules`

When you change any of these rules, update both Cursor and `.agent` so both IDEs stay in sync. The long-form guide is always in **`docs/CODING_STANDARDS.md`**.
