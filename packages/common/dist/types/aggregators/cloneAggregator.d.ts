import type { Aggregator } from './../interfaces/aggregator.interface';
export declare class CloneAggregator implements Aggregator {
    private _isInitialized;
    private _field;
    private _data;
    private _type;
    constructor(field: number | string);
    get field(): number | string;
    get isInitialized(): boolean;
    get type(): string;
    init(_item?: any, isTreeAggregator?: boolean): void;
    accumulate(item: any): void;
    storeResult(groupTotals: any): void;
}
//# sourceMappingURL=cloneAggregator.d.ts.map