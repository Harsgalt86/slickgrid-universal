import type { Aggregator } from './../interfaces/aggregator.interface';
export declare class MinAggregator implements Aggregator {
    private _isInitialized;
    private _isTreeAggregator;
    private _min;
    private _field;
    private _type;
    constructor(field: number | string);
    get field(): number | string;
    get isInitialized(): boolean;
    get type(): string;
    init(item?: any, isTreeAggregator?: boolean): void;
    accumulate(item: any, isTreeParent?: boolean): void;
    storeResult(groupTotals: any): void;
    protected addGroupTotalPropertiesWhenNotExist(groupTotals: any): void;
    protected keepMinValueWhenFound(val: any): void;
}
//# sourceMappingURL=minAggregator.d.ts.map