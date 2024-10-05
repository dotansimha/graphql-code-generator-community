export type ClassTransformerDecoratorConfig = {
  declarationKind?: 'class';
  // List of classes to decorate
  classWhitelist?: string[];
  // RegExp pattern of classes to decorate
  classNamePattern?: string;
};
