# Contributing to the Postman MCP Server

Thanks for your interest in contributing! This document explains how to set up the project, what to work on, and how to get a pull request merged smoothly. Contributions of all sizes are welcome — bug fixes, tests, documentation, and well-scoped features.

## Code of conduct

Be respectful and constructive. We want this to be a welcoming project for contributors of every background and experience level. Harassment or abusive behavior won't be tolerated.

## Ways to contribute

- **Report a bug** — Open an issue with clear reproduction steps, the toolset you ran (`--minimal` / `--full` / `--code`), your OS, and the MCP client (Claude Desktop, Cursor, Windsurf, etc.).
- **Suggest an improvement** — Open an issue describing the problem and the outcome you'd like. For changes to a tool's parameters or description, please file an issue first (see [Generated files](#generated-files-please-dont-hand-edit) below).
- **Open a pull request** — For fixes, tests, or docs. For anything large, open an issue first so we can align before you invest the time.

## Development setup

**Prerequisites**

- Node.js `>= 20`
- [pnpm](https://pnpm.io/) `10.6.2` (the repo enforces pnpm; npm/yarn are blocked by a `preinstall` hook)
- A Postman API key — Create one in [Postman](https://go.postman.co/settings/me/api-keys)

**Get started**

```bash
git clone https://github.com/postmanlabs/postman-mcp-server.git
cd postman-mcp-server
pnpm install
pnpm build        # eslint --fix, prettier, tsc
pnpm test         # vitest
pnpm lint         # eslint
```

**Run the server locally (STDIO)**

```bash
POSTMAN_API_KEY=<your-key> node dist/src/index.js --full
```

Useful flags:
- `--minimal` / `--full` / `--code` — Select the toolset.
- `--region <us|eu>` — Sets the API region.
- `--quiet` — Suppresses verbose startup logs (needed on Windows + Windsurf). See the [README](./README.md) for client configuration examples.

## Project layout

```
src/
  index.ts            # STDIO server entrypoint
  tools/              # MCP tools (most are generated — see below)
    getCollection/    # hand-written orchestrators (safe to edit)
    runner/           # collection runner (safe to edit)
    utils/            # tool helpers (safe to edit)
  clients/            # Postman API client
  resources/          # bundled instructions/resources
  views/              # response templates
  tests/              # unit + integration tests
dist/                 # compiled output (generated — do not edit)
```

## Generated files (please don't hand-edit)

Several files are **auto-generated from the Postman API OpenAPI specification** and are overwritten whenever the project is rebuilt. Editing them by hand looks like it works, but the change won't persist. Don't modify the following:

- `src/tools/*.ts` — The top-level generated tool files (schemas and descriptions).
- `src/views/*.njk` at the root of `src/views/`.
- `dist/**` — The compiled output.

**Spotted a wrong tool schema or description?** (e.g. a missing enum value, a parameter that should be optional, an unclear description.) That's a valuable report — please **open an issue** describing the desired change, or call it out in your PR description. We maintain those definitions at the source and will fold your suggestion in there.

**Safe to edit** (PRs welcome directly):

- `src/tools/getCollection/*` and `src/tools/runner/*` — Hand-written orchestrators.
- `src/tools/utils/*` — Shared helpers.
- `src/clients/*`, `src/constants.ts`, `src/enabledResources.ts`, `src/env.ts`, and `src/index.ts`
- `src/views/errors/*` and `src/resources/*`
- `src/tests/**` — Tests.
- Documentation.

If you're unsure whether a file is generated, open an issue and ask. We're happy to point you to the right place.

## Pull request guidelines

To keep review fast and merges clean:

1. **One focused change per PR.** Don't bundle unrelated fixes. A PR that fixes a single bug (or closes a single issue) is far easier to review, merge, and revert if needed. If you have several fixes, open one PR each.
2. **Keep your branch current and conflict-free.** Branch off the latest `main` and rebase if `main` moves ahead. We can't merge a PR that conflicts with or is behind `main`.
3. **Include tests** for any behavior change, and make sure the full suite passes.
4. **Run the checks before pushing:**
   ```bash
   pnpm build && pnpm test && pnpm lint
   ```
5. **Use [Conventional Commits](https://www.conventionalcommits.org/)** for commit messages and the PR title (`fix:`, `feat:`, `docs:`, `test:`, `refactor:`, `chore:`).
6. **Write a clear description**  for what you've changed, why, and link to the related issue (`Closes #123`).

## How pull requests are reviewed

When you open a PR we'll review it for security, correctness, and scope, and run the build/test/lint suite. Most well-scoped PRs against editable files merge quickly. If your change touches a generated file, we may not be able to merge it directly, but we'll take the underlying suggestion forward and credit your contribution.

## Reporting a security issue

**Please don't open a public issue for security vulnerabilities.** Report them privately to the Postman security team at https://www.postman.com/legal/security-policy/ (or use GitHub's "Report a vulnerability" under the Security tab). We'll coordinate a fix and disclosure with you.

## License

By contributing, you agree that your contributions will be licensed under the same license as this project (see [LICENSE](./LICENSE)).
