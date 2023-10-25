import { type Column } from '@slickgrid-universal/common';
import type { OdataOption } from '../interfaces/odataOption.interface';
export declare class OdataQueryBuilderService {
    _columnFilters: any;
    _defaultSortBy: string;
    _filterCount: number;
    _odataOptions: Partial<OdataOption>;
    protected _columnDefinitions: Column[];
    set columnDefinitions(columnDefinitions: Column[]);
    protected _datasetIdPropName: string;
    set datasetIdPropName(datasetIdPropName: string);
    constructor();
    buildQuery(): string;
    getFilterCount(): number;
    get columnFilters(): any[];
    get options(): Partial<OdataOption>;
    set options(options: Partial<OdataOption>);
    removeColumnFilter(fieldName: string): void;
    saveColumnFilter(fieldName: string, value: any, searchTerms?: any[]): void;
    /**
     * Change any OData options that will be used to build the query
     * @param object options
     */
    updateOptions(options: Partial<OdataOption>): void;
    protected addToFilterQueueWhenNotExists(filterStr: string): void;
    private buildSelectExpand;
    private buildExpand;
}
//# sourceMappingURL=odataQueryBuilder.service.d.ts.map