import type { EditorValidationResult } from '../interfaces/editorValidationResult.interface';
import type { EditorValidator } from '../interfaces/editorValidator.interface';
interface IntegerValidatorOptions {
    editorArgs: any;
    errorMessage?: string;
    minValue?: string | number;
    maxValue?: string | number;
    operatorConditionalType?: 'inclusive' | 'exclusive';
    required?: boolean;
    validator?: EditorValidator;
}
export declare function integerValidator(inputValue: any, options: IntegerValidatorOptions): EditorValidationResult;
export {};
//# sourceMappingURL=integerValidator.d.ts.map