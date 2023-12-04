import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeGuardRawPluginConfig extends RawClientSideBasePluginConfig {
  forEntities?: string[];
  withHelperFunctions?: boolean;
  withTypeGuards?: boolean;
  withExportedBaseTypes?: boolean;
  withQueryNameDiscriminator?: boolean;
  typeDepth?: number;
}
