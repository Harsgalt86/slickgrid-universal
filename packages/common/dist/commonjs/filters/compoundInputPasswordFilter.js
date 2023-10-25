"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundInputPasswordFilter = void 0;
const inputFilter_1 = require("./inputFilter");
class CompoundInputPasswordFilter extends inputFilter_1.InputFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputType = 'password';
        this.inputFilterType = 'compound';
    }
}
exports.CompoundInputPasswordFilter = CompoundInputPasswordFilter;
//# sourceMappingURL=compoundInputPasswordFilter.js.map