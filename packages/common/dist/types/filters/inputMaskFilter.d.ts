import { InputFilter } from './inputFilter';
import type { FilterArguments } from '../interfaces/filterArguments.interface';
import type { TranslaterService } from '../services/translater.service';
export declare class InputMaskFilter extends InputFilter {
    protected readonly translaterService: TranslaterService;
    protected _inputMask: string;
    /** Initialize the Filter */
    constructor(translaterService: TranslaterService);
    /** Getter of the input mask, when provided */
    get inputMask(): string;
    /**
     * Override the Filter init used by SlickGrid
     */
    init(args: FilterArguments): void;
    /**
     * Event handler to cover the following (keyup, blur, change)
     * We will trigger the Filter Service callback from this handler
     */
    protected onTriggerEvent(event?: MouseEvent | KeyboardEvent, isClearFilterEvent?: boolean): void;
    /** From a regular string, we will use the mask to output a new string */
    protected maskValue(inputValue: string): string;
    /** From a masked string, we will remove the mask and make a regular string again */
    protected unmaskValue(maskedValue: string): string;
}
//# sourceMappingURL=inputMaskFilter.d.ts.map