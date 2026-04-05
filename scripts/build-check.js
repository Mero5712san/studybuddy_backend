const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', 'uploads']);

function collectJsFiles(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) {
                files.push(...collectJsFiles(fullPath));
            }
            continue;
        }

        if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }

    return files;
}

function runNodeCheck(filePath) {
    const result = spawnSync(process.execPath, ['--check', filePath], {
        stdio: 'inherit',
        cwd: ROOT,
    });

    return result.status === 0;
}

function main() {
    const jsFiles = collectJsFiles(ROOT);

    if (jsFiles.length === 0) {
        console.log('No JavaScript files found to validate.');
        return;
    }

    let hasError = false;

    for (const filePath of jsFiles) {
        const ok = runNodeCheck(filePath);
        if (!ok) {
            hasError = true;
        }
    }

    if (hasError) {
        console.error('Build check failed: syntax errors found.');
        process.exit(1);
    }

    console.log(`Build check passed: ${jsFiles.length} JavaScript files validated.`);
}

main();
