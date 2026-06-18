import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('React Query - fragments', () => {
  it('generates TypedDocumentString for fragments correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        say: Something
      }

      type Something {
        id: ID!
      }
    `);

    const document = parse(/* GraphQL */ `
      fragment SomethingFrag on Something {
        id
      }
    `);

    const { content } = await plugin(schema, [{ document }], {});

    expect(content).toMatchInlineSnapshot(`
      "
      export class TypedDocumentString<TResult, TVariables>
        extends String
        implements DocumentTypeDecoration<TResult, TVariables>
      {
        __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
        private value: string;
        public __meta__?: Record<string, any> | undefined;

        constructor(value: string, __meta__?: Record<string, any> | undefined) {
          super(value);
          this.value = value;
          this.__meta__ = __meta__;
        }

        override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
          return this.value;
        }
      }
      export const SomethingFragFragmentDoc = new TypedDocumentString(\`
          fragment SomethingFrag on Something {
        id
      }
          \`, {"fragmentName":"SomethingFrag"});"
    `);
  });
});
