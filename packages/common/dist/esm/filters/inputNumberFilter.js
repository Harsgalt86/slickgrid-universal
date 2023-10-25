import { InputFilter } from './inputFilter';
export class InputNumberFilter extends InputFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputType = 'number';
    }
}
//# sourceMappingURL=inputNumberFilter.js.map