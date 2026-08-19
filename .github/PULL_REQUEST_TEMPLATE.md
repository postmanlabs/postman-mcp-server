<!-- Thanks for contributing! Documentation and repository tooling PRs are merged directly. -->

## What does this change?

<!-- One or two sentences. Link the issue: Closes #123 -->

## Type of change

- [ ] Documentation (README, CONTRIBUTING, DOCKER, SECURITY, issue/PR templates)
- [ ] Repository tooling (workflows, Dockerfile, lint/format config, manifests)
- [ ] Release plumbing
- [ ] Other (please explain)

## Synced-path check

Files under `src/` and `dist/` are synced from Postman's internal source of truth, so
changes to them can't be merged here — they would be overwritten on the next sync. The
authoritative list is [`.github/synced-paths.json`](./.github/synced-paths.json).

- [ ] This PR does **not** change anything under `src/` or `dist/`.

If it does, please open an issue instead — that's where those changes get made, and we
credit contributions that ship:
[Bug report](../../issues/new?template=bug_report.yml) ·
[Tool request](../../issues/new?template=tool_request.yml)

## Checklist

- [ ] One focused change
- [ ] Branched off the latest `main`, no conflicts
- [ ] Conventional Commits title (`fix:`, `feat:`, `docs:`, `chore:`, …)
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm test:unit` pass locally
- [ ] No `dist/` files in the diff — don't run `pnpm build` for a contribution, it
      recompiles the committed `dist/` and creates a large unrelated diff
