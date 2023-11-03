"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinAggregator = void 0;
const utils_1 = require("@slickgrid-universal/utils");
class MinAggregator {
    constructor(field) {
        this._isInitialized = false;
        this._isTreeAggregator = false;
        this._min = null;
        this._type = 'min';
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
        this._min = null;
        this._isInitialized = true;
        // when dealing with Tree Data structure, we also need to clear any parent totals
        this._isTreeAggregator = isTreeAggregator;
        if (isTreeAggregator) {
            if (!item.__treeTotals) {
                item.__treeTotals = {};
            }
            if (item.__treeTotals[this._type] === undefined) {
                item.__treeTotals[this._type] = {};
            }
            item.__treeTotals[this._type][this._field] = null;
        }
    }
    accumulate(item, isTreeParent = false) {
        const val = (item === null || item === void 0 ? void 0 : item.hasOwnProperty(this._field)) ? item[this._field] : null;
        // when dealing with Tree Data structure, we need keep only the new min (without doing any addition)
        if (!this._isTreeAggregator) {
            // not a Tree structure, we'll do a regular minimation
            this.keepMinValueWhenFound(val);
        }
        else {
            if (isTreeParent) {
                if (!item.__treeTotals) {
                    item.__treeTotals = {};
                }
                this.addGroupTotalPropertiesWhenNotExist(item.__treeTotals);
                const parentMin = item.__treeTotals[this._type][this._field] !== null ? parseFloat(item.__treeTotals[this._type][this._field]) : null;
                if (parentMin !== null && (0, utils_1.isNumber)(parentMin) && (this._min === null || parentMin < this._min)) {
                    this._min = parentMin;
                }
            }
            else if ((0, utils_1.isNumber)(val)) {
                this.keepMinValueWhenFound(val);
            }
        }
    }
    storeResult(groupTotals) {
        let min = this._min;
        this.addGroupTotalPropertiesWhenNotExist(groupTotals);
        // when dealing with Tree Data, we also need to take the parent's total and add it to the final min
        if (this._isTreeAggregator && min !== null) {
            const parentMin = groupTotals[this._type][this._field];
            if ((0, utils_1.isNumber)(parentMin) && parentMin < min) {
                min = parentMin;
            }
        }
        groupTotals[this._type][this._field] = min;
    }
    addGroupTotalPropertiesWhenNotExist(groupTotals) {
        if (groupTotals[this._type] === undefined) {
            groupTotals[this._type] = {};
        }
    }
    keepMinValueWhenFound(val) {
        if (val !== null && val !== '' && !isNaN(val)) {
            if (this._min === null || val < this._min) {
                this._min = parseFloat(val);
            }
        }
    }
}
exports.MinAggregator = MinAggregator;
//# sourceMappingURL=minAggregator.js.map