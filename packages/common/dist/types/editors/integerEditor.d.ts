import type { EditorArguments, EditorValidationResult } from '../interfaces/index';
import { InputEditor } from './inputEditor';
export declare class IntegerEditor extends InputEditor {
    protected readonly args: EditorArguments;
    constructor(args: EditorArguments);
    /** Initialize the Editor */
    init(): void;
    loadValue(item: any): void;
    serializeValue(): string | number;
    validate(_targetElm?: any, inputValue?: any): EditorValidationResult;
    /** When the input value changes (this will cover the input spinner arrows on the right) */
    protected handleOnMouseWheel(event: KeyboardEvent): void;
}
//# sourceMappingURL=integerEditor.d.ts.map