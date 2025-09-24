#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const versionType = process.argv[2];
if (!versionType) {
    console.error('Usage: npm run release-custom <major|minor|patch|version>');
    console.error('Examples:');
    console.error('  npm run release-custom patch');
    console.error('  npm run release-custom minor');
    console.error('  npm run release-custom 2.3.3');
    process.exit(1);
}

function incrementVersion(currentVersion, type) {
    // Clean the version string and split
    const cleanVersion = currentVersion.replace(/^v/, ''); // Remove 'v' prefix if present
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
            // Validate specific version format
            if (!/^\d+\.\d+\.\d+$/.test(type)) {
                throw new Error(`Invalid version format: ${type}. Use 'major', 'minor', 'patch', or a version like '1.2.3'`);
            }
            return type;
    }
}

try {
    // Read current version
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const currentVersion = pkg.version;
    const newVersion = incrementVersion(currentVersion, versionType);

    console.log(`📦 Updating version from ${currentVersion} to ${newVersion}`);

    // Update package.json version
    pkg.version = newVersion;
    writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

    // Update package-lock.json version
    console.log('🔒 Updating package-lock.json...');
    execSync('npm install --package-lock-only', { stdio: 'inherit' });

    // Build project
    console.log('🔨 Building project...');
    execSync('npm run build', { stdio: 'inherit' });

    // Update manifest versions
    console.log('📝 Updating manifest files...');
    const updateManifest = (file) => {
        const manifest = JSON.parse(readFileSync(file, 'utf8'));
        manifest.version = newVersion;
        writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
    };

    updateManifest('manifest-full.json');
    updateManifest('manifest-minimal.json');

    // Commit and tag
    console.log('📤 Committing and tagging...');
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "chore: v${newVersion}"`, { stdio: 'inherit' });
    execSync(`git tag -a v${newVersion} -m "v${newVersion}"`, { stdio: 'inherit' });

    console.log(`✅ Released version ${newVersion}`);
    console.log(`🚀 Push with: git push origin main --tags`);
} catch (error) {
    console.error('❌ Release failed:', error.message);
    process.exit(1);
}