import type { Formatter } from './../interfaces/index';
/**
 * Roughly the same as the "collectionFormatter" except that it
 * looks up values from the columnDefinition.editor.collection (instead of params) property and displays the label in CSV or string format
 * @example
 * // the grid will display 'foo' and 'bar' and not 1 and 2 from your dataset
 * { editor: { collection: [{ value: 1, label: 'foo'}, {value: 2, label: 'bar' }] }}
 * const dataset = [1, 2];
 */
export declare const collectionEditorFormatter: Formatter;
//# sourceMappingURL=collectionEditorFormatter.d.ts.map