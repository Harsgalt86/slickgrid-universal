import type { EditorArguments, EditorValidationResult } from '../interfaces/index';
import { InputEditor } from './inputEditor';
export declare class FloatEditor extends InputEditor {
    protected readonly args: EditorArguments;
    constructor(args: EditorArguments);
    /** Initialize the Editor */
    init(): void;
    getDecimalPlaces(): number;
    getInputDecimalSteps(): string;
    loadValue(item: any): void;
    serializeValue(): string | number;
    validate(_targetElm?: any, inputValue?: any): EditorValidationResult;
    /** When the input value changes (this will cover the input spinner arrows on the right) */
    protected handleOnMouseWheel(event: KeyboardEvent): void;
}
//# sourceMappingURL=floatEditor.d.ts.map