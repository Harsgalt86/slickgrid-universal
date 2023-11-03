"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundDateFilter = void 0;
const dateFilter_1 = require("./dateFilter");
class CompoundDateFilter extends dateFilter_1.DateFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputFilterType = 'compound';
    }
}
exports.CompoundDateFilter = CompoundDateFilter;
//# sourceMappingURL=compoundDateFilter.js.map