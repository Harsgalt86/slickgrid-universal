"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleSelectFilter = void 0;
const selectFilter_1 = require("./selectFilter");
class MultipleSelectFilter extends selectFilter_1.SelectFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService, collectionService, rxjs) {
        super(translaterService, collectionService, rxjs, true);
        this.translaterService = translaterService;
        this.collectionService = collectionService;
        this.rxjs = rxjs;
    }
}
exports.MultipleSelectFilter = MultipleSelectFilter;
//# sourceMappingURL=multipleSelectFilter.js.map