"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickRowSelectionModel = void 0;
const index_1 = require("../enums/index");
const slickCellRangeSelector_1 = require("../extensions/slickCellRangeSelector");
class SlickRowSelectionModel {
    constructor(options) {
        this._ranges = [];
        this._defaults = {
            autoScrollWhenDrag: true,
            cellRangeSelector: undefined,
            dragToSelect: false,
            selectActiveRow: true
        };
        this.pluginName = 'RowSelectionModel';
        /** triggered when selected ranges changes */
        this.onSelectedRangesChanged = new Slick.Event();
        this._eventHandler = new Slick.EventHandler();
        this._addonOptions = { ...this._defaults, ...options };
    }
    get addonOptions() {
        return this._addonOptions;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    get gridOptions() {
        return this._grid.getOptions();
    }
    init(grid) {
        this._grid = grid;
        this._addonOptions = { ...this._defaults, ...this._addonOptions };
        this._selector = this.addonOptions.cellRangeSelector;
        if (!this._selector && this._addonOptions.dragToSelect) {
            this._selector = new slickCellRangeSelector_1.SlickCellRangeSelector({
                selectionCss: { border: 'none' },
                autoScroll: this._addonOptions.autoScrollWhenDrag
            });
            this.addonOptions.cellRangeSelector = this._selector;
        }
        this._eventHandler
            .subscribe(this._grid.onActiveCellChanged, this.handleActiveCellChange.bind(this))
            .subscribe(this._grid.onClick, this.handleClick.bind(this))
            .subscribe(this._grid.onKeyDown, this.handleKeyDown.bind(this));
        if (this._selector) {
            this._grid.registerPlugin(this._selector);
            this._selector.onCellRangeSelecting.subscribe(this.handleCellRangeSelected.bind(this));
            this._selector.onCellRangeSelected.subscribe(this.handleCellRangeSelected.bind(this));
            this._selector.onBeforeCellRangeSelected.subscribe(this.handleBeforeCellRangeSelected.bind(this));
        }
    }
    destroy() {
        this.dispose();
    }
    dispose() {
        this._eventHandler.unsubscribeAll();
        this.disposeSelector();
    }
    disposeSelector() {
        var _a, _b;
        if (this._selector) {
            this._selector.onCellRangeSelecting.unsubscribe(this.handleCellRangeSelected.bind(this));
            this._selector.onCellRangeSelected.unsubscribe(this.handleCellRangeSelected.bind(this));
            this._selector.onBeforeCellRangeSelected.unsubscribe(this.handleBeforeCellRangeSelected.bind(this));
            this._grid.unregisterPlugin(this._selector);
            (_a = this._selector) === null || _a === void 0 ? void 0 : _a.destroy();
            (_b = this._selector) === null || _b === void 0 ? void 0 : _b.dispose();
        }
    }
    getCellRangeSelector() {
        return this._selector;
    }
    getSelectedRanges() {
        return this._ranges;
    }
    getSelectedRows() {
        return this.rangesToRows(this._ranges);
    }
    refreshSelections() {
        this.setSelectedRows(this.getSelectedRows());
    }
    setSelectedRows(rows) {
        this.setSelectedRanges(this.rowsToRanges(rows), 'SlickRowSelectionModel.setSelectedRows');
    }
    setSelectedRanges(ranges, caller = 'SlickRowSelectionModel.setSelectedRanges') {
        // simple check for: empty selection didn't change, prevent firing onSelectedRangesChanged
        if ((!this._ranges || this._ranges.length === 0) && (!ranges || ranges.length === 0)) {
            return;
        }
        this._ranges = ranges;
        const eventData = new Slick.EventData();
        Object.defineProperty(eventData, 'detail', { writable: true, configurable: true, value: { caller } });
        this.onSelectedRangesChanged.notify(this._ranges, eventData);
    }
    //
    // protected functions
    // ---------------------
    getRowsRange(from, to) {
        let i;
        const rows = [];
        for (i = from; i <= to; i++) {
            rows.push(i);
        }
        for (i = to; i < from; i++) {
            rows.push(i);
        }
        return rows;
    }
    handleBeforeCellRangeSelected(e, cell) {
        var _a;
        let isRowMoveColumn = false;
        if (this.gridOptions.enableRowMoveManager) {
            isRowMoveColumn = (_a = this.isHandlerColumn(cell.cell)) !== null && _a !== void 0 ? _a : false;
        }
        if (this._grid.getEditorLock().isActive() || isRowMoveColumn) {
            e.stopPropagation();
            return false;
        }
        this._grid.setActiveCell(cell.row, cell.cell);
    }
    handleCellRangeSelected(_e, args) {
        if (!this.gridOptions.multiSelect || !this.addonOptions.selectActiveRow) {
            return false;
        }
        this.setSelectedRanges([new Slick.Range(args.range.fromRow, 0, args.range.toRow, this._grid.getColumns().length - 1)]);
    }
    handleActiveCellChange(_e, args) {
        if (this._addonOptions.selectActiveRow && args.row !== null) {
            this.setSelectedRanges([new Slick.Range(args.row, 0, args.row, this._grid.getColumns().length - 1)]);
        }
    }
    handleClick(e) {
        const cell = this._grid.getCellFromEvent(e);
        if (!cell || !this._grid.canCellBeActive(cell.row, cell.cell)) {
            return false;
        }
        if (!this.gridOptions.multiSelect || (!e.ctrlKey && !e.shiftKey && !e.metaKey)) {
            return false;
        }
        let selection = this.rangesToRows(this._ranges);
        const idx = selection.indexOf(cell.row);
        if (idx === -1 && (e.ctrlKey || e.metaKey)) {
            selection.push(cell.row);
            this._grid.setActiveCell(cell.row, cell.cell);
        }
        else if (idx !== -1 && (e.ctrlKey || e.metaKey)) {
            selection = selection.filter((o) => o !== cell.row);
            this._grid.setActiveCell(cell.row, cell.cell);
        }
        else if (selection.length && e.shiftKey) {
            const last = selection.pop();
            const from = Math.min(cell.row, last);
            const to = Math.max(cell.row, last);
            selection = [];
            for (let i = from; i <= to; i++) {
                if (i !== last) {
                    selection.push(i);
                }
            }
            selection.push(last);
            this._grid.setActiveCell(cell.row, cell.cell);
        }
        const tempRanges = this.rowsToRanges(selection);
        this.setSelectedRanges(tempRanges);
        e.stopImmediatePropagation();
        return true;
    }
    handleKeyDown(e) {
        const activeRow = this._grid.getActiveCell();
        if (this.gridOptions.multiSelect && activeRow &&
            e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey &&
            (e.which === index_1.KeyCode.UP || e.key === 'ArrowUp' || e.which === index_1.KeyCode.DOWN || e.key === 'ArrowDown')) {
            let selectedRows = this.getSelectedRows();
            selectedRows.sort((x, y) => x - y);
            if (!selectedRows.length) {
                selectedRows = [activeRow.row];
            }
            let active;
            let top = selectedRows[0];
            let bottom = selectedRows[selectedRows.length - 1];
            if (e.which === index_1.KeyCode.DOWN || e.key === 'ArrowDown') {
                active = (activeRow.row < bottom || top === bottom) ? ++bottom : ++top;
            }
            else {
                active = activeRow.row < bottom ? --bottom : --top;
            }
            if (active >= 0 && active < this._grid.getDataLength()) {
                this._grid.scrollRowIntoView(active);
                const tempRanges = this.rowsToRanges(this.getRowsRange(top, bottom));
                this.setSelectedRanges(tempRanges);
            }
            e.preventDefault();
            e.stopPropagation();
        }
    }
    /** is the column a column Row Move OR Select Row Move */
    isHandlerColumn(columnIndex) {
        const columns = this._grid.getColumns();
        const col = columns[columnIndex].behavior || '';
        return /move|selectAndMove/.test(col);
    }
    rangesToRows(ranges) {
        const rows = [];
        for (let i = 0; i < ranges.length; i++) {
            for (let j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
                rows.push(j);
            }
        }
        return rows;
    }
    rowsToRanges(rows) {
        const ranges = [];
        const lastCell = this._grid.getColumns().length - 1;
        for (const row of rows) {
            ranges.push(new Slick.Range(row, 0, row, lastCell));
        }
        return ranges;
    }
}
exports.SlickRowSelectionModel = SlickRowSelectionModel;
//# sourceMappingURL=slickRowSelectionModel.js.map