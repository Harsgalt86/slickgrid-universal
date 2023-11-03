import type { ColumnEditor } from '../interfaces/index';
/**
 * Get option from editor.params PR editor.editorOptions
 * @deprecated this should be removed when slider editorParams are replaced by editorOptions
 */
export declare function getEditorOptionByName<T, K extends keyof T>(columnEditor: ColumnEditor, optionName: K, defaultValue?: any, editorName?: string): T[K] | undefined;
//# sourceMappingURL=editorUtilities.d.ts.map