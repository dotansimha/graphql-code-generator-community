import {buildClientSchema, parse} from "graphql/index";
import {plugin} from "../src/index";
import {Types, mergeOutputs} from "@graphql-codegen/plugin-helpers";
import * as fs from "fs";

const PATH = 'packages/plugins/typescript/graceful-graphql-interfaces/tests/'

describe('Graceful graphql interfaces', () => {
  let spyConsoleError: jest.SpyInstance;
  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, 'warn');
    spyConsoleError.mockImplementation();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  const schema = buildClientSchema(require('../../../../../dev-test/graceful-interfaces/schema.json'));

  it('should do the THANG', async () => {
    const basicDoc = parse(/* GraphQL */ `
      query HeroDetails($episode: Episode) {
        hero(episode: $episode) {
          name
          ... on Human {
            height
          }
          ... on Droid {
            primaryFunction
          }
        }
      }
    `);

    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([ await plugin(
        schema,
        docs,
        { forEntities: ['Character'] },
        {
          outputFile: PATH + 'output.tsx',
        },
    ) as Types.PluginOutput]);

    fs.writeFileSync(PATH + 'debug.tsx', '');
    fs.appendFileSync(PATH + 'debug.tsx', content);
    expect(content).toBeDefined();
  });



  it('should work', () => {
    expect(true).toBe(true);
  });
});
