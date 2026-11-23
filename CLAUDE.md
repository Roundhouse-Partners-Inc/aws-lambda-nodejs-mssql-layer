# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AWS Lambda Layer providing the `mssql` npm package for SQL Server connectivity in Node.js Lambda functions. The build produces a zip per Node.js version containing only `node_modules` — no application code.

## Build Commands

```bash
# Build layer for default Node.js version (22)
./build.sh

# Build for a specific version
./build.sh 20

# Output: dist/nodejs-mssql-layer-node{VERSION}.zip
```

Requires Docker. Builds target `linux/amd64` using AWS Lambda base images from `public.ecr.aws/lambda/nodejs`.

## Testing

Tests require a running SQL Server instance. Run these database tests on the XPS or in CI -- never start Docker (or a SQL Server container) on the Mac; a guard hook refuses local container starts.

- **Preferred:** push a branch or open a PR. The `test` job in `.github/workflows/build-and-release.yml` runs `test/connection-test.js` against a SQL Server service container for every runtime in `versions.json`.
- **Interactive:** use the XPS test copy for this repo (see Roundhouse-Infrastructure `docs/xps-github-runners.md`) and run the test there against its SQL Server:

```bash
# On the XPS, not the Mac (set NODE_PATH if testing against the built layer)
DB_SERVER=127.0.0.1 DB_USER=sa DB_PWD='<sa password>' DB_NAME=master \
  node test/connection-test.js
```

There is no test framework — `test/connection-test.js` is a standalone script that exits 0/1.

## Architecture

- **`versions.json`** — Source of truth for supported Node.js runtimes. CI reads this to build a matrix. Update this file to add/remove runtime support.
- **`Dockerfile`** — Multi-stage build. Stage 1 installs native build tools (auto-detects AL2 yum vs AL2023 dnf) and runs `npm ci --production`. Stage 2 copies the built `node_modules` to `/opt/nodejs`.
- **`build.sh`** — Wraps Docker build + extract into a zip. Takes Node.js version as argument.
- **`package.json`** — Single dependency: `mssql`. The lockfile pins transitive deps (~50 packages including tedious, Azure identity SDK).

## CI/CD & Releases

Three GitHub Actions workflows:

1. **`build-and-release.yml`** — Builds and tests on push to main. On version tags (`v*.*.*`), also creates a GitHub Release and publishes layers to AWS (Production account via OIDC chain through SharedServices).
2. **`check-updates.yml`** — Weekly cron checks for new Lambda runtimes and mssql versions; opens a PR if changes found.
3. **`dependabot-auto-merge.yml`** — Auto-merges minor/patch dependabot PRs.

**To release:** Create and push a version tag (e.g., `git tag v1.2.0 && git push origin v1.2.0`).

## AWS Publishing Targets

Layers publish to Production via OIDC role chaining:
- Production (344349181969)

Authentication: GitHub OIDC → SharedServices (386930771048) `GitHubActionsDeployRole` → target account `GitHubActionsCrossAccountRole`.
