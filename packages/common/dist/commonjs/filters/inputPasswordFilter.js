"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputPasswordFilter = void 0;
const inputFilter_1 = require("./inputFilter");
class InputPasswordFilter extends inputFilter_1.InputFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputType = 'password';
    }
}
exports.InputPasswordFilter = InputPasswordFilter;
//# sourceMappingURL=inputPasswordFilter.js.map