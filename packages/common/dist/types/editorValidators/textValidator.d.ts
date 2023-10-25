import type { EditorValidationResult } from '../interfaces/editorValidationResult.interface';
import type { EditorValidator } from '../interfaces/editorValidator.interface';
interface TextValidatorOptions {
    editorArgs: any;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    operatorConditionalType?: 'inclusive' | 'exclusive';
    required?: boolean;
    validator?: EditorValidator;
}
export declare function textValidator(inputValue: any, options: TextValidatorOptions): EditorValidationResult;
export {};
//# sourceMappingURL=textValidator.d.ts.map