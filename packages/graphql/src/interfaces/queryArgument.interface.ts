export interface QueryArgument {
  field: string;
  value: string | number | boolean | (() => string | number | boolean);
}
