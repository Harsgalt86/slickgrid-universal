import type { Formatter } from './../interfaces/index';
/**
 * Takes an array of complex objects converts it to a comma delimited string.
 * Requires to pass an array of "propertyNames" in the column definition the generic "params" property
 * For example, if we have an array of user objects that have the property of firstName & lastName then we need to pass in your column definition::
 * params: { propertyNames: ['firtName', 'lastName'] } => 'John Doe, Jane Doe'
 */
export declare const arrayObjectToCsvFormatter: Formatter;
//# sourceMappingURL=arrayObjectToCsvFormatter.d.ts.map