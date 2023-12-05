import * as fs from 'fs';
import { buildClientSchema, parse } from 'graphql/index';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index';

const PATH = 'packages/plugins/typescript/graceful-graphql-interfaces/tests/';

describe('Graceful graphql interfaces', () => {
  let spyConsoleError: jest.SpyInstance;
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

  // create copy of outputTemplate.tsx because we are going to modify it
  beforeEach(() => {
    fs.copyFile(PATH + 'outputTemplate.tsx', PATH + 'output.tsx', err => {
      if (err) throw err;
    });
    spyConsoleError = jest.spyOn(console, 'warn');
    spyConsoleError.mockImplementation();
  });

  afterEach(() => {
    fs.unlink(PATH + 'output.tsx', err => {
      if (err) throw err;
    });
    spyConsoleError.mockRestore();
  });

  const schema = buildClientSchema(
    require('../../../../../dev-test/graceful-interfaces/schema.json'),
  );

  it('should include all templates', async () => {
    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([
      (await plugin(
        schema,
        docs,
        { forEntities: ['Character'] },
        {
          outputFile: PATH + 'output.tsx',
        },
      )) as Types.PluginOutput,
    ]);

    fs.writeFileSync(PATH + 'debug.tsx', '');
    fs.appendFileSync(PATH + 'debug.tsx', content);

    expect(content).toBeDefined();
    expect(content).toContain(
      'const isEntityOfType = <T,>(entity: any, typename: string): entity is T => entity.__typename === typename;',
    );
    expect(content).toContain('return entities.reduce<T[]>((filteredEntities, item) => {\n');
    expect(content).toContain(
      'const getEntitiesByType = <T,>(entities: any[], typename: string): T[] => {',
    );
    expect(content).toContain('export type CharacterType = Character & { __typename?: string };');
    expect(content).toContain('type HeroStateTemplate<QueryType, TypeName> = QueryType extends {');
  });

  it('should include type guards', async () => {
    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([
      (await plugin(
        schema,
        docs,
        { forEntities: ['Character'] },
        {
          outputFile: PATH + 'output.tsx',
        },
      )) as Types.PluginOutput,
    ]);

    expect(content).toContain('export const isCharacterOfHeroDetailsQueryHuman');
    expect(content).toContain('export const isCharacterOfHeroDetailsQueryDroid');
  });

  it('should not include type guards if configured', async () => {
    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([
      (await plugin(
        schema,
        docs,
        { forEntities: ['Character'], withTypeGuards: false },
        {
          outputFile: PATH + 'output.tsx',
        },
      )) as Types.PluginOutput,
    ]);

    expect(content).not.toContain('export const isCharacterOfHeroDetailsQueryHuman');
    expect(content).not.toContain('export const isCharacterOfHeroDetailsQueryDroid');
  });

  it('should not include exported base types for queried types by default', async () => {
    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([
      (await plugin(
        schema,
        docs,
        { forEntities: ['Character'] },
        {
          outputFile: PATH + 'output.tsx',
        },
      )) as Types.PluginOutput,
    ]);

    expect(content).not.toContain('export type Human =');
    expect(content).not.toContain('export type Droid =');
    expect(content).toContain('type Human =');
    expect(content).toContain('type Droid =');
  });

  it('should include exported base types for queried types if configured', async () => {
    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([
      (await plugin(
        schema,
        docs,
        { forEntities: ['Character'], withExportedBaseTypes: true },
        {
          outputFile: PATH + 'output.tsx',
        },
      )) as Types.PluginOutput,
    ]);

    expect(content).toContain('export type Human =');
    expect(content).toContain('export type Droid =');
  });

  it('should throw an error if no entities are configured', async () => {
    const docs = [{ location: '', document: basicDoc }];

    expect(() =>
      plugin(
        schema,
        docs,
        {},
        {
          outputFile: PATH + 'output.tsx',
        },
      ),
    ).toThrowError();
  });

  it('should include helper functions by defaults', async () => {
    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([
      (await plugin(
        schema,
        docs,
        { forEntities: ['Character'] },
        {
          outputFile: PATH + 'output.tsx',
        },
      )) as Types.PluginOutput,
    ]);

    expect(content).toContain(
      'export const getHumanOfHeroDetailsQueryOfCharacters = (characters?: HeroOfHeroDetailsQuery[]): HumanOfHeroDetailsQuery[] => {',
    );
    expect(content).toContain(
      'export const getDroidOfHeroDetailsQueryOfCharacters = (characters?: HeroOfHeroDetailsQuery[]): DroidOfHeroDetailsQuery[] => {',
    );
  });

  it('should not include helper functions if configured', async () => {
    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([
      (await plugin(
        schema,
        docs,
        { forEntities: ['Character'], withHelperFunctions: false },
        {
          outputFile: PATH + 'output.tsx',
        },
      )) as Types.PluginOutput,
    ]);

    expect(content).not.toContain(
      'export const getHumanOfHeroDetailsQueryOfCharacters = (characters?: HeroOfHeroDetailsQuery[]): HumanOfHeroDetailsQuery[] => {',
    );
    expect(content).not.toContain(
      'export const getDroidOfHeroDetailsQueryOfCharacters = (characters?: HeroOfHeroDetailsQuery[]): DroidOfHeroDetailsQuery[] => {',
    );
  });

  it('should include query name discriminator by default', async () => {
    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([
      (await plugin(
        schema,
        docs,
        { forEntities: ['Character'] },
        {
          outputFile: PATH + 'output.tsx',
        },
      )) as Types.PluginOutput,
    ]);

    expect(content).toContain("__queryName: 'HeroDetailsQuery',");
  });

  it('should not include query name discriminator if configured', async () => {
    const docs = [{ location: '', document: basicDoc }];

    const content = mergeOutputs([
      (await plugin(
        schema,
        docs,
        { forEntities: ['Character'], withQueryNameDiscriminator: false },
        {
          outputFile: PATH + 'output.tsx',
        },
      )) as Types.PluginOutput,
    ]);

    expect(content).not.toContain("__queryName: 'HeroDetailsQuery',");
  });

  // TODO: add tests for typeDepth config
});
