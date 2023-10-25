"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickCustomTooltip = void 0;
const common_1 = require("@slickgrid-universal/common");
/**
 * A plugin to add Custom Tooltip when hovering a cell, it subscribes to the cell "onMouseEnter" and "onMouseLeave" events.
 * The "customTooltip" is defined in the Column Definition OR Grid Options (the first found will have priority over the second)
 * To specify a tooltip when hovering a cell, extend the column definition like so:
 *
 * Available plugin options (same options are available in both column definition and/or grid options)
 * Example 1  - via Column Definition
 *  this.columnDefinitions = [
 *    {
 *      id: "action", name: "Action", field: "action", formatter: fakeButtonFormatter,
 *      customTooltip: {
 *        formatter: tooltipTaskFormatter,
 *        usabilityOverride: (args) => !!(args.dataContext.id % 2) // show it only every second row
 *      }
 *    }
 *  ];
 *
 *  OR Example 2 - via Grid Options (for all columns), NOTE: the column definition tooltip options will win over the options defined in the grid options
 *  this.gridOptions = {
 *    enableCellNavigation: true,
 *    customTooltip: {
 *    },
 *  };
 */
class SlickCustomTooltip {
    constructor() {
        this._cellType = 'slick-cell';
        this._rxjs = null;
        this._sharedService = null;
        this._defaultOptions = {
            className: 'slick-custom-tooltip',
            offsetLeft: 0,
            offsetRight: 0,
            offsetTopBottom: 4,
            hideArrow: false,
            regularTooltipWhiteSpace: 'pre-line',
            whiteSpace: 'normal',
        };
        this.name = 'CustomTooltip';
        this._eventHandler = new Slick.EventHandler();
    }
    get addonOptions() {
        return this._addonOptions;
    }
    get cancellablePromise() {
        return this._cancellablePromise;
    }
    get cellAddonOptions() {
        return this._cellAddonOptions;
    }
    get className() {
        var _a, _b;
        return (_b = (_a = this._cellAddonOptions) === null || _a === void 0 ? void 0 : _a.className) !== null && _b !== void 0 ? _b : 'slick-custom-tooltip';
    }
    get dataView() {
        return this._grid.getData() || {};
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        return this._grid.getOptions() || {};
    }
    /** Getter for the grid uid */
    get gridUid() {
        var _a;
        return ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getUID()) || '';
    }
    get gridUidSelector() {
        return this.gridUid ? `.${this.gridUid}` : '';
    }
    get tooltipElm() {
        return this._tooltipElm;
    }
    addRxJsResource(rxjs) {
        this._rxjs = rxjs;
    }
    init(grid, containerService) {
        var _a, _b;
        this._grid = grid;
        this._rxjs = containerService.get('RxJsFacade');
        this._sharedService = containerService.get('SharedService');
        this._addonOptions = { ...this._defaultOptions, ...((_b = (_a = this._sharedService) === null || _a === void 0 ? void 0 : _a.gridOptions) === null || _b === void 0 ? void 0 : _b.customTooltip) };
        this._eventHandler
            .subscribe(grid.onMouseEnter, this.handleOnMouseEnter.bind(this))
            .subscribe(grid.onHeaderMouseEnter, (e, args) => this.handleOnHeaderMouseEnterByType(e, args, 'slick-header-column'))
            .subscribe(grid.onHeaderRowMouseEnter, (e, args) => this.handleOnHeaderMouseEnterByType(e, args, 'slick-headerrow-column'))
            .subscribe(grid.onMouseLeave, this.hideTooltip.bind(this))
            .subscribe(grid.onHeaderMouseLeave, this.hideTooltip.bind(this))
            .subscribe(grid.onHeaderRowMouseLeave, this.hideTooltip.bind(this));
    }
    dispose() {
        // hide (remove) any tooltip and unsubscribe from all events
        this.hideTooltip();
        this._cancellablePromise = undefined;
        this._eventHandler.unsubscribeAll();
    }
    /**
     * hide (remove) tooltip from the DOM, it will also remove it from the DOM and also cancel any pending requests (as mentioned below).
     * When using async process, it will also cancel any opened Promise/Observable that might still be pending.
     */
    hideTooltip() {
        var _a, _b;
        (_a = this._cancellablePromise) === null || _a === void 0 ? void 0 : _a.cancel();
        (_b = this._observable$) === null || _b === void 0 ? void 0 : _b.unsubscribe();
        const prevTooltip = document.body.querySelector(`.${this.className}${this.gridUidSelector}`);
        prevTooltip === null || prevTooltip === void 0 ? void 0 : prevTooltip.remove();
    }
    getOptions() {
        return this._addonOptions;
    }
    setOptions(newOptions) {
        this._addonOptions = { ...this._addonOptions, ...newOptions };
    }
    // --
    // protected functions
    // ---------------------
    /**
     * Async process callback will hide any prior tooltip & then merge the new result with the item `dataContext` under a `__params` property
     * (unless a new prop name is provided) to provice as dataContext object to the asyncPostFormatter.
     */
    asyncProcessCallback(asyncResult, cell, value, columnDef, dataContext) {
        var _a, _b, _c;
        this.hideTooltip();
        const itemWithAsyncData = { ...dataContext, [(_b = (_a = this.addonOptions) === null || _a === void 0 ? void 0 : _a.asyncParamsPropName) !== null && _b !== void 0 ? _b : '__params']: asyncResult };
        if ((_c = this._cellAddonOptions) === null || _c === void 0 ? void 0 : _c.useRegularTooltip) {
            this.renderRegularTooltip(this._cellAddonOptions.asyncPostFormatter, cell, value, columnDef, itemWithAsyncData);
        }
        else {
            this.renderTooltipFormatter(this._cellAddonOptions.asyncPostFormatter, cell, value, columnDef, itemWithAsyncData);
        }
    }
    /** depending on the selector type, execute the necessary handler code */
    handleOnHeaderMouseEnterByType(event, args, selector) {
        var _a, _b, _c;
        this._cellType = selector;
        // before doing anything, let's remove any previous tooltip before
        // and cancel any opened Promise/Observable when using async
        this.hideTooltip();
        const cell = {
            row: -1,
            cell: this._grid.getColumns().findIndex((col) => { var _a, _b; return ((_b = (_a = args === null || args === void 0 ? void 0 : args.column) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '') === col.id; })
        };
        const columnDef = args.column;
        const item = {};
        const isHeaderRowType = selector === 'slick-headerrow-column';
        // run the override function (when defined), if the result is false it won't go further
        args = args || {};
        args.cell = cell.cell;
        args.row = cell.row;
        args.columnDef = columnDef;
        args.dataContext = item;
        args.grid = this._grid;
        args.type = isHeaderRowType ? 'header-row' : 'header';
        this._cellAddonOptions = { ...this._addonOptions, ...(columnDef === null || columnDef === void 0 ? void 0 : columnDef.customTooltip) };
        if ((columnDef === null || columnDef === void 0 ? void 0 : columnDef.disableTooltip) || (typeof ((_a = this._cellAddonOptions) === null || _a === void 0 ? void 0 : _a.usabilityOverride) === 'function' && !this._cellAddonOptions.usabilityOverride(args))) {
            return;
        }
        if (columnDef && event.target) {
            this._cellNodeElm = event.target.closest(`.${selector}`);
            const formatter = isHeaderRowType ? this._cellAddonOptions.headerRowFormatter : this._cellAddonOptions.headerFormatter;
            if (((_b = this._cellAddonOptions) === null || _b === void 0 ? void 0 : _b.useRegularTooltip) || !formatter) {
                const formatterOrText = !isHeaderRowType ? columnDef.name : ((_c = this._cellAddonOptions) === null || _c === void 0 ? void 0 : _c.useRegularTooltip) ? null : formatter;
                this.renderRegularTooltip(formatterOrText, cell, null, columnDef, item);
            }
            else if (this._cellNodeElm && typeof formatter === 'function') {
                this.renderTooltipFormatter(formatter, cell, null, columnDef, item);
            }
        }
    }
    async handleOnMouseEnter(event) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this._cellType = 'slick-cell';
        // before doing anything, let's remove any previous tooltip before
        // and cancel any opened Promise/Observable when using async
        this.hideTooltip();
        if (event && this._grid) {
            // get cell only when it's possible (ie, Composite Editor will not be able to get cell and so it will never show any tooltip)
            const targetClassName = (_b = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.closest('.slick-cell')) === null || _b === void 0 ? void 0 : _b.className;
            const cell = (targetClassName && /l\d+/.exec(targetClassName || '')) ? this._grid.getCellFromEvent(event) : null;
            if (cell) {
                const item = this.dataView ? this.dataView.getItem(cell.row) : this._grid.getDataItem(cell.row);
                const columnDef = this._grid.getColumns()[cell.cell];
                this._cellNodeElm = this._grid.getCellNode(cell.row, cell.cell);
                if (item && columnDef) {
                    this._cellAddonOptions = { ...this._addonOptions, ...(columnDef === null || columnDef === void 0 ? void 0 : columnDef.customTooltip) };
                    if ((columnDef === null || columnDef === void 0 ? void 0 : columnDef.disableTooltip) || (typeof ((_c = this._cellAddonOptions) === null || _c === void 0 ? void 0 : _c.usabilityOverride) === 'function' && !this._cellAddonOptions.usabilityOverride({ cell: cell.cell, row: cell.row, dataContext: item, column: columnDef, grid: this._grid, type: 'cell' }))) {
                        return;
                    }
                    const value = item.hasOwnProperty(columnDef.field) ? item[columnDef.field] : null;
                    // when cell is currently lock for editing, we'll force a tooltip title search
                    const cellValue = this._grid.getEditorLock().isActive() ? null : value;
                    // when there aren't any formatter OR when user specifically want to use a regular tooltip (via "title" attribute)
                    if ((this._cellAddonOptions.useRegularTooltip && !((_d = this._cellAddonOptions) === null || _d === void 0 ? void 0 : _d.asyncProcess)) || !((_e = this._cellAddonOptions) === null || _e === void 0 ? void 0 : _e.formatter)) {
                        this.renderRegularTooltip(columnDef.formatter, cell, cellValue, columnDef, item);
                    }
                    else {
                        // when we aren't using regular tooltip and we do have a tooltip formatter, let's render it
                        if (typeof ((_f = this._cellAddonOptions) === null || _f === void 0 ? void 0 : _f.formatter) === 'function') {
                            this.renderTooltipFormatter(this._cellAddonOptions.formatter, cell, cellValue, columnDef, item);
                        }
                        // when tooltip is an Async (delayed, e.g. with a backend API call)
                        if (typeof ((_g = this._cellAddonOptions) === null || _g === void 0 ? void 0 : _g.asyncProcess) === 'function') {
                            const asyncProcess = this._cellAddonOptions.asyncProcess(cell.row, cell.cell, value, columnDef, item, this._grid);
                            if (!this._cellAddonOptions.asyncPostFormatter) {
                                console.error(`[Slickgrid-Universal] when using "asyncProcess" with Custom Tooltip, you must also provide an "asyncPostFormatter" formatter.`);
                            }
                            if (asyncProcess instanceof Promise) {
                                // create a new cancellable promise which will resolve, unless it's cancelled, with the udpated `dataContext` object that includes the `__params`
                                this._cancellablePromise = (0, common_1.cancellablePromise)(asyncProcess);
                                this._cancellablePromise.promise
                                    .then((asyncResult) => this.asyncProcessCallback(asyncResult, cell, value, columnDef, item))
                                    .catch((error) => {
                                    // we will throw back any errors, unless it's a cancelled promise which in that case will be disregarded (thrown by the promise wrapper cancel() call)
                                    if (!(error instanceof common_1.CancelledException)) {
                                        console.error(error);
                                    }
                                });
                            }
                            else if ((_h = this._rxjs) === null || _h === void 0 ? void 0 : _h.isObservable(asyncProcess)) {
                                const rxjs = this._rxjs;
                                this._observable$ = asyncProcess
                                    .pipe(
                                // use `switchMap` so that it cancels any previous subscription, it must return an observable so we can use `of` for that, and then finally we can subscribe to the new observable
                                rxjs.switchMap((asyncResult) => rxjs.of(asyncResult))).subscribe((asyncResult) => this.asyncProcessCallback(asyncResult, cell, value, columnDef, item), (error) => console.error(error));
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * Parse the Custom Formatter (when provided) or return directly the text when it is already a string.
     * We will also sanitize the text in both cases before returning it so that it can be used safely.
     */
    parseFormatterAndSanitize(formatterOrText, cell, value, columnDef, item) {
        if (typeof formatterOrText === 'function') {
            const tooltipText = formatterOrText(cell.row, cell.cell, value, columnDef, item, this._grid);
            const formatterText = (typeof tooltipText === 'object' && (tooltipText === null || tooltipText === void 0 ? void 0 : tooltipText.text)) ? tooltipText.text : (typeof tooltipText === 'string' ? tooltipText : '');
            return (0, common_1.sanitizeTextByAvailableSanitizer)(this.gridOptions, formatterText);
        }
        else if (typeof formatterOrText === 'string') {
            return (0, common_1.sanitizeTextByAvailableSanitizer)(this.gridOptions, formatterOrText);
        }
        return '';
    }
    /**
     * Parse the cell formatter and assume it might be html
     * then create a temporary html element to easily retrieve the first [title=""] attribute text content
     * also clear the "title" attribute from the grid div text content so that it won't show also as a 2nd browser tooltip
     */
    renderRegularTooltip(formatterOrText, cell, value, columnDef, item) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const tmpDiv = (0, common_1.createDomElement)('div', { innerHTML: this.parseFormatterAndSanitize(formatterOrText, cell, value, columnDef, item) });
        let tooltipText = (_a = columnDef === null || columnDef === void 0 ? void 0 : columnDef.toolTip) !== null && _a !== void 0 ? _a : '';
        let tmpTitleElm;
        if (!tooltipText) {
            if (this._cellType === 'slick-cell' && this._cellNodeElm && (this._cellNodeElm.clientWidth < this._cellNodeElm.scrollWidth) && !((_b = this._cellAddonOptions) === null || _b === void 0 ? void 0 : _b.useRegularTooltipFromFormatterOnly)) {
                tooltipText = (_d = (_c = this._cellNodeElm.textContent) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '';
                if (((_e = this._cellAddonOptions) === null || _e === void 0 ? void 0 : _e.tooltipTextMaxLength) && tooltipText.length > ((_f = this._cellAddonOptions) === null || _f === void 0 ? void 0 : _f.tooltipTextMaxLength)) {
                    tooltipText = tooltipText.substring(0, this._cellAddonOptions.tooltipTextMaxLength - 3) + '...';
                }
                tmpTitleElm = this._cellNodeElm;
            }
            else {
                if ((_g = this._cellAddonOptions) === null || _g === void 0 ? void 0 : _g.useRegularTooltipFromFormatterOnly) {
                    tmpTitleElm = tmpDiv.querySelector('[title], [data-slick-tooltip]');
                }
                else {
                    tmpTitleElm = (0, common_1.findFirstElementAttribute)(this._cellNodeElm, ['title', 'data-slick-tooltip']) ? this._cellNodeElm : tmpDiv.querySelector('[title], [data-slick-tooltip]');
                    if ((!tmpTitleElm || !(0, common_1.findFirstElementAttribute)(tmpTitleElm, ['title', 'data-slick-tooltip'])) && this._cellNodeElm) {
                        tmpTitleElm = this._cellNodeElm.querySelector('[title], [data-slick-tooltip]');
                    }
                }
                if (!tooltipText || (typeof formatterOrText === 'function' && ((_h = this._cellAddonOptions) === null || _h === void 0 ? void 0 : _h.useRegularTooltipFromFormatterOnly))) {
                    tooltipText = (0, common_1.findFirstElementAttribute)(tmpTitleElm, ['title', 'data-slick-tooltip']) || '';
                }
            }
        }
        if (tooltipText !== '') {
            this.renderTooltipFormatter(formatterOrText, cell, value, columnDef, item, tooltipText);
        }
        // also clear any "title" attribute to avoid showing a 2nd browser tooltip
        this.swapAndClearTitleAttribute(tmpTitleElm, tooltipText);
    }
    renderTooltipFormatter(formatter, cell, value, columnDef, item, tooltipText, inputTitleElm) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        // create the tooltip DOM element with the text returned by the Formatter
        this._tooltipElm = (0, common_1.createDomElement)('div', { className: this.className });
        this._tooltipElm.classList.add(this.gridUid);
        this._tooltipElm.classList.add('l' + cell.cell);
        this._tooltipElm.classList.add('r' + cell.cell);
        // when cell is currently lock for editing, we'll force a tooltip title search
        // that can happen when user has a formatter but is currently editing and in that case we want the new value
        // ie: when user is currently editing and uses the Slider, when dragging its value is changing, so we wish to use the editing value instead of the previous cell value.
        if (value === null || value === undefined) {
            const tmpTitleElm = (_a = this._cellNodeElm) === null || _a === void 0 ? void 0 : _a.querySelector('[title], [data-slick-tooltip]');
            value = (0, common_1.findFirstElementAttribute)(tmpTitleElm, ['title', 'data-slick-tooltip']) || value;
        }
        let outputText = tooltipText || this.parseFormatterAndSanitize(formatter, cell, value, columnDef, item) || '';
        outputText = (((_b = this._cellAddonOptions) === null || _b === void 0 ? void 0 : _b.tooltipTextMaxLength) && outputText.length > this._cellAddonOptions.tooltipTextMaxLength) ? outputText.substring(0, this._cellAddonOptions.tooltipTextMaxLength - 3) + '...' : outputText;
        let finalOutputText = '';
        if (!tooltipText || ((_c = this._cellAddonOptions) === null || _c === void 0 ? void 0 : _c.renderRegularTooltipAsHtml)) {
            finalOutputText = (0, common_1.sanitizeTextByAvailableSanitizer)(this.gridOptions, outputText);
            this._tooltipElm.innerHTML = finalOutputText;
            this._tooltipElm.style.whiteSpace = (_e = (_d = this._cellAddonOptions) === null || _d === void 0 ? void 0 : _d.whiteSpace) !== null && _e !== void 0 ? _e : this._defaultOptions.whiteSpace;
        }
        else {
            finalOutputText = outputText || '';
            this._tooltipElm.textContent = finalOutputText;
            this._tooltipElm.style.whiteSpace = (_g = (_f = this._cellAddonOptions) === null || _f === void 0 ? void 0 : _f.regularTooltipWhiteSpace) !== null && _g !== void 0 ? _g : this._defaultOptions.regularTooltipWhiteSpace; // use `pre` so that sequences of white space are collapsed. Lines are broken at newline characters
        }
        // optional max height/width of the tooltip container
        if ((_h = this._cellAddonOptions) === null || _h === void 0 ? void 0 : _h.maxHeight) {
            this._tooltipElm.style.maxHeight = `${this._cellAddonOptions.maxHeight}px`;
        }
        if ((_j = this._cellAddonOptions) === null || _j === void 0 ? void 0 : _j.maxWidth) {
            this._tooltipElm.style.maxWidth = `${this._cellAddonOptions.maxWidth}px`;
        }
        // when do have text to show, then append the new tooltip to the html body & reposition the tooltip
        if (finalOutputText) {
            document.body.appendChild(this._tooltipElm);
            // reposition the tooltip on top of the cell that triggered the mouse over event
            this.reposition(cell);
            // user could optionally hide the tooltip arrow (we can simply update the CSS variables, that's the only way we have to update CSS pseudo)
            if (!((_k = this._cellAddonOptions) === null || _k === void 0 ? void 0 : _k.hideArrow)) {
                this._tooltipElm.classList.add('tooltip-arrow');
            }
            // also clear any "title" attribute to avoid showing a 2nd browser tooltip
            this.swapAndClearTitleAttribute(inputTitleElm, outputText);
        }
    }
    /**
     * Reposition the Tooltip to be top-left position over the cell.
     * By default we use an "auto" mode which will allow to position the Tooltip to the best logical position in the window, also when we mention position, we are talking about the relative position against the grid cell.
     * We can assume that in 80% of the time the default position is top-right, the default is "auto" but we can also override it and use a specific position.
     * Most of the time positioning of the tooltip will be to the "top-right" of the cell is ok but if our column is completely on the right side then we'll want to change the position to "left" align.
     * Same goes for the top/bottom position, Most of the time positioning the tooltip to the "top" but if we are hovering a cell at the top of the grid and there's no room to display it then we might need to reposition to "bottom" instead.
     */
    reposition(cell) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (this._tooltipElm) {
            this._cellNodeElm = this._cellNodeElm || this._grid.getCellNode(cell.row, cell.cell);
            const cellPosition = (0, common_1.getHtmlElementOffset)(this._cellNodeElm) || { top: 0, left: 0 };
            const cellContainerWidth = this._cellNodeElm.offsetWidth;
            const calculatedTooltipHeight = this._tooltipElm.getBoundingClientRect().height;
            const calculatedTooltipWidth = this._tooltipElm.getBoundingClientRect().width;
            const calculatedBodyWidth = document.body.offsetWidth || window.innerWidth;
            // first calculate the default (top/left) position
            let newPositionTop = (cellPosition.top || 0) - this._tooltipElm.offsetHeight - ((_b = (_a = this._cellAddonOptions) === null || _a === void 0 ? void 0 : _a.offsetTopBottom) !== null && _b !== void 0 ? _b : 0);
            let newPositionLeft = (cellPosition.left || 0) - ((_d = (_c = this._cellAddonOptions) === null || _c === void 0 ? void 0 : _c.offsetRight) !== null && _d !== void 0 ? _d : 0);
            // user could explicitely use a "left-align" arrow position, (when user knows his column is completely on the right in the grid)
            // or when using "auto" and we detect not enough available space then we'll position to the "left" of the cell
            // NOTE the class name is for the arrow and is inverse compare to the tooltip itself, so if user ask for "left-align", then the arrow will in fact be "arrow-right-align"
            const position = (_f = (_e = this._cellAddonOptions) === null || _e === void 0 ? void 0 : _e.position) !== null && _f !== void 0 ? _f : 'auto';
            if (position === 'center') {
                newPositionLeft += (cellContainerWidth / 2) - (calculatedTooltipWidth / 2) + ((_h = (_g = this._cellAddonOptions) === null || _g === void 0 ? void 0 : _g.offsetRight) !== null && _h !== void 0 ? _h : 0);
                this._tooltipElm.classList.remove('arrow-left-align');
                this._tooltipElm.classList.remove('arrow-right-align');
                this._tooltipElm.classList.add('arrow-center-align');
            }
            else if (position === 'right-align' || ((position === 'auto' || position !== 'left-align') && (newPositionLeft + calculatedTooltipWidth) > calculatedBodyWidth)) {
                newPositionLeft -= (calculatedTooltipWidth - cellContainerWidth - ((_k = (_j = this._cellAddonOptions) === null || _j === void 0 ? void 0 : _j.offsetLeft) !== null && _k !== void 0 ? _k : 0));
                this._tooltipElm.classList.remove('arrow-center-align');
                this._tooltipElm.classList.remove('arrow-left-align');
                this._tooltipElm.classList.add('arrow-right-align');
            }
            else {
                this._tooltipElm.classList.remove('arrow-center-align');
                this._tooltipElm.classList.remove('arrow-right-align');
                this._tooltipElm.classList.add('arrow-left-align');
            }
            // do the same calculation/reposition with top/bottom (default is top of the cell or in other word starting from the cell going down)
            // NOTE the class name is for the arrow and is inverse compare to the tooltip itself, so if user ask for "bottom", then the arrow will in fact be "arrow-top"
            if (position === 'bottom' || ((position === 'auto' || position !== 'top') && calculatedTooltipHeight > (0, common_1.calculateAvailableSpace)(this._cellNodeElm).top)) {
                newPositionTop = (cellPosition.top || 0) + ((_l = this.gridOptions.rowHeight) !== null && _l !== void 0 ? _l : 0) + ((_o = (_m = this._cellAddonOptions) === null || _m === void 0 ? void 0 : _m.offsetTopBottom) !== null && _o !== void 0 ? _o : 0);
                this._tooltipElm.classList.remove('arrow-down');
                this._tooltipElm.classList.add('arrow-up');
            }
            else {
                this._tooltipElm.classList.add('arrow-down');
                this._tooltipElm.classList.remove('arrow-up');
            }
            // reposition the tooltip over the cell (90% of the time this will end up using a position on the "right" of the cell)
            this._tooltipElm.style.top = `${newPositionTop}px`;
            this._tooltipElm.style.left = `${newPositionLeft}px`;
        }
    }
    /**
     * swap and copy the "title" attribute into a new custom attribute then clear the "title" attribute
     * from the grid div text content so that it won't show also as a 2nd browser tooltip
     */
    swapAndClearTitleAttribute(inputTitleElm, tooltipText) {
        var _a;
        // the title attribute might be directly on the slick-cell container element (when formatter returns a result object)
        // OR in a child element (most commonly as a custom formatter)
        const titleElm = inputTitleElm || (this._cellNodeElm && ((this._cellNodeElm.hasAttribute('title') && this._cellNodeElm.getAttribute('title')) ? this._cellNodeElm : (_a = this._cellNodeElm) === null || _a === void 0 ? void 0 : _a.querySelector('[title]')));
        // flip tooltip text from `title` to `data-slick-tooltip`
        if (titleElm) {
            titleElm.setAttribute('data-slick-tooltip', tooltipText || '');
            if (titleElm.hasAttribute('title')) {
                titleElm.setAttribute('title', '');
            }
        }
    }
}
exports.SlickCustomTooltip = SlickCustomTooltip;
//# sourceMappingURL=slickCustomTooltip.js.map