import type { Aggregator } from './../interfaces/aggregator.interface';
export declare class CountAggregator implements Aggregator {
    private _isInitialized;
    private _isTreeAggregator;
    private _field;
    private _count;
    private _type;
    constructor(field: number | string);
    get field(): number | string;
    get isInitialized(): boolean;
    get type(): string;
    init(item?: any, isTreeAggregator?: boolean): void;
    accumulate(item: any, isTreeParent?: boolean): void;
    storeResult(groupTotals: any): void;
}
//# sourceMappingURL=countAggregator.d.ts.map