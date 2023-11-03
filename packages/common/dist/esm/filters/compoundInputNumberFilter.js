import { InputFilter } from './inputFilter';
export class CompoundInputNumberFilter extends InputFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputType = 'number';
        this.inputFilterType = 'compound';
    }
}
//# sourceMappingURL=compoundInputNumberFilter.js.map