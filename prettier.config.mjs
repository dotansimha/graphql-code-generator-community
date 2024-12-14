/* eslint-disable import/no-extraneous-dependencies */
import prettierConfig from '@theguild/prettier-config';

export default {
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
