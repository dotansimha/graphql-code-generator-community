/* eslint-disable import/no-extraneous-dependencies */
const prettierConfig = require('@theguild/prettier-config');

module.exports = {
  ...prettierConfig,
  overrides: [
    ...prettierConfig.overrides,
    {
      // fixes SyntaxError: Unexpected token (7:23)
      files: '*.flow.js',
      options: {
        importOrderParserPlugins: ['flow'],
      },
    },
  ],
};
