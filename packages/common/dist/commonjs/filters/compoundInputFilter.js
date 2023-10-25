"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundInputFilter = void 0;
const inputFilter_1 = require("./inputFilter");
class CompoundInputFilter extends inputFilter_1.InputFilter {
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
exports.CompoundInputFilter = CompoundInputFilter;
//# sourceMappingURL=compoundInputFilter.js.map