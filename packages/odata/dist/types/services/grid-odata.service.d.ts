import type { BackendService, Column, ColumnFilters, ColumnSort, CurrentFilter, CurrentPagination, CurrentSorter, FilterChangedArgs, GridOption, MultiColumnSort, Pagination, PaginationChangedArgs, OperatorString, SearchTerm, SharedService, SingleColumnSort, SlickGrid, PaginationCursorChangedArgs } from '@slickgrid-universal/common';
import { FieldType, OperatorType } from '@slickgrid-universal/common';
import { OdataQueryBuilderService } from './odataQueryBuilder.service';
import { OdataOption } from '../interfaces/index';
export declare class GridOdataService implements BackendService {
    protected _currentFilters: CurrentFilter[];
    protected _currentPagination: CurrentPagination | null;
    protected _currentSorters: CurrentSorter[];
    protected _columnDefinitions: Column[];
    protected _grid: SlickGrid | undefined;
    protected _odataService: OdataQueryBuilderService;
    options?: Partial<OdataOption>;
    pagination: Pagination | undefined;
    defaultOptions: OdataOption;
    /** Getter for the Column Definitions */
    get columnDefinitions(): Column<any>[];
    /** Getter for the Odata Service */
    get odataService(): OdataQueryBuilderService;
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get _gridOptions(): GridOption;
    constructor();
    init(serviceOptions?: Partial<OdataOption>, pagination?: Pagination, grid?: SlickGrid, sharedService?: SharedService): void;
    buildQuery(): string;
    postProcess(processResult: any): void;
    clearFilters(): void;
    clearSorters(): void;
    updateOptions(serviceOptions?: Partial<OdataOption>): void;
    removeColumnFilter(fieldName: string): void;
    /** Get the Filters that are currently used by the grid */
    getCurrentFilters(): CurrentFilter[];
    /** Get the Pagination that is currently used by the grid */
    getCurrentPagination(): CurrentPagination | null;
    /** Get the Sorters that are currently used by the grid */
    getCurrentSorters(): CurrentSorter[];
    /**
     * Mapper for mathematical operators (ex.: <= is "le", > is "gt")
     * @param string operator
     * @returns string map
     */
    mapOdataOperator(operator: string): string;
    resetPaginationOptions(): void;
    saveColumnFilter(fieldName: string, value: string, terms?: SearchTerm[]): void;
    processOnFilterChanged(_event: Event | undefined, args: FilterChangedArgs): string;
    processOnPaginationChanged(_event: Event | undefined, args: PaginationChangedArgs | PaginationCursorChangedArgs): string;
    processOnSortChanged(_event: Event | undefined, args: SingleColumnSort | MultiColumnSort): string;
    /**
     * loop through all columns to inspect filters & update backend service filters
     * @param columnFilters
     */
    updateFilters(columnFilters: ColumnFilters | CurrentFilter[], isUpdatedByPresetOrDynamically?: boolean): void;
    /**
     * Update the pagination component with it's new page number and size
     * @param newPage
     * @param pageSize
     */
    updatePagination(newPage: number, pageSize: number): void;
    /**
     * loop through all columns to inspect sorters & update backend service orderBy
     * @param columnFilters
     */
    updateSorters(sortColumns?: ColumnSort[], presetSorters?: CurrentSorter[]): string;
    /**
     * Cast provided filters (could be in multiple format) into an array of ColumnFilter
     * @param columnFilters
     */
    protected castFilterToColumnFilters(columnFilters: ColumnFilters | CurrentFilter[]): CurrentFilter[];
    /**
     * Filter by a range of searchTerms (2 searchTerms OR 1 string separated by 2 dots "value1..value2")
     */
    protected filterBySearchTermRange(fieldName: string, operator: OperatorType | OperatorString, searchTerms: SearchTerm[]): string;
    /**
     * Normalizes the search value according to field type and oData version.
     */
    protected normalizeSearchValue(fieldType: typeof FieldType[keyof typeof FieldType], searchValue: any, version: number): any;
}
//# sourceMappingURL=grid-odata.service.d.ts.map