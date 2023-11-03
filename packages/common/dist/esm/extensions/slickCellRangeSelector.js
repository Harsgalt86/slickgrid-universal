import { deepMerge } from '@slickgrid-universal/utils';
import { emptyElement, getHtmlElementOffset, } from '../services/domUtilities';
import { SlickCellRangeDecorator } from './index';
export class SlickCellRangeSelector {
    constructor(options) {
        this._currentlySelectedRange = null;
        this._dragging = false;
        this._gridUid = '';
        // Frozen row & column variables
        this._columnOffset = 0;
        this._rowOffset = 0;
        this._isRightCanvas = false;
        this._isBottomCanvas = false;
        this._xDelayForNextCell = 0;
        this._yDelayForNextCell = 0;
        this._viewportHeight = 0;
        this._viewportWidth = 0;
        this._isRowMoveRegistered = false;
        // Scrollings
        this._scrollLeft = 0;
        this._scrollTop = 0;
        this._defaults = {
            autoScroll: true,
            minIntervalToShowNextCell: 30,
            maxIntervalToShowNextCell: 600,
            accelerateInterval: 5,
            selectionCss: {
                border: '2px dashed blue'
            }
        };
        this.pluginName = 'CellRangeSelector';
        this.onBeforeCellRangeSelected = new Slick.Event();
        this.onCellRangeSelecting = new Slick.Event();
        this.onCellRangeSelected = new Slick.Event();
        this._eventHandler = new Slick.EventHandler();
        this._addonOptions = deepMerge(this._defaults, options);
    }
    get addonOptions() {
        return this._addonOptions;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    /** Getter for the grid uid */
    get gridUid() {
        var _a, _b;
        return this._gridUid || ((_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getUID()) !== null && _b !== void 0 ? _b : '');
    }
    get gridUidSelector() {
        return this.gridUid ? `.${this.gridUid}` : '';
    }
    init(grid) {
        this._grid = grid;
        this._decorator = this._addonOptions.cellDecorator || new SlickCellRangeDecorator(grid, this._addonOptions);
        this._canvas = grid.getCanvasNode();
        this._gridOptions = grid.getOptions();
        this._gridUid = grid.getUID();
        this._eventHandler
            .subscribe(this._grid.onDrag, this.handleDrag.bind(this))
            .subscribe(this._grid.onDragInit, this.handleDragInit.bind(this))
            .subscribe(this._grid.onDragStart, this.handleDragStart.bind(this))
            .subscribe(this._grid.onDragEnd, this.handleDragEnd.bind(this))
            .subscribe(this._grid.onScroll, this.handleScroll.bind(this));
    }
    destroy() {
        this.dispose();
    }
    /** Dispose the plugin. */
    dispose() {
        var _a, _b;
        (_a = this._eventHandler) === null || _a === void 0 ? void 0 : _a.unsubscribeAll();
        emptyElement(this._activeCanvas);
        emptyElement(this._canvas);
        (_b = this._decorator) === null || _b === void 0 ? void 0 : _b.dispose();
        this.stopIntervalTimer();
    }
    getCellDecorator() {
        return this._decorator;
    }
    getCurrentRange() {
        return this._currentlySelectedRange;
    }
    getMouseOffsetViewport(e, dd) {
        var _a, _b, _c, _d;
        const targetEvent = (_b = (_a = e === null || e === void 0 ? void 0 : e.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : e;
        const viewportLeft = this._activeViewport.scrollLeft;
        const viewportTop = this._activeViewport.scrollTop;
        const viewportRight = viewportLeft + this._viewportWidth;
        const viewportBottom = viewportTop + this._viewportHeight;
        const viewportOffset = getHtmlElementOffset(this._activeViewport);
        const viewportOffsetLeft = (_c = viewportOffset === null || viewportOffset === void 0 ? void 0 : viewportOffset.left) !== null && _c !== void 0 ? _c : 0;
        const viewportOffsetTop = (_d = viewportOffset === null || viewportOffset === void 0 ? void 0 : viewportOffset.top) !== null && _d !== void 0 ? _d : 0;
        const viewportOffsetRight = viewportOffsetLeft + this._viewportWidth;
        const viewportOffsetBottom = viewportOffsetTop + this._viewportHeight;
        const result = {
            e,
            dd,
            viewport: {
                left: viewportLeft, top: viewportTop, right: viewportRight, bottom: viewportBottom,
                offset: { left: viewportOffsetLeft, top: viewportOffsetTop, right: viewportOffsetRight, bottom: viewportOffsetBottom }
            },
            // Consider the viewport as the origin, the `offset` is based on the coordinate system:
            // the cursor is on the viewport's left/bottom when it is less than 0, and on the right/top when greater than 0.
            offset: { x: 0, y: 0 },
            isOutsideViewport: false
        };
        // ... horizontal
        if (targetEvent.pageX < viewportOffsetLeft) {
            result.offset.x = targetEvent.pageX - viewportOffsetLeft;
        }
        else if (targetEvent.pageX > viewportOffsetRight) {
            result.offset.x = targetEvent.pageX - viewportOffsetRight;
        }
        // ... vertical
        if (targetEvent.pageY < viewportOffsetTop) {
            result.offset.y = viewportOffsetTop - targetEvent.pageY;
        }
        else if (targetEvent.pageY > viewportOffsetBottom) {
            result.offset.y = viewportOffsetBottom - targetEvent.pageY;
        }
        result.isOutsideViewport = !!result.offset.x || !!result.offset.y;
        return result;
    }
    stopIntervalTimer() {
        if (this._autoScrollTimerId) {
            clearInterval(this._autoScrollTimerId);
            this._autoScrollTimerId = undefined;
        }
    }
    //
    // protected functions
    // ---------------------
    handleDrag(e, dd) {
        if (!this._dragging && !this._gridOptions.enableRowMoveManager) {
            return;
        }
        if (!this._gridOptions.enableRowMoveManager) {
            e.stopImmediatePropagation();
        }
        if (this.addonOptions.autoScroll) {
            this._draggingMouseOffset = this.getMouseOffsetViewport(e, dd);
            if (this._draggingMouseOffset.isOutsideViewport) {
                return this.handleDragOutsideViewport();
            }
        }
        this.stopIntervalTimer();
        this.handleDragTo(e, dd);
    }
    handleDragOutsideViewport() {
        this._xDelayForNextCell = this.addonOptions.maxIntervalToShowNextCell - Math.abs(this._draggingMouseOffset.offset.x) * this.addonOptions.accelerateInterval;
        this._yDelayForNextCell = this.addonOptions.maxIntervalToShowNextCell - Math.abs(this._draggingMouseOffset.offset.y) * this.addonOptions.accelerateInterval;
        // only one timer is created to handle the case that cursor outside the viewport
        if (!this._autoScrollTimerId) {
            let xTotalDelay = 0;
            let yTotalDelay = 0;
            this._autoScrollTimerId = setInterval(() => {
                let xNeedUpdate = false;
                let yNeedUpdate = false;
                // ... horizontal
                if (this._draggingMouseOffset.offset.x) {
                    xTotalDelay += this.addonOptions.minIntervalToShowNextCell;
                    xNeedUpdate = xTotalDelay >= this._xDelayForNextCell;
                }
                else {
                    xTotalDelay = 0;
                }
                // ... vertical
                if (this._draggingMouseOffset.offset.y) {
                    yTotalDelay += this.addonOptions.minIntervalToShowNextCell;
                    yNeedUpdate = yTotalDelay >= this._yDelayForNextCell;
                }
                else {
                    yTotalDelay = 0;
                }
                if (xNeedUpdate || yNeedUpdate) {
                    if (xNeedUpdate) {
                        xTotalDelay = 0;
                    }
                    if (yNeedUpdate) {
                        yTotalDelay = 0;
                    }
                    this.handleDragToNewPosition(xNeedUpdate, yNeedUpdate);
                }
            }, this.addonOptions.minIntervalToShowNextCell);
        }
    }
    handleDragToNewPosition(xNeedUpdate, yNeedUpdate) {
        let pageX = this._draggingMouseOffset.e.pageX;
        let pageY = this._draggingMouseOffset.e.pageY;
        const mouseOffsetX = this._draggingMouseOffset.offset.x;
        const mouseOffsetY = this._draggingMouseOffset.offset.y;
        const viewportOffset = this._draggingMouseOffset.viewport.offset;
        // ... horizontal
        if (xNeedUpdate && mouseOffsetX) {
            if (mouseOffsetX > 0) {
                pageX = viewportOffset.right + this._moveDistanceForOneCell.x;
            }
            else {
                pageX = viewportOffset.left - this._moveDistanceForOneCell.x;
            }
        }
        // ... vertical
        if (yNeedUpdate && mouseOffsetY) {
            if (mouseOffsetY > 0) {
                pageY = viewportOffset.top - this._moveDistanceForOneCell.y;
            }
            else {
                pageY = viewportOffset.bottom + this._moveDistanceForOneCell.y;
            }
        }
        this.handleDragTo({ pageX, pageY }, this._draggingMouseOffset.dd);
    }
    handleDragTo(e, dd) {
        var _a, _b, _c, _d, _f, _g;
        const targetEvent = (_b = (_a = e === null || e === void 0 ? void 0 : e.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : e;
        const end = this._grid.getCellFromPoint(targetEvent.pageX - ((_d = (_c = getHtmlElementOffset(this._activeCanvas)) === null || _c === void 0 ? void 0 : _c.left) !== null && _d !== void 0 ? _d : 0) + this._columnOffset, targetEvent.pageY - ((_g = (_f = getHtmlElementOffset(this._activeCanvas)) === null || _f === void 0 ? void 0 : _f.top) !== null && _g !== void 0 ? _g : 0) + this._rowOffset);
        if (end !== undefined) {
            // ... frozen column(s),
            if (this._gridOptions.frozenColumn >= 0 && ((!this._isRightCanvas && (end.cell > this._gridOptions.frozenColumn)) || (this._isRightCanvas && (end.cell <= this._gridOptions.frozenColumn)))) {
                return;
            }
            // ... or frozen row(s)
            if (this._gridOptions.frozenRow >= 0 && ((!this._isBottomCanvas && (end.row >= this._gridOptions.frozenRow)) || (this._isBottomCanvas && (end.row < this._gridOptions.frozenRow)))) {
                return;
            }
            // scrolling the viewport to display the target `end` cell if it is not fully displayed
            if (this.addonOptions.autoScroll && this._draggingMouseOffset) {
                const endCellBox = this._grid.getCellNodeBox(end.row, end.cell);
                if (endCellBox) {
                    const viewport = this._draggingMouseOffset.viewport;
                    if (endCellBox.left < viewport.left || endCellBox.right > viewport.right || endCellBox.top < viewport.top || endCellBox.bottom > viewport.bottom) {
                        this._grid.scrollCellIntoView(end.row, end.cell);
                    }
                }
            }
            // ... or regular grid (without any frozen options)
            if (!this._grid.canCellBeSelected(end.row, end.cell)) {
                return;
            }
            if (dd === null || dd === void 0 ? void 0 : dd.range) {
                dd.range.end = end;
                const range = new Slick.Range(dd.range.start.row, dd.range.start.cell, end.row, end.cell);
                this._decorator.show(range);
                this.onCellRangeSelecting.notify({ range });
            }
        }
    }
    handleDragEnd(e, dd) {
        if (this._dragging) {
            this._dragging = false;
            e.stopImmediatePropagation();
            this.stopIntervalTimer();
            this._decorator.hide();
            this.onCellRangeSelected.notify({
                range: new Slick.Range(dd.range.start.row, dd.range.start.cell, dd.range.end.row, dd.range.end.cell)
            });
        }
    }
    handleDragInit(e) {
        var _a, _b, _c, _d;
        // Set the active canvas node because the decorator needs to append its
        // box to the correct canvas
        this._activeCanvas = this._grid.getActiveCanvasNode(e);
        this._activeViewport = this._grid.getActiveViewportNode(e);
        const scrollbarDimensions = this._grid.getDisplayedScrollbarDimensions();
        this._viewportWidth = this._activeViewport.offsetWidth - scrollbarDimensions.width;
        this._viewportHeight = this._activeViewport.offsetHeight - scrollbarDimensions.height;
        this._moveDistanceForOneCell = {
            x: this._grid.getAbsoluteColumnMinWidth() / 2,
            y: this._gridOptions.rowHeight / 2
        };
        this._rowOffset = 0;
        this._columnOffset = 0;
        this._isBottomCanvas = this._activeCanvas.classList.contains('grid-canvas-bottom');
        if (this._gridOptions.frozenRow > -1 && this._isBottomCanvas) {
            const canvasSelector = `${this.gridUidSelector} .grid-canvas-${this._gridOptions.frozenBottom ? 'bottom' : 'top'}`;
            this._rowOffset = (_b = (_a = document.querySelector(canvasSelector)) === null || _a === void 0 ? void 0 : _a.clientHeight) !== null && _b !== void 0 ? _b : 0;
        }
        this._isRightCanvas = this._activeCanvas.classList.contains('grid-canvas-right');
        if (this._gridOptions.frozenColumn > -1 && this._isRightCanvas) {
            this._columnOffset = (_d = (_c = document.querySelector(`${this.gridUidSelector} .grid-canvas-left`)) === null || _c === void 0 ? void 0 : _c.clientWidth) !== null && _d !== void 0 ? _d : 0;
        }
        // prevent the grid from cancelling drag'n'drop by default
        e.stopImmediatePropagation();
        e.preventDefault();
    }
    handleDragStart(e, dd) {
        var _a, _b, _c, _d;
        const cellObj = this._grid.getCellFromEvent(e);
        if (cellObj && this.onBeforeCellRangeSelected.notify(cellObj).getReturnValue() !== false && this._grid.canCellBeSelected(cellObj.row, cellObj.cell)) {
            this._dragging = true;
            e.stopImmediatePropagation();
        }
        if (!this._dragging) {
            return;
        }
        this._grid.focus();
        let startX = dd.startX - ((_b = (_a = getHtmlElementOffset(this._canvas)) === null || _a === void 0 ? void 0 : _a.left) !== null && _b !== void 0 ? _b : 0);
        if (this._gridOptions.frozenColumn >= 0 && this._isRightCanvas) {
            startX += this._scrollLeft;
        }
        let startY = dd.startY - ((_d = (_c = getHtmlElementOffset(this._canvas)) === null || _c === void 0 ? void 0 : _c.top) !== null && _d !== void 0 ? _d : 0);
        if (this._gridOptions.frozenRow >= 0 && this._isBottomCanvas) {
            startY += this._scrollTop;
        }
        const start = this._grid.getCellFromPoint(startX, startY);
        dd.range = { start, end: {} };
        this._currentlySelectedRange = dd.range;
        return this._decorator.show(new Slick.Range(start.row, start.cell));
    }
    handleScroll(_e, args) {
        this._scrollTop = args.scrollTop;
        this._scrollLeft = args.scrollLeft;
    }
}
//# sourceMappingURL=slickCellRangeSelector.js.map