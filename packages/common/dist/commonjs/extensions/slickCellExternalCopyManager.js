"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickCellExternalCopyManager = void 0;
const index_1 = require("../enums/index");
const domUtilities_1 = require("../services/domUtilities");
const CLEAR_COPY_SELECTION_DELAY = 2000;
const CLIPBOARD_PASTE_DELAY = 100;
/*
  This manager enables users to copy/paste data from/to an external Spreadsheet application
  such as MS-Excel® or OpenOffice-Spreadsheet.

  Since it is not possible to access directly the clipboard in javascript, the plugin uses
  a trick to do it's job. After detecting the keystroke, we dynamically create a textarea
  where the browser copies/pastes the serialized data.
*/
class SlickCellExternalCopyManager {
    constructor() {
        this._bodyElement = document.body;
        this._copiedCellStyle = 'copied';
        this._copiedCellStyleLayerKey = 'copy-manager';
        this._copiedRanges = null;
        this.pluginName = 'CellExternalCopyManager';
        this.onCopyCells = new Slick.Event();
        this.onCopyCancelled = new Slick.Event();
        this.onPasteCells = new Slick.Event();
        this._eventHandler = new Slick.EventHandler();
    }
    get addonOptions() {
        return this._addonOptions;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    init(grid, options) {
        this._grid = grid;
        this._addonOptions = { ...this._addonOptions, ...options };
        this._copiedCellStyleLayerKey = this._addonOptions.copiedCellStyleLayerKey || 'copy-manager';
        this._copiedCellStyle = this._addonOptions.copiedCellStyle || 'copied';
        this._bodyElement = this._addonOptions.bodyElement || document.body;
        this._onCopyInit = this._addonOptions.onCopyInit || undefined;
        this._onCopySuccess = this._addonOptions.onCopySuccess || undefined;
        this._eventHandler.subscribe(this._grid.onKeyDown, this.handleKeyDown.bind(this));
        // we need a cell selection model
        const cellSelectionModel = grid.getSelectionModel();
        if (!cellSelectionModel) {
            throw new Error(`Selection model is mandatory for this plugin. Please set a selection model on the grid before adding this plugin: grid.setSelectionModel(new Slick.CellSelectionModel())`);
        }
        // we give focus on the grid when a selection is done on it (unless it's an editor, if so the editor should have already set focus to the grid prior to editing a cell).
        // without this, if the user selects a range of cell without giving focus on a particular cell, the grid doesn't get the focus and key stroke handles (ctrl+c) don't work
        this._eventHandler.subscribe(cellSelectionModel.onSelectedRangesChanged, () => {
            if (!this._grid.getEditorLock().isActive()) {
                this._grid.focus();
            }
        });
    }
    dispose() {
        this._eventHandler.unsubscribeAll();
    }
    clearCopySelection() {
        this._grid.removeCellCssStyles(this._copiedCellStyleLayerKey);
    }
    getHeaderValueForColumn(columnDef) {
        if (typeof this._addonOptions.headerColumnValueExtractor === 'function') {
            const val = this._addonOptions.headerColumnValueExtractor(columnDef);
            if (val) {
                return val;
            }
        }
        return columnDef.name;
    }
    getDataItemValueForColumn(item, columnDef, event) {
        if (typeof this._addonOptions.dataItemColumnValueExtractor === 'function') {
            const val = this._addonOptions.dataItemColumnValueExtractor(item, columnDef);
            if (val) {
                return val;
            }
        }
        let retVal = '';
        // if a custom getter is not defined, we call serializeValue of the editor to serialize
        if (columnDef) {
            if (columnDef.editor) {
                const tmpP = document.createElement('p');
                const editor = new columnDef.editor({
                    container: tmpP,
                    column: columnDef,
                    event,
                    position: { top: 0, left: 0 },
                    grid: this._grid,
                });
                editor.loadValue(item);
                retVal = editor.serializeValue();
                editor.destroy();
                tmpP.remove();
            }
            else {
                retVal = item[columnDef.field || ''];
            }
        }
        return retVal;
    }
    setDataItemValueForColumn(item, columnDef, value) {
        if (!(columnDef === null || columnDef === void 0 ? void 0 : columnDef.denyPaste)) {
            if (this._addonOptions.dataItemColumnValueSetter) {
                return this._addonOptions.dataItemColumnValueSetter(item, columnDef, value);
            }
            // if a custom setter is not defined, we call applyValue of the editor to unserialize
            if (columnDef.editor) {
                const tmpDiv = document.createElement('div');
                const editor = new columnDef.editor({
                    container: tmpDiv,
                    column: columnDef,
                    position: { top: 0, left: 0 },
                    grid: this._grid
                });
                editor.loadValue(item);
                editor.applyValue(item, value);
                editor.destroy();
                tmpDiv.remove();
            }
            else {
                item[columnDef.field] = value;
            }
        }
    }
    setIncludeHeaderWhenCopying(includeHeaderWhenCopying) {
        this._addonOptions.includeHeaderWhenCopying = includeHeaderWhenCopying;
    }
    //
    // protected functions
    // ---------------------
    createTextBox(innerText) {
        const textAreaElm = (0, domUtilities_1.createDomElement)('textarea', {
            value: innerText,
            style: { position: 'absolute', left: '-1000px', top: `${document.body.scrollTop}px`, }
        }, this._bodyElement);
        textAreaElm.select();
        return textAreaElm;
    }
    decodeTabularData(grid, textAreaElement) {
        var _a;
        const columns = grid.getColumns();
        const clipText = textAreaElement.value;
        const clipRows = clipText.split(/[\n\f\r]/);
        // trim trailing CR if present
        if (clipRows[clipRows.length - 1] === '') {
            clipRows.pop();
        }
        let j = 0;
        const clippedRange = [];
        this._bodyElement.removeChild(textAreaElement);
        for (const clipRow of clipRows) {
            clippedRange[j++] = clipRow !== '' ? clipRow.split('\t') : [''];
        }
        const selectedCell = this._grid.getActiveCell();
        const ranges = (_a = this._grid.getSelectionModel()) === null || _a === void 0 ? void 0 : _a.getSelectedRanges();
        const selectedRange = (ranges === null || ranges === void 0 ? void 0 : ranges.length) ? ranges[0] : null; // pick only one selection
        let activeRow;
        let activeCell;
        if (selectedRange) {
            activeRow = selectedRange.fromRow;
            activeCell = selectedRange.fromCell;
        }
        else if (selectedCell) {
            activeRow = selectedCell.row;
            activeCell = selectedCell.cell;
        }
        else {
            return; // we don't know where to paste
        }
        let oneCellToMultiple = false;
        let destH = clippedRange.length;
        let destW = clippedRange.length ? clippedRange[0].length : 0;
        if (clippedRange.length === 1 && clippedRange[0].length === 1 && selectedRange) {
            oneCellToMultiple = true;
            destH = selectedRange.toRow - selectedRange.fromRow + 1;
            destW = selectedRange.toCell - selectedRange.fromCell + 1;
        }
        const availableRows = this._grid.getData().length - activeRow;
        let addRows = 0;
        // ignore new rows if we don't have a "newRowCreator"
        if ((availableRows < destH) && typeof this._addonOptions.newRowCreator === 'function') {
            const d = this._grid.getData();
            for (addRows = 1; addRows <= (destH - availableRows); addRows++) {
                d.push({});
            }
            this._grid.setData(d);
            this._grid.render();
        }
        const overflowsBottomOfGrid = (activeRow + destH) > this._grid.getDataLength();
        if (overflowsBottomOfGrid && typeof this._addonOptions.newRowCreator === 'function') {
            const newRowsNeeded = activeRow + destH - this._grid.getDataLength();
            this._addonOptions.newRowCreator(newRowsNeeded);
        }
        const clipCommand = {
            isClipboardCommand: true,
            clippedRange,
            oldValues: [],
            cellExternalCopyManager: this,
            _options: this._addonOptions,
            setDataItemValueForColumn: this.setDataItemValueForColumn,
            markCopySelection: this.markCopySelection,
            oneCellToMultiple,
            activeRow,
            activeCell,
            destH,
            destW,
            maxDestY: this._grid.getDataLength(),
            maxDestX: this._grid.getColumns().length,
            h: 0,
            w: 0,
            execute: () => {
                var _a;
                clipCommand.h = 0;
                for (let y = 0; y < clipCommand.destH; y++) {
                    clipCommand.oldValues[y] = [];
                    clipCommand.w = 0;
                    clipCommand.h++;
                    for (let x = 0; x < clipCommand.destW; x++) {
                        clipCommand.w++;
                        const desty = activeRow + y;
                        const destx = activeCell + x;
                        if (desty < clipCommand.maxDestY && destx < clipCommand.maxDestX) {
                            // const nd = this._grid.getCellNode(desty, destx);
                            const dt = this._grid.getDataItem(desty);
                            clipCommand.oldValues[y][x] = dt[columns[destx]['field']];
                            if (oneCellToMultiple) {
                                this.setDataItemValueForColumn(dt, columns[destx], clippedRange[0][0]);
                            }
                            else {
                                this.setDataItemValueForColumn(dt, columns[destx], clippedRange[y] ? clippedRange[y][x] : '');
                            }
                            this._grid.updateCell(desty, destx);
                            this._grid.onCellChange.notify({
                                row: desty,
                                cell: destx,
                                item: dt,
                                grid: this._grid,
                                column: {},
                            });
                        }
                    }
                }
                const bRange = {
                    fromCell: activeCell,
                    fromRow: activeRow,
                    toCell: activeCell + clipCommand.w - 1,
                    toRow: activeRow + clipCommand.h - 1
                };
                this.markCopySelection([bRange]);
                (_a = this._grid.getSelectionModel()) === null || _a === void 0 ? void 0 : _a.setSelectedRanges([bRange]);
                this.onPasteCells.notify({ ranges: [bRange] });
            },
            undo: () => {
                var _a;
                for (let y = 0; y < clipCommand.destH; y++) {
                    for (let x = 0; x < clipCommand.destW; x++) {
                        const desty = activeRow + y;
                        const destx = activeCell + x;
                        if (desty < clipCommand.maxDestY && destx < clipCommand.maxDestX) {
                            // const nd = this._grid.getCellNode(desty, destx);
                            const dt = this._grid.getDataItem(desty);
                            if (oneCellToMultiple) {
                                this.setDataItemValueForColumn(dt, columns[destx], clipCommand.oldValues[0][0]);
                            }
                            else {
                                this.setDataItemValueForColumn(dt, columns[destx], clipCommand.oldValues[y][x]);
                            }
                            this._grid.updateCell(desty, destx);
                            this._grid.onCellChange.notify({
                                row: desty,
                                cell: destx,
                                item: dt,
                                grid: this._grid,
                                column: {},
                            });
                        }
                    }
                }
                const bRange = {
                    fromCell: activeCell,
                    fromRow: activeRow,
                    toCell: activeCell + clipCommand.w - 1,
                    toRow: activeRow + clipCommand.h - 1
                };
                this.markCopySelection([bRange]);
                (_a = this._grid.getSelectionModel()) === null || _a === void 0 ? void 0 : _a.setSelectedRanges([bRange]);
                this.onPasteCells.notify({ ranges: [bRange] });
                if (typeof this._addonOptions.onPasteCells === 'function') {
                    this._addonOptions.onPasteCells(new Slick.EventData(), { ranges: [bRange] });
                }
                if (addRows > 1) {
                    const data = this._grid.getData();
                    for (; addRows > 1; addRows--) {
                        data.splice(data.length - 1, 1);
                    }
                    this._grid.setData(data);
                    this._grid.render();
                }
            }
        };
        if (this._addonOptions.clipboardCommandHandler) {
            this._addonOptions.clipboardCommandHandler(clipCommand);
        }
        else {
            clipCommand.execute();
        }
    }
    handleKeyDown(e) {
        var _a, _b, _c, _d, _e, _f;
        let ranges;
        if (!this._grid.getEditorLock().isActive() || this._grid.getOptions().autoEdit) {
            if (e.which === index_1.KeyCode.ESCAPE || e.key === 'Escape') {
                if (this._copiedRanges) {
                    e.preventDefault();
                    this.clearCopySelection();
                    this.onCopyCancelled.notify({ ranges: this._copiedRanges });
                    if (typeof this._addonOptions.onCopyCancelled === 'function') {
                        this._addonOptions.onCopyCancelled(e, { ranges: this._copiedRanges });
                    }
                    this._copiedRanges = null;
                }
            }
            if ((e.which === index_1.KeyCode.C || e.key === 'c' || e.which === index_1.KeyCode.INSERT || e.key === 'Insert') && (e.ctrlKey || e.metaKey) && !e.shiftKey) { // CTRL+C or CTRL+INS
                if (typeof this._onCopyInit === 'function') {
                    this._onCopyInit.call(this);
                }
                ranges = (_b = (_a = this._grid.getSelectionModel()) === null || _a === void 0 ? void 0 : _a.getSelectedRanges()) !== null && _b !== void 0 ? _b : [];
                if (ranges.length !== 0) {
                    this._copiedRanges = ranges;
                    this.markCopySelection(ranges);
                    this.onCopyCells.notify({ ranges });
                    if (typeof this._addonOptions.onCopyCells === 'function') {
                        this._addonOptions.onCopyCells(e, { ranges });
                    }
                    const columns = this._grid.getColumns();
                    let clipText = '';
                    for (let rg = 0; rg < ranges.length; rg++) {
                        const range = ranges[rg];
                        const clipTextRows = [];
                        for (let i = range.fromRow; i < range.toRow + 1; i++) {
                            const clipTextCells = [];
                            const dt = this._grid.getDataItem(i);
                            if (clipTextRows.length === 0 && this._addonOptions.includeHeaderWhenCopying) {
                                const clipTextHeaders = [];
                                for (let j = range.fromCell; j < range.toCell + 1; j++) {
                                    if (columns[j].name.length > 0) {
                                        clipTextHeaders.push(this.getHeaderValueForColumn(columns[j]));
                                    }
                                }
                                clipTextRows.push(clipTextHeaders.join('\t'));
                            }
                            for (let j = range.fromCell; j < range.toCell + 1; j++) {
                                clipTextCells.push(this.getDataItemValueForColumn(dt, columns[j], e));
                            }
                            clipTextRows.push(clipTextCells.join('\t'));
                        }
                        clipText += clipTextRows.join('\r\n') + '\r\n';
                    }
                    if (window.clipboardData) {
                        window.clipboardData.setData('Text', clipText);
                        return true;
                    }
                    else {
                        const focusElm = document.activeElement;
                        const textAreaElm = this.createTextBox(clipText);
                        textAreaElm.focus();
                        setTimeout(() => {
                            this._bodyElement.removeChild(textAreaElm);
                            // restore focus when possible
                            focusElm ? focusElm.focus() : console.log('No element to restore focus to after copy?');
                        }, (_d = (_c = this.addonOptions) === null || _c === void 0 ? void 0 : _c.clipboardPasteDelay) !== null && _d !== void 0 ? _d : CLIPBOARD_PASTE_DELAY);
                        if (typeof this._onCopySuccess === 'function') {
                            // If it's cell selection, use the toRow/fromRow fields
                            const rowCount = (ranges.length === 1) ? ((ranges[0].toRow + 1) - ranges[0].fromRow) : ranges.length;
                            this._onCopySuccess(rowCount);
                        }
                        return false;
                    }
                }
            }
            if (!this._addonOptions.readOnlyMode && (((e.which === index_1.KeyCode.V || e.key === 'v') && (e.ctrlKey || e.metaKey) && !e.shiftKey)
                || ((e.which === index_1.KeyCode.INSERT || e.key === 'Insert') && e.shiftKey && !e.ctrlKey))) { // CTRL+V or Shift+INS
                const textBoxElm = this.createTextBox('');
                setTimeout(() => this.decodeTabularData(this._grid, textBoxElm), (_f = (_e = this.addonOptions) === null || _e === void 0 ? void 0 : _e.clipboardPasteDelay) !== null && _f !== void 0 ? _f : CLIPBOARD_PASTE_DELAY);
                return false;
            }
        }
    }
    markCopySelection(ranges) {
        var _a;
        this.clearCopySelection();
        const columns = this._grid.getColumns();
        const hash = {};
        for (const range of ranges) {
            for (let j = range.fromRow; j <= range.toRow; j++) {
                hash[j] = {};
                for (let k = range.fromCell; k <= range.toCell && k < columns.length; k++) {
                    hash[j][columns[k].id] = this._copiedCellStyle;
                }
            }
        }
        this._grid.setCellCssStyles(this._copiedCellStyleLayerKey, hash);
        clearTimeout(this._clearCopyTI);
        this._clearCopyTI = setTimeout(() => this.clearCopySelection(), ((_a = this.addonOptions) === null || _a === void 0 ? void 0 : _a.clearCopySelectionDelay) || CLEAR_COPY_SELECTION_DELAY);
    }
}
exports.SlickCellExternalCopyManager = SlickCellExternalCopyManager;
//# sourceMappingURL=slickCellExternalCopyManager.js.map