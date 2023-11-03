import { SlickCellRangeSelector } from './index';
export class SlickCellSelectionModel {
    constructor(options) {
        this._cachedPageRowCount = 0;
        this._prevKeyDown = '';
        this._ranges = [];
        this._defaults = {
            selectActiveCell: true,
        };
        this.onSelectedRangesChanged = new Slick.Event();
        this.pluginName = 'CellSelectionModel';
        this._eventHandler = new Slick.EventHandler();
        if (options === undefined || options.cellRangeSelector === undefined) {
            this._selector = new SlickCellRangeSelector({ selectionCss: { border: '2px solid black' } });
        }
        else {
            this._selector = options.cellRangeSelector;
        }
        this._addonOptions = options;
    }
    get addonOptions() {
        return this._addonOptions;
    }
    get cellRangeSelector() {
        return this._selector;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    init(grid) {
        var _a;
        this._grid = grid;
        if (this.hasDataView()) {
            this._dataView = (_a = grid === null || grid === void 0 ? void 0 : grid.getData()) !== null && _a !== void 0 ? _a : {};
        }
        this._addonOptions = { ...this._defaults, ...this._addonOptions };
        this._eventHandler
            .subscribe(this._grid.onActiveCellChanged, this.handleActiveCellChange.bind(this))
            .subscribe(this._grid.onKeyDown, this.handleKeyDown.bind(this))
            .subscribe(this._selector.onBeforeCellRangeSelected, this.handleBeforeCellRangeSelected.bind(this))
            .subscribe(this._selector.onCellRangeSelected, this.handleCellRangeSelected.bind(this));
        // register the cell range selector plugin
        grid.registerPlugin(this._selector);
    }
    destroy() {
        this.dispose();
    }
    dispose() {
        var _a, _b;
        if (this._selector) {
            this._selector.onBeforeCellRangeSelected.unsubscribe(this.handleBeforeCellRangeSelected.bind(this));
            this._selector.onCellRangeSelected.unsubscribe(this.handleCellRangeSelected.bind(this));
        }
        this._eventHandler.unsubscribeAll();
        (_a = this._grid) === null || _a === void 0 ? void 0 : _a.unregisterPlugin(this._selector);
        (_b = this._selector) === null || _b === void 0 ? void 0 : _b.dispose();
    }
    getSelectedRanges() {
        return this._ranges;
    }
    /**
     * Get the number of rows displayed in the viewport
     * Note that the row count is an approximation because it is a calculated value using this formula (viewport / rowHeight = rowCount),
     * the viewport must also be displayed for this calculation to work.
     * @return {Number} rowCount
     */
    getViewportRowCount() {
        var _a, _b, _c;
        const viewportElm = this._grid.getViewportNode();
        const viewportHeight = (_a = viewportElm === null || viewportElm === void 0 ? void 0 : viewportElm.clientHeight) !== null && _a !== void 0 ? _a : 0;
        const scrollbarHeight = (_c = (_b = this._grid.getScrollbarDimensions()) === null || _b === void 0 ? void 0 : _b.height) !== null && _c !== void 0 ? _c : 0;
        return Math.floor((viewportHeight - scrollbarHeight) / this._grid.getOptions().rowHeight) || 1;
    }
    hasDataView() {
        return !Array.isArray(this._grid.getData());
    }
    rangesAreEqual(range1, range2) {
        let areDifferent = (range1.length !== range2.length);
        if (!areDifferent) {
            for (let i = 0; i < range1.length; i++) {
                if (range1[i].fromCell !== range2[i].fromCell
                    || range1[i].fromRow !== range2[i].fromRow
                    || range1[i].toCell !== range2[i].toCell
                    || range1[i].toRow !== range2[i].toRow) {
                    areDifferent = true;
                    break;
                }
            }
        }
        return !areDifferent;
    }
    refreshSelections() {
        this.setSelectedRanges(this.getSelectedRanges());
    }
    removeInvalidRanges(ranges) {
        const result = [];
        for (let i = 0; i < ranges.length; i++) {
            const r = ranges[i];
            if (this._grid.canCellBeSelected(r.fromRow, r.fromCell) && this._grid.canCellBeSelected(r.toRow, r.toCell)) {
                result.push(r);
            }
        }
        return result;
    }
    /** Provide a way to force a recalculation of page row count (for example on grid resize) */
    resetPageRowCount() {
        this._cachedPageRowCount = 0;
    }
    setSelectedRanges(ranges, caller = 'SlickCellSelectionModel.setSelectedRanges') {
        // simple check for: empty selection didn't change, prevent firing onSelectedRangesChanged
        if ((!this._ranges || this._ranges.length === 0) && (!ranges || ranges.length === 0)) {
            return;
        }
        // if range has not changed, don't fire onSelectedRangesChanged
        const rangeHasChanged = !this.rangesAreEqual(this._ranges, ranges);
        this._ranges = this.removeInvalidRanges(ranges);
        if (rangeHasChanged) {
            const eventData = new Slick.EventData();
            Object.defineProperty(eventData, 'detail', { writable: true, configurable: true, value: { caller } });
            this.onSelectedRangesChanged.notify(this._ranges, eventData);
        }
    }
    //
    // protected functions
    // ---------------------
    handleActiveCellChange(_e, args) {
        var _a, _b;
        this._prevSelectedRow = undefined;
        if (((_a = this._addonOptions) === null || _a === void 0 ? void 0 : _a.selectActiveCell) && args.row !== null && args.cell !== null) {
            this.setSelectedRanges([new Slick.Range(args.row, args.cell)]);
        }
        else if (!((_b = this._addonOptions) === null || _b === void 0 ? void 0 : _b.selectActiveCell)) {
            // clear the previous selection once the cell changes
            this.setSelectedRanges([]);
        }
    }
    handleBeforeCellRangeSelected(e) {
        if (this._grid.getEditorLock().isActive()) {
            e.stopPropagation();
            return false;
        }
    }
    handleCellRangeSelected(_e, args) {
        this._grid.setActiveCell(args.range.fromRow, args.range.fromCell, false, false, true);
        this.setSelectedRanges([args.range]);
    }
    isKeyAllowed(key) {
        return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageDown', 'PageUp', 'Home', 'End'].some(k => k === key);
    }
    handleKeyDown(e) {
        var _a;
        let ranges;
        let last;
        const active = this._grid.getActiveCell();
        const metaKey = e.ctrlKey || e.metaKey;
        let dataLn = 0;
        if (this._dataView) {
            dataLn = ((_a = this._dataView) === null || _a === void 0 ? void 0 : _a.getPagingInfo().pageSize) || this._dataView.getLength();
        }
        else {
            dataLn = this._grid.getDataLength();
        }
        if (active && e.shiftKey && !metaKey && !e.altKey && this.isKeyAllowed(e.key)) {
            ranges = this.getSelectedRanges().slice();
            if (!ranges.length) {
                ranges.push(new Slick.Range(active.row, active.cell));
            }
            // keyboard can work with last range only
            last = ranges.pop();
            if (typeof (last === null || last === void 0 ? void 0 : last.contains) === 'function') {
                // can't handle selection out of active cell
                if (!last.contains(active.row, active.cell)) {
                    last = new Slick.Range(active.row, active.cell);
                }
                let dRow = last.toRow - last.fromRow;
                let dCell = last.toCell - last.fromCell;
                // walking direction
                const dirRow = active.row === last.fromRow ? 1 : -1;
                const dirCell = active.cell === last.fromCell ? 1 : -1;
                const isSingleKeyMove = e.key.startsWith('Arrow');
                let toRow = 0;
                if (isSingleKeyMove) {
                    // single cell move: (Arrow{Up/ArrowDown/ArrowLeft/ArrowRight})
                    if (e.key === 'ArrowLeft') {
                        dCell -= dirCell;
                    }
                    else if (e.key === 'ArrowRight') {
                        dCell += dirCell;
                    }
                    else if (e.key === 'ArrowUp') {
                        dRow -= dirRow;
                    }
                    else if (e.key === 'ArrowDown') {
                        dRow += dirRow;
                    }
                    toRow = active.row + dirRow * dRow;
                }
                else {
                    // multiple cell moves: (Home, End, Page{Up/Down}), we need to know how many rows are displayed on a page
                    if (this._cachedPageRowCount < 1) {
                        this._cachedPageRowCount = this.getViewportRowCount();
                    }
                    if (this._prevSelectedRow === undefined) {
                        this._prevSelectedRow = active.row;
                    }
                    if (e.key === 'Home') {
                        toRow = 0;
                    }
                    else if (e.key === 'End') {
                        toRow = dataLn - 1;
                    }
                    else if (e.key === 'PageUp') {
                        if (this._prevSelectedRow >= 0) {
                            toRow = this._prevSelectedRow - this._cachedPageRowCount;
                        }
                        if (toRow < 0) {
                            toRow = 0;
                        }
                    }
                    else if (e.key === 'PageDown') {
                        if (this._prevSelectedRow <= dataLn - 1) {
                            toRow = this._prevSelectedRow + this._cachedPageRowCount;
                        }
                        if (toRow > dataLn - 1) {
                            toRow = dataLn - 1;
                        }
                    }
                    this._prevSelectedRow = toRow;
                }
                // define new selection range
                const newLast = new Slick.Range(active.row, active.cell, toRow, active.cell + dirCell * dCell);
                if (this.removeInvalidRanges([newLast]).length) {
                    ranges.push(newLast);
                    const viewRow = dirRow > 0 ? newLast.toRow : newLast.fromRow;
                    const viewCell = dirCell > 0 ? newLast.toCell : newLast.fromCell;
                    if (isSingleKeyMove) {
                        this._grid.scrollRowIntoView(viewRow);
                        this._grid.scrollCellIntoView(viewRow, viewCell, false);
                    }
                    else {
                        this._grid.scrollRowIntoView(toRow);
                        this._grid.scrollCellIntoView(toRow, viewCell, false);
                    }
                }
                else {
                    ranges.push(last);
                }
                this.setSelectedRanges(ranges);
                e.preventDefault();
                e.stopPropagation();
                this._prevKeyDown = e.key;
            }
        }
    }
}
//# sourceMappingURL=slickCellSelectionModel.js.map