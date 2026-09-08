#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const MANIFESTS = [
    'manifest-minimal.json',
    'manifest-full.json',
    'manifest-code.json',
    'manifest-learn.json',
];

const versionType = process.argv[2];
if (!versionType) {
    console.error('Usage: pnpm run release-custom <major|minor|patch|version>');
    console.error('Examples:');
    console.error('  pnpm run release-custom patch');
    console.error('  pnpm run release-custom minor');
    console.error('  pnpm run release-custom 2.3.3');
    console.error('  pnpm run release-custom 2.4.0-beta.1');
    process.exit(1);
}

function incrementVersion(currentVersion, type) {
    // Clean the version string: remove 'v' prefix and prerelease suffix (e.g. -beta.1)
    const cleanVersion = currentVersion.replace(/^v/, '').replace(/-.*$/, '');
    const parts = cleanVersion.split('.');

    if (parts.length !== 3) {
        throw new Error(`Invalid version format: ${currentVersion}. Expected format: x.y.z`);
    }

    const [major, minor, patch] = parts.map(part => {
        const num = parseInt(part, 10);
        if (isNaN(num)) {
            throw new Error(`Invalid version part: ${part} in version ${currentVersion}`);
        }
        return num;
    });

    console.log(`🔍 Current version parts: major=${major}, minor=${minor}, patch=${patch}`);

    switch (type) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            // Validate specific version format (supports prerelease like 1.2.3-beta.1)
            if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(type)) {
                throw new Error(`Invalid version format: ${type}. Use 'major', 'minor', 'patch', or a version like '1.2.3' or '1.2.3-beta.1'`);
            }
            return type;
    }
}

try {
    // Read current version
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const currentVersion = pkg.version;
    const newVersion = incrementVersion(currentVersion, versionType);
    const isPrerelease = newVersion.includes('-');

    console.log(`📦 Updating version from ${currentVersion} to ${newVersion}`);
    if (isPrerelease) {
        console.log('🔶 Prerelease detected — only package.json and lockfile will be updated');
    }

    // Update package.json version
    pkg.version = newVersion;
    writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

    // Update pnpm-lock.yaml version
    console.log('🔒 Updating pnpm-lock.yaml...');
    execSync('pnpm install --lockfile-only', { stdio: 'inherit' });

    // Build project
    console.log('🔨 Building project...');
    execSync('pnpm run build', { stdio: 'inherit' });

    if (!isPrerelease) {
        // Update manifest versions
        console.log('📝 Updating manifest files...');
        const updateManifest = (file) => {
            const manifest = JSON.parse(readFileSync(file, 'utf8'));
            manifest.version = newVersion;
            writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
        };

        MANIFESTS.forEach(updateManifest);

        // Bump the version fields in server.json. The mcpb fileSha256 hashes are
        // deliberately NOT touched here: 'mcpb pack' is not byte-reproducible, so a
        // hash computed on this machine would never match the artifact the release
        // workflow uploads. CI recomputes them from the uploaded files instead.
        console.log('📝 Updating server.json...');
        execSync(`node scripts/update-server-json.js ${newVersion}`, { stdio: 'inherit' });
    }

    // Commit and tag. Stage only the paths a release actually touches -- a bare
    // 'git add .' sweeps any stray untracked file in the tree into the release
    // commit.
    const releasePaths = ['package.json', 'pnpm-lock.yaml', 'dist', 'server.json', ...MANIFESTS];
    execSync(`git add -- ${releasePaths.join(' ')}`, { stdio: 'inherit' });
    execSync(`git commit -m "chore: v${newVersion}"`, { stdio: 'inherit' });

    if (isPrerelease) {
        console.log('📤 Committed (no tag for prerelease)');
        console.log(`✅ Prerelease version ${newVersion} ready`);
        console.log(`🚀 Push with: git push origin main`);
    } else {
        console.log('📤 Committing and tagging...');
        execSync(`git tag -a v${newVersion} -m "v${newVersion}"`, { stdio: 'inherit' });
        console.log(`✅ Released version ${newVersion}`);
        console.log(`🚀 Push with: git push origin main --tags`);
    }
} catch (error) {
    console.error('❌ Release failed:', error.message);
    process.exit(1);
}