import { type Formatter } from './../interfaces/index';
/**
 * You can pipe multiple formatters (executed in sequence), use params to pass the list of formatters.
 * Requires to pass an array of "formatters" in the column definition the generic "params" property
 * For example::
 * { field: 'title', formatter: Formatters.multiple, params: { formatters: [ Formatters.lowercase, Formatters.uppercase ] }
 */
export declare const multipleFormatter: Formatter;
//# sourceMappingURL=multipleFormatter.d.ts.map