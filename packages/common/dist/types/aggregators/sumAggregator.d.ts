import type { Aggregator } from './../interfaces/aggregator.interface';
export declare class SumAggregator implements Aggregator {
    private _isInitialized;
    private _isTreeAggregator;
    private _sum;
    private _itemCount;
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
}
//# sourceMappingURL=sumAggregator.d.ts.map