import type { BasePubSubService, EventSubscription } from '@slickgrid-universal/event-pub-sub';
import type { BackendServiceApi, CurrentPagination, CursorPageInfo, Pagination, PaginationCursorChangedArgs, ServicePagination, SlickDataView, SlickGrid } from '../interfaces/index';
import type { BackendUtilityService } from './backendUtility.service';
import type { SharedService } from './shared.service';
import type { RxJsFacade } from './rxjsFacade';
export declare class PaginationService {
    protected readonly pubSubService: BasePubSubService;
    protected readonly sharedService: SharedService;
    protected readonly backendUtilities?: BackendUtilityService | undefined;
    protected rxjs?: RxJsFacade | undefined;
    protected _eventHandler: import("../interfaces/slickEventHandler.interface").SlickEventHandler;
    protected _initialized: boolean;
    protected _isLocalGrid: boolean;
    protected _backendServiceApi: BackendServiceApi | undefined;
    protected _dataFrom: number;
    protected _dataTo: number;
    protected _itemsPerPage: number;
    protected _pageCount: number;
    protected _pageNumber: number;
    protected _totalItems: number;
    protected _availablePageSizes: number[];
    protected _paginationOptions: Pagination;
    protected _previousPagination?: Pagination;
    protected _subscriptions: EventSubscription[];
    protected _cursorPageInfo?: CursorPageInfo;
    protected _isCursorBased: boolean;
    /** SlickGrid Grid object */
    grid: SlickGrid;
    /** Constructor */
    constructor(pubSubService: BasePubSubService, sharedService: SharedService, backendUtilities?: BackendUtilityService | undefined, rxjs?: RxJsFacade | undefined);
    /** Getter of SlickGrid DataView object */
    get dataView(): SlickDataView | undefined;
    set paginationOptions(paginationOptions: Pagination);
    get paginationOptions(): Pagination;
    get availablePageSizes(): number[];
    get dataFrom(): number;
    get dataTo(): number;
    get itemsPerPage(): number;
    get pageCount(): number;
    get pageNumber(): number;
    get totalItems(): number;
    set totalItems(totalItems: number);
    /**
     * https://dev.to/jackmarchant/offset-and-cursor-pagination-explained-b89
     * Cursor based pagination does not allow navigation to a page in the middle of a set of pages (eg: LinkedList vs Vector).
     *  Further, Pagination with page numbers only makes sense in non-relay style pagination
     *  Relay style pagination is better suited to infinite scrolling
     *
     * eg
     *  relay pagination - Infinte scrolling appending data
     *    page1: {startCursor: A, endCursor: B }
     *    page2: {startCursor: A, endCursor: C }
     *    page3: {startCursor: A, endCursor: D }
     *
     *  non-relay pagination - Getting page chunks
     *    page1: {startCursor: A, endCursor: B }
     *    page2: {startCursor: B, endCursor: C }
     *    page3: {startCursor: C, endCursor: D }
     */
    get isCursorBased(): boolean;
    addRxJsResource(rxjs: RxJsFacade): void;
    init(grid: SlickGrid, paginationOptions: Pagination, backendServiceApi?: BackendServiceApi): void;
    dispose(): void;
    getCurrentPagination(): CurrentPagination & {
        pageSizes: number[];
    };
    getFullPagination(): ServicePagination;
    getCurrentPageNumber(): number;
    getCurrentItemPerPage(): number;
    changeItemPerPage(itemsPerPage: number, event?: any, triggerChangeEvent?: boolean): Promise<ServicePagination>;
    goToFirstPage(event?: any, triggerChangeEvent?: boolean): Promise<ServicePagination>;
    goToLastPage(event?: any, triggerChangeEvent?: boolean): Promise<ServicePagination>;
    goToNextPage(event?: any, triggerChangeEvent?: boolean): Promise<boolean | ServicePagination>;
    goToPageNumber(pageNumber: number, event?: any, triggerChangeEvent?: boolean): Promise<boolean | ServicePagination>;
    goToPreviousPage(event?: any, triggerChangeEvent?: boolean): Promise<boolean | ServicePagination>;
    refreshPagination(isPageNumberReset?: boolean, triggerChangedEvent?: boolean, triggerInitializedEvent?: boolean): void;
    /** Reset the Pagination to first page and recalculate necessary numbers */
    resetPagination(triggerChangedEvent?: boolean): void;
    /**
     * Toggle the Pagination (show/hide), it will use the visible if defined else it will automatically inverse when called without argument
     *
     * IMPORTANT NOTE:
     * The Pagination must be created on initial page load, then only after can you toggle it.
     * Basically this method WILL NOT WORK to show the Pagination if it was never created from the start.
     */
    togglePaginationVisibility(visible?: boolean): void;
    processOnPageChanged(pageNumber: number, event?: Event | undefined, cursorArgs?: PaginationCursorChangedArgs): Promise<ServicePagination>;
    recalculateFromToIndexes(): void;
    /**
     * Reset (revert) to previous pagination, it could be because you prevented `onBeforePaginationChange`, `onBeforePagingInfoChanged` from DataView OR a Backend Error was thrown.
     * It will reapply the previous filter state in the UI.
     */
    resetToPreviousPagination(): void;
    setCursorBased(isWithCursor: boolean): void;
    setCursorPageInfo(pageInfo: CursorPageInfo): void;
    updateTotalItems(totalItems: number, triggerChangedEvent?: boolean): void;
    /**
     * When item is added or removed, we will refresh the numbers on the pagination however we won't trigger a backend change
     * This will have a side effect though, which is that the "To" count won't be matching the "items per page" count,
     * that is a necessary side effect to avoid triggering a backend query just to refresh the paging,
     * basically we assume that this offset is fine for the time being,
     * until user does an action which will refresh the data hence the pagination which will then become normal again
     */
    protected processOnItemAddedOrRemoved(items: any | any[], isItemAdded?: boolean): void;
}
//# sourceMappingURL=pagination.service.d.ts.map