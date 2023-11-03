import type { Formatter } from './../interfaces/index';
/**
 * Looks up values from the columnDefinition.params.collection property and displays the label in CSV or string format
 * @example
 * // the grid will display 'foo' and 'bar' and not 1 and 2 from your dataset
 * { params: { collection: [{ value: 1, label: 'foo'}, {value: 2, label: 'bar' }] }}
 * const dataset = [1, 2];
 */
export declare const collectionFormatter: Formatter;
//# sourceMappingURL=collectionFormatter.d.ts.map