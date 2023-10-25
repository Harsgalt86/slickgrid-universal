"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleSelectFilter = void 0;
const selectFilter_1 = require("./selectFilter");
class SingleSelectFilter extends selectFilter_1.SelectFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService, collectionService, rxjs) {
        super(translaterService, collectionService, rxjs, false);
        this.translaterService = translaterService;
        this.collectionService = collectionService;
        this.rxjs = rxjs;
    }
}
exports.SingleSelectFilter = SingleSelectFilter;
//# sourceMappingURL=singleSelectFilter.js.map