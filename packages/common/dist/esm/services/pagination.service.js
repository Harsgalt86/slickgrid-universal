import { dequal } from 'dequal/lite';
export class PaginationService {
    /** Constructor */
    constructor(pubSubService, sharedService, backendUtilities, rxjs) {
        this.pubSubService = pubSubService;
        this.sharedService = sharedService;
        this.backendUtilities = backendUtilities;
        this.rxjs = rxjs;
        this._eventHandler = new Slick.EventHandler();
        this._initialized = false;
        this._isLocalGrid = true;
        this._dataFrom = 1;
        this._dataTo = 1;
        this._itemsPerPage = 0;
        this._pageCount = 1;
        this._pageNumber = 1;
        this._totalItems = 0;
        this._availablePageSizes = [];
        this._subscriptions = [];
    }
    /** Getter of SlickGrid DataView object */
    get dataView() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getData) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    set paginationOptions(paginationOptions) {
        this._paginationOptions = paginationOptions;
    }
    get paginationOptions() {
        return this._paginationOptions;
    }
    get availablePageSizes() {
        return this._availablePageSizes;
    }
    get dataFrom() {
        return this._dataFrom;
    }
    get dataTo() {
        return this._dataTo;
    }
    get itemsPerPage() {
        return this._itemsPerPage;
    }
    get pageCount() {
        return this._pageCount;
    }
    get pageNumber() {
        return this._pageNumber;
    }
    get totalItems() {
        return this._totalItems;
    }
    set totalItems(totalItems) {
        this._totalItems = totalItems;
        if (this._initialized) {
            this.refreshPagination();
        }
    }
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
    get isCursorBased() {
        var _a;
        return !!((_a = this._backendServiceApi) === null || _a === void 0 ? void 0 : _a.options.isWithCursor);
    }
    addRxJsResource(rxjs) {
        this.rxjs = rxjs;
    }
    init(grid, paginationOptions, backendServiceApi) {
        this._availablePageSizes = paginationOptions.pageSizes;
        this.grid = grid;
        this._backendServiceApi = backendServiceApi;
        this._paginationOptions = paginationOptions;
        this._isLocalGrid = !backendServiceApi;
        this._pageNumber = paginationOptions.pageNumber || 1;
        if (backendServiceApi && (!backendServiceApi.service || !backendServiceApi.process)) {
            throw new Error(`BackendServiceApi requires the following 2 properties "process" and "service" to be defined.`);
        }
        if (this._isLocalGrid && this.dataView) {
            this._eventHandler.subscribe(this.dataView.onPagingInfoChanged, (_e, pagingInfo) => {
                if (this._totalItems !== pagingInfo.totalRows) {
                    this.updateTotalItems(pagingInfo.totalRows);
                    this._previousPagination = { pageNumber: pagingInfo.pageNum, pageSize: pagingInfo.pageSize, pageSizes: this.availablePageSizes, totalItems: pagingInfo.totalRows };
                }
            });
            setTimeout(() => {
                if (this.dataView) {
                    this.dataView.setRefreshHints({ isFilterUnchanged: true });
                    this.dataView.setPagingOptions({ pageSize: this.paginationOptions.pageSize, pageNum: (this._pageNumber - 1) }); // dataView page starts at 0 instead of 1
                }
            });
        }
        // Subscribe to Filter Clear & Changed and go back to page 1 when that happen
        this._subscriptions.push(this.pubSubService.subscribe('onFilterChanged', () => this.resetPagination()));
        this._subscriptions.push(this.pubSubService.subscribe('onFilterCleared', () => this.resetPagination()));
        // Subscribe to any dataview row count changed so that when Adding/Deleting item(s) through the DataView
        // that would trigger a refresh of the pagination numbers
        if (this.dataView) {
            this._subscriptions.push(this.pubSubService.subscribe(`onItemAdded`, items => this.processOnItemAddedOrRemoved(items, true)));
            this._subscriptions.push(this.pubSubService.subscribe(`onItemDeleted`, items => this.processOnItemAddedOrRemoved(items, false)));
        }
        this.refreshPagination(false, false, true);
        // also keep reference to current pagination in case we need to rollback
        const pagination = this.getFullPagination();
        this._previousPagination = { pageNumber: pagination.pageNumber, pageSize: pagination.pageSize, pageSizes: pagination.pageSizes, totalItems: this.totalItems };
        this._initialized = true;
    }
    dispose() {
        this._initialized = false;
        // unsubscribe all SlickGrid events
        this._eventHandler.unsubscribeAll();
        // also unsubscribe all Subscriptions
        this.pubSubService.unsubscribeAll(this._subscriptions);
    }
    getCurrentPagination() {
        return {
            pageNumber: this._pageNumber,
            pageSize: this._itemsPerPage,
            pageSizes: this._availablePageSizes,
        };
    }
    getFullPagination() {
        return {
            pageCount: this._pageCount,
            pageNumber: this._pageNumber,
            pageSize: this._itemsPerPage,
            pageSizes: this._availablePageSizes,
            totalItems: this._totalItems,
            dataFrom: this._dataFrom,
            dataTo: this._dataTo,
        };
    }
    getCurrentPageNumber() {
        return this._pageNumber;
    }
    getCurrentItemPerPage() {
        return this._itemsPerPage;
    }
    changeItemPerPage(itemsPerPage, event, triggerChangeEvent = true) {
        this._pageNumber = 1;
        this._pageCount = Math.ceil(this._totalItems / itemsPerPage);
        this._itemsPerPage = itemsPerPage;
        return triggerChangeEvent ? this.processOnPageChanged(this._pageNumber, event) : Promise.resolve(this.getFullPagination());
    }
    goToFirstPage(event, triggerChangeEvent = true) {
        this._pageNumber = 1;
        if (triggerChangeEvent) {
            return this.isCursorBased && this._cursorPageInfo
                ? this.processOnPageChanged(this._pageNumber, event, { newPage: this._pageNumber, pageSize: this._itemsPerPage, first: this._itemsPerPage })
                : this.processOnPageChanged(this._pageNumber, event);
        }
        return Promise.resolve(this.getFullPagination());
    }
    goToLastPage(event, triggerChangeEvent = true) {
        this._pageNumber = this._pageCount || 1;
        if (triggerChangeEvent) {
            return this.isCursorBased && this._cursorPageInfo
                ? this.processOnPageChanged(this._pageNumber, event, { newPage: this._pageNumber, pageSize: this._itemsPerPage, last: this._itemsPerPage })
                : this.processOnPageChanged(this._pageNumber, event);
        }
        return Promise.resolve(this.getFullPagination());
    }
    goToNextPage(event, triggerChangeEvent = true) {
        if (this._pageNumber < this._pageCount) {
            this._pageNumber++;
            if (triggerChangeEvent) {
                return this.isCursorBased && this._cursorPageInfo
                    ? this.processOnPageChanged(this._pageNumber, event, { newPage: this._pageNumber, pageSize: this._itemsPerPage, first: this._itemsPerPage, after: this._cursorPageInfo.endCursor })
                    : this.processOnPageChanged(this._pageNumber, event);
            }
            else {
                return Promise.resolve(this.getFullPagination());
            }
        }
        return Promise.resolve(false);
    }
    goToPageNumber(pageNumber, event, triggerChangeEvent = true) {
        if (this.isCursorBased) {
            console.assert(true, 'Cursor based navigation cannot navigate to arbitrary page');
            return Promise.resolve(false);
        }
        const previousPageNumber = this._pageNumber;
        if (pageNumber < 1) {
            this._pageNumber = 1;
        }
        else if (pageNumber > this._pageCount) {
            this._pageNumber = this._pageCount;
        }
        else {
            this._pageNumber = pageNumber;
        }
        if (this._pageNumber !== previousPageNumber) {
            return triggerChangeEvent ? this.processOnPageChanged(this._pageNumber, event) : Promise.resolve(this.getFullPagination());
        }
        return Promise.resolve(false);
    }
    goToPreviousPage(event, triggerChangeEvent = true) {
        if (this._pageNumber > 1) {
            this._pageNumber--;
            if (triggerChangeEvent) {
                return this.isCursorBased && this._cursorPageInfo
                    ? this.processOnPageChanged(this._pageNumber, event, { newPage: this._pageNumber, pageSize: this._itemsPerPage, last: this._itemsPerPage, before: this._cursorPageInfo.startCursor })
                    : this.processOnPageChanged(this._pageNumber, event);
            }
            else {
                return Promise.resolve(this.getFullPagination());
            }
        }
        return Promise.resolve(false);
    }
    refreshPagination(isPageNumberReset = false, triggerChangedEvent = true, triggerInitializedEvent = false) {
        var _a, _b, _c;
        const previousPagination = { ...this.getFullPagination() };
        if (this._paginationOptions) {
            const pagination = this._paginationOptions;
            // set the number of items per page if not already set
            if (!this._itemsPerPage) {
                if (this._isLocalGrid) {
                    this._itemsPerPage = pagination.pageSize;
                }
                else {
                    this._itemsPerPage = +(((_c = (_b = (_a = this._backendServiceApi) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.paginationOptions) === null || _c === void 0 ? void 0 : _c.first) ? this._backendServiceApi.options.paginationOptions.first : pagination.pageSize);
                }
            }
            // if totalItems changed, we should always go back to the first page and recalculation the From-To indexes
            if (isPageNumberReset || this._totalItems !== pagination.totalItems) {
                if (isPageNumberReset) {
                    this._pageNumber = 1;
                    this.paginationOptions.pageNumber = 1;
                }
                else if (!this._initialized && pagination.pageNumber && pagination.pageNumber > 1) {
                    this._pageNumber = pagination.pageNumber || 1;
                }
                // when page number is set to 1 then also reset the "offset" of backend service
                if (this._pageNumber === 1 && this._backendServiceApi) {
                    this._backendServiceApi.service.resetPaginationOptions();
                }
            }
            // calculate and refresh the multiple properties of the pagination UI
            this._availablePageSizes = pagination.pageSizes;
            if (!this._totalItems && pagination.totalItems) {
                this._totalItems = pagination.totalItems;
            }
            this.recalculateFromToIndexes();
        }
        this._pageCount = Math.ceil(this._totalItems / this._itemsPerPage);
        this.sharedService.currentPagination = this.getCurrentPagination();
        // publish the refresh event on anytime the pagination is refreshed or re-rendered (run every time)
        // useful when binding a slick-pagination View
        this.pubSubService.publish(`onPaginationRefreshed`, this.getFullPagination());
        // publish a pagination change only when flag requires it (triggered by page or pageSize change, dataset length change by a filter or others)
        if (triggerChangedEvent && !dequal(previousPagination, this.getFullPagination())) {
            this.pubSubService.publish(`onPaginationChanged`, this.getFullPagination());
        }
        // publish on the first pagination initialization (called by the "init()" method on first load)
        if (triggerInitializedEvent && !dequal(previousPagination, this.getFullPagination())) {
            this.pubSubService.publish(`onPaginationPresetsInitialized`, this.getFullPagination());
        }
        const pagination = this.getFullPagination();
        this._previousPagination = { pageNumber: pagination.pageNumber, pageSize: pagination.pageSize, pageSizes: pagination.pageSizes, totalItems: this.totalItems };
    }
    /** Reset the Pagination to first page and recalculate necessary numbers */
    resetPagination(triggerChangedEvent = true) {
        var _a, _b;
        if (this._isLocalGrid && this.dataView && ((_b = (_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.gridOptions) === null || _b === void 0 ? void 0 : _b.enablePagination)) {
            // on a local grid we also need to reset the DataView paging to 1st page
            this.dataView.setPagingOptions({ pageSize: this._itemsPerPage, pageNum: 0 });
        }
        this.refreshPagination(true, triggerChangedEvent);
    }
    /**
     * Toggle the Pagination (show/hide), it will use the visible if defined else it will automatically inverse when called without argument
     *
     * IMPORTANT NOTE:
     * The Pagination must be created on initial page load, then only after can you toggle it.
     * Basically this method WILL NOT WORK to show the Pagination if it was never created from the start.
     */
    togglePaginationVisibility(visible) {
        var _a;
        if (this.grid && ((_a = this.sharedService) === null || _a === void 0 ? void 0 : _a.gridOptions)) {
            const isVisible = visible !== undefined ? visible : !this.sharedService.gridOptions.enablePagination;
            // make sure to reset the Pagination and go back to first page to avoid any issues with Pagination being offset
            if (isVisible) {
                this.goToFirstPage();
            }
            // when using a local grid, we can reset the DataView pagination by changing its page size
            // page size of 0 would show all, hence cancel the pagination
            if (this._isLocalGrid && this.dataView) {
                const pageSize = visible ? this._itemsPerPage : 0;
                this.dataView.setPagingOptions({ pageSize, pageNum: 0 });
            }
            // finally toggle the "enablePagination" flag and make sure it happens AFTER the setPagingOptions is called (when using local grid)
            // to avoid conflict with GridState bindSlickGridRowSelectionToGridStateChange() method
            this.sharedService.gridOptions.enablePagination = isVisible;
            this.pubSubService.publish(`onPaginationVisibilityChanged`, { visible: isVisible });
        }
    }
    processOnPageChanged(pageNumber, event, cursorArgs) {
        console.assert(!this.isCursorBased || cursorArgs, 'Configured for cursor based pagination - cursorArgs expected');
        if (this.pubSubService.publish('onBeforePaginationChange', this.getFullPagination()) === false) {
            this.resetToPreviousPagination();
            return Promise.resolve(this.getFullPagination());
        }
        return new Promise((resolve, reject) => {
            var _a, _b, _c;
            this.recalculateFromToIndexes();
            if (this._isLocalGrid && this.dataView) {
                this.dataView.setPagingOptions({ pageSize: this._itemsPerPage, pageNum: (pageNumber - 1) }); // dataView page starts at 0 instead of 1
                this.pubSubService.publish(`onPaginationChanged`, this.getFullPagination());
                this.pubSubService.publish(`onPaginationRefreshed`, this.getFullPagination());
                resolve(this.getFullPagination());
            }
            else {
                const itemsPerPage = +this._itemsPerPage;
                // keep start time & end timestamps & return it after process execution
                const startTime = new Date();
                // run any pre-process, if defined, for example a spinner
                if ((_a = this._backendServiceApi) === null || _a === void 0 ? void 0 : _a.preProcess) {
                    this._backendServiceApi.preProcess();
                }
                if ((_b = this._backendServiceApi) === null || _b === void 0 ? void 0 : _b.process) {
                    const query = this.isCursorBased && cursorArgs
                        ? this._backendServiceApi.service.processOnPaginationChanged(event, cursorArgs)
                        : this._backendServiceApi.service.processOnPaginationChanged(event, { newPage: pageNumber, pageSize: itemsPerPage });
                    // the processes can be Promises
                    const process = this._backendServiceApi.process(query);
                    if (process instanceof Promise) {
                        process
                            .then((processResult) => {
                            var _a;
                            (_a = this.backendUtilities) === null || _a === void 0 ? void 0 : _a.executeBackendProcessesCallback(startTime, processResult, this._backendServiceApi, this._totalItems);
                            const pagination = this.getFullPagination();
                            this._previousPagination = { pageNumber: pagination.pageNumber, pageSize: pagination.pageSize, pageSizes: pagination.pageSizes, totalItems: this.totalItems };
                            resolve(this.getFullPagination());
                        })
                            .catch((error) => {
                            var _a, _b, _c;
                            this.resetToPreviousPagination();
                            (_a = this.backendUtilities) === null || _a === void 0 ? void 0 : _a.onBackendError(error, this._backendServiceApi);
                            if (!((_b = this._backendServiceApi) === null || _b === void 0 ? void 0 : _b.onError) || !((_c = this.backendUtilities) === null || _c === void 0 ? void 0 : _c.onBackendError)) {
                                reject(process);
                            }
                        });
                    }
                    else if ((_c = this.rxjs) === null || _c === void 0 ? void 0 : _c.isObservable(process)) {
                        this._subscriptions.push(process.subscribe((processResult) => {
                            var _a;
                            const pagination = this.getFullPagination();
                            this._previousPagination = { pageNumber: pagination.pageNumber, pageSize: pagination.pageSize, pageSizes: pagination.pageSizes, totalItems: this.totalItems };
                            resolve((_a = this.backendUtilities) === null || _a === void 0 ? void 0 : _a.executeBackendProcessesCallback(startTime, processResult, this._backendServiceApi, this._totalItems));
                        }, (error) => {
                            var _a, _b, _c;
                            this.resetToPreviousPagination();
                            (_a = this.backendUtilities) === null || _a === void 0 ? void 0 : _a.onBackendError(error, this._backendServiceApi);
                            if (!((_b = this._backendServiceApi) === null || _b === void 0 ? void 0 : _b.onError) || !((_c = this.backendUtilities) === null || _c === void 0 ? void 0 : _c.onBackendError)) {
                                reject(process);
                            }
                        }));
                    }
                    this.pubSubService.publish(`onPaginationRefreshed`, this.getFullPagination());
                    this.pubSubService.publish(`onPaginationChanged`, this.getFullPagination());
                }
            }
        });
    }
    recalculateFromToIndexes() {
        if (this._totalItems === 0) {
            this._dataFrom = 0;
            this._dataTo = 1;
            this._pageNumber = 0;
        }
        else {
            this._dataFrom = this._pageNumber > 1 ? ((this._pageNumber * this._itemsPerPage) - this._itemsPerPage + 1) : 1;
            this._dataTo = (this._totalItems < this._itemsPerPage) ? this._totalItems : ((this._pageNumber || 1) * this._itemsPerPage);
            if (this._dataTo > this._totalItems) {
                this._dataTo = this._totalItems;
            }
        }
        this._pageNumber = (this._totalItems > 0 && this._pageNumber === 0) ? 1 : this._pageNumber;
        // do a final check on the From/To and make sure they are not over or below min/max acceptable values
        if (this._dataTo > this._totalItems) {
            this._dataTo = this._totalItems;
        }
        else if (this._totalItems < this._itemsPerPage) {
            this._dataTo = this._totalItems;
        }
    }
    /**
     * Reset (revert) to previous pagination, it could be because you prevented `onBeforePaginationChange`, `onBeforePagingInfoChanged` from DataView OR a Backend Error was thrown.
     * It will reapply the previous filter state in the UI.
     */
    resetToPreviousPagination() {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const hasPageNumberChange = ((_a = this._previousPagination) === null || _a === void 0 ? void 0 : _a.pageNumber) !== this.getFullPagination().pageNumber;
        const hasPageSizeChange = ((_b = this._previousPagination) === null || _b === void 0 ? void 0 : _b.pageSize) !== this.getFullPagination().pageSize;
        if (hasPageSizeChange) {
            this.changeItemPerPage((_d = (_c = this._previousPagination) === null || _c === void 0 ? void 0 : _c.pageSize) !== null && _d !== void 0 ? _d : 0, null, false);
        }
        if (hasPageNumberChange) {
            this.goToPageNumber((_g = (_f = this._previousPagination) === null || _f === void 0 ? void 0 : _f.pageNumber) !== null && _g !== void 0 ? _g : 0, null, false);
        }
        // refresh the pagination in the UI
        // and re-update the Backend query string without triggering an actual query
        if (hasPageNumberChange || hasPageSizeChange) {
            this.refreshPagination();
            (_k = (_j = (_h = this._backendServiceApi) === null || _h === void 0 ? void 0 : _h.service) === null || _j === void 0 ? void 0 : _j.updatePagination) === null || _k === void 0 ? void 0 : _k.call(_j, (_m = (_l = this._previousPagination) === null || _l === void 0 ? void 0 : _l.pageNumber) !== null && _m !== void 0 ? _m : 0, (_p = (_o = this._previousPagination) === null || _o === void 0 ? void 0 : _o.pageSize) !== null && _p !== void 0 ? _p : 0);
        }
    }
    setCursorPageInfo(pageInfo) {
        this._cursorPageInfo = pageInfo;
    }
    updateTotalItems(totalItems, triggerChangedEvent = false) {
        this._totalItems = totalItems;
        if (this._paginationOptions) {
            this._paginationOptions.totalItems = totalItems;
            this.refreshPagination(false, triggerChangedEvent);
        }
    }
    // --
    // protected functions
    // --------------------
    /**
     * When item is added or removed, we will refresh the numbers on the pagination however we won't trigger a backend change
     * This will have a side effect though, which is that the "To" count won't be matching the "items per page" count,
     * that is a necessary side effect to avoid triggering a backend query just to refresh the paging,
     * basically we assume that this offset is fine for the time being,
     * until user does an action which will refresh the data hence the pagination which will then become normal again
     */
    processOnItemAddedOrRemoved(items, isItemAdded = true) {
        if (items !== null) {
            const previousDataTo = this._dataTo;
            const itemCount = Array.isArray(items) ? items.length : 1;
            const itemCountWithDirection = isItemAdded ? +(itemCount) : -(itemCount);
            // refresh the total count in the pagination and in the UI
            this._totalItems += itemCountWithDirection;
            this.recalculateFromToIndexes();
            // finally refresh the "To" count and we know it might be different than the "items per page" count
            // but this is necessary since we don't want an actual backend refresh
            this._dataTo = previousDataTo + itemCountWithDirection;
            this.pubSubService.publish(`onPaginationChanged`, this.getFullPagination());
        }
    }
}
//# sourceMappingURL=pagination.service.js.map