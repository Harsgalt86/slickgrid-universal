import { isNumber } from '@slickgrid-universal/utils';
export class SumAggregator {
    constructor(field) {
        this._isInitialized = false;
        this._isTreeAggregator = false;
        this._sum = 0;
        this._itemCount = 0;
        this._type = 'sum';
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
        this._isTreeAggregator = isTreeAggregator;
        this._isInitialized = true;
        this._sum = 0;
        this._itemCount = 0;
        // when dealing with Tree Data structure, we also need to keep sum & itemCount refs
        if (isTreeAggregator) {
            if (!item.__treeTotals) {
                item.__treeTotals = {};
            }
            if (item.__treeTotals[this._type] === undefined) {
                item.__treeTotals[this._type] = {};
                item.__treeTotals.count = {};
            }
            item.__treeTotals['count'][this._field] = 0;
            item.__treeTotals[this._type][this._field] = 0;
        }
    }
    accumulate(item, isTreeParent = false) {
        var _a, _b;
        const val = (item === null || item === void 0 ? void 0 : item.hasOwnProperty(this._field)) ? item[this._field] : null;
        // when dealing with Tree Data structure, we need keep only the new sum (without doing any addition)
        if (!this._isTreeAggregator) {
            // not a Tree structure, we'll do a regular summation
            if (val !== null && val !== '' && !isNaN(val)) {
                this._sum += parseFloat(val);
            }
        }
        else {
            if (isTreeParent) {
                if (!item.__treeTotals) {
                    item.__treeTotals = {};
                }
                this.addGroupTotalPropertiesWhenNotExist(item.__treeTotals);
                this._sum = parseFloat((_a = item.__treeTotals[this._type][this._field]) !== null && _a !== void 0 ? _a : 0);
                this._itemCount = (_b = item.__treeTotals['count'][this._field]) !== null && _b !== void 0 ? _b : 0;
            }
            else if (isNumber(val)) {
                this._sum = parseFloat(val);
                this._itemCount = 1;
            }
        }
    }
    storeResult(groupTotals) {
        if (!groupTotals || groupTotals[this._type] === undefined) {
            groupTotals[this._type] = {};
        }
        this.addGroupTotalPropertiesWhenNotExist(groupTotals);
        let sum = this._sum;
        let itemCount = this._itemCount;
        // when dealing with Tree Data, we also need to take the parent's total and add it to the final sum
        if (this._isTreeAggregator) {
            sum += groupTotals[this._type][this._field];
            itemCount += groupTotals['count'][this._field];
            groupTotals['count'][this._field] = itemCount;
        }
        groupTotals[this._type][this._field] = sum;
    }
    addGroupTotalPropertiesWhenNotExist(groupTotals) {
        if (groupTotals[this._type] === undefined) {
            groupTotals[this._type] = {};
        }
        if (this._isTreeAggregator && groupTotals['count'] === undefined) {
            groupTotals['count'] = {};
        }
    }
}
//# sourceMappingURL=sumAggregator.js.map