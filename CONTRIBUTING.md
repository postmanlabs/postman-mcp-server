# Contributing to the Postman MCP Server

Thanks for your interest in contributing. Issues, documentation, and repository tooling are all first-class contributions here — a bug report with a clean reproduction is the single most valuable thing you can send us, and it's how most tool fixes actually get made.

## How this repo works

The MCP tool definitions and the server implementation in this repository are synced from Postman's internal source of truth. Changes to those files can't be merged here — they'd be overwritten on the next sync.

That isn't a dead end. Everything we ship in those files starts as a report or a proposal, and issues filed here are where we get them. Found a wrong schema, a confusing description, a broken tool — or you already know exactly what the fix should be? [Open an issue](https://github.com/postmanlabs/postman-mcp-server/issues/new/choose). That's the path that actually changes the server.

The authoritative list of synced paths is [`.github/synced-paths.json`](./.github/synced-paths.json), and CI will tell you on your pull request if you've touched one.

## What you can change here

| Open — pull requests merged directly | Synced — please open an issue |
| --- | --- |
| `README.md`, `CONTRIBUTING.md`, `DOCKER.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md` | `src/**` — tools, schemas, descriptions, server code, and tests |
| `.github/**` — issue and PR templates, workflows, `CODEOWNERS` | `dist/**` — compiled output |
| `Dockerfile`, `.dockerignore`, `.npmignore`, `.dxtignore`, `.gitignore` | `vitest.config.ts` |
| `eslint.config.mjs`, `.prettierrc.js`, `tsconfig.json` | `package.json` — `dependencies`, `devDependencies`, `pnpm.overrides` |
| `manifest-*.json`, `server.json`, `scripts/**` | |
| `package.json` — the `scripts` block and package metadata | |

Two things worth calling out, because they're easy to guess wrong: **tests under `src/tests/**` and `vitest.config.ts` are on the synced side.** If a change needs test coverage, describe it in the issue or pull request and we'll add it at the source.

If you're unsure whether a file is synced, check [`.github/synced-paths.json`](./.github/synced-paths.json) or just ask in an issue. We're happy to point you to the right place.

## Ways to contribute

- **Report a bug** — [Bug report](https://github.com/postmanlabs/postman-mcp-server/issues/new?template=bug_report.yml). The form has an optional **Proposed solution** field: if you already know what the fix should be, put it there. We'd rather have your design in an issue we can act on than a pull request we can't merge.
- **Request a tool, or a change to one** — [Tool request](https://github.com/postmanlabs/postman-mcp-server/issues/new?template=tool_request.yml). Missing enum values, a parameter that should be optional, an unclear description, a whole new tool. Be as specific as you can; precise proposals often land close to verbatim.
- **Fix the docs** — [Documentation issue](https://github.com/postmanlabs/postman-mcp-server/issues/new?template=docs_issue.yml), or open a pull request directly. Documentation is fully open here.
- **Improve the tooling** — Workflows, Docker, lint and formatter config, manifests. Pull requests welcome; see the table above.

Whatever route you take, we credit contributions that ship — in the commit and in the release notes.

## Development setup

**Prerequisites**

- Node.js `>= 20`
- [pnpm](https://pnpm.io/) `10.6.2` (the repo enforces pnpm; npm and yarn are blocked by a `preinstall` hook)
- A Postman API key, **only if you want to run the integration tests** — create one in [Postman](https://go.postman.co/settings/me/api-keys)

**Get started**

```bash
git clone https://github.com/postmanlabs/postman-mcp-server.git
cd postman-mcp-server
pnpm install
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm test:unit    # unit tests — no API key needed
```

> **Don't run `pnpm build` for a contribution.** `pnpm build` compiles into `dist/`, which is committed to this repository, so it produces a large diff unrelated to your change. Maintainers rebuild `dist/` at release time. Use `pnpm typecheck` to check types instead. If `dist/` shows up in `git status`, leave it unstaged.

## Running the server locally (STDIO)

The published entry point is compiled output, so this is the one case where you do need a build:

```bash
pnpm build
POSTMAN_API_KEY=<your-key> node dist/src/index.js --full
```

Afterwards, leave `dist/` out of your commit (`git restore dist/` if you'd rather not see it in `git status`).

Useful flags:

- `--minimal` (default) / `--code` / `--full` / `--learn` — Select the toolset.
- `--region <us|eu>` — Sets the API region.
- `--quiet` — Suppresses verbose startup logs (needed on Windows + Windsurf).

See the [README](./README.md) for client configuration examples.

## Running the tests

| Command | What it runs | `POSTMAN_API_KEY` |
| --- | --- | --- |
| `pnpm test:unit` | `vitest run src/tests/unit` | not used |
| `pnpm test:ci` | `vitest run` — unit and integration | integration tests are skipped without it |
| `pnpm test` | `vitest` in **watch mode** — interactive use only | same as `test:ci` |

`pnpm test` starts Vitest in watch mode and won't exit on its own; use `pnpm test:ci` (or `pnpm test --run`) in scripts.

The integration tests run against the live Postman API, so they're skipped when `POSTMAN_API_KEY` isn't set — both commands above pass on a clean checkout with no key. Pull requests from forks can't access repository secrets, so CI runs lint, typecheck, and the unit suite for them: **that is a complete pass for a fork pull request.** You don't need an API key to contribute.

## Project layout

```
src/
  index.ts            # STDIO server entrypoint
  tools/              # MCP tools
  clients/            # Postman API client
  resources/          # bundled instructions/resources
  telemetry/          # telemetry
  views/              # response templates
  tests/              # unit + integration tests
dist/                 # compiled output — never edit or commit by hand
scripts/              # release tooling
```

Everything under `src/` is synced; see [What you can change here](#what-you-can-change-here).

## Pull request guidelines

1. **One focused change per PR.** Don't bundle unrelated fixes. A PR that fixes a single bug (or closes a single issue) is far easier to review, merge, and revert if needed.
2. **Keep your branch current and conflict-free.** Branch off the latest `main` and rebase if `main` moves ahead. We can't merge a PR that conflicts with or is behind `main`.
3. **Run the checks before pushing:**
   ```bash
   pnpm lint && pnpm typecheck && pnpm test:unit
   ```
4. **No `dist/` in your diff.** See the note in [Development setup](#development-setup).
5. **Use [Conventional Commits](https://www.conventionalcommits.org/)** for commit messages and the PR title (`fix:`, `feat:`, `docs:`, `test:`, `refactor:`, `chore:`).
6. **Write a clear description** of what you've changed and why, and link the related issue (`Closes #123`).

## How pull requests are reviewed

Pull requests against the open paths in the table above are reviewed by the maintainers listed in [`CODEOWNERS`](./.github/CODEOWNERS) for security, correctness, and scope, and CI runs lint, typecheck, and the unit suite.

If a pull request touches a synced path, an automated comment will say so and the PR will be labelled `synced-path`. We'll convert it into an issue that carries your change forward, and credit you when it ships — we won't just close it. If your PR mixes synced files with documentation or tooling, splitting the mergeable files into their own PR is the fastest route: we can merge that one right away.

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Be respectful and constructive — we want this to be a welcoming project for contributors of every background and experience level.

## Reporting a security issue

**Please don't open a public issue for security vulnerabilities.** See [SECURITY.md](./SECURITY.md) for how to report privately.

## Getting help

For usage questions rather than contributions, see [SUPPORT.md](./SUPPORT.md).

## License

By contributing, you agree that your contributions will be licensed under the same license as this project (see [LICENSE](./LICENSE)).
