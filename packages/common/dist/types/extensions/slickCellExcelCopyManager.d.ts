import type { EditCommand, EditUndoRedoBuffer, ExcelCopyBufferOption, GridOption, SlickEventHandler, SlickGrid } from '../interfaces/index';
import { BindingEventService } from '../services/bindingEvent.service';
import { SlickCellExternalCopyManager, SlickCellSelectionModel } from './index';
export declare class SlickCellExcelCopyManager {
    protected _addonOptions: ExcelCopyBufferOption;
    protected _bindingEventService: BindingEventService;
    protected _cellExternalCopyManagerPlugin: SlickCellExternalCopyManager;
    protected _cellSelectionModel: SlickCellSelectionModel;
    protected _commandQueue: EditCommand[];
    protected _eventHandler: SlickEventHandler;
    protected _grid: SlickGrid;
    protected _undoRedoBuffer: EditUndoRedoBuffer;
    pluginName: 'CellExcelCopyManager';
    constructor();
    get addonOptions(): ExcelCopyBufferOption | null;
    get eventHandler(): SlickEventHandler;
    get commandQueue(): EditCommand[];
    get gridOptions(): GridOption;
    get undoRedoBuffer(): EditUndoRedoBuffer;
    init(grid: SlickGrid, options?: ExcelCopyBufferOption): void;
    /** Dispose of the 3rd party addon (plugin) */
    dispose(): void;
    /** Create an undo redo buffer used by the Excel like copy */
    protected createUndoRedoBuffer(): void;
    /** @return default plugin (addon) options */
    protected getDefaultOptions(): ExcelCopyBufferOption;
    /** Hook an undo shortcut key hook that will redo/undo the copy buffer using Ctrl+(Shift)+Z keyboard events */
    protected handleBodyKeyDown(e: KeyboardEvent): void;
}
//# sourceMappingURL=slickCellExcelCopyManager.d.ts.map