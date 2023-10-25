"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterFactory = void 0;
class FilterFactory {
    constructor(config, translaterService, collectionService, rxjs) {
        var _a, _b;
        this.config = config;
        this.translaterService = translaterService;
        this.collectionService = collectionService;
        this.rxjs = rxjs;
        this._options = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.options) !== null && _b !== void 0 ? _b : {};
    }
    addRxJsResource(rxjs) {
        this.rxjs = rxjs;
    }
    // Uses the User model to create a new User
    createFilter(columnFilter) {
        let filter;
        if (columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.model) {
            filter = typeof columnFilter.model === 'function' ? new columnFilter.model(this.translaterService, this.collectionService, this.rxjs) : columnFilter.model;
        }
        // fallback to the default filter
        if (!filter && this._options.defaultFilter) {
            filter = new this._options.defaultFilter(this.translaterService, this.collectionService, this.rxjs);
        }
        return filter;
    }
}
exports.FilterFactory = FilterFactory;
//# sourceMappingURL=filterFactory.js.map