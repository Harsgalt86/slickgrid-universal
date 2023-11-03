import { InputFilter } from './inputFilter';
export class InputPasswordFilter extends InputFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputType = 'password';
    }
}
//# sourceMappingURL=inputPasswordFilter.js.map