import type { EditorValidationResult } from '../interfaces/editorValidationResult.interface';
import type { EditorValidator } from '../interfaces/editorValidator.interface';
interface SliderValidatorOptions {
    editorArgs: any;
    errorMessage?: string;
    minValue?: string | number;
    maxValue?: string | number;
    required?: boolean;
    validator?: EditorValidator;
}
export declare function sliderValidator(inputValue: any, options: SliderValidatorOptions): EditorValidationResult;
export {};
//# sourceMappingURL=sliderValidator.d.ts.map