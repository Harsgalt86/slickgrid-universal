import { isNumber } from '@slickgrid-universal/utils';
export class CountAggregator {
    constructor(field) {
        this._isInitialized = false;
        this._isTreeAggregator = false;
        this._count = 0;
        this._type = 'count';
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
        this._count = 0;
        this._isInitialized = true;
        this._isTreeAggregator = isTreeAggregator;
        // when dealing with Tree Data structure, we also need to keep sum & itemCount refs
        if (isTreeAggregator) {
            if (!item.__treeTotals) {
                item.__treeTotals = {};
            }
            if (item.__treeTotals[this._type] === undefined) {
                item.__treeTotals[this._type] = {};
            }
            item.__treeTotals[this._type][this._field] = 0;
        }
    }
    accumulate(item, isTreeParent = false) {
        var _a;
        const val = (item === null || item === void 0 ? void 0 : item.hasOwnProperty(this._field)) ? item[this._field] : null;
        // when dealing with Tree Data structure, we need keep only the new sum (without doing any addition)
        if (this._isTreeAggregator) {
            if (isTreeParent) {
                if (!item.__treeTotals) {
                    item.__treeTotals = {};
                }
                if (item.__treeTotals[this._type] === undefined) {
                    item.__treeTotals[this._type] = {};
                }
                this._count = (_a = item.__treeTotals[this._type][this._field]) !== null && _a !== void 0 ? _a : 0;
            }
            else if (isNumber(val)) {
                this._count = 1;
            }
        }
    }
    storeResult(groupTotals) {
        if (!groupTotals || groupTotals[this._type] === undefined) {
            groupTotals[this._type] = {};
        }
        let itemCount = this._count;
        if (this._isTreeAggregator) {
            // when dealing with Tree Data, we also need to take the parent's total and add it to the final count
            itemCount += groupTotals[this._type][this._field];
        }
        else {
            itemCount = groupTotals.group.rows.length;
        }
        groupTotals[this._type][this._field] = itemCount;
    }
}
//# sourceMappingURL=countAggregator.js.map