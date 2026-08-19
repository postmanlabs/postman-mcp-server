# Security policy

## Supported versions

Security fixes are released against the latest published version of
[`@postman/postman-mcp-server`](https://www.npmjs.com/package/@postman/postman-mcp-server).
Please upgrade to the latest version before reporting an issue.

## Reporting a vulnerability

**Please don't report security vulnerabilities through public GitHub issues, pull
requests, or the Postman Community forum.**

Report privately through either of these channels:

- **GitHub private vulnerability reporting** —
  [Report a vulnerability](https://github.com/postmanlabs/postman-mcp-server/security/advisories/new)
  (also reachable from the **Security** tab of this repository).
- **Postman security** — via the
  [Postman security policy](https://www.postman.com/legal/security-policy/).

### What to include

The more of this you can provide, the faster we can confirm and fix:

- The version of the server, and how you installed it (`npx`, npm, Docker, `.mcpb`
  bundle, or the remote server at `mcp.postman.com`).
- The toolset in use (`--minimal`, `--code`, `--full`, `--learn`).
- The impact — what an attacker can do, and what access they'd need to do it.
- Steps to reproduce, or a proof of concept.
- Any suggested mitigation, if you have one.

**Don't include live API keys, tokens, or private collection data** in your report.
Redact them, and rotate anything that may have been exposed.

### What to expect

We'll acknowledge your report, keep you updated as we investigate, and coordinate
disclosure with you before publishing a fix. If you'd like credit in the advisory,
say so and tell us how you'd like to be named.

## Scope

This policy covers the Postman MCP Server distributed from this repository.

Vulnerabilities in the **Postman platform or the Postman API itself** — rather than in
this server — should go through the
[Postman security policy](https://www.postman.com/legal/security-policy/), which
covers Postman's bug bounty and disclosure process.
