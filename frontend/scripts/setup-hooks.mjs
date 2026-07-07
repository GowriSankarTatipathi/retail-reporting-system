#!/usr/bin/env node
// Points git at frontend/.husky for its hooks. A plain `husky` install assumes
// the package it's run from sits at the repository root; here the frontend is
// a subfolder of a monorepo whose root is the Spring Boot backend, so we set
// core.hooksPath ourselves instead. Runs as the "prepare" lifecycle script on
// `npm install`, and is a harmless no-op in CI or outside a git checkout
// (e.g. when installing from a published tarball, or in a Docker build).
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

try {
  const gitRoot = execSync('git rev-parse --show-toplevel', {
    cwd: frontendDir,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();

  const hooksDir = resolve(frontendDir, '.husky');
  if (!existsSync(hooksDir)) {
    console.warn('[setup-hooks] frontend/.husky not found, skipping git hook setup.');
    process.exit(0);
  }

  const relativeHooksPath = relative(gitRoot, hooksDir);
  execSync(`git config core.hooksPath "${relativeHooksPath}"`, { cwd: gitRoot });
  console.log(`[setup-hooks] git core.hooksPath set to "${relativeHooksPath}".`);
} catch {
  // Not inside a git repository (fresh tarball install, some CI/Docker
  // build contexts) - nothing to hook into, so exit quietly and successfully.
  console.warn('[setup-hooks] not inside a git checkout, skipping git hook setup.');
  process.exit(0);
}
