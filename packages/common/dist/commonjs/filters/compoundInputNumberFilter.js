"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundInputNumberFilter = void 0;
const inputFilter_1 = require("./inputFilter");
class CompoundInputNumberFilter extends inputFilter_1.InputFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputType = 'number';
        this.inputFilterType = 'compound';
    }
}
exports.CompoundInputNumberFilter = CompoundInputNumberFilter;
//# sourceMappingURL=compoundInputNumberFilter.js.map