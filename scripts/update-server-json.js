#!/usr/bin/env node

/**
 * Rewrites server.json so it matches a release exactly.
 *
 * server.json feeds the official MCP registry (via mcp-publisher) and the
 * marketplaces built on top of it, including the GitHub Copilot CLI. Clients
 * MUST verify `fileSha256` before running an mcpb package, so the hashes have
 * to be those of the artifacts actually attached to the GitHub release.
 *
 * That is why hashes are computed in CI, from the same files that get uploaded,
 * rather than from a local build: `mcpb pack` is not byte-reproducible across
 * machines, so a locally computed hash never matches the published asset.
 *
 * Usage:
 *   node scripts/update-server-json.js <version> [mcpb-dir]
 *
 * With no mcpb-dir, only the version fields are updated (hashes are left alone)
 * — that is the local `pnpm run release-custom` path, where the artifacts do
 * not exist yet.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

const REPO = 'https://github.com/postmanlabs/postman-mcp-server';
const VARIANTS = ['minimal', 'full', 'code', 'learn'];

const version = process.argv[2]?.replace(/^v/, '');
const mcpbDir = process.argv[3];

if (!version) {
    console.error('Usage: node scripts/update-server-json.js <version> [mcpb-dir]');
    process.exit(1);
}

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

const server = JSON.parse(readFileSync('server.json', 'utf8'));

server.version = version;

const npmPackage = server.packages.find((p) => p.registryType === 'npm');
if (!npmPackage) {
    throw new Error('server.json has no npm package entry');
}
npmPackage.version = version;

for (const variant of VARIANTS) {
    const filename = `postman-mcp-server-${variant}.mcpb`;

    // Match by variant name, never by array position: the packages array is
    // hand-editable and an index-based lookup silently assigns the wrong hash
    // to the wrong artifact.
    const pkg = server.packages.find(
        (p) => p.registryType === 'mcpb' && p.identifier.endsWith(`/${filename}`)
    );
    if (!pkg) {
        throw new Error(`server.json has no mcpb package entry for "${variant}" (${filename})`);
    }

    pkg.identifier = `${REPO}/releases/download/v${version}/${filename}`;

    if (mcpbDir) {
        const path = join(mcpbDir, filename);
        if (!existsSync(path)) {
            throw new Error(`Expected mcpb artifact not found: ${path}`);
        }
        pkg.fileSha256 = sha256(path);
        console.log(`   ✓ ${filename}: ${pkg.fileSha256}`);
    }
}

writeFileSync('server.json', JSON.stringify(server, null, 2) + '\n');
console.log(`📝 server.json updated to v${version}${mcpbDir ? ' with release hashes' : ' (version only)'}`);
