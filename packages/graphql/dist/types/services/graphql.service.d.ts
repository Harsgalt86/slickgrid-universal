import type { BackendService, Column, ColumnFilters, ColumnSort, CurrentFilter, CurrentPagination, CurrentSorter, FilterChangedArgs, GridOption, MultiColumnSort, Pagination, PaginationChangedArgs, PaginationCursorChangedArgs, SharedService, SingleColumnSort, SlickGrid } from '@slickgrid-universal/common';
import { FieldType } from '@slickgrid-universal/common';
import { GraphqlCursorPaginationOption, GraphqlDatasetFilter, GraphqlPaginationOption, GraphqlServiceOption } from '../interfaces/index';
export declare class GraphqlService implements BackendService {
    protected _currentFilters: ColumnFilters | CurrentFilter[];
    protected _currentPagination: CurrentPagination | null;
    protected _currentSorters: CurrentSorter[];
    protected _columnDefinitions?: Column[];
    protected _grid: SlickGrid | undefined;
    protected _datasetIdPropName: string;
    options: GraphqlServiceOption | undefined;
    pagination: Pagination | undefined;
    defaultPaginationOptions: GraphqlPaginationOption;
    defaultCursorPaginationOptions: GraphqlCursorPaginationOption;
    /** Getter for the Column Definitions */
    get columnDefinitions(): Column<any>[] | undefined;
    /** Getter for the Grid Options pulled through the Grid Object */
    protected get _gridOptions(): GridOption;
    /** Initialization of the service, which acts as a constructor */
    init(serviceOptions?: GraphqlServiceOption, pagination?: Pagination, grid?: SlickGrid, sharedService?: SharedService): void;
    /**
     * Build the GraphQL query, since the service include/exclude cursor, the output query will be different.
     * @param serviceOptions GraphqlServiceOption
     */
    buildQuery(): string;
    /**
     * From an input array of strings, we want to build a GraphQL query string.
     * The process has to take the dot notation and parse it into a valid GraphQL query
     * Following this SO answer https://stackoverflow.com/a/47705476/1212166
     *
     * INPUT
     *  ['firstName', 'lastName', 'billing.address.street', 'billing.address.zip']
     * OUTPUT
     * firstName, lastName, billing{address{street, zip}}
     * @param inputArray
     */
    buildFilterQuery(inputArray: string[]): string;
    clearFilters(): void;
    clearSorters(): void;
    /**
     * Get an initialization of Pagination options
     * @return Pagination Options
     */
    getInitPaginationOptions(): GraphqlDatasetFilter;
    /** Get the GraphQL dataset name */
    getDatasetName(): string;
    /** Get the Filters that are currently used by the grid */
    getCurrentFilters(): ColumnFilters | CurrentFilter[];
    /** Get the Pagination that is currently used by the grid */
    getCurrentPagination(): CurrentPagination | null;
    /** Get the Sorters that are currently used by the grid */
    getCurrentSorters(): CurrentSorter[];
    resetPaginationOptions(): void;
    updateOptions(serviceOptions?: Partial<GraphqlServiceOption>): void;
    processOnFilterChanged(_event: Event | undefined, args: FilterChangedArgs): string;
    processOnPaginationChanged(_event: Event | undefined, args: PaginationChangedArgs | PaginationCursorChangedArgs): string;
    processOnSortChanged(_event: Event | undefined, args: SingleColumnSort | MultiColumnSort): string;
    /**
     * loop through all columns to inspect filters & update backend service filteringOptions
     * @param columnFilters
     */
    updateFilters(columnFilters: ColumnFilters | CurrentFilter[], isUpdatedByPresetOrDynamically: boolean): void;
    /**
     * Update the pagination component with it's new page number and size.
     * @param newPage
     * @param pageSize
     * @param cursorArgs Should be supplied when using cursor based pagination
     */
    updatePagination(newPage: number, pageSize: number, cursorArgs?: PaginationCursorChangedArgs): void;
    /**
     * Update the pagination component with it's new page number and size
     * @param newPage
     * @param pageSize
     */
    /**
     * loop through all columns to inspect sorters & update backend service sortingOptions
     * @param columnFilters
     */
    updateSorters(sortColumns?: ColumnSort[], presetSorters?: CurrentSorter[]): void;
    /**
     * A function which takes an input string and removes double quotes only
     * on certain fields are identified as GraphQL enums (except fields with dot notation)
     * For example let say we identified ("direction:", "sort") as word which are GraphQL enum fields
     * then the result will be:
     * FROM
     * query { users (orderBy:[{field:"firstName", direction:"ASC"} }]) }
     * TO
     * query { users (orderBy:[{field: firstName, direction: ASC}})}
     *
     * EXCEPTIONS (fields with dot notation "." which are inside a "field:")
     * these fields will keep double quotes while everything else will be stripped of double quotes
     * query { users (orderBy:[{field:"billing.street.name", direction: "ASC"} }
     * TO
     * query { users (orderBy:[{field:"billing.street.name", direction: ASC}}
     * @param inputStr input string
     * @param enumSearchWords array of enum words to filter
     * @returns outputStr output string
     */
    trimDoubleQuotesOnEnumField(inputStr: string, enumSearchWords: string[], keepArgumentFieldDoubleQuotes: boolean): string;
    /**
     * Cast provided filters (could be in multiple formats) into an array of CurrentFilter
     * @param columnFilters
     */
    protected castFilterToColumnFilters(columnFilters: ColumnFilters | CurrentFilter[]): CurrentFilter[];
    /** Normalizes the search value according to field type. */
    protected normalizeSearchValue(fieldType: typeof FieldType[keyof typeof FieldType], searchValue: any): any;
}
//# sourceMappingURL=graphql.service.d.ts.map