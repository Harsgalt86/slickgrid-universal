import type { EditorValidationResult } from '../interfaces/editorValidationResult.interface';
import type { EditorValidator } from '../interfaces/editorValidator.interface';
interface FloatValidatorOptions {
    editorArgs: any;
    decimal?: number;
    errorMessage?: string;
    minValue?: string | number;
    maxValue?: string | number;
    operatorConditionalType?: 'inclusive' | 'exclusive';
    required?: boolean;
    validator?: EditorValidator;
}
export declare function floatValidator(inputValue: any, options: FloatValidatorOptions): EditorValidationResult;
export {};
//# sourceMappingURL=floatValidator.d.ts.map