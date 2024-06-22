const { resolve } = require('path');
const { pathsToModuleNameMapper } = require('ts-jest');

const ROOT_DIR = __dirname;
const TSCONFIG = resolve(ROOT_DIR, 'tsconfig.json');
const tsconfig = require(TSCONFIG);
const CI = !!process.env.CI;

module.exports = ({ dirname, projectMode = true }) => {
  const pkg = require(resolve(dirname, 'package.json'));

  return {
    ...(CI || !projectMode ? {} : { displayName: pkg.name.replace('@graphql-codegen/', '') }),
    transform: { '^.+\\.tsx?$': 'babel-jest' },
    testEnvironment: 'node',
    rootDir: dirname,
    restoreMocks: true,
    reporters: ['default'],
    modulePathIgnorePatterns: ['dist', '.bob'],
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
      prefix: `${ROOT_DIR}/`,
    }),
    cacheDirectory: resolve(ROOT_DIR, `.cache/jest`),
    setupFiles: [`${ROOT_DIR}/dev-test/setup.js`],
    collectCoverage: false,
    testTimeout: 20000,
    resolver: require.resolve('bob-the-bundler/jest-resolver'),
    snapshotFormat: {
      escapeString: false,
      printBasicPrototype: false,
    },
  };
};
