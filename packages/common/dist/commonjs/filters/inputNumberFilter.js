"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputNumberFilter = void 0;
const inputFilter_1 = require("./inputFilter");
class InputNumberFilter extends inputFilter_1.InputFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputType = 'number';
    }
}
exports.InputNumberFilter = InputNumberFilter;
//# sourceMappingURL=inputNumberFilter.js.map