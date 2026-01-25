import { ClientSideBasePluginConfig } from "@graphql-codegen/visitor-plugin-common";

export interface SolidStartUrqlPluginConfig extends ClientSideBasePluginConfig {
  withPrimitives: boolean;
  urqlImportFrom: string;
}
