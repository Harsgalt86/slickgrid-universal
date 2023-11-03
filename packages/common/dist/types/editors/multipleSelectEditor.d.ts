import type { EditorArguments } from '../interfaces/editorArguments.interface';
import { SelectEditor } from './selectEditor';
export declare class MultipleSelectEditor extends SelectEditor {
    protected readonly args: EditorArguments;
    delayOpening: number;
    /**
     * Initialize the Editor
     */
    constructor(args: EditorArguments, delayOpening?: number);
}
//# sourceMappingURL=multipleSelectEditor.d.ts.map