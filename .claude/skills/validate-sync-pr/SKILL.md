---
name: validate-sync-pr
description: Use when validating the sync PR from postman-mcp-server (branch sync-tools-from-postman-mcp-server) — runs lint, types, tests, and a file-parity check against the upstream source repo, then reports a single structured verdict.
---

# Validate Sync PR

Run this when the user wants to verify the bot-generated sync PR on branch
`sync-tools-from-postman-mcp-server`. The PR mirrors files from the private
`postman-mcp-server` repo via `src/postman-api/generator/scripts/sync-tools-to-api-mcp.sh`;
this skill verifies the mirror is faithful **and** the resulting working tree builds
cleanly.

## Prerequisites

- Sibling repo at `../postman-mcp-server` (or override via `SOURCE_REPO` env var). If it
  is missing, ask the user where it lives — do not guess.
- `pnpm` on PATH. If absent, tell the user to install `pnpm@10`; do not substitute `npm`.

## Steps (in order)

1. **Confirm branch.** Run `git rev-parse --abbrev-ref HEAD`. If not
   `sync-tools-from-postman-mcp-server`, offer to
   `git fetch origin sync-tools-from-postman-mcp-server && git checkout sync-tools-from-postman-mcp-server`.
   Do not switch without asking — the user may have pending changes.

2. **Confirm sibling repo state.** In `../postman-mcp-server`, run
   `git status --short` and `git rev-parse --abbrev-ref HEAD`. If dirty or on an
   unexpected branch (the bot syncs from `develop`), warn — drift findings may be
   stale relative to what the bot actually pushed.

3. **Install deps.** `pnpm install --frozen-lockfile`. Skip if `node_modules` is present
   and the lockfile is unchanged since last install.

4. **Run checks in parallel** (four separate Bash calls in one message):
   - `pnpm lint` — capture all output. `--fix`-able findings count as **warnings**.
   - `pnpm exec tsc --noEmit` — type errors are **errors**.
   - `pnpm vitest run` — non-zero exit is an **error**.
   - `node scripts/validate-sync-pr.mjs` — non-zero exit is an **error**;
     `⚠️` lines in stdout are warnings.

5. **Aggregate and report** with this exact structure:

   ```
   ## validate-sync-pr report

   - Lint: PASS | FAIL | WARN
   - Types: PASS | FAIL
   - Tests: PASS | FAIL
   - File parity: PASS | FAIL
   - Enabled resources: PASS | FAIL
   ```

   Follow with a `### Details` section per non-PASS row.

6. **Judgement on drift.** For each `Δ` reported by the script:
   - Single-line diff that looks like a stale path the sync's `sed` didn't cover →
     likely a sync-script bug or a new import not covered by `REWRITES`.
   - Target contains content that doesn't appear in the upstream source →
     manual edit on the PR branch; recommend re-running the bot sync.
   - Only `dist/` drifts while `src/` is clean → upstream rebuild needed before sync;
     flag for the user.

7. **Judgement on extraneous files.** If a file is flagged extraneous but is intentional
   (e.g. a new tool added directly to `postman-api-mcp` outside the sync), tell the
   user — don't recommend deletion automatically. The sync's mental model is "the bot
   owns everything under `src/tools/`"; deviations are decisions for the user.

8. **Resolve the PR URL.** Before posting to Slack, find the open sync PR with:

   ```bash
   gh pr list --head sync-tools-from-postman-mcp-server --state open \
     --json number,url --jq '.[0]'
   ```

   Use the returned `url` and `number` in the Slack header. If no open PR is found
   (e.g. running this against a closed/merged branch), fall back to the most recent
   `state all` result and note the state in the message. Never link to the branch name
   only — the header MUST be a clickable link to the PR.

9. **Post the report to Slack `#mcpoke-results`** (channel ID `C0A0B1P1UMC`) using
   `mcp__plugin_slack_slack__slack_send_message`. Reformat the report for Slack:
   - **Header line:** `**validate-sync-pr — [PR #<N>: <title>](<url>)**` followed on
     the next line by `_branch \`sync-tools-from-postman-mcp-server\` @ \`<short-sha>\`_`.
     The PR title and number come from the `gh pr list` output in step 8.
   - No markdown headers (`#`, `##`); use **bold** lines for section labels.
   - No markdown tables; use bullet lists with verdict emoji per section.
   - Lead with a one-line overall verdict in **bold** under the header so it reads
     well in mobile notifications.
   - Include: per-section verdicts (Lint / Types / Tests / File parity `src/` and
     `dist/` / Enabled resources), and a bulleted "Upstream fixes needed" section if
     applicable.
   - Keep it under ~30 lines. The full transcript already lives in this session for
     anyone who wants depth.
   - If the user prefers to review before posting, use
     `mcp__plugin_slack_slack__slack_send_message_draft` instead.

## What this skill deliberately does NOT do

- Modify any file. Read-only end to end.
- Spawn the built server to count runtime tools. Upstream
  `validate-enabled-resources.yml` covers that before the PR is opened.
- Compare against `overlayed.yaml`. That file isn't synced into this repo.

## `CUSTOM_RESOURCES` drift

`scripts/validate-sync-pr.mjs` mirrors the `CUSTOM_RESOURCES` allowlist from upstream's
`.github/scripts/validate-enabled-resources.js`. If a new custom resource is added
upstream, expect the local script to flag it as `unresolved` until the mirrored list is
updated. This is a known maintenance point — call it out in the report when it happens.
