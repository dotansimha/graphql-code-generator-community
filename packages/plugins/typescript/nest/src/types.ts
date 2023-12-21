export type DecoratorConfig = {
  type: string;
  interface: string;
  field: string;
  input: string;
  arguments: string;
};

export type DecoratorOptions = {
  nullable?: string;
  description?: string;
  implements?: string;
};

export interface Type {
  type: string;
  isNullable: boolean;
  isArray: boolean;
  isScalar: boolean;
  isItemsNullable: boolean;
}
