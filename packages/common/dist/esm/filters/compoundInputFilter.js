import { InputFilter } from './inputFilter';
export class CompoundInputFilter extends InputFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputType = 'text';
        this.inputFilterType = 'compound';
    }
}
//# sourceMappingURL=compoundInputFilter.js.map