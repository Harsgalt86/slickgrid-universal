import { objectAssignAndExtend } from '@slickgrid-universal/utils';
/***
 * A plugin to add Row Detail Panel View (for example providing order detail info when clicking on the order row in the grid)
 * Original StackOverflow question & article making this possible (thanks to violet313)
 * https://stackoverflow.com/questions/10535164/can-slickgrids-row-height-be-dynamically-altered#29399927
 * http://violet313.org/slickgrids/#intro
 */
export class SlickRowDetailView {
    /** Constructor of the SlickGrid 3rd party plugin, it can optionally receive options */
    constructor(pubSubService) {
        this.pubSubService = pubSubService;
        this._dataViewIdProperty = 'id';
        this._expandableOverride = null;
        this._expandedRows = [];
        this._gridRowBuffer = 0;
        this._gridUid = '';
        this._keyPrefix = '';
        this._lastRange = null;
        this._outsideRange = 5;
        this._rowIdsOutOfViewport = [];
        this._visibleRenderedCellCount = 0;
        this._defaults = {
            alwaysRenderColumn: true,
            columnId: '_detail_selector',
            field: '_detail_selector',
            cssClass: 'detailView-toggle',
            collapseAllOnSort: true,
            collapsedClass: undefined,
            expandedClass: undefined,
            keyPrefix: '_',
            loadOnce: false,
            maxRows: undefined,
            saveDetailViewOnScroll: true,
            singleRowExpand: false,
            useSimpleViewportCalc: false,
            toolTip: '',
            width: 30,
        };
        this.pluginName = 'RowDetailView';
        /** Fired when the async response finished */
        this.onAsyncEndUpdate = new Slick.Event();
        /** This event must be used with the "notify" by the end user once the Asynchronous Server call returns the item detail */
        this.onAsyncResponse = new Slick.Event();
        /** Fired after the row detail gets toggled */
        this.onAfterRowDetailToggle = new Slick.Event();
        /** Fired before the row detail gets toggled */
        this.onBeforeRowDetailToggle = new Slick.Event();
        /** Fired after the row detail gets toggled */
        this.onRowBackToViewportRange = new Slick.Event();
        /** Fired after a row becomes out of viewport range (when user can't see the row anymore) */
        this.onRowOutOfViewportRange = new Slick.Event();
        this._eventHandler = new Slick.EventHandler();
    }
    get addonOptions() {
        return this._addonOptions;
    }
    /** Getter of SlickGrid DataView object */
    get dataView() {
        var _a;
        return ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getData()) || {};
    }
    get dataViewIdProperty() {
        return this._dataViewIdProperty;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        var _a;
        return ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions()) || {};
    }
    get gridUid() {
        var _a;
        return this._gridUid || (((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getUID()) || '');
    }
    set lastRange(range) {
        this._lastRange = range;
    }
    set rowIdsOutOfViewport(rowIds) {
        this._rowIdsOutOfViewport = rowIds;
    }
    get visibleRenderedCellCount() {
        return this._visibleRenderedCellCount;
    }
    /**
     * Initialize the Export Service
     * @param _grid
     * @param _containerService
     */
    init(grid) {
        var _a;
        this._grid = grid;
        if (!grid) {
            throw new Error('[Slickgrid-Universal] RowDetailView Plugin requires the Grid instance to be passed as argument to the "init()" method.');
        }
        this._grid = grid;
        this._gridUid = grid.getUID();
        if (!this._addonOptions) {
            this._addonOptions = objectAssignAndExtend(this.gridOptions.rowDetailView, this._defaults);
        }
        this._keyPrefix = ((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.keyPrefix) || '_';
        // Update the minRowBuffer so that the view doesn't disappear when it's at top of screen + the original default 3
        this._gridRowBuffer = this.gridOptions.minRowBuffer || 0;
        this.gridOptions.minRowBuffer = this._addonOptions.panelRows + 3;
        this._eventHandler
            .subscribe(this._grid.onClick, this.handleClick.bind(this))
            .subscribe(this._grid.onBeforeEditCell, () => this.collapseAll())
            .subscribe(this._grid.onScroll, this.handleScroll.bind(this));
        // Sort will, by default, Collapse all of the open items (unless user implements his own onSort which deals with open row and padding)
        if (this._addonOptions.collapseAllOnSort) {
            this._eventHandler.subscribe(this._grid.onSort, this.collapseAll.bind(this));
            this._expandedRows = [];
            this._rowIdsOutOfViewport = [];
        }
        this._eventHandler.subscribe(this.dataView.onRowCountChanged, () => {
            this._grid.updateRowCount();
            this._grid.render();
        });
        this._eventHandler.subscribe(this.dataView.onRowsChanged, (_e, args) => {
            this._grid.invalidateRows(args.rows);
            this._grid.render();
        });
        // subscribe to the onAsyncResponse so that the plugin knows when the user server side calls finished
        this._eventHandler.subscribe(this.onAsyncResponse, this.handleOnAsyncResponse.bind(this));
        // after data is set, let's get the DataView Id Property name used (defaults to "id")
        this._eventHandler.subscribe(this.dataView.onSetItemsCalled, () => {
            var _a;
            this._dataViewIdProperty = ((_a = this.dataView) === null || _a === void 0 ? void 0 : _a.getIdPropertyName()) || 'id';
        });
        // if we use the alternative & simpler calculation of the out of viewport range
        // we will need to know how many rows are rendered on the screen and we need to wait for grid to be rendered
        // unfortunately there is no triggered event for knowing when grid is finished, so we use 250ms delay and it's typically more than enough
        if (this._addonOptions.useSimpleViewportCalc) {
            this._eventHandler.subscribe(this._grid.onRendered, (_e, args) => {
                if (args === null || args === void 0 ? void 0 : args.endRow) {
                    this._visibleRenderedCellCount = args.endRow - args.startRow;
                }
            });
        }
    }
    /** Dispose of the Slick Row Detail View */
    dispose() {
        var _a;
        (_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.unsubscribeAll();
    }
    create(columnDefinitions, gridOptions) {
        var _a, _b;
        if (!gridOptions.rowDetailView) {
            throw new Error('[Slickgrid-Universal] The Row Detail View requires options to be passed via the "rowDetailView" property of the Grid Options');
        }
        this._addonOptions = objectAssignAndExtend(gridOptions.rowDetailView, this._defaults);
        // user could override the expandable icon logic from within the options or after instantiating the plugin
        if (typeof this._addonOptions.expandableOverride === 'function') {
            this.expandableOverride(this._addonOptions.expandableOverride);
        }
        if (Array.isArray(columnDefinitions) && gridOptions) {
            const newRowDetailViewColumn = this.getColumnDefinition();
            // add new row detail column unless it was already added
            if (!columnDefinitions.some(col => col.id === newRowDetailViewColumn.id)) {
                const rowDetailColDef = Array.isArray(columnDefinitions) && columnDefinitions.find(col => (col === null || col === void 0 ? void 0 : col.behavior) === 'selectAndMove');
                const finalRowDetailViewColumn = rowDetailColDef ? rowDetailColDef : newRowDetailViewColumn;
                // column index position in the grid
                const columnPosition = (_b = (_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.rowDetailView) === null || _a === void 0 ? void 0 : _a.columnIndexPosition) !== null && _b !== void 0 ? _b : 0;
                if (columnPosition > 0) {
                    columnDefinitions.splice(columnPosition, 0, finalRowDetailViewColumn);
                }
                else {
                    columnDefinitions.unshift(finalRowDetailViewColumn);
                }
                this.pubSubService.publish(`onPluginColumnsChanged`, {
                    columns: columnDefinitions,
                    pluginName: this.pluginName
                });
            }
        }
        return this;
    }
    /** Get current plugin options */
    getOptions() {
        return this._addonOptions;
    }
    /** set or change some of the plugin options */
    setOptions(options) {
        var _a;
        this._addonOptions = objectAssignAndExtend(options, this._addonOptions);
        if ((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.singleRowExpand) {
            this.collapseAll();
        }
    }
    /** Collapse all of the open items */
    collapseAll() {
        this.dataView.beginUpdate();
        for (const expandedRow of this._expandedRows) {
            this.collapseDetailView(expandedRow, true);
        }
        this.dataView.endUpdate();
    }
    /** Colapse an Item so it is not longer seen */
    collapseDetailView(item, isMultipleCollapsing = false) {
        if (!isMultipleCollapsing) {
            this.dataView.beginUpdate();
        }
        // Save the details on the collapse assuming onetime loading
        if (this._addonOptions.loadOnce) {
            this.saveDetailView(item);
        }
        item[`${this._keyPrefix}collapsed`] = true;
        for (let idx = 1; idx <= item[`${this._keyPrefix}sizePadding`]; idx++) {
            this.dataView.deleteItem(`${item[this._dataViewIdProperty]}.${idx}`);
        }
        item[`${this._keyPrefix}sizePadding`] = 0;
        this.dataView.updateItem(item[this._dataViewIdProperty], item);
        // Remove the item from the expandedRows
        this._expandedRows = this._expandedRows.filter((expRow) => {
            return expRow[this._dataViewIdProperty] !== item[this._dataViewIdProperty];
        });
        if (!isMultipleCollapsing) {
            this.dataView.endUpdate();
        }
    }
    /** Expand a row given the dataview item that is to be expanded */
    expandDetailView(item) {
        var _a, _b, _c;
        if ((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.singleRowExpand) {
            this.collapseAll();
        }
        item[`${this._keyPrefix}collapsed`] = false;
        this._expandedRows.push(item);
        // In the case something went wrong loading it the first time such a scroll of screen before loaded
        if (!item[`${this._keyPrefix}detailContent`]) {
            item[`${this._keyPrefix}detailViewLoaded`] = false;
        }
        // display pre-loading template
        if (!item[`${this._keyPrefix}detailViewLoaded`] || this._addonOptions.loadOnce !== true) {
            item[`${this._keyPrefix}detailContent`] = (_c = (_b = this._addonOptions) === null || _b === void 0 ? void 0 : _b.preTemplate) === null || _c === void 0 ? void 0 : _c.call(_b, item);
        }
        else {
            this.onAsyncResponse.notify({
                item,
                itemDetail: item,
                detailView: item[`${this._keyPrefix}detailContent`]
            });
            this.applyTemplateNewLineHeight(item);
            this.dataView.updateItem(item[this._dataViewIdProperty], item);
            return;
        }
        this.applyTemplateNewLineHeight(item);
        this.dataView.updateItem(item[this._dataViewIdProperty], item);
        // async server call
        this._addonOptions.process(item);
    }
    /** Saves the current state of the detail view */
    saveDetailView(item) {
        const view = document.querySelector(`.${this.gridUid} .innerDetailView_${item[this._dataViewIdProperty]}`);
        if (view) {
            const html = view.innerHTML;
            if (html !== undefined) {
                item[`${this._keyPrefix}detailContent`] = html;
            }
        }
    }
    /**
     * subscribe to the onAsyncResponse so that the plugin knows when the user server side calls finished
     * the response has to be as "args.item" (or "args.itemDetail") with it's data back
     */
    handleOnAsyncResponse(_e, args) {
        var _a, _b, _c;
        if (!args || (!args.item && !args.itemDetail)) {
            console.error('SlickRowDetailView plugin requires the onAsyncResponse() to supply "args.item" property.');
            return;
        }
        // we accept item/itemDetail, just get the one which has data
        const itemDetail = args.item || args.itemDetail;
        // If we just want to load in a view directly we can use detailView property to do so
        itemDetail[`${this._keyPrefix}detailContent`] = (_a = args.detailView) !== null && _a !== void 0 ? _a : (_c = (_b = this._addonOptions) === null || _b === void 0 ? void 0 : _b.postTemplate) === null || _c === void 0 ? void 0 : _c.call(_b, itemDetail);
        itemDetail[`${this._keyPrefix}detailViewLoaded`] = true;
        this.dataView.updateItem(itemDetail[this._dataViewIdProperty], itemDetail);
        // trigger an event once the post template is finished loading
        this.onAsyncEndUpdate.notify({
            grid: this._grid,
            item: itemDetail,
            itemDetail,
        });
    }
    /**
     * TODO interface only has a GETTER not a SETTER..why?
     * Override the logic for showing (or not) the expand icon (use case example: only every 2nd row is expandable)
     * Method that user can pass to override the default behavior or making every row an expandable row.
     * In order word, user can choose which rows to be an available row detail (or not) by providing his own logic.
     * @param overrideFn: override function callback
     */
    expandableOverride(overrideFn) {
        this._expandableOverride = overrideFn;
    }
    getExpandableOverride() {
        return this._expandableOverride;
    }
    /** Get the Column Definition of the first column dedicated to toggling the Row Detail View */
    getColumnDefinition() {
        var _a, _b, _c;
        const columnId = String((_b = (_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.columnId) !== null && _b !== void 0 ? _b : this._defaults.columnId);
        return {
            id: columnId,
            field: columnId,
            name: '',
            alwaysRenderColumn: (_c = this._addonOptions) === null || _c === void 0 ? void 0 : _c.alwaysRenderColumn,
            cssClass: this._addonOptions.cssClass || '',
            excludeFromExport: true,
            excludeFromColumnPicker: true,
            excludeFromGridMenu: true,
            excludeFromQuery: true,
            excludeFromHeaderMenu: true,
            formatter: this.detailSelectionFormatter.bind(this),
            resizable: false,
            sortable: false,
            toolTip: this._addonOptions.toolTip,
            width: this._addonOptions.width,
        };
    }
    /** return the currently expanded rows */
    getExpandedRows() {
        return this._expandedRows;
    }
    /** return the rows that are out of the viewport */
    getOutOfViewportRows() {
        return this._rowIdsOutOfViewport;
    }
    /** Takes in the item we are filtering and if it is an expanded row returns it's parents row to filter on */
    getFilterItem(item) {
        if (item[`${this._keyPrefix}isPadding`] && item[`${this._keyPrefix}parent`]) {
            item = item[`${this._keyPrefix}parent`];
        }
        return item;
    }
    /** Resize the Row Detail View */
    resizeDetailView(item) {
        if (!item) {
            return;
        }
        // Grad each of the DOM elements
        const mainContainer = document.querySelector(`.${this.gridUid} .detailViewContainer_${item[this._dataViewIdProperty]}`);
        const cellItem = document.querySelector(`.${this.gridUid} .cellDetailView_${item[this._dataViewIdProperty]}`);
        const inner = document.querySelector(`.${this.gridUid} .innerDetailView_${item[this._dataViewIdProperty]}`);
        if (!mainContainer || !cellItem || !inner) {
            return;
        }
        for (let idx = 1; idx <= item[`${this._keyPrefix}sizePadding`]; idx++) {
            this.dataView.deleteItem(`${item[this._dataViewIdProperty]}.${idx}`);
        }
        const rowHeight = this.gridOptions.rowHeight; // height of a row
        const lineHeight = 13; // we know cuz we wrote the custom css init ;)
        // remove the height so we can calculate the height
        mainContainer.style.minHeight = '';
        // Get the scroll height for the main container so we know the actual size of the view
        const itemHeight = mainContainer.scrollHeight;
        // Now work out how many rows
        const rowCount = Math.ceil(itemHeight / rowHeight);
        item[`${this._keyPrefix}sizePadding`] = Math.ceil(((rowCount * 2) * lineHeight) / rowHeight);
        item[`${this._keyPrefix}height`] = itemHeight;
        let outterHeight = (item[`${this._keyPrefix}sizePadding`] * rowHeight);
        if (this._addonOptions.maxRows !== undefined && item[`${this._keyPrefix}sizePadding`] > this._addonOptions.maxRows) {
            outterHeight = this._addonOptions.maxRows * rowHeight;
            item[`${this._keyPrefix}sizePadding`] = this._addonOptions.maxRows;
        }
        // If the padding is now more than the original minRowBuff we need to increase it
        if (this.gridOptions.minRowBuffer < item[`${this._keyPrefix}sizePadding`]) {
            // Update the minRowBuffer so that the view doesn't disappear when it's at top of screen + the original default 3
            this.gridOptions.minRowBuffer = item[`${this._keyPrefix}sizePadding`] + 3;
        }
        mainContainer.setAttribute('style', `min-height: ${item[this._keyPrefix + 'height']}px`);
        if (cellItem) {
            cellItem.setAttribute('style', `height: ${outterHeight}px; top: ${rowHeight}px`);
        }
        const idxParent = this.dataView.getIdxById(item[this._dataViewIdProperty]);
        for (let idx = 1; idx <= item[`${this._keyPrefix}sizePadding`]; idx++) {
            this.dataView.insertItem(idxParent + idx, this.getPaddingItem(item, idx));
        }
        // Lastly save the updated state
        this.saveDetailView(item);
    }
    // --
    // protected functions
    // ------------------
    /**
     * create the detail ctr node. this belongs to the dev & can be custom-styled as per
     */
    applyTemplateNewLineHeight(item) {
        // the height is calculated by the template row count (how many line of items does the template view have)
        const rowCount = this._addonOptions.panelRows;
        // calculate padding requirements based on detail-content..
        // ie. worst-case: create an invisible dom node now & find it's height.
        const lineHeight = 13; // we know cuz we wrote the custom css init ;)
        item[`${this._keyPrefix}sizePadding`] = Math.ceil(((rowCount * 2) * lineHeight) / this.gridOptions.rowHeight);
        item[`${this._keyPrefix}height`] = (item[`${this._keyPrefix}sizePadding`] * this.gridOptions.rowHeight);
        const idxParent = this.dataView.getIdxById(item[this._dataViewIdProperty]);
        for (let idx = 1; idx <= item[`${this._keyPrefix}sizePadding`]; idx++) {
            this.dataView.insertItem((idxParent || 0) + idx, this.getPaddingItem(item, idx));
        }
    }
    calculateOutOfRangeViews() {
        if (this._grid) {
            let scrollDir;
            const renderedRange = this._grid.getRenderedRange();
            // Only check if we have expanded rows
            if (this._expandedRows.length > 0) {
                // Assume scroll direction is down by default.
                scrollDir = 'DOWN';
                if (this._lastRange) {
                    // Some scrolling isn't anything as the range is the same
                    if (this._lastRange.top === renderedRange.top && this._lastRange.bottom === renderedRange.bottom) {
                        return;
                    }
                    // If our new top is smaller we are scrolling up
                    if (this._lastRange.top > renderedRange.top ||
                        // Or we are at very top but our bottom is increasing
                        (this._lastRange.top === 0 && renderedRange.top === 0 && (this._lastRange.bottom > renderedRange.bottom))) {
                        scrollDir = 'UP';
                    }
                }
            }
            this._expandedRows.forEach((row) => {
                const rowIndex = this.dataView.getRowById(row[this._dataViewIdProperty]);
                const rowPadding = row[`${this._keyPrefix}sizePadding`];
                const isRowOutOfRange = this._rowIdsOutOfViewport.some(rowId => rowId === row[this._dataViewIdProperty]);
                if (scrollDir === 'UP') {
                    // save the view when asked
                    if (this._addonOptions.saveDetailViewOnScroll) {
                        // If the bottom item within buffer range is an expanded row save it.
                        if (rowIndex >= renderedRange.bottom - this._gridRowBuffer) {
                            this.saveDetailView(row);
                        }
                    }
                    // If the row expanded area is within the buffer notify that it is back in range
                    if (isRowOutOfRange && ((rowIndex - this._outsideRange) < renderedRange.top) && (rowIndex >= renderedRange.top)) {
                        this.notifyBackToViewportWhenDomExist(row, row[this._dataViewIdProperty]);
                    }
                    else if (!isRowOutOfRange && ((rowIndex + rowPadding) > renderedRange.bottom)) {
                        // if our first expanded row is about to go off the bottom
                        this.notifyOutOfViewport(row, row[this._dataViewIdProperty]);
                    }
                }
                else if (scrollDir === 'DOWN') {
                    // save the view when asked
                    if (this._addonOptions.saveDetailViewOnScroll) {
                        // If the top item within buffer range is an expanded row save it.
                        if (rowIndex <= renderedRange.top + this._gridRowBuffer) {
                            this.saveDetailView(row);
                        }
                    }
                    // If row index is i higher than bottom with some added value (To ignore top rows off view) and is with view and was our of range
                    if (isRowOutOfRange && ((rowIndex + rowPadding + this._outsideRange) > renderedRange.bottom) && (rowIndex < (rowIndex + rowPadding))) {
                        this.notifyBackToViewportWhenDomExist(row, row[this._dataViewIdProperty]);
                    }
                    else if (!isRowOutOfRange && (rowIndex < renderedRange.top)) {
                        // if our row is outside top of and the buffering zone but not in the array of outOfVisable range notify it
                        this.notifyOutOfViewport(row, row[this._dataViewIdProperty]);
                    }
                }
            });
            this._lastRange = renderedRange;
        }
    }
    calculateOutOfRangeViewsSimplerVersion() {
        if (this._grid) {
            const renderedRange = this._grid.getRenderedRange();
            this._expandedRows.forEach((row) => {
                const rowIndex = this.dataView.getRowById(row[this._dataViewIdProperty]);
                const isOutOfVisibility = this.checkIsRowOutOfViewportRange(rowIndex, renderedRange);
                if (!isOutOfVisibility && this._rowIdsOutOfViewport.some(rowId => rowId === row[this._dataViewIdProperty])) {
                    this.notifyBackToViewportWhenDomExist(row, row[this._dataViewIdProperty]);
                }
                else if (isOutOfVisibility) {
                    this.notifyOutOfViewport(row, row[this._dataViewIdProperty]);
                }
            });
        }
    }
    checkExpandableOverride(row, dataContext, grid) {
        if (typeof this._expandableOverride === 'function') {
            return this._expandableOverride(row, dataContext, grid);
        }
        return true;
    }
    checkIsRowOutOfViewportRange(rowIndex, renderedRange) {
        return (Math.abs(renderedRange.bottom - this._gridRowBuffer - rowIndex) > this._visibleRenderedCellCount * 2);
    }
    /** Get the Row Detail padding (which are the rows dedicated to the detail panel) */
    getPaddingItem(parent, offset) {
        const item = {};
        for (const prop in this.dataView) {
            if (prop) {
                item[prop] = null;
            }
        }
        item[this._dataViewIdProperty] = `${parent[this._dataViewIdProperty]}.${offset}`;
        // additional hidden padding metadata fields
        item[`${this._keyPrefix}collapsed`] = true;
        item[`${this._keyPrefix}isPadding`] = true;
        item[`${this._keyPrefix}parent`] = parent;
        item[`${this._keyPrefix}offset`] = offset;
        return item;
    }
    /** The Formatter of the toggling icon of the Row Detail */
    detailSelectionFormatter(row, cell, value, columnDef, dataContext, grid) {
        if (!this.checkExpandableOverride(row, dataContext, grid)) {
            return '';
        }
        else {
            if (dataContext[`${this._keyPrefix}collapsed`] === undefined) {
                dataContext[`${this._keyPrefix}collapsed`] = true;
                dataContext[`${this._keyPrefix}sizePadding`] = 0; // the required number of pading rows
                dataContext[`${this._keyPrefix}height`] = 0; // the actual height in pixels of the detail field
                dataContext[`${this._keyPrefix}isPadding`] = false;
                dataContext[`${this._keyPrefix}parent`] = undefined;
                dataContext[`${this._keyPrefix}offset`] = 0;
            }
            if (dataContext[`${this._keyPrefix}isPadding`]) {
                // render nothing
            }
            else if (dataContext[`${this._keyPrefix}collapsed`]) {
                let collapsedClasses = `${this._addonOptions.cssClass || ''} expand `;
                if (this._addonOptions.collapsedClass) {
                    collapsedClasses += this._addonOptions.collapsedClass;
                }
                return `<div class="${collapsedClasses.trim()}"></div>`;
            }
            else {
                const html = [];
                const rowHeight = this.gridOptions.rowHeight || 0;
                let outterHeight = (dataContext[`${this._keyPrefix}sizePadding`] || 0) * this.gridOptions.rowHeight;
                if (this._addonOptions.maxRows !== null && ((dataContext[`${this._keyPrefix}sizePadding`] || 0) > this._addonOptions.maxRows)) {
                    outterHeight = this._addonOptions.maxRows * rowHeight;
                    dataContext[`${this._keyPrefix}sizePadding`] = this._addonOptions.maxRows;
                }
                // V313HAX:
                // putting in an extra closing div after the closing toggle div and ommiting a
                // final closing div for the detail ctr div causes the slickgrid renderer to
                // insert our detail div as a new column ;) ~since it wraps whatever we provide
                // in a generic div column container. so our detail becomes a child directly of
                // the row not the cell. nice =)  ~no need to apply a css change to the parent
                // slick-cell to escape the cell overflow clipping.
                // sneaky extra </div> inserted here-----------------v
                let expandedClasses = `${this._addonOptions.cssClass || ''} collapse `;
                if (this._addonOptions.expandedClass) {
                    expandedClasses += this._addonOptions.expandedClass;
                }
                html.push(`<div class="${expandedClasses.trim()}"></div></div>`);
                html.push(`<div class="dynamic-cell-detail cellDetailView_${dataContext[this._dataViewIdProperty]}" `); // apply custom css to detail
                html.push(`style="height: ${outterHeight}px;`); // set total height of padding
                html.push(`top: ${rowHeight}px">`); // shift detail below 1st row
                html.push(`<div class="detail-container detailViewContainer_${dataContext[this._dataViewIdProperty]}">`); // sub ctr for custom styling
                html.push(`<div class="innerDetailView_${dataContext[this._dataViewIdProperty]}">${dataContext[`${this._keyPrefix}detailContent`]}</div></div>`);
                // omit a final closing detail container </div> that would come next
                return html.join('');
            }
        }
        return '';
    }
    /** When row is getting toggled, we will handle the action of collapsing/expanding */
    handleAccordionShowHide(item) {
        if (item) {
            if (!item[`${this._keyPrefix}collapsed`]) {
                this.collapseDetailView(item);
            }
            else {
                this.expandDetailView(item);
            }
        }
    }
    /** Handle mouse click event */
    handleClick(e, args) {
        const dataContext = this._grid.getDataItem(args.row);
        if (this.checkExpandableOverride(args.row, dataContext, this._grid)) {
            // clicking on a row select checkbox
            const columnDef = this._grid.getColumns()[args.cell];
            if (this._addonOptions.useRowClick || (columnDef.id === this._addonOptions.columnId && e.target.classList.contains(this._addonOptions.cssClass || ''))) {
                // if editing, try to commit
                if (this._grid.getEditorLock().isActive() && !this._grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                // trigger an event before toggling
                this.onBeforeRowDetailToggle.notify({
                    grid: this._grid,
                    item: dataContext
                });
                this.toggleRowSelection(args.row, dataContext);
                // trigger an event after toggling
                this.onAfterRowDetailToggle.notify({
                    grid: this._grid,
                    item: dataContext,
                    expandedRows: this._expandedRows,
                });
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
    }
    handleScroll() {
        if (this._addonOptions.useSimpleViewportCalc) {
            this.calculateOutOfRangeViewsSimplerVersion();
        }
        else {
            this.calculateOutOfRangeViews();
        }
    }
    notifyOutOfViewport(item, rowId) {
        const rowIndex = item.rowIndex || this.dataView.getRowById(item[this._dataViewIdProperty]);
        this.onRowOutOfViewportRange.notify({
            grid: this._grid,
            item,
            rowId,
            rowIndex,
            expandedRows: this._expandedRows,
            rowIdsOutOfViewport: this.syncOutOfViewportArray(rowId, true)
        });
    }
    notifyBackToViewportWhenDomExist(item, rowId) {
        const rowIndex = item.rowIndex || this.dataView.getRowById(item[this._dataViewIdProperty]);
        setTimeout(() => {
            // make sure View Row DOM Element really exist before notifying that it's a row that is visible again
            if (document.querySelector(`.${this.gridUid} .cellDetailView_${item[this._dataViewIdProperty]}`)) {
                this.onRowBackToViewportRange.notify({
                    grid: this._grid,
                    item,
                    rowId,
                    rowIndex,
                    expandedRows: this._expandedRows,
                    rowIdsOutOfViewport: this.syncOutOfViewportArray(rowId, false)
                });
            }
        }, 100);
    }
    syncOutOfViewportArray(rowId, isAdding) {
        const arrayRowIndex = this._rowIdsOutOfViewport.findIndex(outOfViewportRowId => outOfViewportRowId === rowId);
        if (isAdding && arrayRowIndex < 0) {
            this._rowIdsOutOfViewport.push(rowId);
        }
        else if (!isAdding && arrayRowIndex >= 0) {
            this._rowIdsOutOfViewport.splice(arrayRowIndex, 1);
        }
        return this._rowIdsOutOfViewport;
    }
    toggleRowSelection(rowNumber, dataContext) {
        if (this.checkExpandableOverride(rowNumber, dataContext, this._grid)) {
            this.dataView.beginUpdate();
            this.handleAccordionShowHide(dataContext);
            this.dataView.endUpdate();
        }
    }
}
//# sourceMappingURL=slickRowDetailView.js.map