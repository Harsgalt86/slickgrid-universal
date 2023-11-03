import { isNumber } from '@slickgrid-universal/utils';
export class MaxAggregator {
    constructor(field) {
        this._isInitialized = false;
        this._isTreeAggregator = false;
        this._max = null;
        this._type = 'max';
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
        this._max = null;
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
        // when dealing with Tree Data structure, we need keep only the new max (without doing any addition)
        if (!this._isTreeAggregator) {
            // not a Tree structure, we'll do a regular maximation
            this.keepMaxValueWhenFound(val);
        }
        else {
            if (isTreeParent) {
                if (!item.__treeTotals) {
                    item.__treeTotals = {};
                }
                this.addGroupTotalPropertiesWhenNotExist(item.__treeTotals);
                const parentMax = item.__treeTotals[this._type][this._field] !== null ? parseFloat(item.__treeTotals[this._type][this._field]) : null;
                if (parentMax !== null && isNumber(parentMax) && (this._max === null || parentMax > this._max)) {
                    this._max = parentMax;
                }
            }
            else if (isNumber(val)) {
                this.keepMaxValueWhenFound(val);
            }
        }
    }
    storeResult(groupTotals) {
        let max = this._max;
        this.addGroupTotalPropertiesWhenNotExist(groupTotals);
        // when dealing with Tree Data, we also need to take the parent's total and add it to the final max
        if (this._isTreeAggregator && max !== null) {
            const parentMax = groupTotals[this._type][this._field];
            if (isNumber(parentMax) && parentMax > max) {
                max = parentMax;
            }
        }
        groupTotals[this._type][this._field] = max;
    }
    addGroupTotalPropertiesWhenNotExist(groupTotals) {
        if (groupTotals[this._type] === undefined) {
            groupTotals[this._type] = {};
        }
    }
    keepMaxValueWhenFound(val) {
        if (val !== null && val !== '' && !isNaN(val)) {
            if (this._max === null || val > this._max) {
                this._max = parseFloat(val);
            }
        }
    }
}
//# sourceMappingURL=maxAggregator.js.map