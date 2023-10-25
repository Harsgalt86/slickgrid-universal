export class DistinctAggregator {
    constructor(field) {
        this._isInitialized = false;
        this._distinctValues = [];
        this._type = 'distinct';
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
        this._distinctValues = [];
        this._isInitialized = true;
        if (isTreeAggregator) {
            throw new Error('[Slickgrid-Universal] CloneAggregator is not currently supported for use with Tree Data');
        }
    }
    accumulate(item) {
        const val = (item && item.hasOwnProperty(this._field)) ? item[this._field] : undefined;
        if (this._distinctValues.indexOf(val) === -1 && val !== undefined) {
            this._distinctValues.push(val);
        }
    }
    storeResult(groupTotals) {
        if (!groupTotals || groupTotals[this._type] === undefined) {
            groupTotals[this._type] = {};
        }
        groupTotals[this._type][this._field] = this._distinctValues;
    }
}
//# sourceMappingURL=distinctAggregator.js.map