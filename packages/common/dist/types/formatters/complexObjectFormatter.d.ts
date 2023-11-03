import type { Formatter } from './../interfaces/index';
/**
 * Takes a complex data object and return the data under that property (for example: "user.firstName" will return the first name "John")
 * You can pass the complex structure in the "field" (field: "user.firstName") or in the "params" (labelKey: "firstName", params: { complexField: "user" }) properties.
 * For example::
 * this.columnDefs = [{ id: 'username', field: 'user.firstName', ... }]
 * OR this.columnDefs = [{ id: 'username', field: 'user', labelKey: 'firstName', params: { complexField: 'user' }, ... }]
 * OR this.columnDefs = [{ id: 'username', field: 'user', params: { complexField: 'user.firstName' }, ... }]
 */
export declare const complexObjectFormatter: Formatter;
//# sourceMappingURL=complexObjectFormatter.d.ts.map