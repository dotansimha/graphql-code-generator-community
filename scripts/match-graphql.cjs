const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const { argv, cwd } = require('process');

const pkgPath = resolve(cwd(), './package.json');
const workspacePath = resolve(cwd(), './pnpm-workspace.yaml');

const pkg = require(pkgPath);
const workspace = readFileSync(workspacePath, 'utf8');

const version = argv[2];

// Matches the `graphql` entry of `overrides` in pnpm-workspace.yaml, e.g.
// "  graphql: 16.13.2" -> currentVersion "16.13.2"
// "  graphql: '^17'"   -> currentVersion "^17"
const graphqlOverridePattern = /^ {2}graphql: '?([^'\n]+)'?$/m;
const graphqlOverride = workspace.match(graphqlOverridePattern);
if (!graphqlOverride) {
  throw new Error(`Cannot find the graphql override in ${workspacePath}`);
}

const currentVersion = graphqlOverride[1];
if (currentVersion.startsWith(version)) {
  // eslint-disable-next-line no-console
  console.info(`GraphQL v${version} is match! Skipping.`);
  process.exit(0);
}

const npmVersion = version.includes('-') ? version : `^${version}`;
pkg.devDependencies.graphql = npmVersion;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
writeFileSync(
  workspacePath,
  workspace.replace(graphqlOverridePattern, `  graphql: '${npmVersion}'`),
  'utf8',
);
