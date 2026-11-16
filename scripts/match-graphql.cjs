const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const { argv, cwd } = require('process');
const yaml = require('js-yaml');

const pkgPath = resolve(cwd(), './package.json');
const workspacePath = resolve(cwd(), './pnpm-workspace.yaml');

const pkg = require(pkgPath);
const workspace = yaml.load(readFileSync(workspacePath, 'utf8'));

const version = argv[2];

const currentVersion = workspace.overrides?.graphql;
if (!currentVersion) {
  throw new Error(`Cannot find the graphql override in ${workspacePath}`);
}

if (String(currentVersion).startsWith(version)) {
  // eslint-disable-next-line no-console
  console.info(`GraphQL v${version} is match! Skipping.`);
  process.exit(0);
}

const npmVersion = version.includes('-') ? version : `^${version}`;
pkg.devDependencies.graphql = npmVersion;
workspace.overrides.graphql = npmVersion;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
writeFileSync(workspacePath, yaml.dump(workspace, { lineWidth: -1 }), 'utf8');
