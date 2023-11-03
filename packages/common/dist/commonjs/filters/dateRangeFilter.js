"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangeFilter = void 0;
const dateFilter_1 = require("./dateFilter");
class DateRangeFilter extends dateFilter_1.DateFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this.inputFilterType = 'range';
    }
}
exports.DateRangeFilter = DateRangeFilter;
//# sourceMappingURL=dateRangeFilter.js.map