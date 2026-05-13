#!/usr/bin/env node
// Validate that the postman-api-mcp working tree faithfully mirrors postman-mcp-server's
// sync output. Mirrors sync-tools-to-api-mcp.sh; read-only. Exit 1 on any failure.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = path.resolve(
  process.env.SOURCE_REPO ?? path.join(TARGET_ROOT, '..', 'postman-mcp-server'),
);
const SOURCE_PA = path.join(SOURCE_ROOT, 'src', 'postman-api');

// Mirrored from upstream .github/scripts/validate-enabled-resources.js
const CUSTOM_RESOURCES = new Set([
  'runCollection',
  'getEnabledTools',
  'getCodeGenerationInstructions',
  'searchPostmanElements',
  'getPostmanContextOverview',
  'getApiDiscoveryInstructions',
  'getInstalledApiMaintenanceInstructions',
  'getCollectionContext',
  'getFolderContext',
  'getRequestContext',
  'getResponseContext',
  'getRequestCodeContext',
  'getEnvironmentContext',
  'getWorkspacesContext',
  'getWorkspaceContext',
  'getWorkspaceEnvironmentsContext',
]);

const FORBIDDEN_TARGET_BASENAMES = new Set([
  'egressGuard.ts',
  'egressGuard.js',
  'searchPostmanElementsInPublicNetwork.ts',
  'searchPostmanElementsInPublicNetwork.js',
  'searchPostmanElementsInPrivateNetwork.ts',
  'searchPostmanElementsInPrivateNetwork.js',
]);

// Each rewrite is a [pattern, replacement] pair applied to the upstream source content
// before comparing to the target. Mirrors sed -e from sync-tools-to-api-mcp.sh.
const REWRITES = {
  flatTool: [
    ['../../client/postman.js', '../clients/postman.js'],
    ['../../shared/utils/toolHelpers.js', './utils/toolHelpers.js'],
    ['../../generator/enabledResources.js', '../enabledResources.js'],
  ],
  orchestratorTool: [
    ['../../../client/postman.js', '../../clients/postman.js'],
    ['../../../shared/utils/toolHelpers.js', '../utils/toolHelpers.js'],
    ['../../../shared/constants.js', '../../constants.js'],
    ['../../../env.js', '../../env.js'],
  ],
  index: [
    ['../generator/enabledResources.js', './enabledResources.js'],
    ['../client/postman.js', './clients/postman.js'],
    ['../shared/constants.js', './constants.js'],
    ['../shared/utils/toolHelpers.js', './tools/utils/toolHelpers.js'],
    ['../shared/utils/templateRenderer.js', './tools/utils/templateRenderer.js'],
    ['../shared/utils/errorTemplateRenderer.js', './tools/utils/errorTemplateRenderer.js'],
    ['../env.js', './env.js'],
    ['../generated/tools', './tools'],
    ['../generated/views', './views'],
    ['../resources', './resources'],
    ['../views/errors', './views/errors'],
  ],
  postmanClient: [
    ['../shared/constants.js', '../constants.js'],
    ['../shared/utils/toolHelpers.js', '../tools/utils/toolHelpers.js'],
    ['../env.js', '../env.js'],
  ],
  integrationTest: [
    [`args: ['dist/generated/index.js']`, `args: ['dist/src/index.js', '--full']`],
    ['dist/generated/index.js', 'dist/src/index.js'],
    ['dist/server/stdio.js', 'dist/src/index.js'],
    ['../../../client/postman.js', '../../clients/postman.js'],
    ['../../../shared/utils/toolHelpers.js', '../../tools/utils/toolHelpers.js'],
  ],
  none: [],
};

function applyRewrites(content, bucket) {
  const rules = REWRITES[bucket] ?? REWRITES.none;
  let out = content;
  for (const [from, to] of rules) {
    out = out.split(from).join(to);
  }
  return out;
}

function buildMappings() {
  const m = [];

  // Flat generated tools → src/tools (and dist mirror)
  m.push({ src: 'generated/tools', dst: 'src/tools', bucket: 'flatTool', kind: 'dir-flat-ts' });
  m.push({ src: 'dist/generated/tools', dst: 'dist/src/tools', bucket: 'flatTool', kind: 'dir-flat-js' });

  // Orchestrator subdirs (getCollection, runner)
  for (const sub of ['getCollection', 'runner']) {
    m.push({ src: `generated/tools/${sub}`, dst: `src/tools/${sub}`, bucket: 'orchestratorTool', kind: 'dir-ts' });
    m.push({ src: `dist/generated/tools/${sub}`, dst: `dist/src/tools/${sub}`, bucket: 'orchestratorTool', kind: 'dir-js' });
  }

  // Shared utils → src/tools/utils
  for (const f of ['toolHelpers', 'templateRenderer', 'errorTemplateRenderer']) {
    m.push({ src: `shared/utils/${f}.ts`, dst: `src/tools/utils/${f}.ts`, bucket: 'none', kind: 'file' });
    m.push({ src: `dist/shared/utils/${f}.js`, dst: `dist/src/tools/utils/${f}.js`, bucket: 'none', kind: 'file' });
  }

  // Views
  m.push({ src: 'generated/views', dst: 'src/views', bucket: 'none', kind: 'dir-njk' });
  m.push({ src: 'dist/generated/views', dst: 'dist/src/views', bucket: 'none', kind: 'dir-njk' });
  m.push({ src: 'views/errors', dst: 'src/views/errors', bucket: 'none', kind: 'dir-njk' });
  m.push({ src: 'dist/views/errors', dst: 'dist/src/views/errors', bucket: 'none', kind: 'dir-njk' });

  // enabledResources
  m.push({ src: 'generator/enabledResources.ts', dst: 'src/enabledResources.ts', bucket: 'none', kind: 'file' });
  m.push({ src: 'dist/generator/enabledResources.js', dst: 'dist/src/enabledResources.js', bucket: 'none', kind: 'file' });

  // stdio.ts → index.ts
  m.push({ src: 'server/stdio.ts', dst: 'src/index.ts', bucket: 'index', kind: 'file' });
  m.push({ src: 'dist/server/stdio.js', dst: 'dist/src/index.js', bucket: 'index', kind: 'file' });

  // postman client
  m.push({ src: 'client/postman.ts', dst: 'src/clients/postman.ts', bucket: 'postmanClient', kind: 'file' });
  m.push({ src: 'dist/client/postman.js', dst: 'dist/src/clients/postman.js', bucket: 'postmanClient', kind: 'file' });

  // constants
  m.push({ src: 'shared/constants.ts', dst: 'src/constants.ts', bucket: 'none', kind: 'file' });
  m.push({ src: 'dist/shared/constants.js', dst: 'dist/src/constants.js', bucket: 'none', kind: 'file' });

  // public-env → env
  m.push({ src: 'public-env.ts', dst: 'src/env.ts', bucket: 'none', kind: 'file' });
  m.push({ src: 'dist/public-env.js', dst: 'dist/src/env.js', bucket: 'none', kind: 'file' });

  // Instructions.md (src copied to both src and dist as-is)
  m.push({ src: 'resources/Instructions.md', dst: 'src/resources/Instructions.md', bucket: 'none', kind: 'file' });
  m.push({ src: 'resources/Instructions.md', dst: 'dist/src/resources/Instructions.md', bucket: 'none', kind: 'file' });

  // Integration test + factory
  m.push({ src: 'generator/tests/e2e/direct.test.ts', dst: 'src/tests/integration/direct.test.ts', bucket: 'integrationTest', kind: 'file' });
  m.push({ src: 'generator/tests/e2e/factories/dataFactory.ts', dst: 'src/tests/integration/factories/dataFactory.ts', bucket: 'none', kind: 'file' });

  return m;
}

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(ext))
    .map((d) => d.name)
    .sort();
}

function readSafe(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function shortDiff(a, b, max = 20) {
  const aL = a.split('\n');
  const bL = b.split('\n');
  const out = [];
  const n = Math.max(aL.length, bL.length);
  for (let i = 0; i < n && out.length < max; i++) {
    if (aL[i] !== bL[i]) {
      if (aL[i] !== undefined) out.push(`- ${aL[i]}`);
      if (bL[i] !== undefined) out.push(`+ ${bL[i]}`);
    }
  }
  if (out.length === max) out.push('… (truncated)');
  return out.join('\n');
}

function checkPair(srcPath, dstPath, bucket, results) {
  const srcContent = readSafe(srcPath);
  if (srcContent === null) {
    results.coverage.missingSource.push({ srcPath });
    return;
  }
  const dstContent = readSafe(dstPath);
  if (dstContent === null) {
    results.coverage.missingTarget.push({ srcPath, dstPath });
    return;
  }
  const rewritten = applyRewrites(srcContent, bucket);
  if (rewritten !== dstContent) {
    results.drift.push({ dstPath, diff: shortDiff(rewritten, dstContent) });
  } else {
    results.matched++;
  }
}

function walkMappings(results) {
  for (const m of buildMappings()) {
    const srcAbs = path.join(SOURCE_PA, m.src);
    const dstAbs = path.join(TARGET_ROOT, m.dst);

    if (m.kind === 'file') {
      checkPair(srcAbs, dstAbs, m.bucket, results);
      continue;
    }

    const extByKind = {
      'dir-flat-ts': '.ts',
      'dir-flat-js': '.js',
      'dir-ts': '.ts',
      'dir-js': '.js',
      'dir-njk': '.njk',
    };
    const ext = extByKind[m.kind];

    if (!fs.existsSync(srcAbs)) {
      results.coverage.missingSourceDir.push({ srcAbs });
      continue;
    }

    const srcFiles = listFiles(srcAbs, ext);
    for (const name of srcFiles) {
      checkPair(path.join(srcAbs, name), path.join(dstAbs, name), m.bucket, results);
    }

    const dstFiles = listFiles(dstAbs, ext);
    const srcSet = new Set(srcFiles);
    for (const name of dstFiles) {
      if (!srcSet.has(name)) {
        results.extraneous.push({ path: path.join(m.dst, name) });
      }
      if (FORBIDDEN_TARGET_BASENAMES.has(name)) {
        results.forbidden.push({ path: path.join(m.dst, name) });
      }
    }
  }
}

const CATEGORY_PATTERNS = {
  full: /const full = \[([\s\S]*?)\] as const;/,
  minimal: /const minimal = \[([\s\S]*?)\] as const;/,
  code: /const code = \[([\s\S]*?)\] as const;/,
  excludedFromGeneration: /const excludedFromGeneration = \[([\s\S]*?)\] as const;/,
};

function stripLineComments(s) {
  return s.split('\n').map((line) => line.replace(/\/\/.*$/, '')).join('\n');
}

function parseArrays(content) {
  const out = {};
  for (const [k, re] of Object.entries(CATEGORY_PATTERNS)) {
    const m = content.match(re);
    out[k] = m ? [...stripLineComments(m[1]).matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
  }
  return out;
}

function checkEnabledResources(results) {
  const srcPath = path.join(SOURCE_PA, 'generator/enabledResources.ts');
  const dstPath = path.join(TARGET_ROOT, 'src/enabledResources.ts');
  const src = readSafe(srcPath);
  const dst = readSafe(dstPath);
  if (!src || !dst) {
    results.enabledResources.error = `Cannot read enabledResources.ts (src: ${!!src}, dst: ${!!dst})`;
    return;
  }
  const srcA = parseArrays(src);
  const dstA = parseArrays(dst);

  for (const k of Object.keys(CATEGORY_PATTERNS)) {
    const sSet = new Set(srcA[k]);
    const dSet = new Set(dstA[k]);
    const onlyInSrc = [...sSet].filter((x) => !dSet.has(x));
    const onlyInDst = [...dSet].filter((x) => !sSet.has(x));
    if (onlyInSrc.length || onlyInDst.length) {
      results.enabledResources.arrayMismatch.push({ category: k, onlyInSrc, onlyInDst });
    }
    results.enabledResources.counts[k] = dstA[k].length;
  }

  const union = new Set([...dstA.full, ...dstA.minimal, ...dstA.code]);
  const toolsDir = path.join(TARGET_ROOT, 'src/tools');
  const knownTools = new Set();
  if (fs.existsSync(toolsDir)) {
    for (const name of fs.readdirSync(toolsDir)) {
      if (name.endsWith('.ts')) knownTools.add(name.slice(0, -3));
    }
    for (const sub of ['getCollection', 'runner']) {
      const subDir = path.join(toolsDir, sub);
      if (!fs.existsSync(subDir)) continue;
      for (const name of fs.readdirSync(subDir)) {
        if (name.endsWith('.ts')) knownTools.add(name.slice(0, -3));
      }
    }
  }
  for (const name of union) {
    if (!knownTools.has(name) && !CUSTOM_RESOURCES.has(name)) {
      results.enabledResources.unresolved.push(name);
    }
  }
}

function printReport(results) {
  let hasError = false;
  console.log('\n📊 validate-sync-pr');
  console.log('='.repeat(50));
  console.log(`Source repo: ${SOURCE_ROOT}`);
  console.log(`Target repo: ${TARGET_ROOT}`);
  console.log('');

  if (results.coverage.missingTarget.length) {
    hasError = true;
    console.log(`❌ Missing target files (${results.coverage.missingTarget.length}):`);
    for (const { srcPath, dstPath } of results.coverage.missingTarget) {
      console.log(`   • ${path.relative(TARGET_ROOT, dstPath)} (from ${path.relative(SOURCE_ROOT, srcPath)})`);
    }
    console.log('');
  }
  if (results.coverage.missingSource.length) {
    console.log(`⚠️  Source files referenced by mapping but absent in source repo (${results.coverage.missingSource.length}):`);
    for (const { srcPath } of results.coverage.missingSource) {
      console.log(`   • ${path.relative(SOURCE_ROOT, srcPath)}`);
    }
    console.log('');
  }
  if (results.coverage.missingSourceDir.length) {
    console.log(`⚠️  Source dirs absent (${results.coverage.missingSourceDir.length}):`);
    for (const { srcAbs } of results.coverage.missingSourceDir) {
      console.log(`   • ${path.relative(SOURCE_ROOT, srcAbs)}`);
    }
    console.log('');
  }

  if (results.forbidden.length) {
    hasError = true;
    console.log(`❌ Forbidden files present in target (must be stripped by sync):`);
    for (const { path: p } of results.forbidden) console.log(`   • ${p}`);
    console.log('');
  }

  if (results.extraneous.length) {
    hasError = true;
    console.log(`❌ Extraneous target files (no upstream counterpart, ${results.extraneous.length}):`);
    for (const { path: p } of results.extraneous) console.log(`   • ${p}`);
    console.log('');
  }

  if (results.drift.length) {
    hasError = true;
    console.log(`❌ Content drift after applying sync rewrites (${results.drift.length}):`);
    for (const { dstPath, diff } of results.drift) {
      console.log(`   Δ ${path.relative(TARGET_ROOT, dstPath)}`);
      console.log(diff.split('\n').map((l) => `       ${l}`).join('\n'));
      console.log('');
    }
  }

  const er = results.enabledResources;
  if (er.error) {
    hasError = true;
    console.log(`❌ enabledResources: ${er.error}\n`);
  } else {
    if (er.arrayMismatch.length) {
      hasError = true;
      console.log(`❌ enabledResources array mismatch vs upstream:`);
      for (const { category, onlyInSrc, onlyInDst } of er.arrayMismatch) {
        console.log(`   • ${category}: only in src=[${onlyInSrc.join(', ')}], only in dst=[${onlyInDst.join(', ')}]`);
      }
      console.log('');
    }
    if (er.unresolved.length) {
      hasError = true;
      console.log(`❌ enabledResources entries with no tool file and not in CUSTOM_RESOURCES (${er.unresolved.length}):`);
      for (const name of er.unresolved) console.log(`   • ${name}`);
      console.log('');
    }
    console.log(`ℹ️  enabledResources counts: full=${er.counts.full}, minimal=${er.counts.minimal}, code=${er.counts.code}, excludedFromGeneration=${er.counts.excludedFromGeneration}`);
    console.log('');
  }

  console.log(`✅ ${results.matched} file(s) matched upstream after import rewrites.`);
  console.log('');

  if (!hasError) {
    console.log('✅ All sync-PR checks passed.');
  } else {
    console.log('❌ Sync-PR validation found issues. See above.');
  }
  return hasError;
}

function main() {
  if (!fs.existsSync(SOURCE_ROOT)) {
    console.error(`❌ Source repo not found at ${SOURCE_ROOT}. Set SOURCE_REPO env var.`);
    process.exit(2);
  }
  const results = {
    coverage: { missingTarget: [], missingSource: [], missingSourceDir: [] },
    extraneous: [],
    forbidden: [],
    drift: [],
    matched: 0,
    enabledResources: { counts: {}, arrayMismatch: [], unresolved: [], error: null },
  };
  walkMappings(results);
  checkEnabledResources(results);
  const hasError = printReport(results);
  process.exit(hasError ? 1 : 0);
}

main();
