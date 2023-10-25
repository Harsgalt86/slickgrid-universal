"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneAggregator = void 0;
class CloneAggregator {
    constructor(field) {
        this._isInitialized = false;
        this._type = 'clone';
        this._field = field;
    }
    get field() {
        return this._field;
    }
    get isInitialized() {
        return this._isInitialized;
    }
    get type() {
        return this._type;
    }
    init(_item, isTreeAggregator = false) {
        this._data = '';
        this._isInitialized = true;
        if (isTreeAggregator) {
            throw new Error('[Slickgrid-Universal] CloneAggregator is not currently supported for use with Tree Data');
        }
    }
    accumulate(item) {
        const val = (item && item.hasOwnProperty(this._field)) ? item[this._field] : null;
        if (val !== null && val !== '') {
            this._data = val;
        }
    }
    storeResult(groupTotals) {
        if (!groupTotals || groupTotals[this._type] === undefined) {
            groupTotals[this._type] = {};
        }
        groupTotals[this._type][this._field] = this._data;
    }
}
exports.CloneAggregator = CloneAggregator;
//# sourceMappingURL=cloneAggregator.js.map