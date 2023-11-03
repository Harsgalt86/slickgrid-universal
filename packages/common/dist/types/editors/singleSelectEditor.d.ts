import type { EditorArguments } from '../interfaces/editorArguments.interface';
import { SelectEditor } from './selectEditor';
export declare class SingleSelectEditor extends SelectEditor {
    protected readonly args: EditorArguments;
    delayOpening: number;
    /**
     * Initialize the Editor
     */
    constructor(args: EditorArguments, delayOpening?: number);
}
//# sourceMappingURL=singleSelectEditor.d.ts.map