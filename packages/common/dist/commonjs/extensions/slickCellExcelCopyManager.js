"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlickCellExcelCopyManager = void 0;
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const domUtilities_1 = require("../services/domUtilities");
const index_1 = require("./index");
/*
  This manager enables users to copy/paste data from/to an external Spreadsheet application
  such as MS-Excel® or OpenOffice-Spreadsheet.

  Since it is not possible to access directly the clipboard in javascript, the plugin uses
  a trick to do it's job. After detecting the keystroke, we dynamically create a textarea
  where the browser copies/pastes the serialized data.
*/
class SlickCellExcelCopyManager {
    constructor() {
        this.pluginName = 'CellExcelCopyManager';
        this._eventHandler = new Slick.EventHandler();
        this._bindingEventService = new bindingEvent_service_1.BindingEventService();
    }
    get addonOptions() {
        return this._addonOptions;
    }
    get eventHandler() {
        return this._eventHandler;
    }
    get commandQueue() {
        return this._commandQueue;
    }
    get gridOptions() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : {};
    }
    get undoRedoBuffer() {
        return this._undoRedoBuffer;
    }
    init(grid, options) {
        this._grid = grid;
        this.createUndoRedoBuffer();
        this._cellSelectionModel = new index_1.SlickCellSelectionModel();
        this._grid.setSelectionModel(this._cellSelectionModel);
        this._bindingEventService.bind(document.body, 'keydown', this.handleBodyKeyDown.bind(this));
        this._addonOptions = { ...this.getDefaultOptions(), ...options };
        this._cellExternalCopyManagerPlugin = new index_1.SlickCellExternalCopyManager();
        this._cellExternalCopyManagerPlugin.init(this._grid, this._addonOptions);
        this._eventHandler.subscribe(this._cellExternalCopyManagerPlugin.onCopyCells, (e, args) => {
            if (this._addonOptions && typeof this._addonOptions.onCopyCells === 'function') {
                this._addonOptions.onCopyCells(e, args);
            }
        });
        this._eventHandler.subscribe(this._cellExternalCopyManagerPlugin.onCopyCancelled, (e, args) => {
            if (this._addonOptions && typeof this._addonOptions.onCopyCancelled === 'function') {
                this._addonOptions.onCopyCancelled(e, args);
            }
        });
        this._eventHandler.subscribe(this._cellExternalCopyManagerPlugin.onPasteCells, (e, args) => {
            if (this._addonOptions && typeof this._addonOptions.onPasteCells === 'function') {
                this._addonOptions.onPasteCells(e, args);
            }
        });
    }
    /** Dispose of the 3rd party addon (plugin) */
    dispose() {
        var _a, _b;
        // unsubscribe all SlickGrid events
        this._eventHandler.unsubscribeAll();
        this._bindingEventService.unbindAll();
        (_a = this._cellSelectionModel) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this._cellExternalCopyManagerPlugin) === null || _b === void 0 ? void 0 : _b.dispose();
    }
    //
    // protected functions
    // ---------------------
    /** Create an undo redo buffer used by the Excel like copy */
    createUndoRedoBuffer() {
        let commandCtr = 0;
        this._commandQueue = [];
        this._undoRedoBuffer = {
            queueAndExecuteCommand: (editCommand) => {
                this._commandQueue[commandCtr] = editCommand;
                commandCtr++;
                editCommand.execute();
            },
            undo: () => {
                if (commandCtr === 0) {
                    return;
                }
                commandCtr--;
                const command = this._commandQueue[commandCtr];
                if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
                    command.undo();
                }
            },
            redo: () => {
                if (commandCtr >= this._commandQueue.length) {
                    return;
                }
                const command = this._commandQueue[commandCtr];
                commandCtr++;
                if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
                    command.execute();
                }
            }
        };
    }
    /** @return default plugin (addon) options */
    getDefaultOptions() {
        let newRowIds = 0;
        return {
            clipboardCommandHandler: (editCommand) => {
                this._undoRedoBuffer.queueAndExecuteCommand.call(this._undoRedoBuffer, editCommand);
            },
            dataItemColumnValueExtractor: (item, columnDef) => {
                var _a, _b;
                // when grid or cell is not editable, we will possibly evaluate the Formatter if it was passed
                // to decide if we evaluate the Formatter, we will use the same flag from Export which is "exportWithFormatter"
                if (!this.gridOptions.editable || !columnDef.editor) {
                    const isEvaluatingFormatter = (columnDef.exportWithFormatter !== undefined) ? columnDef.exportWithFormatter : ((_a = this.gridOptions.textExportOptions) === null || _a === void 0 ? void 0 : _a.exportWithFormatter);
                    if (columnDef.formatter && isEvaluatingFormatter) {
                        const formattedOutput = columnDef.formatter(0, 0, item[columnDef.field], columnDef, item, this._grid);
                        if (columnDef.sanitizeDataExport || ((_b = this.gridOptions.textExportOptions) === null || _b === void 0 ? void 0 : _b.sanitizeDataExport)) {
                            let outputString = formattedOutput;
                            if (formattedOutput && typeof formattedOutput === 'object' && formattedOutput.hasOwnProperty('text')) {
                                outputString = formattedOutput.text;
                            }
                            if (outputString === null) {
                                outputString = '';
                            }
                            return (0, domUtilities_1.sanitizeHtmlToText)(outputString);
                        }
                        return formattedOutput;
                    }
                }
                // else use the default "dataItemColumnValueExtractor" from the plugin itself
                // we can do that by setting back the getter with null
                return null;
            },
            readOnlyMode: false,
            includeHeaderWhenCopying: false,
            newRowCreator: (count) => {
                for (let i = 0; i < count; i++) {
                    this._grid.getData().addItem({ id: `newRow_${newRowIds++}` });
                }
            }
        };
    }
    /** Hook an undo shortcut key hook that will redo/undo the copy buffer using Ctrl+(Shift)+Z keyboard events */
    handleBodyKeyDown(e) {
        const keyCode = e.keyCode || e.code;
        if (keyCode === 90 && (e.ctrlKey || e.metaKey)) {
            if (e.shiftKey) {
                this._undoRedoBuffer.redo(); // Ctrl + Shift + Z
            }
            else {
                this._undoRedoBuffer.undo(); // Ctrl + Z
            }
        }
    }
}
exports.SlickCellExcelCopyManager = SlickCellExcelCopyManager;
//# sourceMappingURL=slickCellExcelCopyManager.js.map