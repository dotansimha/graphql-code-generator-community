import { ClientSideBasePluginConfig } from "@graphql-codegen/visitor-plugin-common";

export interface SolidUrqlPluginConfig extends ClientSideBasePluginConfig {
  withPrimitives: boolean;
  urqlImportFrom: string;
}
