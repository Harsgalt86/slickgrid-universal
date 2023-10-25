import { InputFilter } from './inputFilter';
export class CompoundInputPasswordFilter extends InputFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputType = 'password';
        this.inputFilterType = 'compound';
    }
}
//# sourceMappingURL=compoundInputPasswordFilter.js.map