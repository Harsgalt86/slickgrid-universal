"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvgAggregator = void 0;
const utils_1 = require("@slickgrid-universal/utils");
class AvgAggregator {
    constructor(field) {
        this._isInitialized = false;
        this._isTreeAggregator = false;
        this._nonNullCount = 0;
        this._sum = 0;
        this._type = 'avg';
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
    init(item, isTreeAggregator = false) {
        this._sum = 0;
        this._nonNullCount = 0;
        this._isInitialized = true;
        // when dealing with Tree Data structure, we also need to keep sum & itemCount refs
        // also while calculating Avg Aggregator, we could in theory skip completely SumAggregator because we kept the sum already for calculations
        this._isTreeAggregator = isTreeAggregator;
        if (isTreeAggregator) {
            if (!item.__treeTotals) {
                item.__treeTotals = {};
            }
            if (item.__treeTotals[this._type] === undefined) {
                item.__treeTotals[this._type] = {};
                item.__treeTotals.sum = {};
                item.__treeTotals.count = {};
            }
            item.__treeTotals[this._type][this._field] = 0;
            item.__treeTotals['count'][this._field] = 0;
            item.__treeTotals['sum'][this._field] = 0;
        }
    }
    accumulate(item, isTreeParent = false) {
        var _a, _b;
        const val = (item === null || item === void 0 ? void 0 : item.hasOwnProperty(this._field)) ? item[this._field] : null;
        // when dealing with Tree Data structure, we need keep only the new sum (without doing any addition)
        if (!this._isTreeAggregator) {
            // not a Tree structure, we'll do a regular summation
            if (val !== null && val !== '' && !isNaN(val)) {
                this._nonNullCount++;
                this._sum += parseFloat(val);
            }
        }
        else {
            if (isTreeParent) {
                if (!item.__treeTotals) {
                    item.__treeTotals = {};
                }
                this.addGroupTotalPropertiesWhenNotExist(item.__treeTotals);
                this._sum = parseFloat((_a = item.__treeTotals['sum'][this._field]) !== null && _a !== void 0 ? _a : 0);
                this._nonNullCount = (_b = item.__treeTotals['count'][this._field]) !== null && _b !== void 0 ? _b : 0;
            }
            else if ((0, utils_1.isNumber)(val)) {
                this._sum = parseFloat(val);
                this._nonNullCount = 1;
            }
        }
    }
    storeResult(groupTotals) {
        let sum = this._sum;
        let itemCount = this._nonNullCount;
        this.addGroupTotalPropertiesWhenNotExist(groupTotals);
        // when dealing with Tree Data, we also need to take the parent's total and add it to the final sum
        if (this._isTreeAggregator) {
            sum += groupTotals['sum'][this._field];
            itemCount += groupTotals['count'][this._field];
            groupTotals['sum'][this._field] = sum;
            groupTotals['count'][this._field] = itemCount;
        }
        if (itemCount !== 0) {
            groupTotals[this._type][this._field] = itemCount === 0 ? sum : sum / itemCount;
        }
    }
    addGroupTotalPropertiesWhenNotExist(groupTotals) {
        if (groupTotals[this._type] === undefined) {
            groupTotals[this._type] = {};
        }
        if (this._isTreeAggregator && groupTotals['sum'] === undefined) {
            groupTotals['sum'] = {};
        }
        if (this._isTreeAggregator && groupTotals['count'] === undefined) {
            groupTotals['count'] = {};
        }
    }
}
exports.AvgAggregator = AvgAggregator;
//# sourceMappingURL=avgAggregator.js.map